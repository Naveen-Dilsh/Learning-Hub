"use client"

import { InstructorSidebar } from "@/components/instructor-sidebar"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { useDashboard } from "@/lib/hooks"

// Pages that ADMIN users are allowed to access
const ADMIN_ALLOWED_PAGES = [
  "/instructor/enrollments/pending",
  "/instructor/deliveries",
  "/instructor/students",
]

export default function InstructorLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { sidebarOpen } = useDashboard()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Check if user is not INSTRUCTOR or ADMIN
      if (session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
        router.push("/dashboard")
      }
      // If user is ADMIN, check if they're trying to access a restricted page
      else if (session?.user?.role === "ADMIN") {
        // Check if current path is not in the allowed list
        const isAllowedPage = ADMIN_ALLOWED_PAGES.some((allowedPath) => 
          pathname === allowedPath || pathname?.startsWith(allowedPath + "/")
        )
        if (!isAllowedPage) {
          // Redirect to first allowed page
          router.push(ADMIN_ALLOWED_PAGES[0])
        }
      }
    }
  }, [status, session, router, pathname])

  if (status === "loading") {
    return <LoadingScreen />
  }

  return (
    <div className="flex bg-background min-h-screen">
      <InstructorSidebar />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  )
}
