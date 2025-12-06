"use client"


import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState,useEffect } from "react"
import { BookOpen, DollarSign, Image, FileText, ArrowLeft, Sparkles, CheckCircle } from "lucide-react"

export default function CreateCourse() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || "Failed to create course")
        return
      }

      const course = await res.json()
      router.push(`/instructor/courses/${course.id}/edit`)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Courses</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Create New Course</h1>
              <p className="text-slate-600 mt-1">Share your knowledge with students worldwide</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">1</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Basic Information</p>
                <p className="text-xs text-slate-600">Course details</p>
              </div>
            </div>
            
            <div className="hidden sm:block h-px flex-1 bg-slate-200 mx-4"></div>
            
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-semibold">2</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-slate-600">Add Content</p>
                <p className="text-xs text-slate-600">Videos & materials</p>
              </div>
            </div>
            
            <div className="hidden sm:block h-px flex-1 bg-slate-200 mx-4"></div>
            
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-semibold">3</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-slate-600">Publish</p>
                <p className="text-xs text-slate-600">Go live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Form - WRAPPED IN FORM ELEMENT */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-8 space-y-8">
            
            {/* Course Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                placeholder="e.g., Complete Web Development Bootcamp 2024"
              />
              <p className="mt-2 text-xs text-slate-500">Choose a clear, descriptive title that tells students what they'll learn</p>
            </div>

            {/* Course Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                Course Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400 transition-all resize-none"
                placeholder="Describe your course in detail... What will students learn? What makes your course unique? Who is it for?"
              />
              <p className="mt-2 text-xs text-slate-500">Write a compelling description that highlights the value and outcomes of your course</p>
            </div>

            {/* Price and Thumbnail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Course Price (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">Rs.</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                    placeholder="0"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Set a competitive price for your course</p>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
                  <Image className="w-4 h-4 text-purple-600" />
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-2 text-xs text-slate-500">Add an eye-catching thumbnail image URL (optional)</p>
              </div>
            </div>

            {/* Tips Section */}
            
          </div>

          {/* Action Buttons */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="flex-1 sm:flex-initial sm:order-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-all"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:order-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Course...
                </>
              ) : (
                <>
                  Create Course
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Need help? Check out our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              course creation guide
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
