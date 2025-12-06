"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { StudentSidebar } from "@/components/student-sidebar"
import { useDashboardStore } from "@/lib/stores"
import { LoadingScreen } from "@/components/loading-screen"

export default function StudentLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useDashboardStore()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.role === "INSTRUCTOR") {
      router.push("/instructor/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return <LoadingScreen />
  }

  if (status === "unauthenticated" || session?.user?.role === "INSTRUCTOR") {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
