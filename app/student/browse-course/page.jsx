"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Search, BookOpen, Users, Video, TrendingUp } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

export default function CourseBrowser() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCourses, setFilteredCourses] = useState([])

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.published &&
        (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses?published=true")
      if (!res.ok) throw new Error("Failed to fetch courses")
      const data = await res.json()
      setCourses(data)
      setFilteredCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="pl-8 pt-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
      <p className="text-gray-600 mb-5">Discover and enroll in courses to expand your skills</p>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or browse all courses</p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? `Results for "${searchTerm}"` : "All Courses"}
                </h2>
                <p className="text-gray-600 mt-1">{filteredCourses.length} courses available</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Course Thumbnail */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-200">
                      <span className="text-sm font-bold text-blue-600">
                        Rs. {course.price}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                    {/* Course Meta */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">{course.instructor.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Video className="w-4 h-4" />
                        <span className="text-xs font-medium">{course._count.videos} videos</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Link
                        href={`/student/browse-course/${course.id}`}
                        className="block w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-blue-700 transition-all"
                      >
                        View Details
                      </Link>
                      <div className="grid grid-cols-1 gap-2">
                        <Link
                          href={`/student/browse-course/${course.id}/purchase`}
                          className="px-3 py-2 bg-white text-gray-900 rounded-lg text-xs font-semibold text-center hover:bg-gray-50 border border-gray-300 transition-all"
                        >
                          Enroll Now
                        </Link>
                        {/* <Link
                          href={`/student/browse-course/${course.id}/enroll-manual`}
                          className="px-3 py-2 bg-white text-gray-700 rounded-lg text-xs font-semibold text-center hover:bg-gray-50 border border-gray-200 transition-all"
                        >
                          Manual Enroll
                        </Link> */}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
