import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, videos: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ message: "Course ID is required" }, { status: 400 })
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
