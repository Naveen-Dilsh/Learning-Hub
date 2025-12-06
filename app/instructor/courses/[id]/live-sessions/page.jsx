"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ArrowLeft, Plus, Video, Calendar, Clock, Users, Trash2, Edit, ExternalLink, Copy, Check } from "lucide-react"

export default function ManageLiveSessionsPage({ params }) {
  const resolvedParams = use(params)
  const courseId = resolvedParams.id
  const { data: session, status } = useSession()
  const router = useRouter()

  const [liveSessions, setLiveSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

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
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR") {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    if (courseId) {
      fetchLiveSessions()
    }
  }, [courseId])

  const fetchLiveSessions = async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions`)
      const data = await res.json()
      if (res.ok) {
        setLiveSessions(data.liveSessions || [])
      }
    } catch (error) {
      console.error("Error fetching live sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingSession
        ? `/api/instructor/courses/${courseId}/live-sessions/${editingSession.id}`
        : `/api/instructor/courses/${courseId}/live-sessions`

      const res = await fetch(url, {
        method: editingSession ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchLiveSessions()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving live session:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this live session?")) return

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions/${sessionId}`, { method: "DELETE" })

      if (res.ok) {
        fetchLiveSessions()
      }
    } catch (error) {
      console.error("Error deleting live session:", error)
    }
  }

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchLiveSessions()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const resetForm = () => {
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
  }

  const openEditDialog = (liveSession) => {
    setEditingSession(liveSession)
    setFormData({
      title: liveSession.title,
      description: liveSession.description || "",
      meetingUrl: liveSession.meetingUrl,
      meetingId: liveSession.meetingId || "",
      passcode: liveSession.passcode || "",
      scheduledAt: new Date(liveSession.scheduledAt).toISOString().slice(0, 16),
      duration: liveSession.duration,
    })
    setIsDialogOpen(true)
  }

  const copyMeetingUrl = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (status) => {
    const styles = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      LIVE: "bg-green-100 text-green-800 animate-pulse",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/instructor/courses/${courseId}/edit`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Live Sessions</h1>
            <p className="text-muted-foreground">Schedule and manage Zoom meetings for your course</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Live Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
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
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Week 1 - Introduction"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                      placeholder="https://zoom.us/j/123456789"
                      required
                    />
                    <p className="text-xs text-muted-foreground">This URL will be hidden from students</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetingId">Meeting ID (Optional)</Label>
                      <Input
                        id="meetingId"
                        value={formData.meetingId}
                        onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
                        placeholder="123 456 7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passcode">Passcode (Optional)</Label>
                      <Input
                        id="passcode"
                        value={formData.passcode}
                        onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                        placeholder="abc123"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Date & Time *</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : editingSession ? "Update" : "Schedule"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {liveSessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Live Sessions</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Schedule Zoom meetings for your students. They can join with one click without seeing the meeting link.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {liveSessions.map((liveSession) => (
              <Card key={liveSession.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{liveSession.title}</h3>
                        {getStatusBadge(liveSession.status)}
                      </div>
                      {liveSession.description && (
                        <p className="text-muted-foreground text-sm mb-3">{liveSession.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(liveSession.scheduledAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(liveSession.scheduledAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({liveSession.duration} min)
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {liveSession._count?.joinLogs || 0} joins
                        </div>
                      </div>
                      {liveSession.meetingId && (
                        <p className="text-xs text-muted-foreground mt-2">Meeting ID: {liveSession.meetingId}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Select
                        value={liveSession.status}
                        onValueChange={(value) => handleStatusChange(liveSession.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
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
                          onClick={() => copyMeetingUrl(liveSession.meetingUrl)}
                          title="Copy meeting URL"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(liveSession.meetingUrl, "_blank")}
                          title="Open meeting"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(liveSession)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(liveSession.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
