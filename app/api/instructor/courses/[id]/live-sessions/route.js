import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { performanceLogger } from "@/lib/performance-logger"
import { revalidateTag } from "next/cache"

async function getLiveSessionsData(courseId, instructorId) {
  // Verify instructor owns this course
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      instructorId,
    },
    select: {
      id: true,
    },
  })

  if (!course) {
    return null
  }

  // Get live sessions for the course
  const liveSessions = await prisma.liveSession.findMany({
    where: { courseId },
    select: {
      id: true,
      title: true,
      description: true,
      meetingUrl: true,
      meetingId: true,
      passcode: true,
      scheduledAt: true,
      duration: true,
      status: true,
      _count: {
        select: { joinLogs: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })

  return liveSessions
}

// GET - List all live sessions for a course
export async function GET(request, { params }) {
  const routeTimer = performanceLogger.startTimer("GET /api/instructor/courses/[id]/live-sessions")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params

    // Cache live sessions for 30 seconds
    const cacheKey = `instructor-live-sessions-${courseId}-${session.user.id}`
    const cachedGetLiveSessions = unstable_cache(
      () => getLiveSessionsData(courseId, session.user.id),
      [cacheKey],
      {
        revalidate: 30,
        tags: [`live-sessions-${courseId}`],
      }
    )

    const liveSessions = await cachedGetLiveSessions()

    if (liveSessions === null) {
      routeTimer.stop()
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 })
    }

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/instructor/courses/[id]/live-sessions", totalTime, {
      status: 200,
      dbTime,
      courseId,
      instructorId: session.user.id,
      sessionsCount: liveSessions.length,
    })

    return NextResponse.json({ liveSessions })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching live sessions:", error)

    performanceLogger.logAPIRoute("GET", "/api/instructor/courses/[id]/live-sessions", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ error: "Failed to fetch live sessions" }, { status: 500 })
  }
}

// POST - Create a new live session
export async function POST(request, { params }) {
  const routeTimer = performanceLogger.startTimer("POST /api/instructor/courses/[id]/live-sessions")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params

    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
      select: {
        id: true,
      },
    })

    if (!course) {
      routeTimer.stop()
      return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, meetingUrl, meetingId, passcode, scheduledAt, duration } = body

    // Validation
    if (!title || !meetingUrl || !scheduledAt) {
      routeTimer.stop()
      return NextResponse.json(
        { error: "Title, meeting URL, and scheduled time are required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(meetingUrl)
    } catch {
      routeTimer.stop()
      return NextResponse.json({ error: "Invalid meeting URL format" }, { status: 400 })
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(scheduledAt)
    const now = new Date()
    if (scheduledDate <= now) {
      routeTimer.stop()
      return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 })
    }

    // Create live session
    const liveSession = await prisma.liveSession.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        meetingUrl: meetingUrl.trim(),
        meetingId: meetingId?.trim() || null,
        passcode: passcode?.trim() || null,
        scheduledAt: scheduledDate,
        duration: duration || 60,
        status: "SCHEDULED",
      },
      select: {
        id: true,
        title: true,
        description: true,
        meetingUrl: true,
        meetingId: true,
        scheduledAt: true,
        duration: true,
        status: true,
      },
    })

    // Invalidate cache
    revalidateTag(`live-sessions-${courseId}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("POST", "/api/instructor/courses/[id]/live-sessions", totalTime, {
      status: 201,
      dbTime,
      courseId,
      instructorId: session.user.id,
    })

    return NextResponse.json({ liveSession }, { status: 201 })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error creating live session:", error)

    performanceLogger.logAPIRoute("POST", "/api/instructor/courses/[id]/live-sessions", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ error: "Failed to create live session" }, { status: 500 })
  }
}
