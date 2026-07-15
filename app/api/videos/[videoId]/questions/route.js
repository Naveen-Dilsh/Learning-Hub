import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

async function getVideoWithAccess(videoId, session) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      title: true,
      isFree: true,
      courseId: true,
      course: { select: { id: true, title: true, instructorId: true } },
    },
  })

  if (!video) return { error: "Video not found", status: 404 }

  const isInstructor = video.course.instructorId === session.user.id
  const isAdmin = session.user.role === "ADMIN"

  if (isInstructor || isAdmin) {
    return { video, isInstructor: true }
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId: session.user.id, courseId: video.courseId },
    },
    select: { id: true, status: true },
  })

  const hasApprovedEnrollment = enrollment?.status === "APPROVED"

  if (!hasApprovedEnrollment && !video.isFree) {
    return { error: "Not enrolled in this course", status: 403 }
  }

  return { video, isInstructor: false }
}

// GET: questions for a video. Students never receive the correct answers.
export async function GET(request, { params }) {
  try {
    const { videoId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const access = await getVideoWithAccess(videoId, session)
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status })
    }

    const questions = await prisma.videoQuestion.findMany({
      where: { videoId },
      orderBy: { order: "asc" },
    })

    if (access.isInstructor) {
      return NextResponse.json({
        questions,
        videoTitle: access.video.title,
        courseTitle: access.video.course.title,
      })
    }

    return NextResponse.json({
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        triggerTime: q.triggerTime,
      })),
    })
  } catch (error) {
    console.error("[VideoQuestions] Error fetching questions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT: instructor replaces all questions for this video
export async function PUT(request, { params }) {
  try {
    const { videoId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, course: { select: { instructorId: true } } },
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (video.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { questions } = await request.json()

    if (!Array.isArray(questions)) {
      return NextResponse.json({ message: "Invalid questions" }, { status: 400 })
    }

    // Empty array = remove all checkpoint questions for this video
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text || !q.text.trim()) {
        return NextResponse.json({ message: `Question ${i + 1} is empty` }, { status: 400 })
      }
      if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
        return NextResponse.json({ message: `Question ${i + 1} needs 2-6 answer options` }, { status: 400 })
      }
      if (q.options.some((o) => typeof o !== "string" || !o.trim())) {
        return NextResponse.json({ message: `Question ${i + 1} has an empty option` }, { status: 400 })
      }
      const ci = Number.parseInt(q.correctIndex)
      if (isNaN(ci) || ci < 0 || ci >= q.options.length) {
        return NextResponse.json({ message: `Select the correct answer for question ${i + 1}` }, { status: 400 })
      }
      if (q.triggerTime !== null && q.triggerTime !== undefined) {
        const t = Number.parseInt(q.triggerTime)
        if (isNaN(t) || t < 0) {
          return NextResponse.json({ message: `Question ${i + 1} has an invalid show time` }, { status: 400 })
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.videoQuestion.deleteMany({ where: { videoId } })
      if (questions.length > 0) {
        await tx.videoQuestion.createMany({
          data: questions.map((q, i) => ({
            videoId,
            text: q.text.trim(),
            options: q.options.map((o) => o.trim()),
            correctIndex: Number.parseInt(q.correctIndex),
            triggerTime:
              q.triggerTime === null || q.triggerTime === undefined || q.triggerTime === ""
                ? null
                : Number.parseInt(q.triggerTime),
            order: i,
          })),
        })
      }
    })

    const saved = await prisma.videoQuestion.findMany({
      where: { videoId },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ questions: saved })
  } catch (error) {
    console.error("[VideoQuestions] Error saving questions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
