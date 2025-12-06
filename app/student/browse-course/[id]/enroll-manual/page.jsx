"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import ImageUpload from "@/components/image-upload"
import { MapPin, AlertCircle, Package } from "lucide-react"

export default function ManualEnrollment() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [receiptImage, setReceiptImage] = useState("")
  const [error, setError] = useState("")

  // Get requiresDelivery from URL params (set on purchase page)
  const requiresDelivery = searchParams.get('requiresDelivery') === 'true'
  const [userProfile, setUserProfile] = useState(null)
  const [hasAddress, setHasAddress] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (params.id) {
      fetchCourse()
    }
    if (session?.user) {
      fetchUserProfile()
    }
  }, [params.id, session])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch course")
      const data = await res.json()
      setCourse(data)
    } catch (err) {
      setError("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setUserProfile(data)
        setHasAddress(Boolean(data.phone && data.addressLine1 && data.city && data.district))
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate address if delivery is required
    if (requiresDelivery && !hasAddress) {
      setError("Please update your delivery address in Settings before requesting materials")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/enrollments/manual-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.id,
          receiptImage,
          requiresDelivery,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to submit request")
        return
      }

      alert("Enrollment request submitted! Please wait for instructor approval.")
      router.push("/student/dashboard")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manual Enrollment Request</h1>
          <p className="text-muted-foreground">Submit your payment receipt for course enrollment</p>
        </div>

        {course && (
          <div className="bg-card rounded-lg shadow-lg p-6 mb-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">{course.title}</h2>
            <p className="text-2xl font-bold text-primary mb-4">LKR {course.price.toFixed(2)}</p>
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Payment Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Make payment via ATM or bank transfer</li>
                <li>Take a clear photo of the payment receipt</li>
                <li>Upload the receipt image directly below</li>
                <li>Wait for instructor approval (usually within 24 hours)</li>
              </ol>
            </div>
          </div>
        )}

        {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg p-8 border border-border space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Payment Receipt Image</label>
            <ImageUpload onUploadComplete={setReceiptImage} currentImage={receiptImage} aspectRatio="video" />
          </div>

          {/* Delivery Address Section - controlled from purchase page */}
          {requiresDelivery && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                <Package className="w-5 h-5 text-amber-600" />
                <p className="font-semibold text-amber-900">Course materials delivery requested</p>
              </div>

              {hasAddress ? (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    Delivery Address
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 pl-6">
                    <p className="font-medium text-foreground">{userProfile?.name}</p>
                    <p>{userProfile?.addressLine1}</p>
                    {userProfile?.addressLine2 && <p>{userProfile?.addressLine2}</p>}
                    <p>{userProfile?.city}, {userProfile?.district}</p>
                    {userProfile?.postalCode && <p>Postal Code: {userProfile?.postalCode}</p>}
                    <p>Phone: {userProfile?.phone}</p>
                  </div>
                  <Link 
                    href="/student/settings" 
                    className="text-primary hover:text-primary/80 font-semibold text-sm mt-3 inline-block pl-6"
                  >
                    Change address →
                  </Link>
                </div>
              ) : (
                <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                  <p className="text-destructive font-semibold mb-3">
                    No delivery address found
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please add your delivery address in Settings before requesting course materials.
                  </p>
                  <Link
                    href="/student/settings"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition"
                  >
                    <MapPin className="w-4 h-4" />
                    Add Address Now
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !receiptImage || (requiresDelivery && !hasAddress)}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Submitting..." : "Submit Enrollment Request"}
          </button>
          
          {requiresDelivery && !hasAddress && (
            <p className="text-sm text-destructive text-center mt-2">
              Please add your delivery address to continue
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
