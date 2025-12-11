"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import ImageUpload from "@/components/image-upload"
import CourseResources from "@/components/course-resources"
import PdfUploader from "@/components/pdf-uploader"
import LoadingBubbles from "@/components/loadingBubbles"
import {
  BookOpen,
  DollarSign,
  FileText,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Trash2,
  FileUp,
  AlertCircle,
  Video,
  Calendar,
} from "lucide-react"

export default function EditCourse() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: "",
    published: false,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [resourcesRefreshKey, setResourcesRefreshKey] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Block ADMIN access - redirect to allowed page
      if (session?.user?.role === "ADMIN") {
        router.push("/instructor/enrollments/pending")
      } else if (session?.user?.role !== "INSTRUCTOR") {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

  const {
    data: courseData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}`, {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch course")
      }
      
      return await res.json()
    },
    enabled: !!params.id,
    staleTime: 60 * 1000, // 60 seconds
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load course",
      })
    },
  })

  // Update form data when course data loads
  useEffect(() => {
    if (courseData) {
      setFormData({
        title: courseData.title || "",
        description: courseData.description || "",
        price: courseData.price?.toString() || "",
        thumbnail: courseData.thumbnail || "",
        published: courseData.published || false,
      })
    }
  }, [courseData])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }, [])

  const handleThumbnailUpload = useCallback((imageUrl) => {
    setFormData((prev) => ({ ...prev, thumbnail: imageUrl }))
  }, [])

  const isFormValid = useMemo(() => {
    return formData.title.trim() && formData.description.trim() && formData.price && formData.price > 0
  }, [formData])

  const updateCourseMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Failed to update course")
      }

      return result
    },
    onSuccess: () => {
      // Invalidate and refetch course data
      queryClient.invalidateQueries({ queryKey: ["course", params.id] })
      queryClient.invalidateQueries({ queryKey: ["instructorCourses", session?.user?.id] })
      
      toast({
        title: "Course Updated",
        description: "Your course has been updated successfully!",
      })

      router.push("/instructor/courses")
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
      })
    },
  })

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      updateCourseMutation.mutate({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        thumbnail: formData.thumbnail || null,
        published: formData.published,
      })
    },
    [formData, updateCourseMutation]
  )

  const handlePublishToggle = useCallback(() => {
    setFormData((prev) => ({ ...prev, published: !prev.published }))
  }, [])

  const deleteCourseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to delete course")
      }

      return await res.json()
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["instructorCourses", session?.user?.id] })
      
      toast({
        title: "Course Deleted",
        description: "Course has been deleted successfully",
      })

      setShowDeleteModal(false)
      router.push("/instructor/courses")
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete course",
      })
    },
  })

  const handleDelete = useCallback(() => {
    deleteCourseMutation.mutate()
  }, [deleteCourseMutation])

  const handleResourceUploadComplete = useCallback(() => {
    setResourcesRefreshKey((prev) => prev + 1)
    toast({
      title: "Resource Uploaded",
      description: "Resource has been uploaded successfully!",
    })
  }, [toast])

  if (status === "loading" || isLoading || !params.id) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Courses</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Edit Course</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Update your course details and content
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePublishToggle}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                  formData.published
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-chart-5/10 text-chart-5 border border-chart-5/20"
                }`}
              >
                {formData.published ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{formData.published ? "Published" : "Draft"}</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm active:scale-[0.98]"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Course Management Navigation */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href={`/instructor/courses/${params.id}/videos`}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <Video className="w-4 h-4" />
                Videos
              </Link>
              <Link
                href={`/instructor/courses/${params.id}/live-sessions`}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Live Sessions
              </Link>
              <span className="text-xs text-muted-foreground px-2">|</span>
              <span className="text-sm text-muted-foreground font-medium">Course Settings</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
          <div className="p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Course Title */}
            <div>
              <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-all text-sm sm:text-base"
                placeholder="e.g., Complete Web Development Bootcamp 2024"
              />
            </div>

            {/* Course Description */}
            <div>
              <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
                <FileText className="w-4 h-4 text-primary" />
                Course Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-all resize-none text-sm sm:text-base"
                placeholder="Describe your course in detail..."
              />
            </div>

            {/* Price and Thumbnail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
                  <DollarSign className="w-4 h-4 text-success" />
                  Course Price (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium text-sm sm:text-base">
                    Rs.
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-all text-sm sm:text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
                  <FileUp className="w-4 h-4 text-secondary" />
                  Course Thumbnail
                </label>
                <ImageUpload
                  onUploadComplete={handleThumbnailUpload}
                  currentImage={formData.thumbnail}
                  aspectRatio="video"
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="bg-muted border border-border rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      formData.published
                        ? "bg-emerald-500/10 dark:bg-emerald-500/20"
                        : "bg-chart-5/10"
                    }`}
                  >
                    {formData.published ? (
                      <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-chart-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">Course Visibility</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {formData.published
                        ? "This course is live and visible to students"
                        : "This course is in draft mode and not visible to students"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePublishToggle}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
                    formData.published
                      ? "bg-emerald-600 dark:bg-emerald-500"
                      : "bg-muted-foreground/30"
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
          <div className="bg-muted px-5 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-border flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={updateCourseMutation.isPending || !isFormValid}
              className="btn-primary flex-1 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {updateCourseMutation.isPending ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <Link
              href="/instructor/courses"
              className="btn-secondary flex-1 sm:flex-initial px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center active:scale-[0.98]"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Course Resources Section */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-5 sm:p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <FileUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Course Resources</h2>
          </div>
          <CourseResources key={resourcesRefreshKey} courseId={params.id} canEdit={true} />
        </div>

        {/* Upload New Resource */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-5 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <FileUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Upload New Resource</h2>
          </div>
          <PdfUploader courseId={params.id} onUploadComplete={handleResourceUploadComplete} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-border">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground text-center mb-2">Delete Course?</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6">
              This action cannot be undone. All course data, videos, and student enrollments will be permanently
              deleted.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1 px-4 py-2.5 rounded-lg font-medium active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteCourseMutation.isPending}
                className="btn-danger flex-1 px-4 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {deleteCourseMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
