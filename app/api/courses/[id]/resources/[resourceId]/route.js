import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { deleteFile } from "@/lib/r2"

// DELETE - Remove a resource
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id: courseId, resourceId } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user is the instructor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found or you don't have permission" }, { status: 403 })
    }

    // Get resource to delete from R2
    const resource = await prisma.courseResource.findFirst({
      where: {
        id: resourceId,
        courseId,
      },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Delete from R2
    try {
      await deleteFile(resource.fileKey)
    } catch (r2Error) {
      console.error("Error deleting from R2:", r2Error)
      // Continue to delete from database even if R2 deletion fails
    }

    // Delete from database
    await prisma.courseResource.delete({
      where: { id: resourceId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 })
  }
}
