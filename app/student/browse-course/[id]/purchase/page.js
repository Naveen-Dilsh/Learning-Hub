"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/lib/stores"
import Link from "next/link"
import LoadingBubbles from "@/components/loadingBubbles"
import { ShoppingCart, CreditCard, ArrowLeft, Lock, MapPin, Package, AlertCircle, CheckCircle, Clock, Users } from "lucide-react"

const NotificationPopup = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show, onClose])

  if (!notification.show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-3 p-4 rounded-xl shadow-xl ${
        notification.type === 'error' 
          ? 'bg-red-50 border-2 border-red-300' 
          : 'bg-emerald-50 border-2 border-emerald-300'
      }`}>
        <AlertCircle className={`w-5 h-5 ${
          notification.type === 'error' ? 'text-red-600' : 'text-emerald-600'
        }`} />
        <p className={`text-sm font-semibold ${
          notification.type === 'error' ? 'text-red-900' : 'text-emerald-900'
        }`}>
          {notification.message}
        </p>
        <button
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-slate-700 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function PurchaseCourse() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { addToCart } = useCartStore()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })
  
  const [requiresDelivery, setRequiresDelivery] = useState(false)
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
      setNotification({ show: true, type: 'error', message: 'Failed to load course' })
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

  const handlePurchase = async () => {
    if (requiresDelivery && !hasAddress) {
      setNotification({ 
        show: true, 
        type: 'error', 
        message: 'Please update your delivery address in Settings before ordering materials' 
      })
      return
    }

    setProcessing(true)
    setNotification({ show: false, type: '', message: '' })

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
        const data = await res.json()
        if (data.code === "MISSING_ADDRESS") {
          setNotification({ show: true, type: 'error', message: data.message })
          setProcessing(false)
          return
        }
        setNotification({ show: true, type: 'error', message: data.message || 'Failed to create payment' })
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
      setNotification({ show: true, type: 'error', message: 'An error occurred. Please try again.' })
      setProcessing(false)
    }
  }

  const isPaymentDisabled = processing || (requiresDelivery && !hasAddress)

  if (status === "loading" || loading) {
    return (
      <div>
        <LoadingBubbles/>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-slate-700 text-lg font-medium">Course not found</p>
          <Link href="/student/browse-courses" className="text-indigo-600 hover:underline mt-2 inline-block font-semibold">
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <NotificationPopup 
        notification={notification} 
        onClose={() => setNotification({ show: false, type: '', message: '' })} 
      />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <Link 
            href={`/student/browse-course/${course.id}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-3 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Complete Your Purchase
          </h1>
          <p className="text-slate-600 mt-1">Secure checkout with PayHere</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* Course Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden mb-6 hover:shadow-2xl transition-shadow">
          {course.thumbnail && (
            <div className="relative h-64 bg-gradient-to-br from-indigo-100 to-purple-100">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{course.title}</h2>
              </div>
            </div>
          )}
          
          <div className="p-8">
            <p className="text-slate-600 leading-relaxed mb-6">{course.description}</p>
            
            <div className="flex flex-wrap gap-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Instructor</p>
                  <p className="text-sm font-bold text-slate-900">{course.instructor.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Videos</p>
                  <p className="text-sm font-bold text-slate-900">{course._count.videos} lessons</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Users className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Enrolled</p>
                  <p className="text-sm font-bold text-slate-900">{course._count.enrollments} students</p>
                </div>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                What You'll Get
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  Full lifetime access to all course materials
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  {course._count.videos} comprehensive video lessons
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 bg-pink-600 rounded-full"></div>
                  Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Order Summary
            </h3>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-6 border-b-2 border-slate-200">
              <span className="text-slate-600 font-medium">Course Price</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Rs. {course.price}
              </span>
            </div>

            {/* Delivery Option */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={requiresDelivery}
                  onChange={(e) => setRequiresDelivery(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    <Package className="w-5 h-5 text-amber-600" />
                    I need course materials delivered to my address
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Check this if you want physical books/materials sent to your home
                  </p>
                </div>
              </label>

              {requiresDelivery && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  {hasAddress ? (
                    <div className="bg-white rounded-lg p-4 border-2 border-emerald-200">
                      <div className="flex items-center gap-2 font-bold text-emerald-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed pl-6">
                        {userProfile?.addressLine1}, {userProfile?.city}, {userProfile?.district}
                        <br />
                        Phone: {userProfile?.phone}
                      </p>
                      <Link 
                        href="/student/settings" 
                        className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm mt-2 inline-block pl-6"
                      >
                        Change address →
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5 text-center">
                      <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                      <p className="text-red-800 font-semibold mb-3">
                        No delivery address found
                      </p>
                      <Link
                        href="/student/settings"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-md"
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
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  isPaymentDisabled
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay with PayHere
                  </>
                )}
              </button>

              <Link href={`/student/browse-course/${course.id}/enroll-manual?requiresDelivery=${requiresDelivery}`}>
                <button 
                  disabled={isPaymentDisabled}
                  className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md ${
                    isPaymentDisabled
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-800 hover:shadow-lg hover:scale-[1.02]'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Manual Payment
                </button>
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
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