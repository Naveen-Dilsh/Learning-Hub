"use client"

import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, Video, Trash2, Edit, Users, DollarSign, Clock, PlayCircle, Check, X, Eye, EyeOff } from "lucide-react"
import TusVideoUploader from "@/components/tus-video-uploader"
import LoadingBubbles from "@/components/loadingBubbles"
import { useToast } from "@/hooks/use-toast"

// Memoized Video Card Component
const VideoCard = memo(({ video, index, onEdit, onDelete, onToggleFree, isEditing, videoForm, onFormChange, onSave, onCancel }) => {
  return (
    <div className="bg-muted/50 rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200">
      {isEditing ? (
        <div className="space-y-3 sm:space-y-4">
          <input
            type="text"
            value={videoForm.title}
            onChange={(e) => onFormChange({ ...videoForm, title: e.target.value })}
            placeholder="Video title"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground"
          />
          <textarea
            value={videoForm.description}
            onChange={(e) => onFormChange({ ...videoForm, description: e.target.value })}
            placeholder="Description (optional)"
            rows={3}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm sm:text-base bg-background text-foreground resize-none"
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onSave}
              className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg active:scale-[0.98]"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="btn-secondary flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h4 className="font-bold text-foreground text-sm sm:text-base lg:text-lg">
                  {index + 1}. {video.title}
                </h4>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={onEdit}
                    className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1.5 sm:p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              {video.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{video.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                {video.duration > 0 && (
                  <div className="flex items-center gap-1.5 bg-background px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                    </span>
                  </div>
                )}
                <span className="bg-background px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border font-mono text-xs">
                  {video.cloudflareStreamId?.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Free Preview Toggle */}
          <div className="pt-3 sm:pt-4 border-t border-border">
            <button
              onClick={onToggleFree}
              className={`flex items-center gap-2 sm:gap-3 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                video.isFree
                  ? "bg-emerald-500/10 border-2 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-background border-2 border-border text-foreground hover:border-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              {video.isFree ? (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              )}
              <div className="flex-1 text-left">
                <p className={`text-xs sm:text-sm font-semibold ${video.isFree ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                  {video.isFree ? "Free Preview Enabled" : "Enable Free Preview"}
                </p>
                <p className={`text-xs ${video.isFree ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-muted-foreground"}`}>
                  {video.isFree 
                    ? "Non-enrolled users can watch this video"
                    : "Make this video available to everyone"
                  }
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

VideoCard.displayName = "VideoCard"

export default function ManageVideos() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [editingVideo, setEditingVideo] = useState(null)
  const [videoForm, setVideoForm] = useState({ title: "", description: "" })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      // Block ADMIN access - redirect to allowed page
      if (session?.user?.role === "ADMIN") {
        router.push("/instructor/enrollments/pending")
      } else if (session?.user?.role !== "INSTRUCTOR") {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

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
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch course")
      }
      
      return await res.json()
    },
    enabled: !!params.id && status === "authenticated",
    staleTime: 5 * 1000, // 10 seconds
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to load course",
        variant: "destructive",
      })
    },
  })

  const handleUploadComplete = useCallback(async () => {
    // Immediately refetch course data to show new video
    await queryClient.refetchQueries({ 
      queryKey: ["course", params.id],
      exact: true 
    })
    
    // Also invalidate to ensure all related queries are updated
    queryClient.invalidateQueries({ 
      queryKey: ["course", params.id],
      exact: false 
    })
    
    // Invalidate instructor courses list to update video counts
    queryClient.invalidateQueries({ 
      queryKey: ["instructorCourses"],
      exact: false 
    })
  }, [queryClient, params.id])

  const toggleFreeMutation = useMutation({
    mutationFn: async ({ videoId, isFree }) => {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFree }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update video")
      }

      return await res.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch course data
      queryClient.invalidateQueries({ queryKey: ["course", params.id] })
      
      toast({
        title: "Success",
        description: variables.isFree ? "Video set as free preview!" : "Video removed from free preview",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update video preview status",
        variant: "destructive",
      })
    },
  })

  const handleToggleFree = useCallback((videoId, currentStatus) => {
    toggleFreeMutation.mutate({ videoId, isFree: !currentStatus })
  }, [toggleFreeMutation])

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId) => {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete video")
      }

      return await res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch course data
      queryClient.invalidateQueries({ queryKey: ["course", params.id] })
      
      toast({
        title: "Success",
        description: "Video deleted successfully!",
      })
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      })
    },
  })

  const handleDeleteVideo = useCallback((videoId) => {
    deleteVideoMutation.mutate(videoId)
  }, [deleteVideoMutation])

  const handleEditVideo = useCallback((video) => {
    setEditingVideo(video.id)
    setVideoForm({ title: video.title, description: video.description || "" })
  }, [])

  const updateVideoMutation = useMutation({
    mutationFn: async ({ videoId, data }) => {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update video")
      }

      return await res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch course data
      queryClient.invalidateQueries({ queryKey: ["course", params.id] })
      
      toast({
        title: "Success",
        description: "Video updated successfully!",
      })
      setEditingVideo(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update video",
        variant: "destructive",
      })
    },
  })

  const handleUpdateVideo = useCallback((videoId) => {
    if (!videoForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title cannot be empty",
        variant: "destructive",
      })
      return
    }

    updateVideoMutation.mutate({ videoId, data: videoForm })
  }, [videoForm, updateVideoMutation, toast])

  const videoCount = useMemo(() => course?.videos?.length || 0, [course])

  if (status === "loading" || isLoading || !params.id) {
    return <LoadingBubbles />
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6">
          <p className="text-foreground text-xl sm:text-2xl font-semibold mb-4">Course not found</p>
          <Link href="/instructor/courses" className="text-primary hover:opacity-80 font-medium">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200 border border-border">
            <div className="relative px-6 sm:px-8 py-5 sm:py-6 border-b border-border">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-destructive to-chart-5 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">Delete Video?</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="bg-muted border-l-4 border-destructive rounded-xl p-4">
                <p className="text-foreground mb-2 text-sm sm:text-base">You are about to permanently delete:</p>
                <p className="font-bold text-foreground break-words text-sm sm:text-base">"{deleteConfirm.title}"</p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-4">All video data including views and progress will be lost permanently.</p>
            </div>
            <div className="px-6 sm:px-8 py-5 sm:py-6 bg-muted flex flex-col sm:flex-row gap-3 rounded-b-2xl sm:rounded-b-3xl border-t border-border">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base"
              >
                Keep Video
              </button>
              <button
                onClick={() => handleDeleteVideo(deleteConfirm.id)}
                className="btn-danger flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Courses</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground line-clamp-1">
                  Manage Videos
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {course.title}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-muted px-3 sm:px-4 py-2 rounded-lg border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">Total Videos</div>
                <div className="text-lg sm:text-xl font-bold text-foreground">{videoCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden sticky top-6 sm:top-8">
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2 line-clamp-2">{course.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">by {course.instructor?.name}</p>
                
                <p className="text-xs sm:text-sm text-foreground mb-4 sm:mb-6 line-clamp-3">{course.description}</p>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between py-2 sm:py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Total Videos</span>
                    </div>
                    <span className="font-bold text-foreground text-sm sm:text-base">{videoCount}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 sm:py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Students</span>
                    </div>
                    <span className="font-bold text-foreground text-sm sm:text-base">{course._count?.enrollments || 0}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 sm:py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Price</span>
                    </div>
                    <span className="font-bold text-foreground text-sm sm:text-base">Rs. {course.price?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 sm:py-3 border-t border-border">
                    <span className="text-xs sm:text-sm text-muted-foreground">Status</span>
                    <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold ${
                      course.published
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                    }`}>
                      {course.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Videos Management */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* TUS Upload Section */}
            <TusVideoUploader 
              courseId={params.id} 
              onUploadComplete={handleUploadComplete}
            />

            {/* Videos List */}
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-gradient-to-r from-muted/50 to-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        Course Videos
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {videoCount} {videoCount === 1 ? "video" : "videos"} uploaded
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {!course.videos || course.videos.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-semibold text-base sm:text-lg mb-2">No videos yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Upload your first video to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {course.videos.map((video, index) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        index={index}
                        onEdit={() => handleEditVideo(video)}
                        onDelete={() => setDeleteConfirm(video)}
                        onToggleFree={() => handleToggleFree(video.id, video.isFree)}
                        isEditing={editingVideo === video.id}
                        videoForm={videoForm}
                        onFormChange={setVideoForm}
                        onSave={() => handleUpdateVideo(video.id)}
                        onCancel={() => setEditingVideo(null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
