"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import LoadingBubbles from "@/components/loadingBubbles"
import { ArrowLeft, Video, Calendar, Clock, ExternalLink, Loader2 } from "lucide-react"

// Memoized session card component
const SessionCard = memo(({ liveSession, onJoin, joiningSession }) => {
  const now = useMemo(() => new Date(), [])
  const scheduledAt = useMemo(() => new Date(liveSession.scheduledAt), [liveSession.scheduledAt])
  const endTime = useMemo(
    () => new Date(scheduledAt.getTime() + (liveSession.duration || 60) * 60000),
    [scheduledAt, liveSession.duration]
  )

  const isLive = useMemo(
    () => liveSession.status === "LIVE" || (now >= scheduledAt && now <= endTime),
    [liveSession.status, now, scheduledAt, endTime]
  )

  const isUpcoming = useMemo(() => now < scheduledAt, [now, scheduledAt])

  const joinWindowStart = useMemo(
    () => new Date(scheduledAt.getTime() - 10 * 60000),
    [scheduledAt]
  )

  const isJoinable = useMemo(
    () =>
      liveSession.status !== "COMPLETED" &&
      liveSession.status !== "CANCELLED" &&
      now >= joinWindowStart &&
      now <= endTime,
    [liveSession.status, now, joinWindowStart, endTime]
  )

  const timeUntilSession = useMemo(() => {
    const diff = scheduledAt - now
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
  }, [scheduledAt, now])

  const formattedDate = useMemo(
    () =>
      scheduledAt.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    [scheduledAt]
  )

  const formattedTime = useMemo(
    () =>
      scheduledAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [scheduledAt]
  )

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {liveSession.course?.thumbnail && (
          <div className="sm:w-48 h-32 sm:h-auto relative flex-shrink-0 border-b sm:border-b-0 sm:border-r border-border">
            <Image
              src={liveSession.course.thumbnail}
              alt={liveSession.course.title || "Course"}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </div>
        )}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isLive && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20 animate-pulse">
                    LIVE NOW
                  </span>
                )}
                {isUpcoming && !isLive && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    UPCOMING
                  </span>
                )}
                {timeUntilSession && (
                  <span className="text-xs text-muted-foreground font-medium">{timeUntilSession}</span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 line-clamp-2">
                {liveSession.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {liveSession.course?.title || "Course"}
              </p>
              {liveSession.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{liveSession.description}</p>
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
              </div>
            </div>
            <div className="flex-shrink-0">
              {isJoinable ? (
                <button
                  onClick={() => onJoin(liveSession.id)}
                  disabled={joiningSession === liveSession.id}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
                >
                  {joiningSession === liveSession.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Join Now
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold bg-muted text-muted-foreground border border-border cursor-not-allowed"
                >
                  Not Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

SessionCard.displayName = "SessionCard"

export default function StudentLiveSessionsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [joiningSession, setJoiningSession] = useState(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [authStatus, router])

  const {
    data: liveSessionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["liveSessions", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { liveSessions: [] }
      
      const res = await fetch("/api/student/live-sessions", {
        cache: "no-store",
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch live sessions")
      }

      const data = await res.json()
      return data
    },
    enabled: authStatus === "authenticated" && !!session?.user?.id,
    staleTime: 30 * 1000, // 30 seconds
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Loading Sessions",
        description: error.message || "Failed to load live sessions. Please try again.",
      })
    },
    onSuccess: () => {
      // Mark live sessions as viewed when data loads successfully
      if (typeof window !== "undefined") {
        localStorage.setItem("live-sessions-viewed", "true")
      }
    },
  })

  const liveSessions = useMemo(() => {
    return Array.isArray(liveSessionsData?.liveSessions) ? liveSessionsData.liveSessions : []
  }, [liveSessionsData])

  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId) => {
      const res = await fetch(`/api/live-sessions/${sessionId}/join`, {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to join session")
      }

      return data
    },
    onSuccess: (data) => {
      if (data.meetingUrl) {
        // Open meeting in new tab
        window.open(data.meetingUrl, "_blank")
        toast({
          title: "Joining Session",
          description: "Opening meeting in a new tab...",
        })
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Join",
        description: error.message || "Failed to join session. Please try again.",
      })
    },
    onSettled: () => {
      setJoiningSession(null)
    },
  })

  const joinSession = useCallback(
    async (sessionId) => {
      setJoiningSession(sessionId)
      joinSessionMutation.mutate(sessionId)
    },
    [joinSessionMutation]
  )

  // Show loading if query is loading OR if session is not ready yet
  if (isLoading || authStatus === "loading" || !session?.user?.id) {
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
          <Link
            href="/student"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 sm:mb-3 font-medium transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Live Sessions</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Join scheduled Zoom meetings for your courses
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {liveSessions.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 sm:p-12 text-center">
            <Video className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Upcoming Sessions</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              There are no scheduled live sessions for your enrolled courses at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {liveSessions.map((liveSession) => (
              <SessionCard
                key={liveSession.id}
                liveSession={liveSession}
                onJoin={joinSession}
                joiningSession={joiningSession}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
