import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { deleteFile } from "@/lib/r2"
import { performanceLogger } from "@/lib/performance-logger"

// PATCH - Update a resource
export async function PATCH(request, { params }) {
  const routeTimer = performanceLogger.startTimer('PATCH /api/courses/[id]/resources/[resourceId]')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)
    const { id: courseId, resourceId } = await params

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    const { title, description } = await request.json()

    if (!title || !title.trim()) {
      routeTimer.stop()
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const resource = await prisma.courseResource.update({
      where: { id: resourceId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
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

    performanceLogger.logAPIRoute('PATCH', `/api/courses/${courseId}/resources/${resourceId}`, totalTime, {
      status: 200,
      dbTime,
      courseId,
      resourceId,
    })

    return NextResponse.json(resource)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error updating resource:", error)

    performanceLogger.logAPIRoute('PATCH', `/api/courses/${params.id}/resources/${params.resourceId}`, totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json({ error: error.message || "Failed to update resource" }, { status: 500 })
  }
}

// DELETE - Remove a resource
export async function DELETE(request, { params }) {
  const routeTimer = performanceLogger.startTimer('DELETE /api/courses/[id]/resources/[resourceId]')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)
    const { id: courseId, resourceId } = await params

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Get resource to delete from R2
    const resource = await prisma.courseResource.findFirst({
      where: {
        id: resourceId,
        courseId,
      },
      select: {
        id: true,
        fileKey: true,
      },
    })

    if (!resource) {
      routeTimer.stop()
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Delete from R2 (non-blocking - continue even if it fails)
    if (resource.fileKey) {
      try {
        await deleteFile(resource.fileKey)
      } catch (r2Error) {
        console.error("Error deleting from R2:", r2Error)
        // Continue to delete from database even if R2 deletion fails
      }
    }

    // Delete from database
    await prisma.courseResource.delete({
      where: { id: resourceId },
    })

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    performanceLogger.logAPIRoute('DELETE', `/api/courses/${courseId}/resources/${resourceId}`, totalTime, {
      status: 200,
      dbTime,
      courseId,
      resourceId,
    })

    return NextResponse.json({ success: true, message: "Resource deleted successfully" })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error deleting resource:", error)

    performanceLogger.logAPIRoute('DELETE', `/api/courses/${params.id}/resources/${params.resourceId}`, totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete resource" },
      { status: 500 }
    )
  }
}