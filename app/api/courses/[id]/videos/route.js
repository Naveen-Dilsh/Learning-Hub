import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { extractYouTubeVideoId } from "@/lib/youtube"

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { title, description, youtubeUrl, duration } = await request.json()

    if (!title || !youtubeUrl) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const youtubeVideoId = extractYouTubeVideoId(youtubeUrl)

    if (!youtubeVideoId) {
      return NextResponse.json(
        { message: "Invalid YouTube link. Paste a link like https://youtu.be/VIDEO_ID" },
        { status: 400 }
      )
    }

    // Get the maximum order value to keep (courseId, order) unique
    const maxOrderVideo = await prisma.video.findFirst({
      where: { courseId: resolvedParams.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const nextOrder = maxOrderVideo ? maxOrderVideo.order + 1 : 0

    const video = await prisma.video.create({
      data: {
        title,
        description,
        youtubeVideoId,
        duration: duration || 0,
        courseId: resolvedParams.id,
        order: nextOrder,
      },
    })

    console.log("Video created successfully:", video.id, "YouTube ID:", youtubeVideoId)
    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({
      message: "Internal server error",
      error: error.message
    }, { status: 500 })
  }
}
