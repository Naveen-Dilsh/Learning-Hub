import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { deleteFile, IMAGES_BUCKET_NAME, IMAGES_PUBLIC_URL } from "@/lib/r2"

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ message: "Image URL is required" }, { status: 400 })
    }

    if (!IMAGES_BUCKET_NAME || !IMAGES_PUBLIC_URL) {
      return NextResponse.json({ message: "Image storage not configured" }, { status: 500 })
    }

    // Only images in our R2 bucket can be deleted (old Cloudflare Images URLs are skipped)
    if (!imageUrl.startsWith(`${IMAGES_PUBLIC_URL}/`)) {
      return NextResponse.json({ success: true, message: "Not an R2 image, nothing to delete" })
    }

    const key = imageUrl.slice(IMAGES_PUBLIC_URL.length + 1)

    // Users may only delete images they uploaded themselves
    if (!key.startsWith(`images/${session.user.id}/`) || key.includes("..")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await deleteFile(key, IMAGES_BUCKET_NAME)

    return NextResponse.json({ success: true, message: "Image deleted successfully" })
  } catch (error) {
    console.error("[R2 Images] Error:", error)
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 })
  }
}
