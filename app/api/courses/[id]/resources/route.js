import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET - List course resources
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is instructor or enrolled student
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const isInstructor = course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    // Check enrollment for students
    if (!isInstructor && !isAdmin) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          courseId,
          studentId: session.user.id,
          status: "APPROVED",
        },
      })

      if (!enrollment) {
        return NextResponse.json({ error: "You must be enrolled to access resources" }, { status: 403 })
      }
    }

    const resources = await prisma.courseResource.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

// POST - Create a new resource (after successful upload)
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, fileName, fileKey, fileSize, fileType } = await request.json()

    if (!title || !fileName || !fileKey || !fileSize || !fileType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user is the instructor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found or you don't have permission" }, { status: 403 })
    }

    const resource = await prisma.courseResource.create({
      data: {
        courseId,
        title,
        description: description || null,
        fileName,
        fileKey,
        fileSize,
        fileType,
      },
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 })
  }
}
