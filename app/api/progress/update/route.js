import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { revalidateTag } from "next/cache"

const CREDITS_PER_VIDEO = 10 // Award 10 credits per completed video

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { videoId, courseId, completed, watchedSeconds, totalSeconds } = await req.json()

    if (!videoId || !courseId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Updating progress:", { videoId, courseId, completed, watchedSeconds, totalSeconds })

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
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
      return Response.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Update or create video progress
    const existingProgress = await prisma.videoProgress.findUnique({
      where: {
        enrollmentId_videoId: {
          enrollmentId: enrollment.id,
          videoId: videoId,
        },
      },
    })

    let creditsAwarded = 0

    if (completed && !existingProgress?.completed) {
      // First time completing this video - award credits
      creditsAwarded = CREDITS_PER_VIDEO

      // Update user credits
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: {
            increment: creditsAwarded,
          },
        },
      })
    }

    const videoProgress = await prisma.videoProgress.upsert({
      where: {
        enrollmentId_videoId: {
          enrollmentId: enrollment.id,
          videoId: videoId,
        },
      },
      update: {
        completed: completed || existingProgress?.completed || false,
        completedAt: completed && !existingProgress?.completed ? new Date() : existingProgress?.completedAt,
        watchedAt: new Date(),
      },
      create: {
        enrollmentId: enrollment.id,
        videoId: videoId,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
        watchedAt: new Date(),
      },
    })

    // Invalidate student stats cache when progress is updated
    revalidateTag(`student-${user.id}`)

    return Response.json({ 
      success: true, 
      progress: videoProgress,
      creditsAwarded,
      totalCredits: creditsAwarded > 0 ? user.credits + creditsAwarded : user.credits,
    })
  } catch (error) {
    console.error("[v0] Error updating progress:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
