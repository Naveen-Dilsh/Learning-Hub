"use client"

import { useState, useMemo, useEffect, memo } from "react"
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import VideoPlayer from "@/components/video-player"
import { PlayCircle, Users, Video, Clock, ChevronLeft, Lock, User, CheckCircle } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

// Memoized Video Item Component
const VideoItem = memo(({ video, index, isSelected, onClick, isFree }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 sm:p-4 rounded-lg transition-all ${
      isSelected
        ? "bg-primary/10 border border-primary"
        : "hover:bg-muted border border-transparent"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-xs sm:text-sm mb-1 truncate ${
          isSelected ? "text-primary" : "text-foreground"
        }`}>
          {video.title}
        </div>
        {video.duration && (
          <div className={`text-xs flex items-center gap-1 ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}>
            <Clock className="w-3 h-3" />
            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
          </div>
        )}
      </div>
    </div>
  </button>
))

VideoItem.displayName = 'VideoItem'

// Memoized Course Lesson Item
const CourseLessonItem = memo(({ video, index }) => (
  <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg hover:bg-muted transition border border-transparent hover:border-border">
    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded-lg flex items-center justify-center font-semibold text-foreground text-xs sm:text-sm">
        {index + 1}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {video.isFree ? (
          <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-chart-4 flex-shrink-0" />
        ) : (
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium text-foreground text-sm sm:text-base truncate">
            {video.title}
          </span>
          {video.isFree && (
            <span className="text-xs bg-chart-4/10 text-chart-4 px-2 py-0.5 rounded font-medium flex-shrink-0">
              FREE
            </span>
          )}
        </div>
      </div>
    </div>
    {video.duration && (
      <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0 ml-2">
        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
      </span>
    )}
  </div>
))

CourseLessonItem.displayName = 'CourseLessonItem'

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()
  const [selectedVideo, setSelectedVideo] = useState(null)

  // Fetch course details
  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useQuery({
    queryKey: ["course", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to fetch course")
      return await res.json()
    },
    enabled: !!params.id,
    staleTime: 30 * 1000, // 30 seconds
  })

  // Check enrollment status
  const {
    data: enrollmentData,
    isLoading: enrollmentLoading,
  } = useQuery({
    queryKey: ["enrollment-check", params.id, session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments/check?courseId=${params.id}`)
      if (!res.ok) return { enrolled: false }
      return await res.json()
    },
    enabled: !!params.id && !!session?.user?.id,
    staleTime: 30 * 1000, // 30 seconds
  })

  const isEnrolled = enrollmentData?.enrolled || false

  // Memoized free videos
  const freeVideos = useMemo(() => 
    course?.videos.filter(v => v.isFree) || [], 
    [course]
  )

  // Set first free video as selected when course loads
  useEffect(() => {
    if (course && !selectedVideo) {
      const firstFreeVideo = course.videos.find(v => v.isFree)
      if (firstFreeVideo) {
        setSelectedVideo(firstFreeVideo)
      }
    }
  }, [course, selectedVideo])

  const isLoading = courseLoading || (authStatus === "loading")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles/>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Course not found</h2>
          <Link href="/student/browse-course" className="btn-primary inline-block px-4 py-2 rounded-lg mt-4">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Link 
            href="/student/browse-course" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition mb-2"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Courses</span>
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground line-clamp-1">
            {course.title}
          </h1>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Video Section */}
        {freeVideos.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Video Player */}
              <div className="lg:col-span-2 xl:col-span-3">
                {selectedVideo && (
                  <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
                    <div className="aspect-video bg-black">
                      <VideoPlayer
                        videoId={selectedVideo.id}
                        courseId={course.id}
                        userName={session?.user?.name || "Guest"}
                        userId={session?.user?.id || "preview"}
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                        {selectedVideo.title}
                      </h2>
                      {selectedVideo.description && (
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {selectedVideo.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Playlist Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl shadow-sm border border-border lg:sticky lg:top-24">
                  <div className="p-3 sm:p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      Preview Videos
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                      {freeVideos.length} free {freeVideos.length === 1 ? 'video' : 'videos'}
                    </p>
                  </div>
                  
                  <div className="p-2 max-h-[300px] sm:max-h-96 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                      {freeVideos.map((video, index) => (
                        <VideoItem
                          key={video.id}
                          video={video}
                          index={index}
                          isSelected={selectedVideo?.id === video.id}
                          onClick={() => setSelectedVideo(video)}
                          isFree={true}
                        />
                      ))}
                    </div>
                  </div>

                  {!isEnrolled && (
                    <div className="p-3 sm:p-4 bg-muted/50 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Want full access?
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Enroll to access all {course.videos.length} videos
                      </p>
                      <Link
                        href={`/student/browse-course/${course.id}/purchase`}
                        className="btn-primary block text-center px-4 py-2 rounded-lg font-medium text-sm active:scale-[0.98]"
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
        <div className="bg-card rounded-xl shadow-sm border border-border mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">
              {course.title}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
              {course.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-muted rounded-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Instructor</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground truncate">
                    {course.instructor.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-muted rounded-lg">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Videos</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {course.videos.length} lessons
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-muted rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Students</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {course._count.enrollments} enrolled
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                Rs. {course.price.toLocaleString()}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {isEnrolled ? (
                  <Link
                    href={`/courses/${course.id}/watch`}
                    className="btn-success inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base active:scale-[0.98]"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Continue Learning</span>
                  </Link>
                ) : (
                  <Link
                    href={`/student/browse-course/${course.id}/purchase`}
                    className="btn-primary inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base active:scale-[0.98]"
                  >
                    <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Enroll Now</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Course Content
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {course.videos.length} video {course.videos.length === 1 ? 'lesson' : 'lessons'}
            </p>
          </div>
          
          <div className="p-3 sm:p-6">
            <div className="space-y-1 sm:space-y-2">
              {course.videos.map((video, index) => (
                <CourseLessonItem
                  key={video.id}
                  video={video}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
