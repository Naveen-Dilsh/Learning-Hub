import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// GET: instructor/admin receives the full quiz (with correct answers),
// students receive questions WITHOUT correct answers + their attempt status
export async function GET(request, { params }) {
  try {
    const { id: courseId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    const isInstructor = course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    const quiz = await prisma.quiz.findUnique({
      where: { courseId },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    })

    if (isInstructor || isAdmin) {
      return NextResponse.json({ quiz, courseTitle: course.title })
    }

    // Students must have an APPROVED enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: session.user.id, courseId },
      },
      select: { id: true, status: true },
    })

    if (!enrollment || enrollment.status !== "APPROVED") {
      return NextResponse.json({ message: "Not enrolled in this course" }, { status: 403 })
    }

    if (!quiz || quiz.questions.length === 0) {
      return NextResponse.json({ quiz: null, courseTitle: course.title })
    }

    // Strip correct answers for students
    const safeQuiz = {
      id: quiz.id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
      })),
    }

    const bestAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId: quiz.id, studentId: session.user.id },
      orderBy: { score: "desc" },
      select: { score: true, passed: true, createdAt: true },
    })

    const attemptCount = await prisma.quizAttempt.count({
      where: { quizId: quiz.id, studentId: session.user.id },
    })

    return NextResponse.json({
      quiz: safeQuiz,
      courseTitle: course.title,
      bestAttempt,
      attemptCount,
    })
  } catch (error) {
    console.error("[Quiz] Error fetching quiz:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST: instructor/admin creates or replaces the course quiz
export async function POST(request, { params }) {
  try {
    const { id: courseId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { title, passingScore, questions } = await request.json()

    // Validate
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: "Add at least one question" }, { status: 400 })
    }

    const score = Number.parseInt(passingScore)
    if (isNaN(score) || score < 1 || score > 100) {
      return NextResponse.json({ message: "Passing score must be between 1 and 100" }, { status: 400 })
    }

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
    }

    // Replace the quiz atomically: upsert quiz, wipe old questions, insert new
    const quiz = await prisma.$transaction(async (tx) => {
      const upserted = await tx.quiz.upsert({
        where: { courseId },
        update: { title: title?.trim() || "Final Quiz", passingScore: score },
        create: { courseId, title: title?.trim() || "Final Quiz", passingScore: score },
      })

      await tx.quizQuestion.deleteMany({ where: { quizId: upserted.id } })

      await tx.quizQuestion.createMany({
        data: questions.map((q, i) => ({
          quizId: upserted.id,
          text: q.text.trim(),
          options: q.options.map((o) => o.trim()),
          correctIndex: Number.parseInt(q.correctIndex),
          order: i,
        })),
      })

      return tx.quiz.findUnique({
        where: { id: upserted.id },
        include: { questions: { orderBy: { order: "asc" } } },
      })
    })

    return NextResponse.json({ quiz }, { status: 201 })
  } catch (error) {
    console.error("[Quiz] Error saving quiz:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE: instructor/admin removes the quiz (certificates fall back to videos-only)
export async function DELETE(request, { params }) {
  try {
    const { id: courseId } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.quiz.delete({ where: { courseId } }).catch((e) => {
      if (e.code !== "P2025") throw e // Ignore "not found"
    })

    return NextResponse.json({ message: "Quiz deleted" })
  } catch (error) {
    console.error("[Quiz] Error deleting quiz:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
