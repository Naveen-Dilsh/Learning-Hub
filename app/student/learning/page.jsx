"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useVideoStore } from "@/lib/stores"

export default function ContinueLearning() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentVideoId, currentCourseId, setCurrentVideo, completedVideos } = useVideoStore()

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
      const inProgress = data.enrollments.filter((e) => e.progress < 100)
      setCourses(inProgress)
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Continue Learning</h1>
      <p className="text-gray-600 mb-8">Resume your in-progress courses</p>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-900 font-medium mb-2">No courses in progress</p>
          <p className="text-gray-600">Complete more courses or enroll in new ones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{enrollment.course.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{enrollment.course.description}</p>
                </div>
                <div className="ml-8">
                  <p className="text-2xl font-bold text-blue-600">{enrollment.progress}%</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${enrollment.progress}%` }}
                  ></div>
                </div>
              </div>
              <Link
                href={`/courses/${enrollment.course.id}/watch`}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Continue
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
