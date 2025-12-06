import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")

    if (instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const courses = await prisma.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        _count: { select: { enrollments: true, videos: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate stats
    const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0)
    const totalEarnings = courses.reduce((sum, course) => sum + course.price * course._count.enrollments, 0)

    const uniqueStudents = await prisma.enrollment.findMany({
      where: {
        course: { instructorId: session.user.id },
      },
      distinct: ["studentId"],
    })

    const stats = {
      totalCourses: courses.length,
      totalStudents: uniqueStudents.length,
      totalEnrollments: totalEnrollments,
      totalEarnings: totalEarnings,
    }

    return NextResponse.json({
      stats,
      courses,
    })
  } catch (error) {
    console.error("Error fetching instructor dashboard:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
