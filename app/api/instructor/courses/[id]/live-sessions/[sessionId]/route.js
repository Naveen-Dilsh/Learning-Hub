import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { performanceLogger } from "@/lib/performance-logger"
import { revalidateTag } from "next/cache"

// GET - Get a single live session with join logs
export async function GET(request, { params }) {
  const routeTimer = performanceLogger.startTimer("GET /api/instructor/courses/[id]/live-sessions/[sessionId]")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId, sessionId } = await params

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

    const liveSession = await prisma.liveSession.findFirst({
      where: { id: sessionId, courseId },
      select: {
        id: true,
        title: true,
        description: true,
        meetingUrl: true,
        meetingId: true,
        scheduledAt: true,
        duration: true,
        status: true,
        joinLogs: {
          select: {
            id: true,
            studentId: true,
            joinedAt: true,
            ipAddress: true,
            student: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: "desc" },
          take: 100,
        },
      },
    })

    if (!liveSession) {
      routeTimer.stop()
      return NextResponse.json({ error: "Live session not found" }, { status: 404 })
    }

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/instructor/courses/[id]/live-sessions/[sessionId]", totalTime, {
      status: 200,
      dbTime,
      courseId,
      sessionId,
      instructorId: session.user.id,
    })

    return NextResponse.json({ liveSession })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching live session:", error)

    performanceLogger.logAPIRoute("GET", "/api/instructor/courses/[id]/live-sessions/[sessionId]", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ error: "Failed to fetch live session" }, { status: 500 })
  }
}

// PATCH - Update a live session
export async function PATCH(request, { params }) {
  const routeTimer = performanceLogger.startTimer("PATCH /api/instructor/courses/[id]/live-sessions/[sessionId]")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId, sessionId } = await params

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
    const { title, description, meetingUrl, meetingId, passcode, scheduledAt, duration, status } = body

    // Get existing session to check if it exists
    const existingSession = await prisma.liveSession.findFirst({
      where: { id: sessionId, courseId },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
      },
    })

    if (!existingSession) {
      routeTimer.stop()
      return NextResponse.json({ error: "Live session not found" }, { status: 404 })
    }

    // Build update data
    const updateData = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (meetingUrl !== undefined) {
      // Validate URL format
      try {
        new URL(meetingUrl)
        updateData.meetingUrl = meetingUrl.trim()
      } catch {
        routeTimer.stop()
        return NextResponse.json({ error: "Invalid meeting URL format" }, { status: 400 })
      }
    }
    if (meetingId !== undefined) updateData.meetingId = meetingId?.trim() || null
    if (passcode !== undefined) updateData.passcode = passcode?.trim() || null
    if (scheduledAt !== undefined) {
      const scheduledDate = new Date(scheduledAt)
      if (scheduledDate < new Date() && status !== "COMPLETED" && status !== "CANCELLED") {
        routeTimer.stop()
        return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 })
      }
      updateData.scheduledAt = scheduledDate
    }
    if (duration !== undefined) updateData.duration = duration
    if (status !== undefined) updateData.status = status

    // Update session
    const liveSession = await prisma.liveSession.update({
      where: { id: sessionId },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        meetingUrl: true,
        meetingId: true,
        scheduledAt: true,
        duration: true,
        status: true,
        _count: {
          select: { joinLogs: true },
        },
      },
    })

    // Invalidate cache
    revalidateTag(`live-sessions-${courseId}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("PATCH", "/api/instructor/courses/[id]/live-sessions/[sessionId]", totalTime, {
      status: 200,
      dbTime,
      courseId,
      sessionId,
      instructorId: session.user.id,
    })

    return NextResponse.json({ liveSession })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error updating live session:", error)

    performanceLogger.logAPIRoute("PATCH", "/api/instructor/courses/[id]/live-sessions/[sessionId]", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ error: "Failed to update live session" }, { status: 500 })
  }
}

// DELETE - Delete a live session
export async function DELETE(request, { params }) {
  const routeTimer = performanceLogger.startTimer("DELETE /api/instructor/courses/[id]/live-sessions/[sessionId]")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId, sessionId } = await params

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

    // Check if session exists
    const liveSession = await prisma.liveSession.findFirst({
      where: { id: sessionId, courseId },
      select: { id: true },
    })

    if (!liveSession) {
      routeTimer.stop()
      return NextResponse.json({ error: "Live session not found" }, { status: 404 })
    }

    // Delete the session (cascade will handle join logs)
    await prisma.liveSession.delete({
      where: { id: sessionId },
    })

    // Invalidate cache
    revalidateTag(`live-sessions-${courseId}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("DELETE", "/api/instructor/courses/[id]/live-sessions/[sessionId]", totalTime, {
      status: 200,
      dbTime,
      courseId,
      sessionId,
      instructorId: session.user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error deleting live session:", error)

    performanceLogger.logAPIRoute("DELETE", "/api/instructor/courses/[id]/live-sessions/[sessionId]", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ error: "Failed to delete live session" }, { status: 500 })
  }
}
