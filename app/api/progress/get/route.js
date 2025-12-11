import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")
    const courseId = searchParams.get("courseId")

    if (!videoId || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Get video progress
    const progress = await prisma.videoProgress.findUnique({
      where: {
        enrollmentId_videoId: {
          enrollmentId: enrollment.id,
          videoId: videoId,
        },
      },
    })

    // Get video duration
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { duration: true },
    })

    return NextResponse.json({
      progress: progress || null,
      videoDuration: video?.duration || 0,
      isCompleted: progress?.completed || false,
    })
  } catch (error) {
    console.error("[Progress] Error fetching progress:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

