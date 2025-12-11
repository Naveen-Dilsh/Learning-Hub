"use client"

import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react"
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import VideoPlayer from "@/components/video-player"
import Link from "next/link"
import { PlayCircle, Clock, Award, ArrowLeft, ChevronDown, ChevronUp, X, FileText } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"
import CourseResources from "@/components/course-resources"
import { useToast } from "@/hooks/use-toast"

// Simple Certificate Modal - Simplified
const CertificateModal = memo(({ isOpen, onClose, courseName, courseId }) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Automatically generate certificate when modal opens
      const generateCertificate = async () => {
        try {
          const res = await fetch(`/api/courses/${courseId}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })

          const data = await res.json()

          if (res.ok && data.completed) {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["enrollments"] })
            queryClient.invalidateQueries({ queryKey: ["certificates"] })
            queryClient.invalidateQueries({ queryKey: ["course", courseId] })
            
            toast({
              title: "🎉 Certificate Earned!",
              description: "Congratulations! Your certificate has been generated.",
            })
          }
        } catch (error) {
          console.error("Error generating certificate:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to generate certificate. Please try again later.",
          })
        }
      }

      generateCertificate()
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, courseId, queryClient, toast])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300 border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-card/80 hover:bg-card rounded-full transition-colors border border-border"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 p-8 pt-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <Award className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              You've completed the course!
            </p>
            <p className="text-sm font-semibold text-primary">{courseName}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            <Link
              href={`/student/certificates`}
              className="btn-primary w-full py-4 px-6 rounded-xl font-bold text-center block active:scale-[0.98]"
            >
              View Certificate
            </Link>
            <Link
              href="/student/courses"
              className="bg-muted hover:bg-muted/80 text-foreground w-full py-4 px-6 rounded-xl font-bold text-center block transition active:scale-[0.98]"
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})

CertificateModal.displayName = "CertificateModal"

// Memoized Video Item Component
const VideoItem = memo(({ video, index, isActive, onClick, formatDuration }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isActive
          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
          : "hover:bg-muted text-foreground border border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1 flex-shrink-0`}>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isActive 
              ? 'border-white bg-white' 
              : 'border-muted-foreground'
          }`}>
            {isActive && (
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold mb-1 ${
            isActive ? 'text-white' : 'text-foreground'
          }`}>
            {index + 1}. {video.title}
          </p>
          {video.duration && (
            <div className="flex items-center gap-2">
              <Clock className={`w-3 h-3 ${
                isActive ? 'text-white/80' : 'text-muted-foreground'
              }`} />
              <span className={`text-xs ${
                isActive ? 'text-white/90' : 'text-muted-foreground'
              }`}>
                {formatDuration(video.duration)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
})

VideoItem.displayName = "VideoItem"

export default function WatchCourse() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session, status: authStatus } = useSession()
  const [selectedVideoId, setSelectedVideoId] = useState(null)
  const [showContentSection, setShowContentSection] = useState(false)
  const [showResourcesSection, setShowResourcesSection] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const { toast } = useToast()

  // Redirect if unauthenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [authStatus, router])

  // Fetch course data with React Query - optimized
  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to fetch course")
      return await res.json()
    },
    enabled: !!params.id && authStatus !== "unauthenticated",
    staleTime: 60 * 1000, // 60 seconds - increased for better performance
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
  })

  // Set first video as selected when course loads
  useEffect(() => {
    if (course?.videos?.length > 0 && !selectedVideoId) {
      setSelectedVideoId(course.videos[0].id)
    }
  }, [course, selectedVideoId])

  // Memoized utility functions
  const formatDuration = useCallback((seconds) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }, [])

  const selectedVideo = useMemo(() => {
    if (!course?.videos || !selectedVideoId) return null
    return course.videos.find(v => v.id === selectedVideoId)
  }, [course?.videos, selectedVideoId])

  const currentIndex = useMemo(() => {
    if (!course?.videos || !selectedVideo) return 0
    return course.videos.findIndex(v => v.id === selectedVideo.id)
  }, [course?.videos, selectedVideo])

  const progressPercentage = useMemo(() => {
    if (!course?.videos?.length) return 0
    return ((currentIndex + 1) / course.videos.length) * 100
  }, [course?.videos?.length, currentIndex])

  const handleVideoSelect = useCallback((videoId) => {
    setSelectedVideoId(videoId)
    setShowContentSection(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && course?.videos) {
      setSelectedVideoId(course.videos[currentIndex - 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentIndex, course?.videos])

  const handleNext = useCallback(() => {
    if (!course?.videos) return
    
    if (currentIndex < course.videos.length - 1) {
      // Move to next video
      setSelectedVideoId(course.videos[currentIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Last video completed - simply show certificate modal
      // Certificate will be generated automatically when modal opens
      setShowCertificateModal(true)
    }
  }, [currentIndex, course?.videos])


  // Loading state
  if (isLoading || authStatus === "loading" || !session?.user?.id) {
    return <LoadingBubbles />
  }

  // Error state
  if (isError || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="text-center max-w-md">
          <p className="text-destructive font-semibold mb-4 text-lg">
            {error?.message || "Failed to load course"}
          </p>
          {/* <Link 
            href="/student" 
            className="btn-primary inline-block px-6 py-3 rounded-lg"
          >
            Back to Dashboard
          </Link> */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Certificate Modal */}
      <CertificateModal 
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseName={course.title}
        courseId={course.id}
      />

      {/* Main Content - Single Column */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            {course.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            By <span className="font-semibold text-primary">{course.instructor.name}</span>
          </p>
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">
              Lesson {currentIndex + 1} of {course.videos.length}
            </span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">

          {/* Video Player Section */}
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden">
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
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3">
                      {selectedVideo.title}
                    </h2>
                    {selectedVideo.description && (
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {selectedVideo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                    {selectedVideo.duration && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <span className="text-xs sm:text-sm font-medium">{formatDuration(selectedVideo.duration)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span className="text-xs sm:text-sm font-medium">Lesson {currentIndex + 1} of {course.videos.length}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No videos available</p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {selectedVideo && (
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-card border-2 border-border text-foreground rounded-xl font-bold hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <span className="hidden sm:inline">← Previous</span>
                <span className="sm:hidden">←</span>
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <span className="hidden sm:inline">
                  {currentIndex === course.videos.length - 1 ? 'Complete Course →' : 'Next →'}
                </span>
                <span className="sm:hidden">→</span>
              </button>
            </div>
          )}

          {/* Collapsible Course Content Section */}
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setShowContentSection(!showContentSection)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Course Content ({course.videos.length} lessons)
                </h3>
              </div>
              {showContentSection ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {showContentSection && (
              <div className="border-t border-border p-4 sm:p-6 space-y-2 max-h-[600px] overflow-y-auto">
                {course.videos.map((video, index) => (
                  <VideoItem
                    key={video.id}
                    video={video}
                    index={index}
                    isActive={selectedVideoId === video.id}
                    onClick={() => handleVideoSelect(video.id)}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Course Resources Section */}
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setShowResourcesSection(!showResourcesSection)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Course Materials
                </h3>
              </div>
              {showResourcesSection ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {showResourcesSection && (
              <div className="border-t border-border p-4 sm:p-6">
                <CourseResources courseId={params.id} showUploader={false} canEdit={false} />
              </div>
            )}
          </div>

          {/* Certificate Progress Card */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl sm:rounded-2xl border border-primary/20 p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h4 className="font-bold text-foreground mb-2 text-lg sm:text-xl">Complete & Get Certified</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Finish all lessons to receive your certificate
              </p>
              <div className="w-full bg-muted rounded-full h-3 mb-3">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {course.videos.length - (currentIndex + 1)} lesson{course.videos.length - (currentIndex + 1) !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
