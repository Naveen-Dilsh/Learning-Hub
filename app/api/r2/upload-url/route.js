import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUploadUrl, generateFileKey } from "@/lib/r2"
import prisma from "@/lib/db"

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/plain",
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, fileName, fileType, fileSize } = await request.json()

    if (!courseId || !fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, fileName, fileType, fileSize" },
        { status: 400 },
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "File type not allowed. Supported: PDF, Word, Excel, PowerPoint, ZIP, TXT" },
        { status: 400 },
      )
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB" }, { status: 400 })
    }

    // Verify user is the instructor of this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found or you don't have permission" }, { status: 403 })
    }

    // Generate unique file key
    const fileKey = generateFileKey(courseId, fileName)

    // Get presigned upload URL
    const uploadUrl = await getUploadUrl(fileKey, fileType)

    return NextResponse.json({
      uploadUrl,
      fileKey,
    })
  } catch (error) {
    console.error("Error generating upload URL:", error)
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
  }
}
