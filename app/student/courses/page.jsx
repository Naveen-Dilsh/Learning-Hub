"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useMemo, memo } from "react"
import { BookOpen, Play, TrendingUp, Award } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

// Memoized CourseCard component for better performance
const CourseCard = memo(({ enrollment }) => {
  return (
    <div className="group bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[280px]">
      {/* Course Thumbnail */}
      <div className="relative h-40 sm:h-48 bg-muted overflow-hidden">
        {enrollment.course.thumbnail ? (
          <img
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Progress Badge */}
        {enrollment.progress > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-card px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md border border-border backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">
                {enrollment.progress}%
              </span>
            </div>
          </div>
        )}

        {/* Certificate Badge */}
        {enrollment.certificate && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Certified
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 line-clamp-2 min-h-[3rem]">
          {enrollment.course.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
          {enrollment.course.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground font-medium">Progress</span>
            <span className="text-xs font-bold text-primary">
              {enrollment.progress}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${enrollment.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {enrollment.certificate ? (
            <>
              {/* <button
                onClick={() => {
                  window.open(`/api/certificates/${enrollment.certificate.id}/download`, "_blank")
                }}
                className="btn-primary flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold active:scale-[0.98] bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              >
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>View Certificate</span>
              </button> */}
              <Link
                href={`/student/browse-course/${enrollment.course.id}/watch`}
                className="btn-secondary flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Review Course</span>
              </Link>
            </>
          ) : (
            <Link
              href={`/student/browse-course/${enrollment.course.id}/watch`}
              className="btn-primary flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Continue Learning</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
})

CourseCard.displayName = 'CourseCard'

export default function MyCourses() {
  const { data: session, status: authStatus } = useSession()

  const {
    data: enrollmentData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["enrollments", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { enrollments: [], stats: { totalCourses: 0, hoursWatched: 0, completedCourses: 0, certificates: 0 } }
      }
      
      const res = await fetch(`/api/student/enrollments?studentId=${session.user.id}`, {
        cache: "no-store",
      })
      
      if (!res.ok) throw new Error("Failed to fetch enrollments")
      
      return await res.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 30 * 1000, // 30 seconds
  })

  const enrolledCourses = enrollmentData?.enrollments || []
  const courseCount = useMemo(() => enrolledCourses.length, [enrolledCourses.length])

  // Show loading if query is loading OR if session is not ready yet
  if (isLoading || authStatus === "loading" || !session?.user?.id) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          My Courses
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {courseCount > 0 
            ? `You're enrolled in ${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`
            : 'Start your learning journey today'
          }
        </p>
      </div>
      

      {/* Content Section */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Error loading courses: {error?.message || "Failed to load courses. Please try again."}
            </p>
          </div>
        )}
        
        {courseCount === 0 ? (
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-12 lg:p-16 text-center transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              No courses yet
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
              Browse our course catalog and enroll in courses to start your learning journey
            </p>
            <Link
              href="/student/browse-courses"
              className="btn-primary inline-block px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base active:scale-[0.98]"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-cols-fr">
            {enrolledCourses.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
