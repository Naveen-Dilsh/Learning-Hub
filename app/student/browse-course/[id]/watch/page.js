"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import VideoPlayer from "@/components/video-player"
import Link from "next/link"
import { CheckCircle, PlayCircle, Clock, Award, ArrowLeft, ChevronRight, Menu, X } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

// Certificate Celebration Modal with Lottie Animation
const CertificateModal = ({ isOpen, onClose, courseName }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Lottie Animation Container */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-8 pt-12">
          {/* Simple CSS Animation as fallback */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Award className="w-16 h-16 text-white" />
              </div>
              {/* Confetti effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-ping"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      left: `${50 + Math.cos(i * Math.PI / 4) * 60}%`,
                      top: `${50 + Math.sin(i * Math.PI / 4) * 60}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-lg text-slate-700 mb-6">
              You've completed the course!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 mb-6 border-2 border-indigo-100">
            <h3 className="font-bold text-slate-900 mb-2 text-center">Course Completed</h3>
            <p className="text-sm text-slate-700 text-center mb-4">
              {courseName}
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle className="w-5 h-5" />
              <span>Certificate Ready!</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              View Certificate
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 px-6 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WatchCourse() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [course, setCourse] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (params.id) {
      fetchCourse()
    }
  }, [params.id])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch course")
      const data = await res.json()
      setCourse(data)
      if (data.videos.length > 0) {
        setSelectedVideo(data.videos[0])
      }
    } catch (err) {
      setError("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  const getCurrentVideoIndex = () => {
    if (!course || !selectedVideo) return 0
    return course.videos.findIndex(v => v.id === selectedVideo.id)
  }

  const handlePrevious = () => {
    const currentIndex = getCurrentVideoIndex()
    if (currentIndex > 0) {
      setSelectedVideo(course.videos[currentIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    const currentIndex = getCurrentVideoIndex()
    if (currentIndex < course.videos.length - 1) {
      setSelectedVideo(course.videos[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Last video - show certificate modal
      setShowCertificateModal(true)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div><LoadingBubbles/></div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-4">Course not found</p>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currentIndex = getCurrentVideoIndex()
  const progressPercentage = course.videos.length > 0 
    ? ((currentIndex + 1) / course.videos.length) * 100 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Certificate Modal */}
      <CertificateModal 
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseName={course.title}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between gap-3">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            
            {/* Mobile Progress Indicator */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-xs font-semibold text-slate-600">
                {currentIndex + 1}/{course.videos.length}
              </span>
              <div className="w-16 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Video Player - Left Side */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {selectedVideo ? (
                <>
                  <VideoPlayer 
                    videoId={selectedVideo.id} 
                    courseId={params.id} 
                    videoTitle={selectedVideo.title}
                    userName={session?.user?.name}
                    userId={session?.user?.id}
                  />
                  
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">
                          {selectedVideo.title}
                        </h2>
                        {selectedVideo.description && (
                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            {selectedVideo.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-200">
                      {selectedVideo.duration && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                          <span className="text-xs sm:text-sm font-medium">{formatDuration(selectedVideo.duration)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                        <span className="text-xs sm:text-sm font-medium">Lesson {currentIndex + 1} of {course.videos.length}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  <p className="text-slate-600 text-sm sm:text-base">No videos available</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {selectedVideo && (
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">←</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">
                    {currentIndex === course.videos.length - 1 ? 'Complete Course →' : 'Next →'}
                  </span>
                  <span className="sm:hidden">→</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className={`
            fixed lg:relative inset-y-0 right-0 w-full sm:w-96 lg:w-auto
            transform ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            transition-transform duration-300 ease-in-out
            lg:col-span-1 z-50 lg:z-auto
          `}>
            <div className="h-full lg:h-auto bg-white rounded-none lg:rounded-2xl shadow-2xl lg:shadow-lg border-l lg:border-2 border-slate-200 lg:sticky lg:top-24 overflow-hidden flex flex-col max-h-screen lg:max-h-[calc(100vh-7rem)]">
              {/* Mobile Close Button */}
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden absolute top-4 right-4 z-10 p-2 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Course Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex-shrink-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 pr-8 lg:pr-0">{course.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                  By <span className="font-semibold text-indigo-600">{course.instructor.name}</span>
                </p>
              </div>

              {/* Video List */}
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
                <h4 className="font-bold text-slate-900 mb-3 px-2 flex items-center gap-2 text-sm sm:text-base">
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  Course Content
                </h4>
                <div className="space-y-2 pr-1 sm:pr-2">
                  {course.videos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        setSelectedVideo(video)
                        setShowSidebar(false)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all ${
                        selectedVideo?.id === video.id
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                          : "hover:bg-slate-50 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`mt-0.5 sm:mt-1 flex-shrink-0 ${
                          selectedVideo?.id === video.id ? 'text-white' : ''
                        }`}>
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedVideo?.id === video.id 
                              ? 'border-white bg-white' 
                              : 'border-slate-300'
                          }`}>
                            {selectedVideo?.id === video.id && (
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-600"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-bold mb-1 ${
                            selectedVideo?.id === video.id ? 'text-white' : 'text-slate-900'
                          }`}>
                            {index + 1}. {video.title}
                          </p>
                          {video.duration && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Clock className={`w-3 h-3 ${
                                selectedVideo?.id === video.id ? 'text-white/80' : 'text-slate-400'
                              }`} />
                              <span className={`text-xs ${
                                selectedVideo?.id === video.id ? 'text-white/90' : 'text-slate-500'
                              }`}>
                                {formatDuration(video.duration)}
                              </span>
                            </div>
                          )}
                        </div>
                        {selectedVideo?.id === video.id && (
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 sm:mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate CTA */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-t border-slate-200 flex-shrink-0">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 border-2 border-indigo-200">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">Complete & Get Certified</h4>
                  <p className="text-xs text-slate-600 mb-3 sm:mb-4">
                    Finish all lessons to receive your certificate
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {course.videos.length - (currentIndex + 1)} lessons remaining
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
