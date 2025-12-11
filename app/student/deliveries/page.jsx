"use client"

import { useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import LoadingBubbles from "@/components/loadingBubbles"
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowLeft } from "lucide-react"

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "text-chart-5",
    bgClassName: "bg-chart-5/10",
    borderClassName: "border-chart-5/20",
    message: "Your order is waiting to be processed",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    className: "text-primary",
    bgClassName: "bg-primary/10",
    borderClassName: "border-primary/20",
    message: "Your materials are being prepared",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    className: "text-secondary",
    bgClassName: "bg-secondary/10",
    borderClassName: "border-secondary/20",
    message: "Your package is on its way!",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    className: "text-success",
    bgClassName: "bg-success/10",
    borderClassName: "border-success/20",
    message: "Your package has been delivered",
  },
}

export default function StudentDeliveries() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const {
    data: deliveries = [],
    isLoading,
    isError,
    error,
    isSuccess,
    isFetching,
  } = useQuery({
    queryKey: ["deliveries", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const res = await fetch("/api/student/deliveries", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch deliveries")
      }

      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    enabled: authStatus === "authenticated" && !!session?.user?.id,
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Loading Deliveries",
        description: error.message || "Failed to load deliveries. Please try again.",
      })
    },
    onSuccess: () => {
      // Mark deliveries as viewed when data loads successfully
      if (typeof window !== "undefined") {
        localStorage.setItem("deliveries-viewed", "true")
      }
    },
  })

  // Redirect if unauthenticated
  if (authStatus === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  // Memoized status counts
  const statusCounts = useMemo(() => {
    return deliveries.reduce((acc, delivery) => {
      acc[delivery.status] = (acc[delivery.status] || 0) + 1
      return acc
    }, {})
  }, [deliveries])

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
            <Link 
              href="/student"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 sm:mb-3 font-medium transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Deliveries</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Track your course material deliveries</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-12 sm:py-16 bg-card rounded-xl border border-border">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-4" />
            <p className="text-base sm:text-lg font-semibold text-destructive mb-2">Error Loading Deliveries</p>
            <p className="text-sm sm:text-base text-muted-foreground">{error?.message || "Failed to load deliveries. Please try again."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            My Deliveries
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your course material deliveries
          </p>
        </div>
        {/* Stats Cards */}
        {deliveries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = statusCounts[status] || 0
              const Icon = config.icon
              
              return (
                <div key={status} className="bg-card rounded-xl border border-border p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 ${config.bgClassName} rounded-lg`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.className}`} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-foreground">{count}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{config.label}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Deliveries List */}
        {deliveries.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-card rounded-xl border border-border">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-base sm:text-lg font-semibold text-foreground mb-2">No deliveries found</p>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your course material deliveries will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {deliveries.map((delivery) => {
              const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.PENDING
              const StatusIcon = statusConfig.icon
              const progressSteps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
              const currentStepIndex = progressSteps.indexOf(delivery.status)

              return (
                <div key={delivery.id} className="bg-card rounded-xl border border-border p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className={`p-2 sm:p-3 rounded-full ${statusConfig.bgClassName} flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${statusConfig.className}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1 line-clamp-2">
                        {delivery.enrollment?.course?.title || "Course Materials"}
                      </h3>
                      <p className={`text-xs sm:text-sm ${statusConfig.className}`}>{statusConfig.message}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${statusConfig.className} ${statusConfig.bgClassName} border ${statusConfig.borderClassName} flex-shrink-0`}>
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex justify-between mb-2 sm:mb-3">
                      {progressSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex
                        const StepIcon = STATUS_CONFIG[step].icon
                        const stepConfig = STATUS_CONFIG[step]

                        return (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                isCompleted 
                                  ? `bg-primary text-primary-foreground ${stepConfig.bgClassName}` 
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <StepIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-muted-foreground text-center">
                              {stepConfig.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-primary transition-all duration-500`}
                        style={{
                          width: `${(currentStepIndex + 1) * 25}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Delivery details */}
                  <div className={`${statusConfig.bgClassName} rounded-lg p-3 sm:p-4 border ${statusConfig.borderClassName}`}>
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${statusConfig.className} mt-0.5 flex-shrink-0`} />
                      <div className="text-xs sm:text-sm flex-1 min-w-0">
                        <p className="font-semibold text-foreground mb-1">{delivery.fullName}</p>
                        <p className="text-muted-foreground">{delivery.addressLine1}</p>
                        {delivery.addressLine2 && (
                          <p className="text-muted-foreground">{delivery.addressLine2}</p>
                        )}
                        <p className="text-muted-foreground">
                          {delivery.city}, {delivery.district}
                          {delivery.postalCode && ` ${delivery.postalCode}`}
                        </p>
                        {delivery.phone && (
                          <p className="text-muted-foreground mt-1">Phone: {delivery.phone}</p>
                        )}
                      </div>
                    </div>

                    {delivery.trackingNumber && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs sm:text-sm mb-1">
                          <span className="text-muted-foreground">Tracking Number:</span>{" "}
                          <span className="font-mono text-foreground font-semibold break-all">
                            {delivery.trackingNumber}
                          </span>
                        </p>
                        {delivery.courier && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Courier: <span className="font-medium text-foreground">{delivery.courier}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium">Requested:</span>{" "}
                      {new Date(delivery.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {delivery.shippedAt && (
                      <span>
                        <span className="font-medium">Shipped:</span>{" "}
                        {new Date(delivery.shippedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {delivery.deliveredAt && (
                      <span>
                        <span className="font-medium">Delivered:</span>{" "}
                        {new Date(delivery.deliveredAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
