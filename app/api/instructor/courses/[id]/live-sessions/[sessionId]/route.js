import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET - Get a single live session with join logs
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId, sessionId } = await params

    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    })

    if (!course) {
      return Response.json({ error: "Course not found or access denied" }, { status: 404 })
    }

    const liveSession = await prisma.liveSession.findFirst({
      where: { id: sessionId, courseId },
      include: {
        joinLogs: {
          orderBy: { joinedAt: "desc" },
          take: 100,
        },
      },
    })

    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 })
    }

    return Response.json({ liveSession })
  } catch (error) {
    console.error("Error fetching live session:", error)
    return Response.json({ error: "Failed to fetch live session" }, { status: 500 })
  }
}

// PATCH - Update a live session
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId, sessionId } = await params

    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    })

    if (!course) {
      return Response.json({ error: "Course not found or access denied" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, meetingUrl, meetingId, passcode, scheduledAt, duration, status } = body

    const liveSession = await prisma.liveSession.update({
      where: { id: sessionId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(meetingUrl && { meetingUrl }),
        ...(meetingId !== undefined && { meetingId }),
        ...(passcode !== undefined && { passcode }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(duration && { duration }),
        ...(status && { status }),
      },
    })

    return Response.json({ liveSession })
  } catch (error) {
    console.error("Error updating live session:", error)
    return Response.json({ error: "Failed to update live session" }, { status: 500 })
  }
}

// DELETE - Delete a live session
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId, sessionId } = await params

    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    })

    if (!course) {
      return Response.json({ error: "Course not found or access denied" }, { status: 404 })
    }

    await prisma.liveSession.delete({
      where: { id: sessionId },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error deleting live session:", error)
    return Response.json({ error: "Failed to delete live session" }, { status: 500 })
  }
}
