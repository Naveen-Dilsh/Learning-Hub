"use client"

import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import LoadingBubbles from "@/components/loadingBubbles"
import {
  FileText,
  User,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  ImageIcon,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"

// Memoized Enrollment Card Component
const EnrollmentCard = memo(({ enrollment, onApprove, onReject, processing }) => {
  const formattedDate = useMemo(
    () => new Date(enrollment.enrolledAt).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    [enrollment.enrolledAt]
  )

  const formattedPrice = useMemo(
    () => `Rs. ${enrollment.course.price.toLocaleString()}`,
    [enrollment.course.price]
  )

  const isProcessing = useMemo(() => processing === enrollment.id, [processing, enrollment.id])

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl sm:text-2xl font-bold flex-shrink-0 border border-border">
              {enrollment.student.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 line-clamp-1">
                {enrollment.student.name || "Anonymous"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                {enrollment.student.email}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                #{enrollment.student.studentNumber || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Course:</span>
                <p className="text-sm sm:text-base text-foreground font-medium line-clamp-2">
                  {enrollment.course.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Price:</span>
                <p className="text-sm sm:text-base text-foreground font-semibold">{formattedPrice}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Requested:</span>
                <p className="text-xs sm:text-sm text-foreground">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Receipt */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Payment Receipt:</p>
          </div>
          <div className="relative w-full h-48 sm:h-64 bg-muted rounded-lg sm:rounded-xl overflow-hidden border border-border">
            <Image
              src={enrollment.receiptImage || "/placeholder.svg"}
              alt="Payment Receipt"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 384px"
              unoptimized
            />
          </div>
          {enrollment.receiptImage && (
            <a
              href={enrollment.receiptImage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              View Full Size
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          onClick={() => onApprove(enrollment.id)}
          disabled={isProcessing}
          className="flex-1 btn-success flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Approve Enrollment</span>
            </>
          )}
        </button>
        <button
          onClick={() => onReject(enrollment.id)}
          disabled={isProcessing}
          className="flex-1 btn-danger flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  )
})

EnrollmentCard.displayName = "EnrollmentCard"

export default function PendingEnrollments() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [processing, setProcessing] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null) // { type: 'approve' | 'reject', enrollmentId: string }

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [authStatus, session, router])

  const {
    data: enrollmentsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pendingEnrollments", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { enrollments: [] }
      
      const res = await fetch("/api/instructor/enrollments/pending", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch enrollments")
      }
      
      return await res.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to load pending enrollments",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      // Mark enrollments as viewed when data loads successfully
      if (typeof window !== "undefined") {
        localStorage.setItem("instructor-enrollments-viewed", "true")
      }
    },
  })

  const enrollments = useMemo(() => enrollmentsData?.enrollments || [], [enrollmentsData])

  const handleApproveClick = useCallback((enrollmentId) => {
    setConfirmModal({ type: "approve", enrollmentId })
  }, [])

  const handleRejectClick = useCallback((enrollmentId) => {
    setConfirmModal({ type: "reject", enrollmentId })
  }, [])

  const approveEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      const res = await fetch(`/api/instructor/enrollments/${enrollmentId}/approve`, {
        method: "POST",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to approve enrollment")
      }

      return await res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch pending enrollments
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments", session?.user?.id] })
      
      toast({
        title: "Success",
        description: "Enrollment approved successfully!",
      })
      setConfirmModal(null)
      setProcessing(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve enrollment",
        variant: "destructive",
      })
      setProcessing(null)
    },
  })

  const rejectEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId) => {
      const res = await fetch(`/api/instructor/enrollments/${enrollmentId}/reject`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to reject enrollment")
      }

      return await res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch pending enrollments
      queryClient.invalidateQueries({ queryKey: ["pendingEnrollments", session?.user?.id] })
      
      toast({
        title: "Success",
        description: "Enrollment request rejected",
      })
      setConfirmModal(null)
      setProcessing(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject enrollment",
        variant: "destructive",
      })
      setProcessing(null)
    },
  })

  const handleConfirm = useCallback(() => {
    if (!confirmModal) return

    const { type, enrollmentId } = confirmModal
    setProcessing(enrollmentId)

    if (type === "approve") {
      approveEnrollmentMutation.mutate(enrollmentId)
    } else {
      rejectEnrollmentMutation.mutate(enrollmentId)
    }
  }, [confirmModal, approveEnrollmentMutation, rejectEnrollmentMutation])

  const handleCancel = useCallback(() => {
    setConfirmModal(null)
  }, [])


  const enrollmentCount = useMemo(() => enrollments.length, [enrollments])

  if (authStatus === "loading" || isLoading || !session?.user?.id) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Pending Enrollment Requests
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Review and approve manual enrollment requests from students
                </p>
              </div>
            </div>

            {/* Count Badge */}
            {enrollmentCount > 0 && (
              <div className="bg-muted px-3 sm:px-4 py-2 rounded-lg border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">Pending Requests</div>
                <div className="text-lg sm:text-xl font-bold text-foreground">{enrollmentCount}</div>
              </div>
            )}
          </div>
        </div>

        {/* Enrollments List */}
        {enrollmentCount === 0 ? (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-8 sm:p-12 text-center">
            <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              No Pending Requests
            </h2>
            <p className="text-muted-foreground">
              All enrollment requests have been processed
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {enrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                processing={processing}
              />
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200 border border-border">
              {/* Modal Header */}
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-border">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      confirmModal.type === "approve"
                        ? "bg-success/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    {confirmModal.type === "approve" ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      {confirmModal.type === "approve"
                        ? "Approve Enrollment?"
                        : "Reject Enrollment?"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {confirmModal.type === "approve"
                        ? "This action will approve the enrollment request"
                        : "This action cannot be undone"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                <div className="bg-muted border-l-4 border-chart-5 rounded-xl p-4 mb-6">
                  <p className="text-foreground text-sm sm:text-base">
                    {confirmModal.type === "approve"
                      ? "Are you sure you want to approve this enrollment request? The student will be able to access the course immediately."
                      : "Are you sure you want to reject this enrollment request? This action cannot be undone and the student will be notified."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={
                      processing === confirmModal.enrollmentId &&
                      (approveEnrollmentMutation.isPending || rejectEnrollmentMutation.isPending)
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all ${
                      confirmModal.type === "approve"
                        ? "btn-success"
                        : "btn-danger"
                    }`}
                  >
                    {processing === confirmModal.enrollmentId &&
                    (approveEnrollmentMutation.isPending || rejectEnrollmentMutation.isPending) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {confirmModal.type === "approve" ? (
                          <>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Approve</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Reject</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
