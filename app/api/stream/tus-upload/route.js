import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

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

    // Build allowed origins from env — strip trailing slash if present
    const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "")
    const allowedOrigins = [
      baseUrl,
      baseUrl.replace("https://www.", "https://"),
      "http://localhost:3000",
    ].filter(Boolean)

    // ✅ Use /direct_upload — the officially recommended REST endpoint for browser uploads.
    // Returns a CORS-enabled uploadURL that the browser can PUT/TUS-PATCH directly.
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds: 21600, // 6 hours max
          allowedOrigins,
          requireSignedURLs: true,
          meta: {
            name: fileName,
            filetype: fileType || "video/mp4",
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[stream] direct_upload failed:", errorData)
      throw new Error(
        `Cloudflare API error: ${errorData.errors?.[0]?.message || response.statusText}`
      )
    }

    const data = await response.json()
    const { uploadURL, uid: mediaId } = data.result

    return NextResponse.json({
      uploadUrl: uploadURL,
      mediaId,
    })
  } catch (error) {
    console.error("[stream] Error creating direct upload:", error)
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
