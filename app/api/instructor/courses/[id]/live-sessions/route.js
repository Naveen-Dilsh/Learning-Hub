import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET - List all live sessions for a course
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params

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

    const liveSessions = await prisma.liveSession.findMany({
      where: { courseId },
      orderBy: { scheduledAt: "asc" },
      include: {
        _count: {
          select: { joinLogs: true },
        },
      },
    })

    return Response.json({ liveSessions })
  } catch (error) {
    console.error("Error fetching live sessions:", error)
    return Response.json({ error: "Failed to fetch live sessions" }, { status: 500 })
  }
}

// POST - Create a new live session
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params

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
    const { title, description, meetingUrl, meetingId, passcode, scheduledAt, duration } = body

    if (!title || !meetingUrl || !scheduledAt) {
      return Response.json({ error: "Title, meeting URL, and scheduled time are required" }, { status: 400 })
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        courseId,
        title,
        description,
        meetingUrl,
        meetingId,
        passcode,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
      },
    })

    return Response.json({ liveSession }, { status: 201 })
  } catch (error) {
    console.error("Error creating live session:", error)
    return Response.json({ error: "Failed to create live session" }, { status: 500 })
  }
}
