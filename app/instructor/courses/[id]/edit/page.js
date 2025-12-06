"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect} from "react"
import { BookOpen, DollarSign, Image, FileText, ArrowLeft, Save, Eye, EyeOff, Trash2, Video, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function EditCourse() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState({
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and build real-world projects from scratch. This comprehensive course covers everything you need to become a professional web developer.",
    price: "15000",
    thumbnail: "",
    published: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (params.id) {
      fetchCourse()
    }
  }, [params.id])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch course")
      const data = await res.json()
      setFormData(data)
    } catch (err) {
      setError("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || "Failed to update course")
        return
      }

      router.push("/instructor/courses")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePublishToggle = () => {
    setFormData(prev => ({ ...prev, published: !prev.published }))
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/instructor/courses">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Courses</span>
            </button>
          </Link>
          
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Edit Course</h1>
                <p className="text-muted-foreground mt-1">Update your course details and content</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handlePublishToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.published
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {formData.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {formData.published ? "Published" : "Draft"}
              </button>
            </div>
          </div>
        </div>



        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="mb-6">
          <div>
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="p-8 space-y-8">
                
                {/* Course Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground transition-all"
                    placeholder="e.g., Complete Web Development Bootcamp 2024"
                  />
                </div>

                {/* Course Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Course Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground transition-all resize-none"
                    placeholder="Describe your course in detail..."
                  />
                </div>

                {/* Price and Thumbnail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Price */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Course Price (LKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">Rs.</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="100"
                        className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Thumbnail URL */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <Image className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="bg-muted border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.published ? "bg-emerald-500/10 dark:bg-emerald-500/20" : "bg-amber-500/10 dark:bg-amber-500/20"
                      }`}>
                        {formData.published ? 
                          <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : 
                          <EyeOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Course Visibility</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {formData.published 
                            ? "This course is live and visible to students"
                            : "This course is in draft mode and not visible to students"
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePublishToggle}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        formData.published ? "bg-emerald-600 dark:bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                          formData.published ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-muted px-8 py-6 border-t border-border flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-initial px-6 py-3 border-2 border-border text-foreground rounded-xl font-medium hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6 border border-border">
            <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground text-center mb-2">Delete Course?</h3>
            <p className="text-muted-foreground text-center mb-6">
              This action cannot be undone. All course data, videos, and student enrollments will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2.5 bg-red-600 dark:bg-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-all">
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}