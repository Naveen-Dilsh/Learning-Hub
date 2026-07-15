import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// POST: student submits quiz answers - graded server-side so correct
// answers never reach the browser
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

    const isInstructor = course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    let enrollment = null
    if (!isInstructor && !isAdmin) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: session.user.id, courseId },
        },
        select: { id: true, status: true },
      })

      if (!enrollment || enrollment.status !== "APPROVED") {
        return NextResponse.json({ message: "Not enrolled in this course" }, { status: 403 })
      }
    }

    const quiz = await prisma.quiz.findUnique({
      where: { courseId },
      include: { questions: { orderBy: { order: "asc" } } },
    })

    if (!quiz || quiz.questions.length === 0) {
      return NextResponse.json({ message: "This course has no quiz" }, { status: 404 })
    }

    const { answers } = await request.json()

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { message: "Please answer all questions before submitting" },
        { status: 400 }
      )
    }

    // Grade
    let correctCount = 0
    const results = quiz.questions.map((q, i) => {
      const selected = Number.parseInt(answers[i])
      const correct = !isNaN(selected) && selected === q.correctIndex
      if (correct) correctCount++
      return correct
    })

    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore

    // Record the attempt for enrolled students (instructor test runs are not saved)
    if (enrollment) {
      await prisma.quizAttempt.create({
        data: {
          quizId: quiz.id,
          studentId: session.user.id,
          score,
          passed,
          answers: answers.map((a) => Number.parseInt(a)),
        },
      })
    }

    return NextResponse.json({
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      passingScore: quiz.passingScore,
      results, // per-question true/false (correct answers themselves stay hidden)
    })
  } catch (error) {
    console.error("[Quiz] Error submitting quiz:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
