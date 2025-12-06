"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Earnings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [earnings, setEarnings] = useState([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchEarnings()
    }
  }, [session])

  const fetchEarnings = async () => {
    try {
      const res = await fetch(`/api/instructor/dashboard?instructorId=${session.user.id}`)
      const data = await res.json()
      setTotalEarnings(data.stats.totalEarnings)
      // TODO: Fetch detailed payout history
    } catch (error) {
      console.error("Error fetching earnings:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings</h1>
      <p className="text-gray-500 mb-8">View payout history and earnings summary</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">Rs. {totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Pending Payouts</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">Rs. 0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Paid Out</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">Rs. 0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>No payout records yet</p>
        </div>
      </div>
    </div>
  )
}
