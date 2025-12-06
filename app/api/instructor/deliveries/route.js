import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    const courseId = searchParams.get("courseId")

    // Build where clause
    const where = {
      enrollment: {
        course: {
          instructorId: session.user.id,
        },
        status: "APPROVED", // Only show deliveries for approved enrollments
      },
    }

    if (status) {
      where.status = status
    }

    if (courseId) {
      where.enrollment.courseId = courseId
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentNumber: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get delivery counts by status
    const counts = await prisma.delivery.groupBy({
      by: ["status"],
      where: {
        enrollment: {
          course: {
            instructorId: session.user.id,
          },
          status: "APPROVED",
        },
      },
      _count: true,
    })

    const statusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    }

    counts.forEach((c) => {
      statusCounts[c.status] = c._count
    })

    return NextResponse.json({
      deliveries,
      counts: statusCounts,
    })
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
