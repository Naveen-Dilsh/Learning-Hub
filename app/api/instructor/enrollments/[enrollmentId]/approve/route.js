import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function POST(request, { params }) {
  const routeTimer = performanceLogger.startTimer("POST /api/instructor/enrollments/[id]/approve")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { enrollmentId } = await params

    // Find the enrollment and verify it belongs to instructor's course
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        status: true,
        studentId: true,
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
          },
        },
        payment: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!enrollment) {
      routeTimer.stop()
      return NextResponse.json({ message: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    if (enrollment.status === "APPROVED") {
      routeTimer.stop()
      return NextResponse.json({ message: "Enrollment already approved" }, { status: 400 })
    }

    // Update enrollment and payment in parallel
    const [updatedEnrollment] = await Promise.all([
      prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: "APPROVED",
          approvedBy: session.user.id,
          approvedAt: new Date(),
        },
        select: {
          id: true,
          status: true,
        },
      }),
      enrollment.payment
        ? prisma.payment.update({
            where: { id: enrollment.payment.id },
            data: { status: "COMPLETED" },
          })
        : Promise.resolve(null),
      prisma.notification.create({
        data: {
          studentId: enrollment.studentId,
          title: "Enrollment Approved",
          message: `Your enrollment request for "${enrollment.course.title}" has been approved! You can now access the course.`,
          type: "success",
        },
      }),
    ])

    // Invalidate cache
    revalidateTag(`instructor-pending-enrollments-${session.user.id}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("POST", "/api/instructor/enrollments/[id]/approve", totalTime, {
      status: 200,
      dbTime,
      enrollmentId,
      instructorId: session.user.id,
    })

    return NextResponse.json({
      message: "Enrollment approved successfully",
      enrollment: updatedEnrollment,
    })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error approving enrollment:", error)

    performanceLogger.logAPIRoute("POST", "/api/instructor/enrollments/[id]/approve", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
