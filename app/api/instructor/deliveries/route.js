import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

async function getDeliveriesData(userRole, userId, status, courseId) {
  // Build where clause - ADMIN sees all, INSTRUCTOR sees only their courses
  const where = {
    enrollment: {
      status: "APPROVED",
    },
  }

  // Only filter by instructorId if user is INSTRUCTOR (not ADMIN)
  if (userRole === "INSTRUCTOR") {
    where.enrollment.course = {
      instructorId: userId,
    }
  }

  if (status) {
    where.status = status
  }

  if (courseId) {
    where.enrollment.courseId = courseId
  }

  // Fetch deliveries and counts in parallel
  const [deliveries, counts] = await Promise.all([
    prisma.delivery.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        district: true,
        postalCode: true,
        status: true,
        trackingNumber: true,
        courier: true,
        notes: true,
        createdAt: true,
        shippedAt: true,
        deliveredAt: true,
        enrollment: {
          select: {
            id: true,
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
    }),
    prisma.delivery.groupBy({
      by: ["status"],
      where: {
        enrollment: {
          ...(userRole === "INSTRUCTOR" ? {
            course: {
              instructorId: userId,
            },
          } : {}),
          status: "APPROVED",
        },
      },
      _count: true,
    }),
  ])

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

  return {
    deliveries,
    counts: statusCounts,
  }
}

export async function GET(request) {
  const routeTimer = performanceLogger.startTimer("GET /api/instructor/deliveries")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const courseId = searchParams.get("courseId")

    // Cache deliveries data for 30 seconds
    const cacheKey = session.user.role === "ADMIN"
      ? `admin-deliveries-${status || "all"}-${courseId || "all"}`
      : `instructor-deliveries-${session.user.id}-${status || "all"}-${courseId || "all"}`
    
    const cachedGetDeliveriesData = unstable_cache(
      () => getDeliveriesData(session.user.role, session.user.id, status, courseId),
      [cacheKey],
      {
        revalidate: 30,
        tags: [session.user.role === "ADMIN" ? "admin-deliveries" : `instructor-deliveries-${session.user.id}`],
      }
    )

    const data = await cachedGetDeliveriesData()

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/instructor/deliveries", totalTime, {
      status: 200,
      dbTime,
      instructorId: session.user.id,
      deliveriesCount: data.deliveries.length,
      statusFilter: status || "all",
    })

    return NextResponse.json(data)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching deliveries:", error)

    performanceLogger.logAPIRoute("GET", "/api/instructor/deliveries", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
