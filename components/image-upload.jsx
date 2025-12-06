"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"

export default function ImageUpload({ onUploadComplete, currentImage, aspectRatio = "square" }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      // Step 1: Get one-time upload URL from our API
      const urlResponse = await fetch("/api/cloudflare/images/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            uploadedAt: new Date().toISOString(),
          },
        }),
      })
      console.log('image-uploader', urlResponse)

      if (!urlResponse.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { uploadURL, imageId } = await urlResponse.json()
      console.log(uploadURL,imageId)
      // Step 2: Upload the file directly to Cloudflare
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch(uploadURL, {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image")
      }

      const uploadData = await uploadResponse.json()

      if (!uploadData.success) {
        throw new Error("Upload failed")
      }

      // Construct the Cloudflare Images URL
      const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || "UpcYAZA_EOk-JiIrjAIa2Q"
      const imageUrl = `https://imagedelivery.net/${accountHash}/${imageId}/public`

      setPreview(imageUrl)
      onUploadComplete(imageUrl)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onUploadComplete("")
  }

  const aspectRatioClass = aspectRatio === "video" ? "aspect-video" : "aspect-square"

  return (
    <div className="space-y-3 sm:space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative">
          <div
            className={`relative w-full ${aspectRatioClass} bg-muted rounded-lg sm:rounded-xl overflow-hidden border border-border`}
          >
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 sm:p-2 bg-destructive text-destructive-foreground rounded-full hover:opacity-90 transition active:scale-95"
            disabled={uploading}
            aria-label="Remove image"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-full ${aspectRatioClass} border-2 border-dashed border-border rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-2 p-4 sm:p-6 hover:border-primary transition bg-muted/50 disabled:opacity-50 active:scale-[0.98]`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin" />
              <span className="text-xs sm:text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-foreground font-medium">Click to upload image</span>
              <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs sm:text-sm text-destructive">{error}</p>}
    </div>
  )
}
