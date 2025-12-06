"use client"

import { InstructorSidebar } from "@/components/instructor-sidebar"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function InstructorLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return <LoadingScreen />
  }

  return (
    <div className="flex bg-background min-h-screen">
      <InstructorSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
