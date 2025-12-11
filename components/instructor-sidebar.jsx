"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useDashboard } from "@/lib/hooks"
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  DollarSign,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  BarChart3,
  Menu,
  X,
  UserCheck,
  Package,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect, useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query"

export function InstructorSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useDashboard()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasViewedEnrollments, setHasViewedEnrollments] = useState(false)
  const [hasViewedDeliveries, setHasViewedDeliveries] = useState(false)

  const allMenuItems = [
    { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-primary to-accent" },
    { href: "/instructor/courses", label: "My Courses", icon: BookOpen, gradient: "from-accent to-primary" },
    { href: "/instructor/upload-videos", label: "Upload Videos", icon: Upload, gradient: "from-primary to-secondary" },
    {
      href: "/instructor/enrollments/pending",
      label: "Enrollments",
      icon: UserCheck,
      gradient: "from-accent to-primary",
    },
    {
      href: "/instructor/deliveries",
      label: "Deliveries",
      icon: Package,
      gradient: "from-primary to-secondary",
    },
    // { href: "/instructor/earnings", label: "Earnings", icon: DollarSign, gradient: "from-secondary to-accent" },
    { href: "/instructor/students", label: "Students", icon: Users, gradient: "from-accent to-secondary" },
    // { href: "/instructor/analytics", label: "Analytics", icon: BarChart3, gradient: "from-primary to-accent" },
    // { href: "/instructor/messages", label: "Messages", icon: MessageSquare, gradient: "from-secondary to-primary" },
    
    {
      href: "/instructor/profile",
      label: "Profile Settings",
      icon: Settings,
      gradient: "from-muted-foreground to-foreground",
    },
  ]

  // Filter menu items based on user role
  // ADMIN users can only access: enrollments/pending, deliveries, students
  const menuItems = useMemo(() => {
    if (session?.user?.role === "ADMIN") {
      const adminAllowedPaths = [
        "/instructor/enrollments/pending",
        "/instructor/deliveries",
        "/instructor/students",
      ]
      return allMenuItems.filter((item) => adminAllowedPaths.includes(item.href))
    }
    // INSTRUCTOR users see all menu items
    return allMenuItems
  }, [session?.user?.role])

  const isActive = (href) => pathname === href

  // Fetch enrollment count with React Query
  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["pendingEnrollments", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { enrollments: [] }
      
      const res = await fetch("/api/instructor/enrollments/pending", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch enrollments")
      }
      
      const data = await res.json()
      return data
    },
    enabled: !!session?.user?.id && !!session?.user?.role && (session.user.role === "INSTRUCTOR" || session.user.role === "ADMIN"),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10 * 1000, // Consider data stale after 10 seconds
    retry: 2,
  })

  // Fetch delivery count with React Query
  const { data: deliveryData, isLoading: deliveryLoading } = useQuery({
    queryKey: ["instructorDeliveries", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { deliveries: [], counts: {} }
      
      const res = await fetch("/api/instructor/deliveries", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch deliveries")
      }
      
      const data = await res.json()
      return data
    },
    enabled: !!session?.user?.id && !!session?.user?.role && (session.user.role === "INSTRUCTOR" || session.user.role === "ADMIN"),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10 * 1000, // Consider data stale after 10 seconds
    retry: 2,
  })

  // Calculate counts from React Query data
  const enrollmentCount = useMemo(() => {
    if (enrollmentLoading || !enrollmentData) return 0
    const enrollments = Array.isArray(enrollmentData?.enrollments) ? enrollmentData.enrollments : []
    return enrollments.length
  }, [enrollmentData, enrollmentLoading])

  const deliveryCount = useMemo(() => {
    if (deliveryLoading || !deliveryData) return 0
    const deliveries = Array.isArray(deliveryData?.deliveries) ? deliveryData.deliveries : []
    // Count pending and processing deliveries
    return deliveries.filter(
      (d) => d.status === "PENDING" || d.status === "PROCESSING"
    ).length
  }, [deliveryData, deliveryLoading])

  // Track previous counts to detect when new items appear
  const prevEnrollmentCountRef = useRef(0)
  const prevDeliveryCountRef = useRef(0)

  // Reset viewed status when count goes from 0 to > 0 (new items appeared)
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // If enrollment count increased from 0, reset viewed status
    if (prevEnrollmentCountRef.current === 0 && enrollmentCount > 0 && hasViewedEnrollments) {
      localStorage.removeItem("instructor-enrollments-viewed")
      setHasViewedEnrollments(false)
    }
    prevEnrollmentCountRef.current = enrollmentCount
    
    // If delivery count increased from 0, reset viewed status
    if (prevDeliveryCountRef.current === 0 && deliveryCount > 0 && hasViewedDeliveries) {
      localStorage.removeItem("instructor-deliveries-viewed")
      setHasViewedDeliveries(false)
    }
    prevDeliveryCountRef.current = deliveryCount
  }, [enrollmentCount, deliveryCount, hasViewedEnrollments, hasViewedDeliveries])

  // Check if user has viewed enrollments page
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkViewed = () => {
      const viewed = localStorage.getItem("instructor-enrollments-viewed")
      setHasViewedEnrollments(viewed === "true")
    }

    // Check on mount and pathname change
    checkViewed()

    // Mark as viewed when on enrollments page
    if (pathname === "/instructor/enrollments/pending") {
      localStorage.setItem("instructor-enrollments-viewed", "true")
      setHasViewedEnrollments(true)
    }

    // Listen for storage changes (when page sets it)
    const handleStorageChange = (e) => {
      if (e.key === "instructor-enrollments-viewed") {
        setHasViewedEnrollments(e.newValue === "true")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    // Also check periodically in case localStorage was set by same window
    // Note: storage event only fires across tabs, so we poll for same-window changes
    const interval = setInterval(checkViewed, 500)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [pathname])

  // Check if user has viewed deliveries page
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkViewed = () => {
      const viewed = localStorage.getItem("instructor-deliveries-viewed")
      setHasViewedDeliveries(viewed === "true")
    }

    // Check on mount and pathname change
    checkViewed()

    // Mark as viewed when on deliveries page
    if (pathname === "/instructor/deliveries") {
      localStorage.setItem("instructor-deliveries-viewed", "true")
      setHasViewedDeliveries(true)
    }

    // Listen for storage changes (when page sets it)
    const handleStorageChange = (e) => {
      if (e.key === "instructor-deliveries-viewed") {
        setHasViewedDeliveries(e.newValue === "true")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    // Also check periodically in case localStorage was set by same window
    // Note: storage event only fires across tabs, so we poll for same-window changes
    const interval = setInterval(checkViewed, 500)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [pathname])

  // Calculate badge counts (only show if not viewed and count > 0)
  const enrollmentBadgeCount = useMemo(() => {
    // Don't show badge if loading, viewed, or count is 0
    if (enrollmentLoading || hasViewedEnrollments || enrollmentCount === 0) return 0
    return enrollmentCount
  }, [hasViewedEnrollments, enrollmentCount, enrollmentLoading])

  const deliveryBadgeCount = useMemo(() => {
    // Don't show badge if loading, viewed, or count is 0
    if (deliveryLoading || hasViewedDeliveries || deliveryCount === 0) return 0
    return deliveryCount
  }, [hasViewedDeliveries, deliveryCount, deliveryLoading])

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SmartLearn
              </h2>
              <p className="text-xs text-muted-foreground font-medium">Instructor Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="bg-card border-t border-border max-h-[calc(100vh-73px)] overflow-y-auto">
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      active ? "bg-muted shadow-md" : "hover:bg-muted/50"
                    }`}
                  >
                    {active && (
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full`}
                      ></div>
                    )}

                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          active ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-muted group-hover:bg-accent/20"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-foreground"}`} />
                      </div>
                      {(item.href === "/instructor/enrollments/pending" && enrollmentBadgeCount > 0) && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                          {enrollmentBadgeCount > 9 ? "9+" : enrollmentBadgeCount}
                        </span>
                      )}
                      {(item.href === "/instructor/deliveries" && deliveryBadgeCount > 0) && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                          {deliveryBadgeCount > 9 ? "9+" : deliveryBadgeCount}
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-semibold text-sm ${
                        active ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent` : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border space-y-3">
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    {session?.user?.name?.[0] || "I"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {session?.user?.name || "Instructor"}
                    </p>
                    <p className="text-xs text-muted-foreground">Expert Educator</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 hover:shadow-md"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 ${
          sidebarOpen ? "w-72" : "w-20"
        } bg-card border-r border-border h-screen transition-all duration-300 shadow-lg z-40`}
      >
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className={`${sidebarOpen ? "p-4" : "p-2"} ${sidebarOpen ? "border-b border-border" : "border-b-0"}`}>
            <div className={`flex items-center ${sidebarOpen ? "justify-between mb-3" : "justify-center flex-col gap-2"}`}>
              <div className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}>
                <div className={`${sidebarOpen ? "w-10 h-10" : "w-12 h-12"} rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg`}>
                  <GraduationCap className={`${sidebarOpen ? "w-6 h-6" : "w-7 h-7"} text-primary-foreground`} />
                </div>
                {sidebarOpen && (
                  <div>
                    <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      SmartLearn
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">Instructor Portal</p>
                  </div>
                )}
              </div>
              
              {/* Toggle Button */}
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-8 h-8 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95 flex-shrink-0"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
              )}
            </div>
            
            {/* Theme Toggle */}
            <div className={`${sidebarOpen ? 'w-full' : 'flex justify-center'}`}>
              <ThemeToggle />
            </div>
            
            {/* Expand button when collapsed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full mt-2 p-2 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 ${sidebarOpen ? "p-4" : "p-2"} space-y-1 overflow-y-auto`}>
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full group relative flex items-center ${sidebarOpen ? "gap-3 px-4" : "justify-center px-2"} py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                    active ? "bg-muted shadow-md" : "hover:bg-muted/50"
                  }`}
                  title={!sidebarOpen ? item.label : ""}
                  aria-label={item.label}
                >
                  {active && (
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full`}
                    ></div>
                  )}

                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        active ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-muted group-hover:bg-accent/20"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-foreground"}`} />
                    </div>
                    {(item.href === "/instructor/enrollments/pending" && enrollmentBadgeCount > 0) && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                        {enrollmentBadgeCount > 9 ? "9+" : enrollmentBadgeCount}
                      </span>
                    )}
                    {(item.href === "/instructor/deliveries" && deliveryBadgeCount > 0) && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                        {deliveryBadgeCount > 9 ? "9+" : deliveryBadgeCount}
                      </span>
                    )}
                  </div>

                  {sidebarOpen && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-sm ${
                          active ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent` : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                      {(item.href === "/instructor/enrollments/pending" && enrollmentBadgeCount > 0) && (
                        <span className="w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {enrollmentBadgeCount > 9 ? "9+" : enrollmentBadgeCount}
                        </span>
                      )}
                      {(item.href === "/instructor/deliveries" && deliveryBadgeCount > 0) && (
                        <span className="w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {deliveryBadgeCount > 9 ? "9+" : deliveryBadgeCount}
                        </span>
                      )}
                    </div>
                  )}

                  {!active && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section & Logout */}
          <div className={`${sidebarOpen ? "p-4" : "p-2"} ${sidebarOpen ? "border-t border-border" : "border-t-0"} space-y-3`}>
            {sidebarOpen && (
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    {session?.user?.name?.[0] || "I"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {session?.user?.name || "Instructor"}
                    </p>
                    <p className="text-xs text-muted-foreground">Expert Educator</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 hover:shadow-md ${
                !sidebarOpen && "flex-col gap-1 py-2"
              }`}
            >
              <LogOut className={`${sidebarOpen ? "w-5 h-5" : "w-6 h-6"}`} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-[73px]"></div>
    </>
  )
}
