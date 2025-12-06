import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateSignedToken, cleanCloudflareAccountId } from "@/lib/cloudflare-stream"
import { NextResponse } from "next/server"

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

    if (!video.cloudflareStreamId) {
      console.error("[v0] Video missing cloudflareStreamId:", {
        videoId,
        title: video.title,
      })
      return NextResponse.json(
        { message: "Video not ready for streaming. Please re-upload it." },
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

    if (!enrollment && !isInstructor && !isAdmin && !isFreeVideo) {
      return NextResponse.json({ message: "Not enrolled in this course" }, { status: 403 })
    }

    const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim()
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
    const publicAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID?.trim()
    
    const cleanId = cleanCloudflareAccountId(publicAccountId)
    
    console.log("[v0] Generating token for video:", {
      videoId: video.cloudflareStreamId,
      hasApiToken: !!apiToken,
      hasAccountId: !!accountId,
    })

    let streamSrc
    let token = null

    if (apiToken && accountId) {
      try {
        token = await generateSignedToken(video.cloudflareStreamId, accountId, apiToken, 3600)
        
        console.log("[v0] Token received from Cloudflare:", {
          tokenStart: token.substring(0, 20) + "...",
          tokenEnd: "..." + token.substring(token.length - 20),
          tokenLength: token.length
        })
        
        streamSrc = token
        
        console.log("[v0] Using signed token for Stream Player SDK")
      } catch (error) {
        console.error("[v0] Failed to generate signed token:", error.message)
        streamSrc = video.cloudflareStreamId
      }
    } else {
      console.log("[v0] No API token configured - using public video ID")
      streamSrc = video.cloudflareStreamId
    }

    // Record video view
    if (enrollment) {
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
      token: streamSrc,
      videoId: video.cloudflareStreamId,
      embedUrl: `https://customer-${cleanId}.cloudflarestream.com/${streamSrc}/iframe`,
      requireSignedURLs: !!token,
    })
  } catch (error) {
    console.error("[v0] Error generating token:", error)
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
  }
}
