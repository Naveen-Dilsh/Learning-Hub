import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { enrollmentId } = params

    // Find the enrollment and verify it belongs to instructor's course
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        student: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json({ message: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Delete the enrollment request
    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    })

    // Create notification for student
    await prisma.notification.create({
      data: {
        studentId: enrollment.studentId,
        title: "Enrollment Rejected",
        message: `Your enrollment request for "${enrollment.course.title}" was rejected. Please contact the instructor for more information.`,
        type: "warning",
      },
    })

    return NextResponse.json({ message: "Enrollment request rejected" })
  } catch (error) {
    console.error("Error rejecting enrollment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
