"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Calendar, DollarSign, CheckCircle2, Clock, XCircle, AlertCircle, Download } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"
import Image from "next/image"
import Link from "next/link"

// Payment status badge component
const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    COMPLETED: {
      label: "Completed",
      className: "bg-success/10 text-success border-success/20",
      icon: CheckCircle2,
    },
    PENDING: {
      label: "Pending",
      className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
      icon: Clock,
    },
    FAILED: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: XCircle,
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-muted text-muted-foreground border-border",
      icon: AlertCircle,
    },
  }

  const config = statusConfig[status] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

// Payment method badge
const PaymentMethodBadge = ({ method }) => {
  const methodLabels = {
    online: "Online",
    manual_atm: "Manual (ATM)",
    manual: "Manual",
    free: "Free",
  }

  return (
    <span className="text-xs text-muted-foreground font-medium">
      {methodLabels[method] || method || "N/A"}
    </span>
  )
}

export default function Payments() {
  const { data: session, status: authStatus } = useSession()
  const { toast } = useToast()

  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: ["payments", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const res = await fetch("/api/student/payments", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch payments")
      }

      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    enabled: authStatus === "authenticated" && !!session?.user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnMount: "always", // Always refetch when component mounts to ensure fresh data
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Loading Payments",
        description: error.message || "Failed to load payment history. Please try again.",
      })
    },
  })

  // Memoized computed values
  const totalAmount = useMemo(() => 
    payments
      .filter(p => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  )

  const completedCount = useMemo(() => 
    payments.filter(p => p.status === "COMPLETED").length,
    [payments]
  )

  const pendingCount = useMemo(() => 
    payments.filter(p => p.status === "PENDING").length,
    [payments]
  )

  // Show loading if query is loading OR if session is not ready yet
  if (isLoading || authStatus === "loading" || !session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles />
      </div>
    )
  }

  // Show error state (optional - error toast already shown via onError)
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Payment History</h1>
            <p className="text-sm sm:text-base text-muted-foreground">View your course purchase history and payment details</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-card rounded-xl shadow-sm border border-border p-8 sm:p-12 text-center">
            <p className="text-base sm:text-lg font-semibold text-destructive mb-2">Error Loading Payments</p>
            <p className="text-sm sm:text-base text-muted-foreground">{error?.message || "Failed to load payment history. Please try again."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Payment History</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View your course purchase history and payment details</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        {payments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">Rs. {totalAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{completedCount}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{pendingCount}</p>
                </div>
                <div className="p-3 bg-chart-5/10 rounded-lg">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-chart-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="bg-card rounded-xl shadow-sm border border-border p-8 sm:p-12 text-center">
            <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-base sm:text-lg font-semibold text-foreground mb-2">No payments yet</p>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Your purchase history will appear here</p>
            <Link
              href="/student/browse-course"
              className="btn-primary inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Course</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Method</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {payment.course?.thumbnail && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                              <Image
                                src={payment.course.thumbnail}
                                alt={payment.course.title || "Course"}
                                fill
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {payment.course?.title || "Course"}
                            </p>
                            {payment.payHereOrderId && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Order: {payment.payHereOrderId}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <p className="text-sm font-semibold text-foreground">
                          Rs. {payment.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{payment.currency || "LKR"}</p>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <PaymentMethodBadge method={payment.paymentMethod} />
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(payment.createdAt).toLocaleDateString("en-US", { 
                            year: "numeric", 
                            month: "short", 
                            day: "numeric" 
                          })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(payment.createdAt).toLocaleTimeString("en-US", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </p>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {payment.course?.thumbnail && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                        <Image
                          src={payment.course.thumbnail}
                          alt={payment.course.title || "Course"}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
                        {payment.course?.title || "Course"}
                      </h3>
                      <p className="text-lg font-bold text-primary mb-2">
                        Rs. {payment.amount.toLocaleString()}
                      </p>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                      <PaymentMethodBadge method={payment.paymentMethod} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(payment.createdAt).toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric",
                          year: "numeric"
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {payment.payHereOrderId && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="text-xs font-mono text-foreground mt-0.5 break-all">
                        {payment.payHereOrderId}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
