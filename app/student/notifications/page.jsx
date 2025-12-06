"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

export default function Notifications() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/student/notifications?studentId=${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
      <p className="text-gray-600 mb-8">Stay updated with course updates and messages</p>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">No notifications</p>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <Bell className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
