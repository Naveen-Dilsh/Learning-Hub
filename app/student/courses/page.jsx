"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { BookOpen, Play, TrendingUp } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

export default function MyCourses() {
  const { data: session } = useSession()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchEnrolledCourses()
    }
  }, [session])

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch(`/api/student/enrollments?studentId=${session.user.id}`)
      if (!res.ok) throw new Error("Failed to fetch enrollments")
      const data = await res.json()
      setEnrolledCourses(data.enrollments)
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingBubbles />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="pl-8 pt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">
                {enrolledCourses.length > 0 
                  ? `You're enrolled in ${enrolledCourses.length} ${enrolledCourses.length === 1 ? 'course' : 'courses'}`
                  : 'Start your learning journey today'
                }
              </p>
      </div>
      

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 lg:p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No courses yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Browse our course catalog and enroll in courses to start your learning journey
            </p>
            <Link
              href="/student/browse-courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {enrollment.course.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Progress Badge */}
                  {enrollment.progress > 0 && (
                    <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-600">{enrollment.progress}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {enrollment.course.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600 font-medium">Progress</span>
                      <span className="text-xs font-bold text-blue-600">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Continue Learning Button */}
                  <Link
                    href={`/student/browse-course/${enrollment.course.id}/watch`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-semibold"
                  >
                    <Play className="w-4 h-4" />
                    <span>Continue Learning</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
