import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { unstable_cache } from "next/cache"

// GET - List course resources
export async function GET(request, { params }) {
  const routeTimer = performanceLogger.startTimer('GET /api/courses/[id]/resources')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is instructor or enrolled student
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course) {
      routeTimer.stop()
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
        select: { id: true },
      })

      if (!enrollment) {
        routeTimer.stop()
        return NextResponse.json({ error: "You must be enrolled to access resources" }, { status: 403 })
      }
    }

    const resources = await prisma.courseResource.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    performanceLogger.logAPIRoute('GET', `/api/courses/${courseId}/resources`, totalTime, {
      status: 200,
      dbTime,
      courseId,
      count: resources.length,
    })

    return NextResponse.json(resources)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching resources:", error)

    performanceLogger.logAPIRoute('GET', `/api/courses/${params.id}/resources`, totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { error: error.message || "Failed to fetch resources" },
      { status: 500 }
    )
  }
}

// POST - Create a new resource (after successful upload)
export async function POST(request, { params }) {
  const routeTimer = performanceLogger.startTimer('POST /api/courses/[id]/resources')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)
    const { id: courseId } = await params

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, fileName, fileKey, fileSize, fileType } = await request.json()

    if (!title || !fileName || !fileKey || !fileSize || !fileType) {
      routeTimer.stop()
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user is the instructor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
      select: { id: true },
    })

    if (!course) {
      routeTimer.stop()
      return NextResponse.json({ error: "Course not found or you don't have permission" }, { status: 403 })
    }

    const resource = await prisma.courseResource.create({
      data: {
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        fileName,
        fileKey,
        fileSize,
        fileType,
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    performanceLogger.logAPIRoute('POST', `/api/courses/${courseId}/resources`, totalTime, {
      status: 201,
      dbTime,
      courseId,
      resourceId: resource.id,
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error creating resource:", error)

    performanceLogger.logAPIRoute('POST', `/api/courses/${params.id}/resources`, totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { error: error.message || "Failed to create resource" },
      { status: 500 }
    )
  }
}
