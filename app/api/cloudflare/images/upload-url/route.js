import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { metadata } = await request.json()

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json({ message: "Cloudflare credentials not configured" }, { status: 500 })
    }

    // Request a one-time upload URL from Cloudflare Images
    const formData = new FormData()
    formData.append("requireSignedURLs", "false")
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    })

    const data = await response.json()
    console.log("upload url route ", data)

    if (!response.ok || !data.success) {
      console.error("[Cloudflare Images] Failed to get upload URL:", data)
      return NextResponse.json(
        { message: "Failed to generate upload URL", errors: data.errors },
        { status: response.status },
      )
    }

    // Return the upload URL and image ID to the client
    return NextResponse.json({
      uploadURL: data.result.uploadURL,
      imageId: data.result.id,
    })
  } catch (error) {
    console.error("[Cloudflare Images] Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
