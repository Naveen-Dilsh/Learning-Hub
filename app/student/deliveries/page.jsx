"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react"

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-500",
    message: "Your order is waiting to be processed",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "text-blue-500",
    message: "Your materials are being prepared",
  },
  SHIPPED: { label: "Shipped", icon: Truck, color: "text-purple-500", message: "Your package is on its way!" },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-500",
    message: "Your package has been delivered",
  },
}

export default function StudentDeliveries() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session) {
      fetchDeliveries()
    }
  }, [session])

  const fetchDeliveries = async () => {
    try {
      const res = await fetch("/api/student/deliveries")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setDeliveries(data)
    } catch (error) {
      console.error("Error fetching deliveries:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/student/dashboard" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">My Deliveries</h1>
          <p className="text-muted-foreground mt-1">Track your course material deliveries</p>
        </div>

        {deliveries.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No deliveries found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {deliveries.map((delivery) => {
              const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.PENDING
              const StatusIcon = statusConfig.icon

              return (
                <div key={delivery.id} className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-full bg-muted ${statusConfig.color}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{delivery.enrollment?.course?.title}</h3>
                      <p className={`text-sm ${statusConfig.color}`}>{statusConfig.message}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${statusConfig.color} bg-muted`}>
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map((step, index) => {
                        const stepIndex = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(delivery.status)
                        const isCompleted = index <= stepIndex
                        const StepIcon = STATUS_CONFIG[step].icon

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span className="text-xs mt-1 text-muted-foreground">{STATUS_CONFIG[step].label}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(delivery.status) + 1) * 25}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Delivery details */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <p className="text-foreground">{delivery.fullName}</p>
                        <p className="text-muted-foreground">{delivery.addressLine1}</p>
                        {delivery.addressLine2 && <p className="text-muted-foreground">{delivery.addressLine2}</p>}
                        <p className="text-muted-foreground">
                          {delivery.city}, {delivery.district} {delivery.postalCode}
                        </p>
                      </div>
                    </div>

                    {delivery.trackingNumber && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Tracking Number:</span>{" "}
                          <span className="font-mono text-foreground">{delivery.trackingNumber}</span>
                        </p>
                        {delivery.courier && (
                          <p className="text-sm text-muted-foreground">Courier: {delivery.courier}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Requested: {new Date(delivery.createdAt).toLocaleDateString()}</span>
                    {delivery.shippedAt && <span>Shipped: {new Date(delivery.shippedAt).toLocaleDateString()}</span>}
                    {delivery.deliveredAt && (
                      <span>Delivered: {new Date(delivery.deliveredAt).toLocaleDateString()}</span>
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
