import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// POST: check a single answer for an in-video checkpoint question.
// Graded server-side so the correct answer never reaches the browser.
export async function POST(request, { params }) {
  try {
    const { videoId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        isFree: true,
        courseId: true,
        course: { select: { instructorId: true } },
      },
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    const isInstructor = video.course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isInstructor && !isAdmin) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: session.user.id, courseId: video.courseId },
        },
        select: { id: true, status: true },
      })

      if (enrollment?.status !== "APPROVED" && !video.isFree) {
        return NextResponse.json({ message: "Not enrolled in this course" }, { status: 403 })
      }
    }

    const { questionId, answer } = await request.json()

    const question = await prisma.videoQuestion.findUnique({
      where: { id: questionId },
      select: { id: true, videoId: true, correctIndex: true },
    })

    if (!question || question.videoId !== videoId) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 })
    }

    const selected = Number.parseInt(answer)
    const correct = !isNaN(selected) && selected === question.correctIndex

    return NextResponse.json({ correct })
  } catch (error) {
    console.error("[VideoQuestions] Error checking answer:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
