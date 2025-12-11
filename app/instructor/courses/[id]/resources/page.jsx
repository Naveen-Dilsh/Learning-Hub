"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, File, Trash2, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PdfUploader from "@/components/pdf-uploader"
import { useToast } from "@/hooks/use-toast"
import LoadingBubbles from "@/components/loadingBubbles"

export default function ManageResources() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [deleting, setDeleting] = useState(null)

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
    isLoading: courseLoading,
  } = useQuery({
    queryKey: ["course", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}`, {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch course")
      }
      
      return await res.json()
    },
    enabled: !!params.id,
    staleTime: 60 * 1000, // 60 seconds
  })

  const {
    data: resources = [],
    isLoading: resourcesLoading,
  } = useQuery({
    queryKey: ["courseResources", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${params.id}/resources`, {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch resources")
      }
      
      return await res.json()
    },
    enabled: !!params.id,
    staleTime: 30 * 1000, // 30 seconds
  })

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId) => {
      const res = await fetch(`/api/courses/${params.id}/resources/${resourceId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete resource")
      }

      return await res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch resources
      queryClient.invalidateQueries({ queryKey: ["courseResources", params.id] })
      
      toast({
        title: "Resource Deleted",
        description: "Resource has been deleted successfully.",
      })
      setDeleting(null)
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete resource",
      })
      setDeleting(null)
    },
  })

  const handleDelete = useCallback(async (resourceId) => {
    if (!confirm("Are you sure you want to delete this resource?")) return
    setDeleting(resourceId)
    deleteResourceMutation.mutate(resourceId)
  }, [deleteResourceMutation])

  const handleDownload = useCallback(async (resource) => {
    try {
      const res = await fetch(`/api/courses/${params.id}/resources/${resource.id}/download`)

      if (!res.ok) throw new Error("Failed to get download URL")

      const { downloadUrl } = await res.json()
      window.open(downloadUrl, "_blank")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download resource",
      })
    }
  }, [params.id, toast])

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

  const handleUploadComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["courseResources", params.id] })
  }, [queryClient, params.id])

  if (status === "loading" || courseLoading || resourcesLoading || !params.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingBubbles />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/instructor/courses" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Course Resources</h1>
            {course && <p className="text-muted-foreground mt-1">{course.title}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <PdfUploader courseId={params.id} onUploadComplete={handleUploadComplete} />
          </div>

          {/* Resources List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Uploaded Resources</h3>

            {resources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No resources uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center gap-3 p-4 bg-card border border-input rounded-lg">
                    <span className="text-2xl">{getFileIcon(resource.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {resource.fileName} • {formatFileSize(resource.fileSize)}
                      </p>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{resource.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(resource)} title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(resource.id)}
                        disabled={deleting === resource.id && deleteResourceMutation.isPending}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === resource.id && deleteResourceMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
