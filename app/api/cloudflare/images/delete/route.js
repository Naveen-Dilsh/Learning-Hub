import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { imageId } = await request.json()

    if (!imageId) {
      return NextResponse.json({ message: "Image ID is required" }, { status: 400 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json({ message: "Cloudflare credentials not configured" }, { status: 500 })
    }

    // Delete image from Cloudflare Images
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()

    // If image not found (404), it's okay - might have been deleted already
    if (response.status === 404) {
      console.log("[Cloudflare Images] Image not found (may have been deleted already):", imageId)
      return NextResponse.json({ success: true, message: "Image not found (may have been deleted already)" })
    }

    if (!response.ok || !data.success) {
      console.error("[Cloudflare Images] Failed to delete image:", data)
      return NextResponse.json(
        { message: "Failed to delete image", errors: data.errors },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, message: "Image deleted successfully" })
  } catch (error) {
    console.error("[Cloudflare Images] Error:", error)
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
  }
}

