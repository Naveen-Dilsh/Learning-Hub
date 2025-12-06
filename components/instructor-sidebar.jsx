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
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

export function InstructorSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useDashboard()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-primary to-accent" },
    { href: "/instructor/courses", label: "My Courses", icon: BookOpen, gradient: "from-accent to-primary" },
    { href: "/instructor/upload-videos", label: "Upload Videos", icon: Upload, gradient: "from-primary to-secondary" },
    { href: "/instructor/earnings", label: "Earnings", icon: DollarSign, gradient: "from-secondary to-accent" },
    { href: "/instructor/students", label: "Students", icon: Users, gradient: "from-accent to-secondary" },
    { href: "/instructor/analytics", label: "Analytics", icon: BarChart3, gradient: "from-primary to-accent" },
    { href: "/instructor/messages", label: "Messages", icon: MessageSquare, gradient: "from-secondary to-primary" },
    {
      href: "/instructor/enrollments/pending",
      label: "Enrollments",
      icon: UserCheck,
      gradient: "from-accent to-primary",
    },
    {
      href: "/instructor/profile",
      label: "Profile Settings",
      icon: Settings,
      gradient: "from-muted-foreground to-foreground",
    },
  ]

  const isActive = (href) => pathname === href

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

                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        active ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-muted group-hover:bg-accent/20"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-foreground"}`} />
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
        className={`hidden lg:block ${
          sidebarOpen ? "w-72" : "w-20"
        } bg-card border-r border-border min-h-screen sticky top-0 transition-all duration-300 shadow-lg`}
      >
        <div className="flex flex-col h-screen">
          {/* Header Section */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
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
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-8 h-8 rounded-lg bg-muted hover:bg-accent/20 flex items-center justify-center transition-all duration-200 hover:shadow-md"
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-foreground" />
                )}
              </button>
            </div>
            {sidebarOpen && <ThemeToggle />}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    active ? "bg-muted shadow-md" : "hover:bg-muted/50"
                  }`}
                  title={!sidebarOpen ? item.label : ""}
                >
                  {active && (
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full`}
                    ></div>
                  )}

                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      active ? `bg-gradient-to-br ${item.gradient} shadow-lg` : "bg-muted group-hover:bg-accent/20"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-foreground"}`} />
                  </div>

                  {sidebarOpen && (
                    <span
                      className={`font-semibold text-sm ${
                        active ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent` : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {!active && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section & Logout */}
          <div className="p-4 border-t border-border space-y-3">
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
