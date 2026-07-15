import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// Verifies the student may watch this lesson and returns the YouTube video ID.
// The ID is never rendered in the page HTML for non-enrolled users - this
// endpoint is the only place it is exposed.
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { videoId, courseId } = await request.json()

    if (!videoId || !courseId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { course: true },
    })

    if (!video) {
      console.error("[v0] Video not found:", videoId)
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    if (!video.youtubeVideoId) {
      console.error("[v0] Video missing youtubeVideoId:", {
        videoId,
        title: video.title,
      })
      return NextResponse.json(
        { message: "This video is not available yet. Please ask the instructor to re-add it with a YouTube link." },
        { status: 400 }
      )
    }

    // Check if user is enrolled in the course or if video is free
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    })

    const isInstructor = session.user.id === video.course.instructorId
    const isAdmin = session.user.role === "ADMIN"
    const isFreeVideo = video.isFree === true
    // Only APPROVED enrollments can watch - PENDING (unpaid/unapproved),
    // REJECTED and CANCELLED must not access paid content
    const hasApprovedEnrollment = enrollment?.status === "APPROVED"

    if (!hasApprovedEnrollment && !isInstructor && !isAdmin && !isFreeVideo) {
      const message = enrollment
        ? "Your enrollment is not approved yet. Please wait for approval."
        : "Not enrolled in this course"
      return NextResponse.json({ message }, { status: 403 })
    }

    // Record video view
    if (hasApprovedEnrollment) {
      await prisma.videoProgress.upsert({
        where: {
          enrollmentId_videoId: {
            enrollmentId: enrollment.id,
            videoId: videoId,
          },
        },
        update: {
          watchedAt: new Date(),
        },
        create: {
          enrollmentId: enrollment.id,
          videoId: videoId,
          watchedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      youtubeVideoId: video.youtubeVideoId,
    })
  } catch (error) {
    console.error("[v0] Error fetching video source:", error)
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
  }
}
