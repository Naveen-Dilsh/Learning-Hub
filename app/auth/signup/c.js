"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Upload, Video, Trash2, Edit, Users, DollarSign, Clock, PlayCircle, Check, X, AlertCircle, CheckCircle2 } from "lucide-react"

export default function ManageVideos() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadForm, setUploadForm] = useState({ title: "", description: "" })
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setSelectedFile(file)
    setUploadForm({ 
      title: file.name.replace(/\.[^/.]+$/, ""), 
      description: "" 
    })
    setShowUploadModal(true)
  }

  const handleVideoUpload = async () => {
    if (!selectedFile || !uploadForm.title.trim()) {
      showNotification("Please provide a title for the video", "error")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const res = await fetch(`/api/courses/${params.id}/videos/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Failed to upload video")

      const uploadedVideo = await res.json()

      const createRes = await fetch(`/api/courses/${params.id}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          cloudflareStreamId: uploadedVideo.videoId,
          duration: uploadedVideo.duration,
        }),
      })

      if (!createRes.ok) throw new Error("Failed to create video record")

      showNotification("Video uploaded successfully!", "success")
      setShowUploadModal(false)
      setSelectedFile(null)
      setUploadForm({ title: "", description: "" })
      fetchCourse()
    } catch (err) {
      showNotification(err.message || "Failed to upload video", "error")
    } finally {
      setUploading(false)
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-slate-900 text-xl font-semibold mb-4">Course not found</p>
          <Link href="/instructor/courses" className="text-blue-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
            notification.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-red-50 border-red-200 text-red-800"
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Upload Video Details</h3>
              <p className="text-sm text-slate-600 mt-1">File: {selectedFile?.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Enter video title"
                  className="w-full text-black px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={3}
                  className="w-full text-black px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setUploadForm({ title: "", description: "" })
                }}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVideoUpload}
                disabled={uploading || !uploadForm.title.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200">
            <div className="relative px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">Delete Video?</h3>
                  <p className="text-sm text-slate-600 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="bg-slate-50 border-l-4 border-red-500 rounded-xl p-4">
                <p className="text-slate-700 mb-2">You are about to permanently delete:</p>
                <p className="font-bold text-slate-900 break-words">"{deleteConfirm.title}"</p>
              </div>
              <p className="text-sm text-slate-600 mt-4">All video data including views and progress will be lost permanently.</p>
            </div>
            <div className="px-8 py-6 bg-gradient-to-br from-slate-50 to-slate-100/50 flex gap-3 rounded-b-3xl">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-white hover:border-slate-400 transition font-semibold"
              >
                Keep Video
              </button>
              <button
                onClick={() => handleDeleteVideo(deleteConfirm.id)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-lg shadow-red-600/25"
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
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h2>
                <p className="text-sm text-slate-600 mb-4">by {course.instructor?.name}</p>
                
                <p className="text-sm text-slate-700 mb-6 line-clamp-3">{course.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Video className="w-4 h-4" />
                      <span className="text-sm">Total Videos</span>
                    </div>
                    <span className="font-bold text-slate-900">{course.videos?.length || 0}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Students</span>
                    </div>
                    <span className="font-bold text-slate-900">{course._count?.enrollments || 0}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Price</span>
                    </div>
                    <span className="font-bold text-slate-900">Rs. {course.price?.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <span className="text-sm text-slate-600">Status</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      course.published
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
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
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Upload New Video</h3>
              </div>
              
              <div className="p-6">
                <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition group">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition">
                      <Upload className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="text-slate-900 font-semibold mb-1">Click to select video</p>
                    <p className="text-xs text-slate-600">MP4, WebM and other formats</p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Videos List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">
                  Course Videos ({course.videos?.length || 0})
                </h3>
              </div>

              <div className="p-6">
                {!course.videos || course.videos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No videos yet</p>
                    <p className="text-sm text-slate-500 mt-1">Upload your first video above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.videos.map((video, index) => (
                      <div
                        key={video.id}
                        className="bg-slate-50 rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:bg-slate-100 transition"
                      >
                        {editingVideo === video.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={videoForm.title}
                              onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                              placeholder="Video title"
                              className="w-full text-black px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <textarea
                              value={videoForm.description}
                              onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                              placeholder="Description (optional)"
                              rows={2}
                              className="w-full text-black px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateVideo(video.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                              >
                                <Check className="w-4 h-4" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingVideo(null)}
                                className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <PlayCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900 text-sm">
                                  {index + 1}. {video.title}
                                </h4>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => handleEditVideo(video)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(video)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {video.description && (
                                <p className="text-xs text-slate-600 mb-2">{video.description}</p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                {video.duration > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                                  </div>
                                )}
                                <span className="bg-slate-200 px-2 py-0.5 rounded">
                                  {video.cloudflareStreamId.slice(0, 8)}...
                                </span>
                              </div>
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
