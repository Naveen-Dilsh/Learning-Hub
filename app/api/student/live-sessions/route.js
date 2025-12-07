import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { performanceLogger } from "@/lib/performance-logger"

async function getLiveSessionsData(studentId) {
  // Get student's approved enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: "APPROVED",
    },
    select: {
      courseId: true,
    },
  })

  const courseIds = enrollments.map((e) => e.courseId)

  if (courseIds.length === 0) {
    return []
  }

  // Get upcoming and live sessions for enrolled courses
  const liveSessions = await prisma.liveSession.findMany({
    where: {
      courseId: { in: courseIds },
      status: { in: ["SCHEDULED", "LIVE"] },
    },
    select: {
      id: true,
      title: true,
      description: true,
      meetingId: true,
      scheduledAt: true,
      duration: true,
      status: true,
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          instructor: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })

  // Remove sensitive data and return safe sessions
  return liveSessions.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    meetingId: s.meetingId,
    scheduledAt: s.scheduledAt,
    duration: s.duration,
    status: s.status,
    course: s.course,
  }))
}

// GET - Get upcoming live sessions for enrolled courses
export async function GET(request) {
  const routeTimer = performanceLogger.startTimer("GET /api/student/live-sessions")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Cache live sessions for 30 seconds
    const cacheKey = `student-live-sessions-${session.user.id}`
    const cachedGetLiveSessions = unstable_cache(
      () => getLiveSessionsData(session.user.id),
      [cacheKey],
      {
        revalidate: 30,
        tags: [`live-sessions-${session.user.id}`],
      }
    )

    const liveSessions = await cachedGetLiveSessions()

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/student/live-sessions", totalTime, {
      status: 200,
      dbTime,
      studentId: session.user.id,
      sessionsCount: liveSessions.length,
    })

    return NextResponse.json({ liveSessions })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching live sessions:", error)

    performanceLogger.logAPIRoute("GET", "/api/student/live-sessions", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ error: "Failed to fetch live sessions" }, { status: 500 })
  }
}
