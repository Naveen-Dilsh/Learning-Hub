import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { courseId, title, description, cloudflareStreamId, duration } = await request.json()

    console.log(courseId, title, description, cloudflareStreamId, duration)
    
    if (!courseId || !title || !cloudflareStreamId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // ✅ FIX: Get the maximum order value instead of count
    const maxOrderVideo = await prisma.video.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const nextOrder = maxOrderVideo ? maxOrderVideo.order + 1 : 0

    console.log("Creating video with order:", nextOrder)
    console.log("Cloudflare Stream ID:", cloudflareStreamId)

    const video = await prisma.video.create({
      data: {
        title,
        description,
        cloudflareStreamId,
        duration: duration || 0,
        courseId,
        order: nextOrder, // Use the next available order
      },
    })

    console.log("Video created successfully:", video)
    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      error: error.message 
    }, { status: 500 })
  }
}
