"use client"

import { useState, useRef } from "react"
import { Upload, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PdfUploader({ courseId, onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "text/plain",
  ]

  const maxSize = 50 * 1024 * 1024 // 50MB

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError("")
    setSuccess(false)

    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, ZIP, TXT")
      return
    }

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError("File too large. Maximum size is 50MB")
      return
    }

    setFile(selectedFile)
    // Auto-fill title from filename if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExt)
    }
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("Please select a file and enter a title")
      return
    }

    setUploading(true)
    setProgress(0)
    setError("")

    try {
      // Step 1: Get presigned upload URL
      setProgress(10)
      const urlRes = await fetch("/api/r2/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })

      if (!urlRes.ok) {
        const data = await urlRes.json()
        throw new Error(data.error || "Failed to get upload URL")
      }

      const { uploadUrl, fileKey } = await urlRes.json()
      setProgress(20)

      // Step 2: Upload file directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to storage")
      }

      setProgress(70)

      // Step 3: Save resource metadata to database
      const resourceRes = await fetch(`/api/courses/${courseId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          fileName: file.name,
          fileKey,
          fileSize: file.size,
          fileType: file.type,
        }),
      })

      if (!resourceRes.ok) {
        const data = await resourceRes.json()
        throw new Error(data.error || "Failed to save resource")
      }

      setProgress(100)
      setSuccess(true)

      // Reset form
      setFile(null)
      setTitle("")
      setDescription("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Callback to refresh resources list
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message || "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (type) => {
    if (type === "application/pdf") return "📄"
    if (type.includes("word")) return "📝"
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊"
    if (type.includes("powerpoint") || type.includes("presentation")) return "📽️"
    if (type === "application/zip") return "📦"
    return "📁"
  }

  return (
    <div className="space-y-4 p-4 border border-input rounded-lg bg-card">
      <h3 className="font-semibold text-foreground">Upload Resource</h3>

      {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}

      {success && (
        <div className="p-3 bg-green-500/10 text-green-600 text-sm rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          Resource uploaded successfully!
        </div>
      )}

      <div>
        <Label htmlFor="title">Resource Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Week 1 Lecture Notes"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this resource..."
          rows={2}
          className="mt-1"
        />
      </div>

      <div>
        <Label>File *</Label>
        <div
          className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            file ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">{getFileIcon(file.type)}</span>
              <div className="text-left">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, PowerPoint, ZIP, TXT (max 50MB)</p>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <Button onClick={handleUpload} disabled={!file || !title.trim() || uploading} className="w-full">
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Resource
          </>
        )}
      </Button>
    </div>
  )
}
