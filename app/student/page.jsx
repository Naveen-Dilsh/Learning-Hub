"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { BookOpen, Zap, Award } from "lucide-react"
import { useDashboard } from "@/lib/hooks"
import LoadingBubbles from "@/components/loadingBubbles"


export default function StudentDashboard() {
  const { data: session } = useSession()
  const { setActiveTab } = useDashboard()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [stats, setStats] = useState({ totalCourses: 0, hoursWatched: 0, completedCourses: 0, certificates: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveTab("dashboard")
  }, [setActiveTab])

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
      setEnrolledCourses(data.enrollments.slice(0, 3))
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingBubbles/>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          Continue learning and expand your skills
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Enrolled Courses</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalCourses}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Learning Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.hoursWatched}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Completed Courses</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.completedCourses}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Certificates Earned</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.certificates}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Courses</h2>
          <Link 
            href="/student/courses" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base"
          >
            View All
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-900 dark:text-gray-100 font-medium mb-2 text-sm sm:text-base">No courses yet</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">Start learning by enrolling in courses</p>
            <Link
              href="/courses"
              className="inline-block px-4 sm:px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition text-sm sm:text-base"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {enrolledCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
              >
                {enrollment.course.thumbnail && (
                  <img
                    src={enrollment.course.thumbnail || "/placeholder.svg"}
                    alt={enrollment.course.title}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {enrollment.course.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    href={`/courses/${enrollment.course.id}/watch`}
                    className="block w-full px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-center text-xs sm:text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
                  >
                    Continue Learning
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
