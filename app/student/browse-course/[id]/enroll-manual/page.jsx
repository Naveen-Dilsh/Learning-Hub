"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import ImageUpload from "@/components/image-upload"
import LoadingBubbles from "@/components/loadingBubbles"
import { MapPin, Package, ArrowLeft, CheckCircle } from "lucide-react"

export default function ManualEnrollment() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [receiptImage, setReceiptImage] = useState("")

  // Get requiresDelivery from URL params (set on purchase page)
  const requiresDelivery = useMemo(() => 
    searchParams.get('requiresDelivery') === 'true', 
    [searchParams]
  )
  const [userProfile, setUserProfile] = useState(null)
  const [hasAddress, setHasAddress] = useState(false)

  // Memoized computed values
  const isSubmitDisabled = useMemo(() => 
    submitting || !receiptImage || (requiresDelivery && !hasAddress),
    [submitting, receiptImage, requiresDelivery, hasAddress]
  )

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        next: { revalidate: 60 }
      })
      if (!res.ok) {
        let errorMessage = "Failed to fetch course"
        try {
          const errorData = await res.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          errorMessage = res.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
      const data = await res.json()
      setCourse(data)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error Loading Course",
        description: err.message || "Failed to load course. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }, [params.id, toast])

  const fetchUserProfile = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchCourse()
    }
    if (session?.user) {
      fetchUserProfile()
    }
  }, [params.id, session, fetchCourse, fetchUserProfile])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    // Validate address if delivery is required
    if (requiresDelivery && !hasAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please update your delivery address in Settings before requesting materials",
      })
      return
    }

    if (!receiptImage) {
      toast({
        variant: "destructive",
        title: "Receipt Required",
        description: "Please upload a payment receipt image",
      })
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
        let errorMessage = "Failed to submit request"
        let errorTitle = "Submission Error"
        
        // Handle Prisma errors
        if (data.code === "UNIQUE_CONSTRAINT_VIOLATION") {
          errorTitle = "Duplicate Entry"
          errorMessage = data.message || `Unique constraint failed on the fields: (${data.field})`
        } else {
          errorMessage = data.message || data.error || errorMessage
        }
        
        toast({
          variant: "destructive",
          title: errorTitle,
          description: errorMessage,
        })
        setSubmitting(false)
        return
      }

      toast({
        title: "Request Submitted",
        description: "Your enrollment request has been submitted. Please wait for instructor approval.",
      })
      
      // Redirect after short delay to show toast
      setTimeout(() => {
        router.push("/student")
      }, 1500)
    } catch (err) {
      const errorMessage = err.message || "An error occurred. Please try again."
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
      setSubmitting(false)
    }
  }, [requiresDelivery, hasAddress, receiptImage, params.id, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <Link 
            href={`/student/browse-course/${params.id}/purchase`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 sm:mb-3 font-medium transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Purchase
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manual Enrollment Request</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Submit your payment receipt for course enrollment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {course && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 line-clamp-2">{course.title}</h2>
            <p className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Rs. {course.price.toLocaleString()}</p>
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Payment Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
                <li>Make payment via ATM or bank transfer</li>
                <li>Take a clear photo of the payment receipt</li>
                <li>Upload the receipt image directly below</li>
                <li>Wait for instructor approval (usually within 24 hours)</li>
              </ol>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Payment Receipt Image</label>
            <ImageUpload onUploadComplete={setReceiptImage} currentImage={receiptImage} aspectRatio="video" />
            {!receiptImage && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Please upload a clear image of your payment receipt
              </p>
            )}
          </div>

          {/* Delivery Address Section */}
          {requiresDelivery && (
            <div className="border-t border-border pt-4 sm:pt-6">
              <div className="flex items-center gap-2 mb-4 p-3 sm:p-4 bg-muted rounded-lg border-2 border-border">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <p className="font-semibold text-foreground text-sm sm:text-base">Course materials delivery requested</p>
              </div>

              {hasAddress ? (
                <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    Delivery Address
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1 pl-6">
                    <p className="font-medium text-foreground">{userProfile?.name}</p>
                    <p>{userProfile?.addressLine1}</p>
                    {userProfile?.addressLine2 && <p>{userProfile?.addressLine2}</p>}
                    <p>{userProfile?.city}, {userProfile?.district}</p>
                    {userProfile?.postalCode && <p>Postal Code: {userProfile?.postalCode}</p>}
                    <p>Phone: {userProfile?.phone}</p>
                  </div>
                  <Link 
                    href="/student/settings" 
                    className="text-primary hover:text-primary/80 font-semibold text-xs sm:text-sm mt-2 sm:mt-3 inline-block pl-6 transition"
                  >
                    Change address →
                  </Link>
                </div>
              ) : (
                <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4 sm:p-6 text-center">
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-destructive mx-auto mb-3" />
                  <p className="text-destructive font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                    No delivery address found
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    Please add your delivery address in Settings before requesting course materials.
                  </p>
                  <Link
                    href="/student/settings"
                    className="btn-danger inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm active:scale-[0.98]"
                  >
                    <MapPin className="w-4 h-4" />
                    Add Address Now
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary w-full py-3 sm:py-3.5 px-4 rounded-lg font-semibold text-sm sm:text-base active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Submit Enrollment Request
                </span>
              )}
            </button>
            
            {requiresDelivery && !hasAddress && (
              <p className="text-xs sm:text-sm text-destructive text-center">
                Please add your delivery address to continue
              </p>
            )}
            
            {!receiptImage && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Please upload a payment receipt image
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
