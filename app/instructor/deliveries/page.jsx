"use client"

import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import LoadingBubbles from "@/components/loadingBubbles"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Edit,
  Trash2,
  X,
  Save,
} from "lucide-react"

const STATUS_CONFIG = {
  PENDING: { label: "Pending", icon: Clock, color: "text-chart-5", bg: "bg-chart-5/10" },
  PROCESSING: { label: "Processing", icon: Package, color: "text-primary", bg: "bg-primary/10" },
  SHIPPED: { label: "Shipped", icon: Truck, color: "text-secondary", bg: "bg-secondary/10" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
}

// Memoized Delivery Card Component
const DeliveryCard = memo(({ delivery, onEdit, onDelete, onStatusUpdate }) => {
  const statusConfig = useMemo(() => STATUS_CONFIG[delivery.status], [delivery.status])
  const StatusIcon = statusConfig.icon

  const formattedDate = useMemo(
    () => new Date(delivery.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    [delivery.createdAt]
  )

  const address = useMemo(() => {
    const parts = [
      delivery.addressLine1,
      delivery.addressLine2,
      delivery.city,
      delivery.district,
      delivery.postalCode,
    ].filter(Boolean)
    return parts.join(", ")
  }, [delivery])

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg} border border-border flex-shrink-0`}
            >
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`text-xs sm:text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-foreground mb-1 line-clamp-1">
                {delivery.fullName}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Student #{delivery.enrollment?.student?.studentNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {delivery.status === "PENDING" && (
              <button
                onClick={() => onStatusUpdate(delivery.id, "PROCESSING")}
                className="btn-primary inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
              >
                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Start Processing</span>
                <span className="sm:hidden">Process</span>
              </button>
            )}

            {delivery.status === "PROCESSING" && (
              <button
                onClick={() => onEdit(delivery)}
                className="btn-secondary inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
              >
                <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Mark as Shipped</span>
                <span className="sm:hidden">Ship</span>
              </button>
            )}

            {delivery.status === "SHIPPED" && (
              <button
                onClick={() => onStatusUpdate(delivery.id, "DELIVERED")}
                className="btn-success inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Mark Delivered</span>
                <span className="sm:hidden">Delivered</span>
              </button>
            )}

            <button
              onClick={() => onEdit(delivery)}
              className="btn-secondary inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={() => onDelete(delivery.id)}
              className="btn-danger inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-muted rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Course</p>
          <p className="text-sm sm:text-base font-semibold text-foreground">
            {delivery.enrollment?.course?.title || "N/A"}
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Phone</p>
            <p className="text-sm sm:text-base text-foreground">{delivery.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm sm:text-base text-foreground line-clamp-1">
              {delivery.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Address</p>
          <p className="text-sm sm:text-base text-foreground">{address}</p>
        </div>

        {/* Tracking Info */}
        {delivery.trackingNumber && (
          <div className="bg-muted rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Tracking Information</p>
            <p className="text-sm sm:text-base font-mono text-foreground mb-1">
              {delivery.trackingNumber}
            </p>
            {delivery.courier && (
              <p className="text-xs sm:text-sm text-muted-foreground">Courier: {delivery.courier}</p>
            )}
          </div>
        )}

        {/* Notes */}
        {delivery.notes && (
          <div className="bg-muted rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Internal Notes</p>
            <p className="text-sm sm:text-base text-foreground italic">{delivery.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-wrap gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border text-xs text-muted-foreground">
          <span>Created: {formattedDate}</span>
          {delivery.shippedAt && (
            <span>
              Shipped: {new Date(delivery.shippedAt).toLocaleDateString()}
            </span>
          )}
          {delivery.deliveredAt && (
            <span>
              Delivered: {new Date(delivery.deliveredAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

DeliveryCard.displayName = "DeliveryCard"

export default function InstructorDeliveries() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [deliveries, setDeliveries] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDeliveries()
    }
  }, [session, filterStatus])

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus) params.append("status", filterStatus)

      const res = await fetch(`/api/instructor/deliveries?${params}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch deliveries")
      }
      const data = await res.json()
      setDeliveries(data.deliveries || [])
      setCounts(data.counts || {})
    } catch (error) {
      console.error("Error fetching deliveries:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load deliveries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filterStatus, toast])

  const updateDelivery = useCallback(
    async (id, updateData) => {
      setUpdating(true)
      try {
        const res = await fetch(`/api/instructor/deliveries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to update delivery")
        }

        await fetchDeliveries()
        setSelectedDelivery(null)
        toast({
          title: "Success",
          description: "Delivery updated successfully!",
        })
      } catch (error) {
        console.error("Error updating delivery:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to update delivery",
          variant: "destructive",
        })
      } finally {
        setUpdating(false)
      }
    },
    [fetchDeliveries, toast]
  )

  const handleStatusUpdate = useCallback(
    (id, status) => {
      updateDelivery(id, { status })
    },
    [updateDelivery]
  )

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this delivery record?")) return

      setDeleting(id)
      try {
        const res = await fetch(`/api/instructor/deliveries/${id}`, {
          method: "DELETE",
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to delete delivery")
        }

        await fetchDeliveries()
        toast({
          title: "Success",
          description: "Delivery deleted successfully!",
        })
      } catch (error) {
        console.error("Error deleting delivery:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete delivery",
          variant: "destructive",
        })
      } finally {
        setDeleting(null)
      }
    },
    [fetchDeliveries, toast]
  )

  const handleEdit = useCallback((delivery) => {
    setSelectedDelivery(delivery)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedDelivery(null)
  }, [])

  const filteredDeliveries = useMemo(() => {
    if (!searchQuery.trim()) return deliveries

    const query = searchQuery.toLowerCase()
    return deliveries.filter(
      (delivery) =>
        delivery.fullName?.toLowerCase().includes(query) ||
        delivery.phone?.includes(query) ||
        delivery.city?.toLowerCase().includes(query) ||
        delivery.enrollment?.student?.studentNumber?.toString().includes(query) ||
        delivery.enrollment?.course?.title?.toLowerCase().includes(query) ||
        delivery.trackingNumber?.toLowerCase().includes(query)
    )
  }, [deliveries, searchQuery])

  if (authStatus === "loading" || loading) {
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
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Delivery Management
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Track and manage course material deliveries
                </p>
              </div>
            </div>
          </div>

          {/* Status counts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const Icon = config.icon
              const count = counts[key] || 0
              const isActive = filterStatus === key

              return (
                <button
                  key={key}
                  onClick={() => setFilterStatus(isActive ? "" : key)}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:bg-muted/50 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.color}`} />
                    <span className="text-xl sm:text-2xl font-bold text-foreground">{count}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{config.label}</p>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, city, student number, course, or tracking..."
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Deliveries list */}
        {filteredDeliveries.length === 0 ? (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-8 sm:p-12 text-center">
            <Package className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              {searchQuery ? "No deliveries found" : "No deliveries yet"}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : "Deliveries will appear here once students request course materials"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {selectedDelivery && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200 border border-border">
              {/* Modal Header */}
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-border">
                      <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Update Delivery</h2>
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        {selectedDelivery.fullName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-muted-foreground hover:text-foreground transition-colors text-2xl sm:text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  updateDelivery(selectedDelivery.id, {
                    status: formData.get("status"),
                    trackingNumber: formData.get("trackingNumber") || null,
                    courier: formData.get("courier") || null,
                    notes: formData.get("notes") || null,
                  })
                }}
                className="p-6 sm:p-8 space-y-4 sm:space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedDelivery.status}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tracking Number</label>
                  <input
                    type="text"
                    name="trackingNumber"
                    defaultValue={selectedDelivery.trackingNumber || ""}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    placeholder="Enter tracking number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Courier Service</label>
                  <input
                    type="text"
                    name="courier"
                    defaultValue={selectedDelivery.courier || ""}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    placeholder="e.g., DHL, Pronto, Domex"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Internal Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={selectedDelivery.notes || ""}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground resize-none"
                    placeholder="Notes for internal use..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
