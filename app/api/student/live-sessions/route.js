import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET - Get upcoming live sessions for enrolled courses
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student's approved enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
        status: "APPROVED",
      },
      select: {
        courseId: true,
      },
    })

    const courseIds = enrollments.map((e) => e.courseId)

    // Get upcoming and live sessions for enrolled courses
    const liveSessions = await prisma.liveSession.findMany({
      where: {
        courseId: { in: courseIds },
        status: { in: ["SCHEDULED", "LIVE"] },
        // scheduledAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Include sessions from 1 hour ago
      },
      orderBy: { scheduledAt: "asc" },
      include: {
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
    })

    // Remove sensitive data (meetingUrl, passcode) from response
    const safeSessions = liveSessions.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      meetingId: s.meetingId, // Can show meeting ID if needed
      scheduledAt: s.scheduledAt,
      duration: s.duration,
      status: s.status,
      course: s.course,
    }))

    return Response.json({ liveSessions: safeSessions })
  } catch (error) {
    console.error("Error fetching live sessions:", error)
    return Response.json({ error: "Failed to fetch live sessions" }, { status: 500 })
  }
}
