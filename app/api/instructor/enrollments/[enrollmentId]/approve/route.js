import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request, { params }) {
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
        payment: true, // Include payment
      },
    })

    if (!enrollment) {
      return NextResponse.json({ message: "Enrollment not found" }, { status: 404 })
    }

    if (enrollment.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    if (enrollment.status === "APPROVED") {
      return NextResponse.json({ message: "Enrollment already approved" }, { status: 400 })
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
    })

    if (enrollment.payment) {
      await prisma.payment.update({
        where: { id: enrollment.payment.id },
        data: { status: "COMPLETED" },
      })
    }

    // Create notification for student
    await prisma.notification.create({
      data: {
        studentId: enrollment.studentId,
        title: "Enrollment Approved",
        message: `Your enrollment request for "${enrollment.course.title}" has been approved! You can now access the course.`,
        type: "success",
      },
    })

    return NextResponse.json({
      message: "Enrollment approved successfully",
      enrollment: updatedEnrollment,
    })
  } catch (error) {
    console.error("Error approving enrollment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
