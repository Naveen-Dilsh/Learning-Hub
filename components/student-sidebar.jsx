"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useDashboard } from "@/lib/hooks"
import {
  Home,
  BookOpen,
  CreditCard,
  Award,
  Heart,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Trophy,
  Menu,
  X,
  Search,
  Package,
  Video,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"

export function StudentSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useDashboard()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasViewedDeliveries, setHasViewedDeliveries] = useState(false)
  const [hasViewedLiveSessions, setHasViewedLiveSessions] = useState(false)

  // Memoize menu items - prevents recreation on every render
  const menuItems = useMemo(() => [
    { href: "/student", label: "Dashboard", icon: Home, gradient: "from-primary to-accent" },
    { href: "/student/courses", label: "My Courses", icon: BookOpen, gradient: "from-accent to-primary" },
    { href: "/student/browse-course", label: "Browse Courses", icon: Search, gradient: "from-primary to-secondary" },
    { href: "/student/live-sessions", label: "Live Sessions", icon: Video, gradient: "from-primary to-accent" },
    { href: "/student/certificates", label: "Certificates", icon: Award, gradient: "from-accent to-secondary" },
    { href: "/student/deliveries", label: "Deliveries", icon: Package, gradient: "from-accent to-primary" },
    { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy, gradient: "from-primary to-accent" },
    { href: "/student/payments", label: "Payments", icon: CreditCard, gradient: "from-secondary to-accent" },
    // { href: "/student/wishlist", label: "Wishlist", icon: Heart, gradient: "from-accent to-primary" },
    // { href: "/student/notifications", label: "Notifications", icon: Bell, gradient: "from-primary to-secondary" },
    { href: "/student/settings", label: "Settings", icon: Settings, gradient: "from-muted-foreground to-foreground" },
    { href: "/student/help", label: "Help", icon: HelpCircle, gradient: "from-secondary to-accent" },
  ], [])

  // Memoize active check
  const isActive = useCallback((href) => pathname === href, [pathname])
  
  // Memoize handlers
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen(prev => !prev), [])
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [setSidebarOpen, sidebarOpen])
  const handleLogout = useCallback(() => signOut({ callbackUrl: "/" }), [])

  // Fetch delivery count with React Query
  const { data: deliveryData, isLoading: deliveryLoading } = useQuery({
    queryKey: ["deliveries", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const res = await fetch("/api/student/deliveries", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch deliveries")
      }
      
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    enabled: !!session?.user?.id && session?.user?.role === "STUDENT",
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10 * 1000, // Consider data stale after 10 seconds
    retry: 2,
  })

  // Fetch live session count with React Query
  const { data: liveSessionData, isLoading: liveSessionLoading } = useQuery({
    queryKey: ["liveSessions", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { liveSessions: [] }
      
      const res = await fetch("/api/student/live-sessions", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch live sessions")
      }
      
      return await res.json()
    },
    enabled: !!session?.user?.id && session?.user?.role === "STUDENT",
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10 * 1000, // Consider data stale after 10 seconds
    retry: 2,
  })

  // Calculate counts from React Query data
  const deliveryCount = useMemo(() => {
    if (deliveryLoading || !deliveryData) return 0
    const deliveries = Array.isArray(deliveryData) ? deliveryData : []
    // Count non-delivered deliveries (PENDING, PROCESSING, SHIPPED)
    return deliveries.filter(
      (d) => d.status !== "DELIVERED" && d.status !== "CANCELLED"
    ).length
  }, [deliveryData, deliveryLoading])

  const liveSessionCount = useMemo(() => {
    if (liveSessionLoading || !liveSessionData) return 0
    const sessions = Array.isArray(liveSessionData?.liveSessions) ? liveSessionData.liveSessions : []
    // Count upcoming and live sessions
    const now = new Date()
    return sessions.filter((s) => {
      if (!s.scheduledAt) return false
      const scheduledAt = new Date(s.scheduledAt)
      const endTime = new Date(scheduledAt.getTime() + (s.duration || 60) * 60000)
      return (
        (s.status === "LIVE" || s.status === "SCHEDULED") &&
        now <= endTime &&
        scheduledAt >= new Date(now.getTime() - 24 * 60 * 60 * 1000) // Only show sessions from last 24 hours
      )
    }).length
  }, [liveSessionData, liveSessionLoading])

  // Check if user has viewed deliveries page
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkViewed = () => {
      const viewed = localStorage.getItem("deliveries-viewed")
      setHasViewedDeliveries(viewed === "true")
    }

    // Check on mount and pathname change
    checkViewed()

    // Mark as viewed when on deliveries page
    if (pathname === "/student/deliveries") {
      localStorage.setItem("deliveries-viewed", "true")
      setHasViewedDeliveries(true)
    }

    // Listen for storage changes (when page sets it)
    const handleStorageChange = (e) => {
      if (e.key === "deliveries-viewed") {
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

  // Check if user has viewed live sessions page
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkViewed = () => {
      const viewed = localStorage.getItem("live-sessions-viewed")
      setHasViewedLiveSessions(viewed === "true")
    }

    // Check on mount and pathname change
    checkViewed()

    // Mark as viewed when on live sessions page
    if (pathname === "/student/live-sessions") {
      localStorage.setItem("live-sessions-viewed", "true")
      setHasViewedLiveSessions(true)
    }

    // Listen for storage changes (when page sets it)
    const handleStorageChange = (e) => {
      if (e.key === "live-sessions-viewed") {
        setHasViewedLiveSessions(e.newValue === "true")
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

  // Track previous counts to detect when new items appear
  const prevDeliveryCountRef = useRef(0)
  const prevLiveSessionCountRef = useRef(0)

  // Reset viewed status when count goes from 0 to > 0 (new items appeared)
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // If delivery count increased from 0, reset viewed status
    if (prevDeliveryCountRef.current === 0 && deliveryCount > 0 && hasViewedDeliveries) {
      localStorage.removeItem("deliveries-viewed")
      setHasViewedDeliveries(false)
    }
    prevDeliveryCountRef.current = deliveryCount
    
    // If live session count increased from 0, reset viewed status
    if (prevLiveSessionCountRef.current === 0 && liveSessionCount > 0 && hasViewedLiveSessions) {
      localStorage.removeItem("live-sessions-viewed")
      setHasViewedLiveSessions(false)
    }
    prevLiveSessionCountRef.current = liveSessionCount
  }, [deliveryCount, liveSessionCount, hasViewedDeliveries, hasViewedLiveSessions])

  // Calculate badge count for deliveries (only show if not viewed and count > 0)
  const deliveryBadgeCount = useMemo(() => {
    // Don't show badge if loading, viewed, or count is 0
    if (deliveryLoading || hasViewedDeliveries || deliveryCount === 0) return 0
    return deliveryCount
  }, [hasViewedDeliveries, deliveryCount, deliveryLoading])

  // Calculate badge count for live sessions (only show if not viewed and count > 0)
  const liveSessionBadgeCount = useMemo(() => {
    // Don't show badge if loading, viewed, or count is 0
    if (liveSessionLoading || hasViewedLiveSessions || liveSessionCount === 0) return 0
    return liveSessionCount
  }, [hasViewedLiveSessions, liveSessionCount, liveSessionLoading])

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-md backdrop-blur-sm bg-card/95">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SmartLearn
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-all active:scale-95"
              aria-label="Toggle menu"
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
                    onClick={closeMobileMenu}
                    className={`w-full group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
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
                      {(item.href === "/student/deliveries" && deliveryBadgeCount > 0) && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                          {deliveryBadgeCount > 9 ? "9+" : deliveryBadgeCount}
                        </span>
                      )}
                      {(item.href === "/student/live-sessions" && liveSessionBadgeCount > 0) && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                          {liveSessionBadgeCount > 9 ? "9+" : liveSessionBadgeCount}
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

            {/* Mobile User Section & Logout */}
            <div className="p-4 border-t border-border space-y-3">
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    {session?.user?.name?.[0] || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{session?.user?.name || "Student"}</p>
                    <p className="text-xs text-muted-foreground">Active Learner</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 hover:shadow-md active:scale-[0.98]"
                aria-label="Logout"
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
        className={`hidden lg:block ${
          sidebarOpen ? "w-72" : "w-20"
        } min-w-[5rem] max-w-[18rem] bg-card border-r border-border min-h-screen sticky top-0 transition-all duration-300 shadow-lg flex-shrink-0`}
      >
        <div className="flex flex-col h-screen">
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
                    <p className="text-xs text-muted-foreground font-medium">Student Portal</p>
                  </div>
                )}
              </div>
              
              {/* Toggle Button */}
              {sidebarOpen && (
                <button
                  onClick={toggleSidebar}
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
                onClick={toggleSidebar}
                className="w-full mt-2 p-2 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className={`flex-1 ${sidebarOpen ? "p-4" : "p-2"} space-y-1 overflow-y-auto custom-scrollbar`}>
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
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          active ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-muted group-hover:bg-accent/20"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-foreground"}`} />
                      </div>
                      {(item.href === "/student/deliveries" && deliveryBadgeCount > 0) && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                          {deliveryBadgeCount > 9 ? "9+" : deliveryBadgeCount}
                        </span>
                      )}
                      {(item.href === "/student/live-sessions" && liveSessionBadgeCount > 0) && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                          {liveSessionBadgeCount > 9 ? "9+" : liveSessionBadgeCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span
                        className={`font-semibold text-sm ${
                          active ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent` : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                      {(item.href === "/student/deliveries" && deliveryBadgeCount > 0) && (
                        <span className="ml-2 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {deliveryBadgeCount > 9 ? "9+" : deliveryBadgeCount}
                        </span>
                      )}
                      {(item.href === "/student/live-sessions" && liveSessionBadgeCount > 0) && (
                        <span className="ml-2 w-5 h-5 bg-destructive text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {liveSessionBadgeCount > 9 ? "9+" : liveSessionBadgeCount}
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
                    {session?.user?.name?.[0] || "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{session?.user?.name || "Student"}</p>
                    <p className="text-xs text-muted-foreground">Active Learner</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 hover:shadow-md active:scale-[0.98] ${
                !sidebarOpen && "flex-col gap-1 py-2"
              }`}
              aria-label="Logout"
            >
              <LogOut className={`${sidebarOpen ? "w-5 h-5" : "w-6 h-6"}`} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile to prevent content from going under fixed header */}
      <div className="lg:hidden h-[57px] sm:h-[65px]"></div>
    </>
  )
}
