"use client"

import { useState, useEffect, use, useCallback, useMemo, memo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import LoadingBubbles from "@/components/loadingBubbles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Video, Calendar, Clock, Users, Trash2, Edit, ExternalLink, Copy, Check, AlertTriangle } from "lucide-react"

// Memoized Status Badge Component
const StatusBadge = memo(({ status }) => {
  const statusConfig = useMemo(
    () => ({
      SCHEDULED: {
        label: "Scheduled",
        className: "bg-primary/10 text-primary border-primary/20",
      },
      LIVE: {
        label: "Live Now",
        className: "bg-success/10 text-success border-success/20 animate-pulse",
      },
      COMPLETED: {
        label: "Completed",
        className: "bg-muted text-muted-foreground border-border",
      },
      CANCELLED: {
        label: "Cancelled",
        className: "bg-destructive/10 text-destructive border-destructive/20",
      },
    }),
    []
  )

  const config = statusConfig[status] || statusConfig.SCHEDULED

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  )
})

StatusBadge.displayName = "StatusBadge"

// Memoized Session Card Component
const SessionCard = memo(
  ({ liveSession, onStatusChange, onCopyUrl, onEdit, onDelete, copiedSessionId, deletingSessionId }) => {
    const formattedDate = useMemo(
      () =>
        new Date(liveSession.scheduledAt).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      [liveSession.scheduledAt]
    )

    const formattedTime = useMemo(
      () =>
        new Date(liveSession.scheduledAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      [liveSession.scheduledAt]
    )

    const handleCopy = useCallback(() => {
      onCopyUrl(liveSession.meetingUrl, liveSession.id)
    }, [liveSession.meetingUrl, liveSession.id, onCopyUrl])

    const handleEdit = useCallback(() => {
      onEdit(liveSession)
    }, [liveSession, onEdit])

    const handleDelete = useCallback(() => {
      onDelete(liveSession)
    }, [liveSession, onDelete])

    const handleStatusChange = useCallback(
      (value) => {
        onStatusChange(liveSession.id, value)
      },
      [liveSession.id, onStatusChange]
    )

    const handleOpenMeeting = useCallback(() => {
      window.open(liveSession.meetingUrl, "_blank")
    }, [liveSession.meetingUrl])

    return (
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2">
                {liveSession.title}
              </h3>
              <StatusBadge status={liveSession.status} />
            </div>
            {liveSession.description && (
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{liveSession.description}</p>
            )}
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>
                  {formattedTime} ({liveSession.duration || 60} min)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{liveSession._count?.joinLogs || 0} joins</span>
              </div>
            </div>
            {liveSession.meetingId && (
              <p className="text-xs text-muted-foreground mt-2 sm:mt-3">Meeting ID: {liveSession.meetingId}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 flex-shrink-0">
            <Select value={liveSession.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[140px] lg:w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="LIVE">Live Now</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy meeting URL"
                className="flex-1 sm:flex-initial"
              >
                {copiedSessionId === liveSession.id ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenMeeting}
                title="Open meeting"
                className="flex-1 sm:flex-initial"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleEdit}
                title="Edit"
                className="flex-1 sm:flex-initial"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDelete}
                disabled={deletingSessionId === liveSession.id}
                className="text-destructive hover:text-destructive flex-1 sm:flex-initial"
                title="Delete"
              >
                {deletingSessionId === liveSession.id ? (
                  <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

SessionCard.displayName = "SessionCard"

export default function ManageLiveSessionsPage({ params }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.id
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [copiedSessionId, setCopiedSessionId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deletingSessionId, setDeletingSessionId] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingUrl: "",
    meetingId: "",
    passcode: "",
    scheduledAt: "",
    duration: 60,
  })

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    } else if (authStatus === "authenticated") {
      // Block ADMIN access - redirect to allowed page
      if (session?.user?.role === "ADMIN") {
        router.push("/instructor/enrollments/pending")
      } else if (session?.user?.role !== "INSTRUCTOR") {
        router.push("/")
      }
    }
  }, [authStatus, session, router])

  const {
    data: liveSessionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["liveSessions", courseId],
    queryFn: async () => {
      if (!courseId) return { liveSessions: [] }
      
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions`, {
        cache: "no-store",
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to fetch live sessions")
      }
      
      return await res.json()
    },
    enabled: !!courseId && authStatus === "authenticated",
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Loading Sessions",
        description: error.message || "Failed to load live sessions. Please try again.",
      })
    },
  })

  const liveSessions = useMemo(() => {
    return Array.isArray(liveSessionsData?.liveSessions) ? liveSessionsData.liveSessions : []
  }, [liveSessionsData])

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      meetingUrl: "",
      meetingId: "",
      passcode: "",
      scheduledAt: "",
      duration: 60,
    })
    setEditingSession(null)
  }, [])

  const openEditDialog = useCallback(
    (liveSession) => {
      setEditingSession(liveSession)
      setFormData({
        title: liveSession.title,
        description: liveSession.description || "",
        meetingUrl: liveSession.meetingUrl,
        meetingId: liveSession.meetingId || "",
        passcode: liveSession.passcode || "",
        scheduledAt: new Date(liveSession.scheduledAt).toISOString().slice(0, 16),
        duration: liveSession.duration || 60,
      })
      setIsDialogOpen(true)
    },
    []
  )

  const saveSessionMutation = useMutation({
    mutationFn: async (data) => {
      const url = editingSession
        ? `/api/instructor/courses/${courseId}/live-sessions/${editingSession.id}`
        : `/api/instructor/courses/${courseId}/live-sessions`

      const res = await fetch(url, {
        method: editingSession ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to save session")
      }

      return result
    },
    onSuccess: () => {
      // Invalidate and refetch live sessions
      queryClient.invalidateQueries({ queryKey: ["liveSessions", courseId] })
      
      toast({
        title: editingSession ? "Session Updated" : "Session Created",
        description: editingSession
          ? "Live session has been updated successfully."
          : "Live session has been scheduled successfully.",
      })
      setIsDialogOpen(false)
      resetForm()
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save live session. Please try again.",
      })
    },
  })

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      saveSessionMutation.mutate(formData)
    },
    [formData, saveSessionMutation]
  )

  const handleDeleteClick = useCallback((liveSession) => {
    setDeleteConfirm(liveSession)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm(null)
  }, [])

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId) => {
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions/${sessionId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete session")
      }

      return data
    },
    onSuccess: (_, sessionId) => {
      // Invalidate and refetch live sessions
      queryClient.invalidateQueries({ queryKey: ["liveSessions", courseId] })
      
      toast({
        title: "Session Deleted",
        description: `Live session has been deleted successfully.`,
      })
      setDeleteConfirm(null)
      setDeletingSessionId(null)
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete live session. Please try again.",
      })
      setDeletingSessionId(null)
    },
  })

  const handleDelete = useCallback(() => {
    if (!deleteConfirm) return
    const sessionId = deleteConfirm.id
    setDeletingSessionId(sessionId)
    deleteSessionMutation.mutate(sessionId)
  }, [deleteConfirm, deleteSessionMutation])

  const updateStatusMutation = useMutation({
    mutationFn: async ({ sessionId, status }) => {
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status")
      }

      return data
    },
    onSuccess: () => {
      // Invalidate and refetch live sessions
      queryClient.invalidateQueries({ queryKey: ["liveSessions", courseId] })
      
      toast({
        title: "Status Updated",
        description: "Live session status has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
      })
    },
  })

  const handleStatusChange = useCallback(
    (sessionId, newStatus) => {
      updateStatusMutation.mutate({ sessionId, status: newStatus })
    },
    [updateStatusMutation]
  )

  const copyMeetingUrl = useCallback(async (url, sessionId) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedSessionId(sessionId)
      toast({
        title: "Copied",
        description: "Meeting URL copied to clipboard.",
      })
      setTimeout(() => setCopiedSessionId(null), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL. Please try again.",
      })
    }
  }, [toast])

  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  if (authStatus === "loading" || isLoading || !courseId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href={`/instructor/courses/${courseId}/edit`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Live Sessions</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Schedule and manage Zoom meetings for your course
              </p>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Live Session</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingSession ? "Edit Live Session" : "Schedule Live Session"}</DialogTitle>
                  <DialogDescription>
                    Add a Zoom meeting link. Students will join without seeing the actual URL.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Session Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFormChange("title", e.target.value)}
                        placeholder="e.g., Week 1 - Introduction"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFormChange("description", e.target.value)}
                        placeholder="What will be covered in this session?"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meetingUrl">Zoom Meeting URL *</Label>
                      <Input
                        id="meetingUrl"
                        type="url"
                        value={formData.meetingUrl}
                        onChange={(e) => handleFormChange("meetingUrl", e.target.value)}
                        placeholder="https://zoom.us/j/123456789"
                        required
                      />
                      <p className="text-xs text-muted-foreground">This URL will be hidden from students</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="meetingId">Meeting ID (Optional)</Label>
                        <Input
                          id="meetingId"
                          value={formData.meetingId}
                          onChange={(e) => handleFormChange("meetingId", e.target.value)}
                          placeholder="123 456 7890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passcode">Passcode (Optional)</Label>
                        <Input
                          id="passcode"
                          value={formData.passcode}
                          onChange={(e) => handleFormChange("passcode", e.target.value)}
                          placeholder="abc123"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduledAt">Date & Time *</Label>
                        <Input
                          id="scheduledAt"
                          type="datetime-local"
                          value={formData.scheduledAt}
                          onChange={(e) => handleFormChange("scheduledAt", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="15"
                          max="480"
                          value={formData.duration}
                          onChange={(e) => handleFormChange("duration", Number.parseInt(e.target.value) || 60)}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saveSessionMutation.isPending}>
                      {saveSessionMutation.isPending ? "Saving..." : editingSession ? "Update" : "Schedule"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {liveSessions.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 sm:p-12 text-center">
            <Video className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Live Sessions</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6">
              Schedule Zoom meetings for your students. They can join with one click without seeing the meeting link.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule First Session
            </Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {liveSessions.map((liveSession) => (
              <SessionCard
                key={liveSession.id}
                liveSession={liveSession}
                onStatusChange={handleStatusChange}
                onCopyUrl={copyMeetingUrl}
                onEdit={openEditDialog}
                onDelete={handleDeleteClick}
                copiedSessionId={copiedSessionId}
                deletingSessionId={deletingSessionId}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 duration-200 border border-border">
              {/* Modal Header */}
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-border">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-destructive to-chart-5 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">Delete Live Session?</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                <div className="bg-muted border-l-4 border-destructive rounded-xl p-4 mb-4">
                  <p className="text-foreground mb-2 text-sm sm:text-base">You are about to permanently delete:</p>
                  <p className="font-bold text-foreground break-words text-sm sm:text-base">"{deleteConfirm.title}"</p>
                  {deleteConfirm.scheduledAt && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Scheduled: {new Date(deleteConfirm.scheduledAt).toLocaleString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-foreground">
                    All enrolled students will be notified. This action cannot be undone and all session data including join logs will be permanently deleted.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 sm:px-8 py-5 sm:py-6 border-t border-border flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteSessionMutation.isPending && deletingSessionId === deleteConfirm.id}
                  className="flex-1 btn-danger flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                >
                  {deletingSessionId === deleteConfirm.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Session
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
