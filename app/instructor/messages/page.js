"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Messages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    setLoading(false)
  }, [])

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
      <p className="text-gray-500 mb-8">Respond to student questions and inquiries</p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <p className="font-medium">No messages yet</p>
          <p className="text-sm">When students ask questions, you'll see them here</p>
        </div>
      </div>
    </div>
  )
}
