"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/lib/stores"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import LoadingBubbles from "@/components/loadingBubbles"
import { ShoppingCart, CreditCard, ArrowLeft, Lock, MapPin, Package, CheckCircle, Clock, Users } from "lucide-react"

export default function PurchaseCourse() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { addToCart } = useCartStore()
  const { toast } = useToast()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [requiresDelivery, setRequiresDelivery] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [hasAddress, setHasAddress] = useState(false)

  // Memoized computed values
  const isPaymentDisabled = useMemo(() => 
    processing || (requiresDelivery && !hasAddress), 
    [processing, requiresDelivery, hasAddress]
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
        let errorTitle = "Error Loading Course"
        
        try {
          const errorData = await res.json()
          errorMessage = errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}`
          
          if (res.status === 404) {
            errorTitle = "Course Not Found"
            errorMessage = errorData.message || "The course you're looking for doesn't exist"
          } else if (res.status === 401) {
            errorTitle = "Authentication Required"
            errorMessage = "Please sign in to view this course"
          }
        } catch (parseError) {
          errorMessage = res.statusText || `Error ${res.status}: Unknown error`
        }
        
        throw new Error(errorMessage)
      }
      const data = await res.json()
      setCourse(data)
    } catch (err) {
      const errorMessage = err.message || "Failed to load course. Please try again."
      toast({
        variant: "destructive",
        title: "Error Loading Course",
        description: errorMessage,
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

  const handlePurchase = useCallback(async () => {
    if (requiresDelivery && !hasAddress) {
      toast({
        variant: "destructive",
        title: "Address Required",
        description: "Please update your delivery address in Settings before ordering materials",
      })
      return
    }

    setProcessing(true)

    try {
      addToCart({
        id: params.id,
        title: course.title,
        price: course.price,
        thumbnail: course.thumbnail,
      })

      const res = await fetch("/api/payhere/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseId: params.id,
          requiresDelivery
        }),
      })

      if (!res.ok) {
        let errorMessage = 'Failed to create payment'
        let errorTitle = "Payment Error"
        
        try {
          const errorData = await res.json()
          
          // Handle Prisma constraint violations
          if (errorData.code === "UNIQUE_CONSTRAINT_VIOLATION") {
            errorTitle = "Duplicate Entry"
            // Show the exact Prisma error message
            errorMessage = errorData.message || `Unique constraint failed on the fields: (${errorData.field})`
          } else if (errorData.code === "FOREIGN_KEY_CONSTRAINT_VIOLATION") {
            errorTitle = "Invalid Reference"
            errorMessage = errorData.message || `Foreign key constraint failed on field "${errorData.field}"`
          } else if (errorData.code === "RECORD_NOT_FOUND") {
            errorTitle = "Not Found"
            errorMessage = errorData.message || "The requested record was not found"
          } else if (errorData.code === "MISSING_ADDRESS") {
            errorTitle = "Address Required"
            errorMessage = errorData.message || "Please add a delivery address in Settings"
          } else {
            // Extract error message from various possible fields
            errorMessage = errorData.message || errorData.error || errorData.details || `Error ${res.status}: ${res.statusText}`
            
            // Handle HTTP status codes
            if (res.status === 401) {
              errorTitle = "Authentication Error"
              errorMessage = "Please sign in to continue"
            } else if (res.status === 404) {
              errorTitle = "Not Found"
              errorMessage = errorData.message || "Course not found"
            } else if (res.status === 400) {
              errorTitle = "Invalid Request"
            }
          }
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = res.statusText || `Error ${res.status}: Unknown error`
        }
        
        toast({
          variant: "destructive",
          title: errorTitle,
          description: errorMessage,
        })
        setProcessing(false)
        return
      }

      const { payHereData, payHereUrl } = await res.json()

      const form = document.createElement("form")
      form.method = "POST"
      form.action = payHereUrl

      Object.keys(payHereData).forEach((key) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = payHereData[key]
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      const errorMessage = err.message || "An error occurred. Please try again."
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
      setProcessing(false)
    }
  }, [requiresDelivery, hasAddress, params.id, course, addToCart, toast])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles/>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-foreground text-lg font-medium mb-4">Course not found</p>
          <Link href="/student/browse-course" className="btn-primary inline-block px-4 py-2 rounded-lg">
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <Link 
            href={`/student/browse-course/${course.id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 sm:mb-3 font-medium transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Complete Your Purchase
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Secure checkout with PayHere</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        
        {/* Course Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-4 sm:mb-6 hover:shadow-md transition-shadow">
          {course.thumbnail && (
            <div className="relative h-48 sm:h-64 bg-muted">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg line-clamp-2">{course.title}</h2>
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-6 lg:p-8">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">{course.description}</p>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Instructor</p>
                  <p className="text-sm font-bold text-foreground truncate">{course.instructor.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Videos</p>
                  <p className="text-sm font-bold text-foreground">{course._count.videos} lessons</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Enrolled</p>
                  <p className="text-sm font-bold text-foreground">{course._count.enrollments} students</p>
                </div>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="mt-4 sm:mt-6 bg-muted/50 rounded-xl p-4 sm:p-6 border border-border">
              <h3 className="font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                What You'll Get
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                  Full lifetime access to all course materials
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0"></div>
                  {course._count.videos} comprehensive video lessons
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                  Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="bg-primary p-4 sm:p-6 text-primary-foreground">
            <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              Order Summary
            </h3>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center pb-4 sm:pb-6 border-b-2 border-border">
              <span className="text-muted-foreground font-medium text-sm sm:text-base">Course Price</span>
              <span className="text-2xl sm:text-3xl font-bold text-primary">
                Rs. {course.price.toLocaleString()}
              </span>
            </div>

            {/* Delivery Option */}
            <div className="bg-chart-5/10 rounded-xl p-4 sm:p-5 border-2 border-chart-5/30">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={requiresDelivery}
                  onChange={(e) => setRequiresDelivery(e.target.checked)}
                  className="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded border-border text-chart-5 focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-foreground group-hover:text-chart-5 transition-colors text-sm sm:text-base">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-chart-5" />
                    I need course materials delivered to my address
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Check this if you want physical books/materials sent to your home
                  </p>
                </div>
              </label>

              {requiresDelivery && (
                <div className="mt-4 pt-4 border-t border-chart-5/30">
                  {hasAddress ? (
                    <div className="bg-card rounded-lg p-3 sm:p-4 border-2 border-chart-4/30">
                      <div className="flex items-center gap-2 font-bold text-chart-4 mb-2 text-sm sm:text-base">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </div>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed pl-6">
                        {userProfile?.addressLine1}, {userProfile?.city}, {userProfile?.district}
                        <br />
                        Phone: {userProfile?.phone}
                      </p>
                      <Link 
                        href="/student/settings" 
                        className="text-primary hover:text-primary/80 font-semibold text-xs sm:text-sm mt-2 inline-block pl-6 transition"
                      >
                        Change address →
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4 sm:p-5 text-center">
                      <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-destructive mx-auto mb-3" />
                      <p className="text-destructive font-semibold mb-3 text-sm sm:text-base">
                        No delivery address found
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
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handlePurchase}
                disabled={isPaymentDisabled}
                className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-lg active:scale-[0.98] ${
                  isPaymentDisabled
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'btn-primary hover:shadow-xl'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Pay with PayHere</span>
                  </>
                )}
              </button>

              <Link href={`/student/browse-course/${course.id}/enroll-manual?requiresDelivery=${requiresDelivery}`}>
                <button 
                  disabled={isPaymentDisabled}
                  className={`w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-md active:scale-[0.98] ${
                    isPaymentDisabled
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'btn-secondary hover:shadow-lg'
                  }`}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Manual Payment</span>
                </button>
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Lock className="w-3 h-3" />
                Secure payment powered by PayHere
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}