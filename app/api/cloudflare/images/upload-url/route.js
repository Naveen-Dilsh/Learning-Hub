import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUploadUrl, IMAGES_BUCKET_NAME, IMAGES_PUBLIC_URL } from "@/lib/r2"

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { contentType } = await request.json()

    const extension = ALLOWED_TYPES[contentType]
    if (!extension) {
      return NextResponse.json({ message: "Only JPG, PNG, WEBP, GIF or AVIF images are allowed" }, { status: 400 })
    }

    if (!IMAGES_BUCKET_NAME || !IMAGES_PUBLIC_URL) {
      return NextResponse.json({ message: "Image storage not configured" }, { status: 500 })
    }

    // Images are stored under the uploader's id so only they can delete them
    const randomId = Math.random().toString(36).substring(2, 10)
    const key = `images/${session.user.id}/${Date.now()}-${randomId}.${extension}`

    // Short-lived presigned URL - the browser PUTs the file straight to R2
    const uploadURL = await getUploadUrl(key, contentType, 600, IMAGES_BUCKET_NAME)

    return NextResponse.json({
      uploadURL,
      imageUrl: `${IMAGES_PUBLIC_URL}/${key}`,
    })
  } catch (error) {
    console.error("[R2 Images] Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
