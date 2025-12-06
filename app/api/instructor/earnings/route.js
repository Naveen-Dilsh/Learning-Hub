import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        enrollments: { select: { id: true } },
        payments: {
          where: { status: "COMPLETED" },
          select: { amount: true },
        },
      },
    })

    const earnings = courses.map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      price: course.price,
      students: course.enrollments.length,
      revenue: course.payments.reduce((sum, payment) => sum + payment.amount, 0),
    }))

    const totalRevenue = earnings.reduce((sum, course) => sum + course.revenue, 0)
    const totalStudents = courses.reduce((sum, course) => sum + course.enrollments.length, 0)

    return NextResponse.json({
      totalRevenue,
      totalStudents,
      earnings,
    })
  } catch (error) {
    console.error("Error fetching earnings:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
