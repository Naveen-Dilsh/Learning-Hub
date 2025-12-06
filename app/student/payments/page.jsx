"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { CreditCard } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

export default function Payments() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchPayments()
    }
  }, [session])

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/student/payments?studentId=${session.user.id}`)
      
      if (res.ok) {
        const data = await res.json()
        console.log(data)
        console.log(data.payment)
        setPayments(data || [])
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div><LoadingBubbles/></div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
      <p className="text-gray-600 mb-8">View your course purchase history</p>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">No payments yet</p>
          <p className="text-gray-600">Your purchase history will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.course?.title || "Course"}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs. {payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {payment?.studentId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
