"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import Image from "next/image"

export default function PendingEnrollments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "INSTRUCTOR") {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchPendingEnrollments()
  }, [])

  const fetchPendingEnrollments = async () => {
    try {
      const res = await fetch("/api/instructor/enrollments/pending")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setEnrollments(data.enrollments)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (enrollmentId) => {
    if (!confirm("Are you sure you want to approve this enrollment?")) return

    setProcessing(enrollmentId)
    try {
      const res = await fetch(`/api/instructor/enrollments/${enrollmentId}/approve`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to approve")

      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId))
      alert("Enrollment approved successfully!")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to approve enrollment")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (enrollmentId) => {
    if (!confirm("Are you sure you want to reject this enrollment request?")) return

    setProcessing(enrollmentId)
    try {
      const res = await fetch(`/api/instructor/enrollments/${enrollmentId}/reject`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to reject")

      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId))
      alert("Enrollment rejected")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to reject enrollment")
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pending Enrollment Requests</h1>
          <p className="text-muted-foreground">Review and approve manual enrollment requests from students</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-card rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Pending Requests</h2>
            <p className="text-muted-foreground">All enrollment requests have been processed</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-card rounded-lg shadow-lg p-6 border border-border">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                        {enrollment.student.name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{enrollment.student.name}</h3>
                        <p className="text-sm text-muted-foreground">{enrollment.student.email}</p>
                        <div className="mt-1">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            Student #{enrollment.student.studentNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Course:</span>
                        <p className="text-foreground font-medium">{enrollment.course.title}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Price:</span>
                        <p className="text-foreground font-semibold">LKR {enrollment.course.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Requested:</span>
                        <p className="text-foreground">{new Date(enrollment.enrolledAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Receipt */}
                  <div className="lg:w-96">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Payment Receipt:</p>
                    <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border border-border">
                      <Image
                        src={enrollment.receiptImage || "/placeholder.svg"}
                        alt="Payment Receipt"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <a
                      href={enrollment.receiptImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-primary hover:underline inline-block"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => handleApprove(enrollment.id)}
                    disabled={processing === enrollment.id}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    {processing === enrollment.id ? "Processing..." : "Approve Enrollment"}
                  </button>
                  <button
                    onClick={() => handleReject(enrollment.id)}
                    disabled={processing === enrollment.id}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
