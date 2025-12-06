import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { headers } from "next/headers"

// POST - Join a live session (redirect to meeting URL securely)
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    // Get the live session
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
      },
    })

    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 })
    }

    // Check if student is enrolled in the course with APPROVED status
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId: liveSession.courseId,
        status: "APPROVED",
      },
    })

    // Also allow instructor to join their own sessions
    const isInstructor = liveSession.course.instructorId === session.user.id

    if (!enrollment && !isInstructor) {
      return Response.json({ error: "You must be enrolled in this course to join the live session" }, { status: 403 })
    }

    // Check if session is active (SCHEDULED or LIVE)
    if (liveSession.status === "COMPLETED" || liveSession.status === "CANCELLED") {
      return Response.json({ error: "This live session has ended or been cancelled" }, { status: 400 })
    }

    // Log the join attempt
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

    await prisma.sessionJoinLog.create({
      data: {
        sessionId,
        studentId: session.user.id,
        ipAddress,
      },
    })

    // Return the meeting URL (only sent server-side, redirected immediately)
    return Response.json({
      success: true,
      meetingUrl: liveSession.meetingUrl,
    })
  } catch (error) {
    console.error("Error joining live session:", error)
    return Response.json({ error: "Failed to join live session" }, { status: 500 })
  }
}
