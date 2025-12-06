"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, Truck, CheckCircle, Clock, XCircle, Search } from "lucide-react"

const STATUS_CONFIG = {
  PENDING: { label: "Pending", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  PROCESSING: { label: "Processing", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
  SHIPPED: { label: "Shipped", icon: Truck, color: "text-purple-500", bg: "bg-purple-500/10" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
}

export default function InstructorDeliveries() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [deliveries, setDeliveries] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [authStatus, session, router])

  useEffect(() => {
    fetchDeliveries()
  }, [filterStatus])

  const fetchDeliveries = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append("status", filterStatus)

      const res = await fetch(`/api/instructor/deliveries?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setDeliveries(data.deliveries)
      setCounts(data.counts)
    } catch (error) {
      console.error("Error fetching deliveries:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateDelivery = async (id, updateData) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/instructor/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) throw new Error("Failed to update")

      await fetchDeliveries()
      setSelectedDelivery(null)
    } catch (error) {
      console.error("Error updating delivery:", error)
      alert("Failed to update delivery")
    } finally {
      setUpdating(false)
    }
  }

  const deleteDelivery = async (id) => {
    if (!confirm("Are you sure you want to delete this delivery record?")) return

    try {
      const res = await fetch(`/api/instructor/deliveries/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete")

      await fetchDeliveries()
    } catch (error) {
      console.error("Error deleting delivery:", error)
      alert("Failed to delete delivery")
    }
  }

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      delivery.fullName.toLowerCase().includes(query) ||
      delivery.phone.includes(query) ||
      delivery.city.toLowerCase().includes(query) ||
      delivery.enrollment?.student?.studentNumber?.toString().includes(query) ||
      delivery.enrollment?.course?.title.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/instructor/dashboard" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Delivery Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage book deliveries for your courses</p>
        </div>

        {/* Status counts */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            const count = counts[key] || 0
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(filterStatus === key ? "" : key)}
                className={`p-4 rounded-lg border transition ${
                  filterStatus === key ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="text-2xl font-bold text-foreground">{count}</span>
                </div>
                <p className="text-sm text-muted-foreground">{config.label}</p>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, city, student number, or course..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        </div>

        {/* Deliveries list */}
        <div className="space-y-4">
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deliveries found</p>
            </div>
          ) : (
            filteredDeliveries.map((delivery) => {
              const statusConfig = STATUS_CONFIG[delivery.status]
              const StatusIcon = statusConfig.icon

              return (
                <div key={delivery.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Status badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                      </div>

                      {/* Main info */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{delivery.fullName}</h3>
                          <span className="text-sm text-muted-foreground">
                            (Student #{delivery.enrollment?.student?.studentNumber || "N/A"})
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          Course: <span className="text-foreground">{delivery.enrollment?.course?.title}</span>
                        </p>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Phone: {delivery.phone}</p>
                          <p>
                            Address: {delivery.addressLine1}
                            {delivery.addressLine2 && `, ${delivery.addressLine2}`}
                          </p>
                          <p>
                            {delivery.city}, {delivery.district} {delivery.postalCode}
                          </p>
                        </div>

                        {delivery.trackingNumber && (
                          <p className="text-sm mt-2">
                            <span className="text-muted-foreground">Tracking:</span>{" "}
                            <span className="text-foreground font-mono">{delivery.trackingNumber}</span>
                            {delivery.courier && <span className="text-muted-foreground"> ({delivery.courier})</span>}
                          </p>
                        )}

                        {delivery.notes && (
                          <p className="text-sm mt-2 text-muted-foreground italic">Note: {delivery.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {delivery.status === "PENDING" && (
                          <button
                            onClick={() => updateDelivery(delivery.id, { status: "PROCESSING" })}
                            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            Start Processing
                          </button>
                        )}

                        {delivery.status === "PROCESSING" && (
                          <button
                            onClick={() => setSelectedDelivery(delivery)}
                            className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                          >
                            Mark as Shipped
                          </button>
                        )}

                        {delivery.status === "SHIPPED" && (
                          <button
                            onClick={() => updateDelivery(delivery.id, { status: "DELIVERED" })}
                            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Mark Delivered
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedDelivery(delivery)}
                          className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteDelivery(delivery.id)}
                          className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(delivery.createdAt).toLocaleDateString()}</span>
                      {delivery.shippedAt && <span>Shipped: {new Date(delivery.shippedAt).toLocaleDateString()}</span>}
                      {delivery.deliveredAt && (
                        <span>Delivered: {new Date(delivery.deliveredAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Edit Modal */}
        {selectedDelivery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border w-full max-w-md p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Update Delivery</h2>

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
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedDelivery.status}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tracking Number</label>
                  <input
                    type="text"
                    name="trackingNumber"
                    defaultValue={selectedDelivery.trackingNumber || ""}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Enter tracking number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Courier Service</label>
                  <input
                    type="text"
                    name="courier"
                    defaultValue={selectedDelivery.courier || ""}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="e.g., DHL, Pronto, Domex"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Internal Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={selectedDelivery.notes || ""}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Notes for internal use..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDelivery(null)}
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
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
