"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import ImageUpload from "@/components/image-upload"
import PdfUploader from "@/components/pdf-uploader"
import LoadingBubbles from "@/components/loadingBubbles"
import { BookOpen, DollarSign, FileText, ArrowLeft, Sparkles, CheckCircle, FileUp } from "lucide-react"

export default function CreateCourse() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: "",
  })
  const [createdCourseId, setCreatedCourseId] = useState(null)
  const [resourcesRefreshKey, setResourcesRefreshKey] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleThumbnailUpload = useCallback((imageUrl) => {
    setFormData((prev) => ({ ...prev, thumbnail: imageUrl }))
  }, [])

  const isFormValid = useMemo(() => {
    return formData.title.trim() && formData.description.trim() && formData.price && formData.price > 0
  }, [formData])

  const createCourseMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Failed to create course")
      }

      return result
    },

    onSuccess: (data) => {
      // Invalidate instructor courses list
      queryClient.invalidateQueries({ queryKey: ["instructorCourses", session?.user?.id] })
      queryClient.invalidateQueries({ queryKey: ["instructorDashboard", session?.user?.id] })
      console.log("here",session.user.id)
      toast({
        title: "Course Created",
        description: "Your course has been created successfully!",
      })

      setCreatedCourseId(data.id)
      // Don't redirect immediately, allow user to upload resources
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
      createCourseMutation.mutate({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        thumbnail: formData.thumbnail || null,
      })
    },
    [formData, createCourseMutation]
  )

  const handleResourceUploadComplete = useCallback(() => {
    setResourcesRefreshKey((prev) => prev + 1)
    toast({
      title: "Resource Uploaded",
      description: "Resource has been uploaded successfully! Redirecting to your courses...",
    })
    // Redirect to courses page after a short delay
    setTimeout(() => {
      router.push("/instructor/courses")
    }, 1500)
  }, [toast, router])

  if (status === "loading") {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/instructor/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Create New Course</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Share your knowledge with students worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
            {/* Step 1: Basic Information */}
            <div className={`flex items-center gap-3 ${createdCourseId ? "opacity-100" : ""}`}>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  createdCourseId
                    ? "bg-success text-success-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {createdCourseId ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="font-semibold text-sm sm:text-base">1</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm sm:text-base">Basic Information</p>
                <p className="text-xs text-muted-foreground">Course details</p>
              </div>
            </div>

            <div
              className={`hidden sm:block h-px flex-1 mx-2 sm:mx-4 ${
                createdCourseId ? "bg-success" : "bg-border"
              }`}
            ></div>

            {/* Step 2: Add Content Materials */}
            <div className={`flex items-center gap-3 ${createdCourseId ? "" : "opacity-50"}`}>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  createdCourseId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="font-semibold text-sm sm:text-base">2</span>
              </div>
              <div className="hidden sm:block">
                <p
                  className={`font-semibold text-sm sm:text-base ${
                    createdCourseId ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Add Content Materials
                </p>
                <p className="text-xs text-muted-foreground">Resources & materials</p>
              </div>
            </div>

            <div className="hidden sm:block h-px flex-1 bg-border mx-2 sm:mx-4"></div>

            {/* Step 3: Publish */}
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-muted-foreground font-semibold text-sm sm:text-base">3</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-muted-foreground text-sm sm:text-base">Publish</p>
                <p className="text-xs text-muted-foreground">Go live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        {!createdCourseId ? (
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
                <p className="mt-2 text-xs text-muted-foreground">
                  Choose a clear, descriptive title that tells students what they'll learn
                </p>
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
                  placeholder="Describe your course in detail... What will students learn? What makes your course unique? Who is it for?"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Write a compelling description that highlights the value and outcomes of your course
                </p>
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
                  <p className="mt-2 text-xs text-muted-foreground">Set a competitive price for your course</p>
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
                  <p className="mt-2 text-xs text-muted-foreground">
                    Upload an eye-catching thumbnail image (optional)
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-muted px-5 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-border flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={createCourseMutation.isPending || !isFormValid}
                className="btn-primary flex-1 sm:flex-initial px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {createCourseMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
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
        ) : (
          /* Success Message - Course Created */
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
            <div className="p-5 sm:p-6 lg:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">Course Created Successfully!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your course "{formData.title}" has been created. You can now upload resources and materials below, or continue editing your course.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/instructor/courses/${createdCourseId}/edit`}
                      className="btn-primary px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Continue Editing Course
                    </Link>
                    <Link
                      href="/instructor/dashboard"
                      className="btn-secondary px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Uploader Section - Show after course creation */}
        {createdCourseId && (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-5 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <FileUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Upload Course Resources</h2>
            </div>
            <PdfUploader
              key={resourcesRefreshKey}
              courseId={createdCourseId}
              onUploadComplete={handleResourceUploadComplete}
            />
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Check out our{" "}
            <a href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
              course creation guide
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}


