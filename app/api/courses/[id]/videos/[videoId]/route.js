import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      include: { course: true },
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (video.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { title, description, duration, order } = await request.json()

    const updatedVideo = await prisma.video.update({
      where: { id: params.videoId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(duration !== undefined && { duration }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error("Error updating video:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      include: { course: true },
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (video.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { isFree } = await request.json()

    const updatedVideo = await prisma.video.update({
      where: { id: params.videoId },
      data: {
        ...(isFree !== undefined && { isFree }),
      },
    })

    return NextResponse.json(updatedVideo)
  } catch (error) {
    console.error("Error updating video:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      include: { course: true },
    })

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (video.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.video.delete({
      where: { id: params.videoId },
    })

    return NextResponse.json({ message: "Video deleted successfully" })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
