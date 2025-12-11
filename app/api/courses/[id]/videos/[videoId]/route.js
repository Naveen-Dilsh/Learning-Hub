import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { deleteVideoFromCloudflare } from "@/lib/cloudflare-stream"

export async function PUT(request, { params }) {
  const routeTimer = performanceLogger.startTimer('PUT /api/courses/[id]/videos/[videoId]')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    })

    if (!video) {
      routeTimer.stop()
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (video.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, duration, order } = body

    // Validate input
    if (title !== undefined && (!title || title.trim().length < 1)) {
      routeTimer.stop()
      return NextResponse.json({ message: "Title cannot be empty" }, { status: 400 })
    }

    if (duration !== undefined && duration < 0) {
      routeTimer.stop()
      return NextResponse.json({ message: "Duration must be a positive number" }, { status: 400 })
    }

    if (order !== undefined && order < 0) {
      routeTimer.stop()
      return NextResponse.json({ message: "Order must be a positive number" }, { status: 400 })
    }

    const updatedVideo = await prisma.video.update({
      where: { id: params.videoId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(duration !== undefined && { duration: Number.parseInt(duration) }),
        ...(order !== undefined && { order: Number.parseInt(order) }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        order: true,
        isFree: true,
        cloudflareStreamId: true,
      },
    })

    // Invalidate cache
    revalidatePath(`/api/courses/${params.id}`)
    revalidatePath(`/api/courses/${params.id}/videos`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    performanceLogger.logAPIRoute('PUT', `/api/courses/${params.id}/videos/${params.videoId}`, totalTime, {
      status: 200,
      dbTime,
      videoId: params.videoId,
    })

    return NextResponse.json(updatedVideo)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error updating video:", error)

    performanceLogger.logAPIRoute('PUT', `/api/courses/${params.id}/videos/${params.videoId}`, totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  const routeTimer = performanceLogger.startTimer('PATCH /api/courses/[id]/videos/[videoId]')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    })

    if (!video) {
      routeTimer.stop()
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (video.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { isFree } = await request.json()

    if (typeof isFree !== "boolean") {
      routeTimer.stop()
      return NextResponse.json({ message: "isFree must be a boolean" }, { status: 400 })
    }

    const updatedVideo = await prisma.video.update({
      where: { id: params.videoId },
      data: { isFree },
      select: {
        id: true,
        title: true,
        isFree: true,
      },
    })

    // Invalidate cache
    revalidatePath(`/api/courses/${params.id}`)
    revalidatePath(`/api/courses/${params.id}/videos`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    performanceLogger.logAPIRoute('PATCH', `/api/courses/${params.id}/videos/${params.videoId}`, totalTime, {
      status: 200,
      dbTime,
      videoId: params.videoId,
    })

    return NextResponse.json(updatedVideo)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error updating video:", error)

    performanceLogger.logAPIRoute('PATCH', `/api/courses/${params.id}/videos/${params.videoId}`, totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const routeTimer = performanceLogger.startTimer('DELETE /api/courses/[id]/videos/[videoId]')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params

    const video = await prisma.video.findUnique({
      where: { id: resolvedParams.videoId },
      select: {
        id: true,
        cloudflareStreamId: true,
        course: {
          select: {
            id: true,
            instructorId: true,
          },
        },
      },
    })

    if (!video) {
      routeTimer.stop()
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (video.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Delete video from Cloudflare Stream first (if cloudflareStreamId exists)
    if (video.cloudflareStreamId) {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
      const apiToken = process.env.CLOUDFLARE_API_TOKEN

      if (accountId && apiToken) {
        try {
          await deleteVideoFromCloudflare(video.cloudflareStreamId, accountId, apiToken)
          console.log("[v0] Successfully deleted video from Cloudflare Stream:", video.cloudflareStreamId)
        } catch (cloudflareError) {
          // Log error but continue with database deletion
          // This prevents database orphan records if Cloudflare deletion fails
          console.error("[v0] Failed to delete video from Cloudflare Stream (continuing with DB deletion):", cloudflareError.message)
          // Don't throw - we still want to delete from database even if Cloudflare deletion fails
        }
      } else {
        console.warn("[v0] Cloudflare credentials not configured, skipping Cloudflare Stream deletion")
      }
    }

    // Delete from database
    await prisma.video.delete({
      where: { id: resolvedParams.videoId },
    })

    // Invalidate cache
    revalidatePath(`/api/courses/${resolvedParams.id}`)
    revalidatePath(`/api/courses/${resolvedParams.id}/videos`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    performanceLogger.logAPIRoute('DELETE', `/api/courses/${resolvedParams.id}/videos/${resolvedParams.videoId}`, totalTime, {
      status: 200,
      dbTime,
      videoId: resolvedParams.videoId,
    })

    return NextResponse.json({ message: "Video deleted successfully" })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error deleting video:", error)

    performanceLogger.logAPIRoute('DELETE', `/api/courses/${params.id}/videos/${params.videoId}`, totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    // Handle Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
