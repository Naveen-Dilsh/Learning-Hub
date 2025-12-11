"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useMemo, memo } from "react"
import { StudentSidebar } from "@/components/student-sidebar"
import { useDashboardStore } from "@/lib/stores"
import { LoadingScreen } from "@/components/loading-screen"

function StudentLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useDashboardStore()

  // Handle redirects - only run when status or role changes
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
    if (status === "authenticated") {
      if (session?.user?.role === "INSTRUCTOR") {
        router.push("/instructor/dashboard")
      } else if (session?.user?.role === "ADMIN") {
        router.push("/instructor/enrollments/pending")
      }
    }
  }, [status, session?.user?.role, router])

  // Memoize toggle function to prevent unnecessary re-renders of StudentSidebar
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen, setSidebarOpen])

  // Memoize early return conditions
  const shouldShowLoading = useMemo(() => status === "loading", [status])
  const shouldHideLayout = useMemo(
    () => status === "unauthenticated" || session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN",
    [status, session?.user?.role]
  )

  if (shouldShowLoading) {
    return <LoadingScreen />
  }

  if (shouldHideLayout) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar open={sidebarOpen} onToggle={handleToggleSidebar} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders when parent updates
export default memo(StudentLayout)
