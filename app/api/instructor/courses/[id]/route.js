import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        videos: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true, reviews: true } },
      },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { title, description, price, thumbnail, published } = await request.json()

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number.parseFloat(price) }),
        ...(thumbnail && { thumbnail }),
        ...(published !== undefined && { published }),
      },
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.course.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
