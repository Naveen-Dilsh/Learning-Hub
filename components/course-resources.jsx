"use client"

import { useState, useEffect } from "react"
import { File, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CourseResources({ courseId }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    fetchResources()
  }, [courseId])

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/resources`)
      if (res.ok) {
        setResources(await res.json())
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (resource) => {
    setDownloading(resource.id)
    try {
      const res = await fetch(`/api/courses/${courseId}/resources/${resource.id}/download`)

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Download failed")
        return
      }

      const { downloadUrl } = await res.json()

      // Open download in new tab (URL expires in 5 minutes)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = resource.fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Download failed:", err)
      alert("Download failed. Please try again.")
    } finally {
      setDownloading(null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No resources available for this course</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground mb-4">Course Resources</h3>
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="flex items-center gap-3 p-4 bg-card border border-input rounded-lg hover:border-primary/50 transition-colors"
        >
          <span className="text-2xl">{getFileIcon(resource.fileType)}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">{resource.title}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(resource.fileSize)}</p>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(resource)}
            disabled={downloading === resource.id}
          >
            {downloading === resource.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
