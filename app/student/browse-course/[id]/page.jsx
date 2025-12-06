"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import Link from "next/link"
import VideoPlayer from "@/components/video-player"
import { PlayCircle, Users, Video, Clock, ChevronLeft, Lock, User } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCourse()
      if (session?.user) {
        checkEnrollment()
      }
    }
  }, [params.id, session])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch course")
      const data = await res.json()
      setCourse(data)
      
      const firstFreeVideo = data.videos.find(v => v.isFree)
      if (firstFreeVideo) {
        setSelectedVideo(firstFreeVideo)
      }
    } catch (error) {
      console.error("Error fetching course:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    try {
      const res = await fetch(`/api/enrollments/check?courseId=${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setIsEnrolled(data.enrolled)
      }
    } catch (error) {
      console.error("Error checking enrollment:", error)
    }
  }

  const handleManualEnroll = async () => {
    if (!session?.user) {
      alert("Please sign in to enroll")
      return
    }

    setEnrolling(true)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: params.id
        })
      })

      if (res.ok) {
        setIsEnrolled(true)
        alert("Successfully enrolled in the course!")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to enroll")
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      alert("Failed to enroll. Please try again.")
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-lg"><LoadingBubbles/></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-700 text-lg">Course not found</div>
      </div>
    )
  }

  const freeVideos = course.videos.filter(v => v.isFree)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/student/browse-course" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition mb-3"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Courses
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {course.title}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Section */}
        {freeVideos.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-3">
                {selectedVideo && (
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    <div className="aspect-video bg-black">
                      <VideoPlayer
                        videoId={selectedVideo.id}
                        courseId={course.id}
                        userName={session?.user?.name || "Guest"}
                        userId={session?.user?.id || "preview"}
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {selectedVideo.title}
                      </h2>
                      {selectedVideo.description && (
                        <p className="text-gray-600 leading-relaxed">
                          {selectedVideo.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Playlist Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Preview Videos
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {freeVideos.length} free videos
                    </p>
                  </div>
                  
                  <div className="p-2 max-h-96 overflow-y-auto">
                    <div className="space-y-1">
                      {freeVideos.map((video, index) => (
                        <button
                          key={video.id}
                          onClick={() => setSelectedVideo(video)}
                          className={`w-full text-left p-3 rounded transition ${
                            selectedVideo?.id === video.id
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50 border border-transparent"
                          }`}
                        >
                          <div className={`font-medium text-sm mb-1 ${
                            selectedVideo?.id === video.id ? "text-blue-900" : "text-gray-900"
                          }`}>
                            {index + 1}. {video.title}
                          </div>
                          {video.duration && (
                            <div className={`text-xs flex items-center gap-1 ${
                              selectedVideo?.id === video.id ? "text-blue-600" : "text-gray-500"
                            }`}>
                              <Clock className="w-3 h-3" />
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isEnrolled && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-900 font-medium mb-1">
                        Want full access?
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Enroll to access all {course.videos.length} videos
                      </p>
                      <Link
                        href={`/courses/${course.id}/purchase`}
                        className="block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm"
                      >
                        Enroll for Rs. {course.price}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {course.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Instructor</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {course.instructor.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded">
                  <Video className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Videos</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {course.videos.length} lessons
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Students</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {course._count.enrollments} enrolled
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-3xl font-bold text-gray-900">
                Rs. {course.price}
              </div>
              <div className="flex flex-wrap gap-3">
                {isEnrolled ? (
                  <Link
                    href={`/courses/${course.id}/watch`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Continue Learning
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/student/browse-course/${course.id}/purchase`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                    >
                      Enroll Now
                    </Link>
                    
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Course Content
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {course.videos.length} video lessons
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-2">
              {course.videos.map((video, index) => (
                <div 
                  key={video.id} 
                  className="flex items-center justify-between p-4 rounded hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center font-semibold text-gray-700 text-sm">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      {video.isFree ? (
                        <PlayCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-gray-900">
                          {video.title}
                        </span>
                        {video.isFree && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                            FREE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {video.duration && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
