"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import LoadingBubbles from "@/components/loadingBubbles"
import { Upload, BookOpen, ArrowRight, Video, CheckCircle, Cloud, ChevronDown } from "lucide-react"

// Memoized Info Card Component
const InfoCard = memo(({ icon: Icon, title, description, bgColor, iconColor }) => (
  <div className="bg-card rounded-lg sm:rounded-xl border border-border p-4 sm:p-6 hover:shadow-md transition-all">
    <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mb-3 flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">{title}</h3>
    <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
  </div>
))

InfoCard.displayName = "InfoCard"

export default function UploadVideos() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCourse, setSelectedCourse] = useState("")

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
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["instructorCourses", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const res = await fetch(`/api/courses?instructorId=${session.user.id}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch courses")
      }

      return await res.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load courses. Please try again.",
      })
    },
  })

  const handleCourseSelect = useCallback((courseId) => {
    setSelectedCourse(courseId)
  }, [])

  const selectedCourseData = useMemo(() => {
    return courses.find((c) => c.id === selectedCourse)
  }, [courses, selectedCourse])

  const infoCards = useMemo(
    () => [
      {
        icon: Cloud,
        title: "Cloudflare Stream",
        description: "Fast, reliable video delivery worldwide",
        bgColor: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        icon: Video,
        title: "Easy Management",
        description: "Upload, organize, and edit your videos",
        bgColor: "bg-secondary/10",
        iconColor: "text-secondary",
      },
      {
        icon: CheckCircle,
        title: "High Quality",
        description: "Automatic optimization and encoding",
        bgColor: "bg-emerald-500/10",
        iconColor: "text-emerald-600 dark:text-emerald-400",
      },
    ],
    []
  )

  if (status === "loading" || isLoading || !session?.user?.id) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Upload Videos</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm sm:text-base">
                <Cloud className="w-4 h-4 flex-shrink-0" />
                <span>Powered by Cloudflare Stream for optimized delivery</span>
              </p>
            </div>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No courses available</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              You need to create a course before you can upload videos. Start building your course content today!
            </p>
            <Link
              href="/instructor/courses/create"
              className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Main Upload Card */}
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary px-5 sm:px-6 lg:px-8 py-4 sm:py-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-1 sm:mb-2">
                  Select Your Course
                </h2>
                <p className="text-primary-foreground/80 text-sm sm:text-base">
                  Choose which course you want to add videos to
                </p>
              </div>

              <div className="p-5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Course Selection - Single Dropdown for All Screens */}
                <div>
                  <label className="block mb-2 sm:mb-3">
                    <span className="block text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
                      Course Selection
                    </span>
                    <div className="relative">
                      <BookOpen className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
                      <select
                        value={selectedCourse}
                        onChange={(e) => handleCourseSelect(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground font-medium appearance-none cursor-pointer text-sm sm:text-base hover:border-primary/50 transition-colors"
                      >
                        <option value="">Choose a course to upload videos...</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title} ({course._count?.videos || 0} videos)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
                    </div>
                  </label>
                </div>

                {/* Selected Course Info */}
                {selectedCourseData && (
                  <div className="bg-muted border border-border rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-base sm:text-lg mb-1 sm:mb-2 line-clamp-1">
                          {selectedCourseData.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                          {selectedCourseData.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Video className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                            <span className="font-medium">{selectedCourseData._count?.videos || 0}</span>
                            <span>videos</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                selectedCourseData.published ? "bg-emerald-500" : "bg-chart-5"
                              }`}
                            ></span>
                            <span
                              className={
                                selectedCourseData.published
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-chart-5"
                              }
                            >
                              {selectedCourseData.published ? "Published" : "Draft"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {selectedCourse && (
                  <Link
                    href={`/instructor/courses/${selectedCourse}/videos`}
                    className="btn-primary flex items-center justify-center gap-2 sm:gap-3 w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98] group"
                  >
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Manage Videos for This Course</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {infoCards.map((card, index) => (
                <InfoCard key={index} {...card} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
