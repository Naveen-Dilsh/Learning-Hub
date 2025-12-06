"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import Link from "next/link"
import TusVideoUploader from "@/components/tus-video-uploader"

export default function ManageVideos() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
      console.log(data)
      setCourse(data)
    } catch (err) {
      setError("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFree = async (videoId, currentStatus) => {
    try {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFree: !currentStatus }),
      })

      if (!res.ok) throw new Error("Failed to update video")

      fetchCourse()
    } catch (err) {
      setError("Failed to update video")
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const res = await fetch(`/api/courses/${params.id}/videos/${videoId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete video")

      fetchCourse()
    } catch (err) {
      setError("Failed to delete video")
    }
  }

  const handleUploadComplete = () => {
    fetchCourse()
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground">Course not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/instructor/courses" className="text-primary hover:underline mb-2 inline-block">
              Back to Courses
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{course.title} - Videos</h1>
          </div>
        </div>

        {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

        <div className="mb-8">
          <TusVideoUploader courseId={params.id} onUploadComplete={handleUploadComplete} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Course Videos ({course.videos.length})</h2>
          {course.videos.length === 0 ? (
            <div className="bg-card rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No videos uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {course.videos.map((video, index) => (
                <div key={video.id} className="bg-card rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {index + 1}. {video.title}
                      </p>
                      {video.description && (
                        <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                      )}
                      {video.duration && (
                        <p className="text-sm text-muted-foreground">
                          Duration: {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="px-4 py-2 text-destructive border border-destructive rounded-lg hover:bg-destructive/10 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <input
                      type="checkbox"
                      id={`free-${video.id}`}
                      checked={video.isFree || false}
                      onChange={() => handleToggleFree(video.id, video.isFree)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={`free-${video.id}`} className="text-sm text-muted-foreground cursor-pointer">
                      Free Preview (visible to non-enrolled users)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
