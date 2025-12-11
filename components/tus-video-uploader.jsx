"use client"

import { useState, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Upload, X, CheckCircle, AlertCircle, Video, FileVideo } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function TusVideoUploader({ courseId, onUploadComplete }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [videoDetails, setVideoDetails] = useState({ title: "", description: "" })
  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid File",
          description: "Please select a valid video file",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setVideoDetails({ 
        title: file.name.replace(/\.[^/.]+$/, ""), 
        description: "" 
      })
      setError(null)
      setSuccess(false)
      setShowDetailsModal(true)
    }
  }, [toast])

  const uploadFileWithTus = useCallback(async () => {
    if (!selectedFile || !videoDetails.title.trim()) {
      setError("Please provide a title for the video")
      return
    }

    setShowDetailsModal(false)
    setUploading(true)
    setProgress(0)
    setError(null)
    abortControllerRef.current = new AbortController()

    try {
      // Step 1: Initiate tus upload
      const initResponse = await fetch("/api/stream/tus-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          courseId,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!initResponse.ok) {
        const errorData = await initResponse.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to initiate upload")
      }

      const { uploadUrl, mediaId, chunkSize } = await initResponse.json()

      // Step 2: Upload file in chunks
      const totalSize = selectedFile.size
      let offset = 0

      while (offset < totalSize) {
        const chunk = selectedFile.slice(offset, offset + chunkSize)
        const chunkData = new FormData()
        chunkData.append("chunk", chunk)
        chunkData.append("uploadUrl", uploadUrl)
        chunkData.append("offset", offset.toString())

        const chunkResponse = await fetch("/api/stream/tus-chunk", {
          method: "POST",
          body: chunkData,
          signal: abortControllerRef.current.signal,
        })

        if (!chunkResponse.ok) {
          throw new Error("Failed to upload chunk")
        }

        const { offset: newOffset } = await chunkResponse.json()
        offset = newOffset

        const progressPercentage = Math.round((offset / totalSize) * 100)
        setProgress(progressPercentage)
      }

      // Step 3: Save to database with title and description
      const createRes = await fetch(`/api/instructor/videos/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId,
          title: videoDetails.title,
          description: videoDetails.description,
          cloudflareStreamId: mediaId,
          duration: 0,
        }),
      })

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create video record")
      }

      setSuccess(true)
      setProgress(100)
      
      // Immediately refetch course data to show new video
      await queryClient.refetchQueries({ 
        queryKey: ["course", courseId],
        exact: true 
      })
      
      // Also invalidate related queries for course data
      queryClient.invalidateQueries({ 
        queryKey: ["course", courseId],
        exact: false 
      })
      
      // Invalidate instructor courses list to update video counts
      queryClient.invalidateQueries({ 
        queryKey: ["instructorCourses"],
        exact: false 
      })
      
      // Call the callback if provided
      onUploadComplete?.(mediaId)

      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      })

      // Reset after success
      setTimeout(() => {
        setSelectedFile(null)
        setSuccess(false)
        setProgress(0)
        setVideoDetails({ title: "", description: "" })
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 3000)
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Upload cancelled")
        toast({
          title: "Upload Cancelled",
          description: "The upload was cancelled",
        })
      } else {
        console.error("Upload error:", err)
        const errorMessage = err.message || "Upload failed"
        setError(errorMessage)
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
      setProgress(0)
    } finally {
      setUploading(false)
      abortControllerRef.current = null
    }
  }, [selectedFile, videoDetails, courseId, onUploadComplete, toast, queryClient])

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const handleCancel = useCallback(() => {
    setShowDetailsModal(false)
    setSelectedFile(null)
    setVideoDetails({ title: "", description: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  return (
    <div className="w-full">
      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full transform animate-in zoom-in-95 duration-200 border border-border">
            <div className="px-4 sm:px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Video Details</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Provide information about your video</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-muted border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{selectedFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Video Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={videoDetails.title}
                  onChange={(e) => setVideoDetails({ ...videoDetails, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Description <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  value={videoDetails.description}
                  onChange={(e) => setVideoDetails({ ...videoDetails, description: e.target.value })}
                  placeholder="Add a brief description of what students will learn..."
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-muted flex flex-col sm:flex-row gap-3 rounded-b-xl sm:rounded-b-2xl border-t border-border">
              <button
                onClick={handleCancel}
                className="btn-secondary flex-1 px-4 py-2.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={uploadFileWithTus}
                disabled={!videoDetails.title.trim()}
                className="btn-primary flex-1 px-4 py-2.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-gradient-to-r from-muted/50 to-primary/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Upload New Video</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Supports large files with resumable upload</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {!selectedFile || success ? (
            <div>
              <label 
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full px-4 sm:px-6 py-8 sm:py-12 border-2 border-dashed border-input rounded-xl sm:rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 hover:border-primary transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <p className="text-foreground font-semibold text-base sm:text-lg mb-1">
                    Click to select video
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    or drag and drop your file here
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 sm:px-3 py-1 bg-muted rounded-full">MP4</span>
                    <span className="px-2 sm:px-3 py-1 bg-muted rounded-full">WebM</span>
                    <span className="px-2 sm:px-3 py-1 bg-muted rounded-full">MOV</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 sm:mt-3">
                    Maximum file size: 10GB
                  </p>
                </div>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
                disabled={uploading}
              />
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-muted/50 to-primary/5 rounded-xl sm:rounded-2xl border border-border">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate text-sm sm:text-base">
                    {videoDetails.title || selectedFile.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {videoDetails.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {videoDetails.description}
                    </p>
                  )}
                </div>
                {!uploading && (
                  <button
                    onClick={handleCancel}
                    className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-foreground">Uploading...</span>
                    <span className="text-xs sm:text-sm font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out rounded-full shadow-lg"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-primary-foreground/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Please don't close this page while uploading
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl sm:rounded-2xl">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl sm:rounded-2xl">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-medium">Video uploaded successfully!</p>
                </div>
              )}

              {uploading && (
                <button
                  onClick={cancelUpload}
                  className="btn-danger w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg"
                >
                  Cancel Upload
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
