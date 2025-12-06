"use client"

import { useState, useRef } from "react"
import { Upload, X, CheckCircle, AlertCircle, Video, FileVideo } from 'lucide-react'

export default function TusVideoUploader({ courseId, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [videoDetails, setVideoDetails] = useState({ title: "", description: "" })
  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file")
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
  }

  const uploadFileWithTus = async () => {
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
        throw new Error("Failed to initiate upload")
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
          courseId:courseId,
          title: videoDetails.title,
          description: videoDetails.description,
          cloudflareStreamId: mediaId,
          duration: 0,
        }),
      })

      if (!createRes.ok) {
        throw new Error("Failed to create video record")
      }

      setSuccess(true)
      setProgress(100)
      onUploadComplete?.(mediaId)

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
      } else {
        console.error("Upload error:", err)
        setError(err.message || "Upload failed")
      }
      setProgress(0)
    } finally {
      setUploading(false)
      abortControllerRef.current = null
    }
  }

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleCancel = () => {
    setShowDetailsModal(false)
    setSelectedFile(null)
    setVideoDetails({ title: "", description: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Video Details</h3>
                  <p className="text-sm text-slate-600 mt-0.5">Provide information about your video</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{selectedFile?.name}</p>
                    <p className="text-xs text-slate-500">
                      {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={videoDetails.title}
                  onChange={(e) => setVideoDetails({ ...videoDetails, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={videoDetails.description}
                  onChange={(e) => setVideoDetails({ ...videoDetails, description: e.target.value })}
                  placeholder="Add a brief description of what students will learn..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex gap-3 rounded-b-2xl border-t border-slate-200">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-white hover:border-slate-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={uploadFileWithTus}
                disabled={!videoDetails.title.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
              >
                Start Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upload New Video</h3>
              <p className="text-sm text-slate-600">Supports large files with resumable upload</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!selectedFile || success ? (
            <div>
              <label 
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full px-6 py-12 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-slate-900 font-semibold text-lg mb-1">
                    Click to select video
                  </p>
                  <p className="text-sm text-slate-600 mb-3">
                    or drag and drop your file here
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span className="px-3 py-1 bg-slate-100 rounded-full">MP4</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full">WebM</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full">MOV</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
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
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {videoDetails.title || selectedFile.name}
                  </p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {videoDetails.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {videoDetails.description}
                    </p>
                  )}
                </div>
                {!uploading && (
                  <button
                    onClick={handleCancel}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Uploading...</span>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out rounded-full shadow-lg"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Please don't close this page while uploading
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Video uploaded successfully!</p>
                </div>
              )}

              {uploading && (
                <button
                  onClick={cancelUpload}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-lg shadow-red-600/25"
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
