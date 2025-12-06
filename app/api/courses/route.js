import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")
    const published = searchParams.get("published")

    const where = {}
    if (instructorId) where.instructorId = instructorId
    if (published !== null) where.published = published === "true"

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, email: true } },
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, price, thumbnail } = await request.json()

    if (!title || !description || price === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: Number.parseFloat(price),
        thumbnail,
        instructorId: session.user.id,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
