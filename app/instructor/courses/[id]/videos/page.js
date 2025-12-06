"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Video, Trash2, Edit, Users, DollarSign, Clock, PlayCircle, Check, X, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import TusVideoUploader from "@/components/tus-video-uploader"

export default function ManageVideos() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [editingVideo, setEditingVideo] = useState(null)
  const [videoForm, setVideoForm] = useState({ title: "", description: "" })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

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
    } catch (err) {
      showNotification("Failed to load course", "error")
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 4000)
  }

  const handleUploadComplete = (mediaId) => {
    showNotification("Video uploaded successfully!", "success")
    fetchCourse()
  }

  const handleToggleFree = async (videoId, currentStatus) => {
    try {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFree: !currentStatus }),
      })

      if (!res.ok) throw new Error("Failed to update video")

      showNotification(
        !currentStatus ? "Video set as free preview!" : "Video removed from free preview",
        "success"
      )
      fetchCourse()
    } catch (err) {
      showNotification("Failed to update video preview status", "error")
    }
  }

  const handleDeleteVideo = async (videoId) => {
    try {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete video")

      showNotification("Video deleted successfully!", "success")
      setDeleteConfirm(null)
      fetchCourse()
    } catch (err) {
      showNotification("Failed to delete video", "error")
    }
  }

  const handleEditVideo = (video) => {
    setEditingVideo(video.id)
    setVideoForm({ title: video.title, description: video.description || "" })
  }

  const handleUpdateVideo = async (videoId) => {
    if (!videoForm.title.trim()) {
      showNotification("Title cannot be empty", "error")
      return
    }

    try {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoForm),
      })

      if (!res.ok) throw new Error("Failed to update video")

      showNotification("Video updated successfully!", "success")
      setEditingVideo(null)
      fetchCourse()
    } catch (err) {
      showNotification("Failed to update video", "error")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-foreground text-xl font-semibold mb-4">Course not found</p>
          <Link href="/instructor/courses" className="text-primary hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
            notification.type === "success" 
              ? "bg-emerald-500/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400" 
              : "bg-red-500/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
          }`}>
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification({ show: false, message: "", type: "" })}
              className="ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200 border border-border">
            <div className="relative px-8 py-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">Delete Video?</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="bg-muted border-l-4 border-red-500 rounded-xl p-4">
                <p className="text-foreground mb-2">You are about to permanently delete:</p>
                <p className="font-bold text-foreground break-words">"{deleteConfirm.title}"</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">All video data including views and progress will be lost permanently.</p>
            </div>
            <div className="px-8 py-6 bg-muted flex gap-3 rounded-b-3xl border-t border-border">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border-2 border-border text-foreground rounded-xl hover:bg-card transition font-semibold"
              >
                Keep Video
              </button>
              <button
                onClick={() => handleDeleteVideo(deleteConfirm.id)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-lg"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-2 text-primary hover:opacity-80 font-medium mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden sticky top-8">
              <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-2">{course.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">by {course.instructor?.name}</p>
                
                <p className="text-sm text-foreground mb-6 line-clamp-3">{course.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Video className="w-4 h-4" />
                      <span className="text-sm">Total Videos</span>
                    </div>
                    <span className="font-bold text-foreground">{course.videos?.length || 0}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Students</span>
                    </div>
                    <span className="font-bold text-foreground">{course._count?.enrollments || 0}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Price</span>
                    </div>
                    <span className="font-bold text-foreground">Rs. {course.price?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
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
          <div className="lg:col-span-2 space-y-6">
            {/* TUS Upload Section */}
            <TusVideoUploader 
              courseId={params.id} 
              onUploadComplete={handleUploadComplete}
            />

            {/* Videos List */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-muted/50 to-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Course Videos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.videos?.length || 0} videos uploaded
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!course.videos || course.videos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Video className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-semibold text-lg mb-2">No videos yet</p>
                    <p className="text-sm text-muted-foreground">Upload your first video to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.videos.map((video, index) => (
                      <div
                        key={video.id}
                        className="bg-muted/50 rounded-xl border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                      >
                        {editingVideo === video.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={videoForm.title}
                              onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                              placeholder="Video title"
                              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
                            />
                            <textarea
                              value={videoForm.description}
                              onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                              placeholder="Description (optional)"
                              rows={2}
                              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background text-foreground"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateVideo(video.id)}
                                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition text-sm font-semibold shadow-lg"
                              >
                                <Check className="w-4 h-4" />
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingVideo(null)}
                                className="flex items-center gap-1 px-4 py-2 border-2 border-border text-foreground rounded-lg hover:bg-muted transition text-sm font-semibold"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <PlayCircle className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-bold text-foreground text-base">
                                    {index + 1}. {video.title}
                                  </h4>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => handleEditVideo(video)}
                                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(video)}
                                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {video.duration > 0 && (
                                    <div className="flex items-center gap-1 bg-background px-2 py-1 rounded-md border border-border">
                                      <Clock className="w-3 h-3" />
                                      <span className="font-medium">
                                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                                      </span>
                                    </div>
                                  )}
                                  <span className="bg-background px-2 py-1 rounded-md border border-border font-mono">
                                    {video.cloudflareStreamId.slice(0, 8)}...
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Free Preview Toggle */}
                            <div className="pt-3 border-t border-border">
                              <button
                                onClick={() => handleToggleFree(video.id, video.isFree)}
                                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                  video.isFree
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600"
                                    : "bg-background border-2 border-border text-foreground hover:border-emerald-400 hover:bg-emerald-500/10"
                                }`}
                              >
                                {video.isFree ? (
                                  <Eye className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                  <EyeOff className="w-4 h-4 flex-shrink-0" />
                                )}
                                <div className="flex-1 text-left">
                                  <p className={`text-sm font-semibold ${video.isFree ? "text-white" : "text-foreground"}`}>
                                    {video.isFree ? "Free Preview Enabled" : "Enable Free Preview"}
                                  </p>
                                  <p className={`text-xs ${video.isFree ? "text-emerald-100" : "text-muted-foreground"}`}>
                                    {video.isFree 
                                      ? "Non-enrolled users can watch this video"
                                      : "Make this video available to everyone"
                                    }
                                  </p>
                                </div>
                                {video.isFree && (
                                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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