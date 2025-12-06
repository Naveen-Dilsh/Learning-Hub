import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request, { params }) {
  try {
    // ✅ FIX 1: Await params
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

    const { title, description, cloudflareStreamId, duration } = await request.json()

    if (!title || !cloudflareStreamId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // ✅ FIX 2: Get the maximum order value instead of count
    const maxOrderVideo = await prisma.video.findFirst({
      where: { courseId: resolvedParams.id },
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
        courseId: resolvedParams.id,
        order: nextOrder, // Use the next available order
      },
    })
    
    console.log("Video created successfully:", video)
    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      error: error.message 
    }, { status: 500 })
  }
}

// Quick Fix Summary
// Problem: Video uploads to Cloudflare but doesn't save to database.
// Two Issues Found:
// 1. Next.js 15 Params Issue
// javascript// ❌ Old (broken)
// export async function POST(request, { params }) {
//   where: { id: params.id }
// }

// // ✅ New (fixed)
// export async function POST(request, { params }) {
//   const resolvedParams = await params;
//   where: { id: resolvedParams.id }
// }
// Why: Next.js 15 requires awaiting params before use.
// 2. Duplicate Order Number
// javascript// ❌ Old (can duplicate orders)
// const videoCount = await prisma.video.count({
//   where: { courseId: params.id }
// })
// order: videoCount

// // ✅ New (always unique)
// const maxOrderVideo = await prisma.video.findFirst({
//   where: { courseId: resolvedParams.id },
//   orderBy: { order: 'desc' }
// })
// const nextOrder = maxOrderVideo ? maxOrderVideo.order + 1 : 0
// order: nextOrder
// Why: Database has unique constraint on (courseId, order). Using count can create duplicates if videos are deleted or uploads fail.
// Apply these fixes to both:

// /api/courses/[id]/videos/route.js
// /api/courses/[id]/videos/upload/route.js
