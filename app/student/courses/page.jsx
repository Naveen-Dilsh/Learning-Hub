"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState, useMemo, useCallback, memo } from "react"
import { BookOpen, Play, TrendingUp } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

// Memoized CourseCard component for better performance
const CourseCard = memo(({ enrollment }) => {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-w-[280px]">
      {/* Course Thumbnail */}
      <div className="relative h-40 sm:h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {enrollment.course.thumbnail ? (
          <img
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        
        {/* Progress Badge */}
        {enrollment.progress > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white dark:bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {enrollment.progress}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 min-h-[3rem]">
          {enrollment.course.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
          {enrollment.course.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Progress</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {enrollment.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${enrollment.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Continue Learning Button */}
        <Link
          href={`/student/browse-course/${enrollment.course.id}/watch`}
          className="flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold"
        >
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Continue Learning</span>
        </Link>
      </div>
    </div>
  )
})

CourseCard.displayName = 'CourseCard'

export default function MyCourses() {
  const { data: session } = useSession()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Memoized fetch function for better performance
  const fetchEnrolledCourses = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      setError(null)
      const res = await fetch(`/api/student/enrollments?studentId=${session.user.id}`, {
        // Add caching headers for better performance
        next: { revalidate: 60 }, // Cache for 60 seconds
      })
      
      if (!res.ok) throw new Error("Failed to fetch enrollments")
      
      const data = await res.json()
      setEnrolledCourses(data.enrollments || [])
    } catch (error) {
      console.error("Error fetching enrollments:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id) {
      fetchEnrolledCourses()
    }
  }, [session?.user?.id, fetchEnrolledCourses])

  // Memoize course count for performance
  const courseCount = useMemo(() => enrolledCourses.length, [enrolledCourses.length])

  if (loading) return <LoadingBubbles />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Courses
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {courseCount > 0 
            ? `You're enrolled in ${courseCount} ${courseCount === 1 ? 'course' : 'courses'}`
            : 'Start your learning journey today'
          }
        </p>
      </div>
      

      {/* Content Section */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Error loading courses: {error}</p>
          </div>
        )}
        
        {courseCount === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-12 lg:p-16 text-center transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
              No courses yet
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
              Browse our course catalog and enroll in courses to start your learning journey
            </p>
            <Link
              href="/student/browse-courses"
              className="inline-block px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold text-sm sm:text-base"
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
