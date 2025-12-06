import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadVideoToCloudflare } from "@/lib/cloudflare-stream"
import { NextResponse } from "next/server"

export async function POST(request, { params }) {
  try {
    // ✅ FIX: Await params
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

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Upload to Cloudflare Stream
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    const uploadedVideo = await uploadVideoToCloudflare(file, accountId, apiToken)

    return NextResponse.json({
      videoId: uploadedVideo.uid,
      duration: uploadedVideo.duration,
      status: uploadedVideo.status,
    })
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      error: error.message 
    }, { status: 500 })
  }
}
