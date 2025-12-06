import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { initiateTusUpload } from "@/lib/cloudflare-stream"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { fileName, fileSize, fileType, courseId } = await request.json()

    if (!fileName || !fileSize || !courseId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { message: "Cloudflare credentials not configured" },
        { status: 500 }
      )
    }

    const metadata = {
      name: fileName,
      filetype: fileType || "video/mp4",
      uploadSize: fileSize,
      requiresignedurls: "true",
    }

    const { location, mediaId } = await initiateTusUpload(
      metadata,
      accountId,
      apiToken
    )

    return NextResponse.json({
      uploadUrl: location,
      mediaId,
      chunkSize: 52428800, // 50 MB chunks
    })
  } catch (error) {
    console.error("[v0] Error initiating tus upload:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
