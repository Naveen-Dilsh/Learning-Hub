"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useToast } from "@/hooks/use-toast"
import { File, Download, Loader2, Edit, Trash2, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const ResourceItem = memo(({ resource, courseId, onDelete, onUpdate }) => {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(resource.title)
  const [editingDescription, setEditingDescription] = useState(resource.description || "")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleSave = useCallback(async () => {
    if (!editingTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required",
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingTitle.trim(),
          description: editingDescription.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update resource")
      }

      toast({
        title: "Resource Updated",
        description: "Resource has been updated successfully",
      })

      setIsEditing(false)
      onUpdate()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update resource",
      })
    } finally {
      setSaving(false)
    }
  }, [editingTitle, editingDescription, courseId, resource.id, toast, onUpdate])

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/resources/${resource.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete resource")
      }

      toast({
        title: "Resource Deleted",
        description: data.message || "Resource has been deleted successfully",
      })

      onDelete()
    } catch (err) {
      console.error("Delete error:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete resource. Please try again.",
      })
    } finally {
      setDeleting(false)
    }
  }, [courseId, resource.id, toast, onDelete])

  const handleDownload = useCallback(async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/resources/${resource.id}/download`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Download failed")
      }

      const { downloadUrl } = await res.json()

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = resource.fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: err.message || "Failed to download resource",
      })
    } finally {
      setDownloading(false)
    }
  }, [courseId, resource.id, resource.fileName, toast])

  const formatFileSize = useMemo(() => {
    if (resource.fileSize < 1024) return resource.fileSize + " B"
    if (resource.fileSize < 1024 * 1024) return (resource.fileSize / 1024).toFixed(1) + " KB"
    return (resource.fileSize / (1024 * 1024)).toFixed(1) + " MB"
  }, [resource.fileSize])

  const fileIcon = useMemo(() => {
    if (resource.fileType === "application/pdf") return "📄"
    if (resource.fileType.includes("word")) return "📝"
    if (resource.fileType.includes("excel") || resource.fileType.includes("spreadsheet")) return "📊"
    if (resource.fileType.includes("powerpoint") || resource.fileType.includes("presentation")) return "📽️"
    if (resource.fileType === "application/zip") return "📦"
    return "📁"
  }, [resource.fileType])

  if (isEditing) {
    return (
      <div className="p-4 bg-card border border-border rounded-lg space-y-3">
        <div>
          <Label htmlFor={`title-${resource.id}`}>Title *</Label>
          <Input
            id={`title-${resource.id}`}
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="mt-1"
            placeholder="Resource title"
          />
        </div>
        <div>
          <Label htmlFor={`desc-${resource.id}`}>Description (Optional)</Label>
          <Textarea
            id={`desc-${resource.id}`}
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            className="mt-1"
            rows={2}
            placeholder="Resource description"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} size="sm" className="btn-primary">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false)
              setEditingTitle(resource.title)
              setEditingDescription(resource.description || "")
            }}
            disabled={saving}
            size="sm"
            variant="outline"
            className="btn-secondary"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
      <span className="text-2xl flex-shrink-0">{fileIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm sm:text-base">{resource.title}</p>
        <p className="text-xs sm:text-sm text-muted-foreground">{formatFileSize}</p>
        {resource.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-secondary"
        >
          {downloading ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <>
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Download</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          disabled={deleting}
          className="btn-secondary"
        >
          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>
    </div>
  )
})

ResourceItem.displayName = "ResourceItem"

export default function CourseResources({ courseId, showUploader = false }) {
  const { toast } = useToast()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchResources = useCallback(async () => {
    if (!courseId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/courses/${courseId}/resources`, {
        cache: "no-store",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch resources")
      }

      const data = await res.json()
      setResources(data || [])
    } catch (err) {
      console.error("Failed to fetch resources:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load resources",
      })
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [courseId, toast])

  useEffect(() => {
    if (courseId) {
      fetchResources()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const handleResourceUpdate = useCallback(() => {
    fetchResources()
  }, [fetchResources])

  const handleResourceDelete = useCallback(() => {
    fetchResources()
  }, [fetchResources])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm sm:text-base">No resources available for this course</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-semibold text-foreground text-base sm:text-lg mb-4">Course Resources</h3>
      {resources.map((resource) => (
        <ResourceItem
          key={resource.id}
          resource={resource}
          courseId={courseId}
          onDelete={handleResourceDelete}
          onUpdate={handleResourceUpdate}
        />
      ))}
    </div>
  )
}
