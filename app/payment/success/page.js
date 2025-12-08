"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { CheckCircle, Loader2, XCircle, ArrowRight, Home, BookOpen, PlayCircle, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [status, setStatus] = useState("verifying")
  const [message, setMessage] = useState("")
  const [courseId, setCourseId] = useState(null)

  const orderId = searchParams.get("order_id")

  useEffect(() => {
    if (orderId) {
      verifyPayment()
    } else {
      setStatus("error")
      setMessage("No order ID found")
    }
  }, [orderId])

  const verifyPayment = useCallback(async () => {
    try {
      setStatus("verifying")
      const response = await fetch("/api/payhere/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Payment verified successfully!")
        
        // Extract course ID from response
        if (data.courseId) {
          setCourseId(data.courseId)
        } else if (data.payment?.courseId) {
          setCourseId(data.payment.courseId)
        } else if (params?.id) {
          setCourseId(params.id)
        } else {
          // Try to get from searchParams
          const courseIdParam = searchParams.get("course_id")
          if (courseIdParam) {
            setCourseId(courseIdParam)
          }
        }
        
        // Immediately refetch queries to update UI
        await queryClient.refetchQueries({ 
          queryKey: ["enrollments"],
          exact: false
        })
        await queryClient.refetchQueries({ 
          queryKey: ["payments"],
          exact: false
        })
        
        // Invalidate related queries
        queryClient.invalidateQueries({ 
          queryKey: ["enrollments"],
          exact: false
        })
        queryClient.invalidateQueries({ 
          queryKey: ["payments"],
          exact: false
        })
        
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to verify payment")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while verifying payment")
    }
  }, [orderId, queryClient, params?.id])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        {/* Verifying State */}
        {status === "verifying" && (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 px-6 sm:px-8 py-8 sm:py-12 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Verifying Payment
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Please wait while we confirm your payment. This may take a few moments...
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-success/20 via-emerald-500/10 to-success/20 px-6 sm:px-8 py-8 sm:py-12 text-center relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-success rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-emerald-500 rounded-full blur-3xl animate-pulse delay-300"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-success/20 rounded-full flex items-center justify-center border-4 border-success/30 shadow-lg animate-in zoom-in-95 duration-500">
                  <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-success" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  Payment Successful!
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {message}
                </p>
              </div>
            </div>

            {/* Success Content */}
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">
                      Enrollment Confirmed
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      You now have full access to the course content. Start learning right away!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                {courseId && (
                  <Link
                    href={`/student/browse-course/${courseId}/watch`}
                    className="btn-primary w-full flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all group"
                  >
                    <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Start Learning Now</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Link
                    href="/student"
                    className="btn-secondary flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base active:scale-[0.98] transition-all"
                  >
                    <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/student/courses"
                    className="btn-secondary flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base active:scale-[0.98] transition-all"
                  >
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>My Courses</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden animate-in fade-in duration-300">
            {/* Error Header */}
            <div className="bg-gradient-to-br from-destructive/20 via-red-500/10 to-destructive/20 px-6 sm:px-8 py-8 sm:py-12 text-center relative overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-1/4 w-32 h-32 bg-destructive rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-red-500 rounded-full blur-3xl animate-pulse delay-300"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-destructive/20 rounded-full flex items-center justify-center border-4 border-destructive/30 shadow-lg">
                  <XCircle className="w-12 h-12 sm:w-14 sm:h-14 text-destructive" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                  Payment Verification Failed
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                  {message}
                </p>
              </div>
            </div>

            {/* Error Content */}
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-destructive/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">
                      Verification Issue
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      We couldn't verify your payment. Please try again or contact support if the issue persists.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={verifyPayment}
                  className="btn-primary w-full flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Try Again</span>
                </button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {courseId && (
                    <Link
                      href={`/student/browse-course/${courseId}`}
                      className="btn-secondary flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base active:scale-[0.98] transition-all"
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                      <span>Back to Course</span>
                    </Link>
                  )}
                  
                  <Link
                    href="/student/browse-course"
                    className="btn-secondary flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base active:scale-[0.98] transition-all"
                  >
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Browse Courses</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}