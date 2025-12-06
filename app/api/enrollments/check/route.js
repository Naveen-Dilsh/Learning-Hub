import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ enrolled: false })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ message: "Missing courseId" }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    })

    const isApproved = enrollment?.status === "APPROVED"

    return NextResponse.json({
      enrolled: isApproved,
      status: enrollment?.status || null,
      enrollmentId: enrollment?.id || null,
    })
  } catch (error) {
    console.error("Error checking enrollment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
