import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function DELETE(request, { params }) {
  const routeTimer = performanceLogger.startTimer("DELETE /api/instructor/enrollments/[id]/reject")
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
        studentId: true,
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true,
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

    // Delete enrollment and create notification in parallel
    await Promise.all([
      prisma.enrollment.delete({
        where: { id: enrollmentId },
      }),
      prisma.notification.create({
        data: {
          studentId: enrollment.studentId,
          title: "Enrollment Rejected",
          message: `Your enrollment request for "${enrollment.course.title}" was rejected. Please contact the instructor for more information.`,
          type: "warning",
        },
      }),
    ])

    // Invalidate cache
    revalidateTag(`instructor-pending-enrollments-${session.user.id}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("DELETE", "/api/instructor/enrollments/[id]/reject", totalTime, {
      status: 200,
      dbTime,
      enrollmentId,
      instructorId: session.user.id,
    })

    return NextResponse.json({ message: "Enrollment request rejected" })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error rejecting enrollment:", error)

    performanceLogger.logAPIRoute("DELETE", "/api/instructor/enrollments/[id]/reject", totalTime, {
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
