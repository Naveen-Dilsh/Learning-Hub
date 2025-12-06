"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Upload, BookOpen, ArrowRight, Video, CheckCircle, Cloud } from "lucide-react"

export default function UploadVideos() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchCourses()
    }
  }, [session])

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/courses?instructorId=${session.user.id}`)
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse)

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Upload Videos</h1>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                <Cloud className="w-4 h-4" />
                Powered by Cloudflare Stream for optimized delivery
              </p>
            </div>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses available</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You need to create a course before you can upload videos. Start building your course content today!
            </p>
            <Link
              href="/instructor/courses/create"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 font-medium"
            >
              <BookOpen className="w-5 h-5" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">Select Your Course</h2>
                <p className="text-blue-100">Choose which course you want to add videos to</p>
              </div>

              <div className="p-8">
                <label className="block mb-6">
                  <span className="block text-sm font-semibold text-slate-900 mb-3">
                    Course Selection
                  </span>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 font-medium appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <option value="">Choose a course to upload videos...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} ({course._count?.videos || 0} videos)
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </label>

                {/* Selected Course Info */}
                {selectedCourseData && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-2">
                          {selectedCourseData.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {selectedCourseData.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Video className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{selectedCourseData._count?.videos || 0}</span>
                            <span>videos</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className={`w-2 h-2 rounded-full ${selectedCourseData.published ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span>{selectedCourseData.published ? 'Published' : 'Draft'}</span>
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
                    className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 font-semibold text-lg group"
                  >
                    <Video className="w-6 h-6" />
                    Manage Videos for This Course
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Cloud className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Cloudflare Stream</h3>
                <p className="text-sm text-slate-600">Fast, reliable video delivery worldwide</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Easy Management</h3>
                <p className="text-sm text-slate-600">Upload, organize, and edit your videos</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">High Quality</h3>
                <p className="text-sm text-slate-600">Automatic optimization and encoding</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
