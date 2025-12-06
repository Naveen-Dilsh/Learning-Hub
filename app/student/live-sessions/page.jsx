"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Video, Calendar, Clock, ExternalLink, Loader2 } from "lucide-react"

export default function StudentLiveSessionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [liveSessions, setLiveSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningSession, setJoiningSession] = useState(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    fetchLiveSessions()
  }, [])

  const fetchLiveSessions = async () => {
    try {
      const res = await fetch("/api/student/live-sessions")
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

  const joinSession = async (sessionId) => {
    setJoiningSession(sessionId)
    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/join`, {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok && data.meetingUrl) {
        // Open meeting in new tab
        window.open(data.meetingUrl, "_blank")
      } else {
        alert(data.error || "Failed to join session")
      }
    } catch (error) {
      console.error("Error joining session:", error)
      alert("Failed to join session")
    } finally {
      setJoiningSession(null)
    }
  }

  const getStatusBadge = (liveSession) => {
    const now = new Date()
    const scheduledAt = new Date(liveSession.scheduledAt)
    const endTime = new Date(scheduledAt.getTime() + liveSession.duration * 60000)

    if (liveSession.status === "LIVE" || (now >= scheduledAt && now <= endTime)) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
          LIVE NOW
        </span>
      )
    }
    if (now < scheduledAt) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">UPCOMING</span>
    }
    return null
  }

  const isJoinable = (liveSession) => {
    const now = new Date()
    const scheduledAt = new Date(liveSession.scheduledAt)
    const joinWindowStart = new Date(scheduledAt.getTime() - 10 * 60000) // 10 min before
    const endTime = new Date(scheduledAt.getTime() + liveSession.duration * 60000)

    return (
      liveSession.status !== "COMPLETED" &&
      liveSession.status !== "CANCELLED" &&
      now >= joinWindowStart &&
      now <= endTime
    )
  }

  const getTimeUntilSession = (scheduledAt) => {
    const now = new Date()
    const diff = new Date(scheduledAt) - now

    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `Starts in ${days} day${days > 1 ? "s" : ""}`
    }
    if (hours > 0) {
      return `Starts in ${hours}h ${minutes}m`
    }
    return `Starts in ${minutes}m`
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/student/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Sessions</h1>
            <p className="text-muted-foreground">Join scheduled Zoom meetings for your courses</p>
          </div>
        </div>

        {liveSessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Upcoming Sessions</h3>
              <p className="text-muted-foreground text-center max-w-md">
                There are no scheduled live sessions for your enrolled courses at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {liveSessions.map((liveSession) => (
              <Card key={liveSession.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {liveSession.course.thumbnail && (
                      <div className="sm:w-48 h-32 sm:h-auto relative flex-shrink-0">
                        <Image
                          src={liveSession.course.thumbnail || "/placeholder.svg"}
                          alt={liveSession.course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(liveSession)}
                            {getTimeUntilSession(liveSession.scheduledAt) && (
                              <span className="text-xs text-muted-foreground">
                                {getTimeUntilSession(liveSession.scheduledAt)}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">{liveSession.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{liveSession.course.title}</p>
                          {liveSession.description && (
                            <p className="text-sm text-muted-foreground mb-3">{liveSession.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(liveSession.scheduledAt).toLocaleDateString("en-US", {
                                weekday: "short",
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
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isJoinable(liveSession) ? (
                            <Button
                              onClick={() => joinSession(liveSession.id)}
                              disabled={joiningSession === liveSession.id}
                              className="gap-2"
                            >
                              {joiningSession === liveSession.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ExternalLink className="h-4 w-4" />
                              )}
                              Join Now
                            </Button>
                          ) : (
                            <Button disabled variant="outline">
                              Not Started
                            </Button>
                          )}
                        </div>
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
