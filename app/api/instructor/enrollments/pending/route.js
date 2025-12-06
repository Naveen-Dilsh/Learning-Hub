import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get pending manual enrollments for instructor's courses
    const pendingEnrollments = await prisma.enrollment.findMany({
      where: {
        paymentMethod: "manual",
        approvedBy: null,
        course: {
          instructorId: session.user.id,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentNumber: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    })

    return NextResponse.json({ enrollments: pendingEnrollments })
  } catch (error) {
    console.error("Error fetching pending enrollments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
