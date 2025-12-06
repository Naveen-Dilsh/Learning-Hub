import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { getDownloadUrl } from "@/lib/r2"

// GET - Get secure download URL for a resource
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId, resourceId } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the resource
    const resource = await prisma.courseResource.findFirst({
      where: {
        id: resourceId,
        courseId,
      },
      include: {
        course: {
          select: { instructorId: true },
        },
      },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const isInstructor = resource.course.instructorId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    // Check enrollment for students
    if (!isInstructor && !isAdmin) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          courseId,
          studentId: session.user.id,
          status: "APPROVED",
        },
      })

      if (!enrollment) {
        return NextResponse.json({ error: "You must be enrolled to download resources" }, { status: 403 })
      }
    }

    // Generate presigned download URL (valid for 5 minutes)
    const downloadUrl = await getDownloadUrl(
      resource.fileKey,
      300, // 5 minutes
      resource.fileName,
    )

    // Log download for analytics (optional)
    console.log(`Resource download: ${resource.id} by user ${session.user.id}`)

    return NextResponse.json({ downloadUrl })
  } catch (error) {
    console.error("Error generating download URL:", error)
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 })
  }
}
