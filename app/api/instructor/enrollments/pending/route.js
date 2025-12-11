import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

async function getPendingEnrollments(userRole, userId) {
  // Build where clause - ADMIN sees all, INSTRUCTOR sees only their courses
  const where = {
    paymentMethod: "manual",
    status: "PENDING",
    approvedBy: null,
  }

  // Only filter by instructorId if user is INSTRUCTOR (not ADMIN)
  if (userRole === "INSTRUCTOR") {
    where.course = {
      instructorId: userId,
    }
  }

  return await prisma.enrollment.findMany({
    where,
    select: {
      id: true,
      enrolledAt: true,
      receiptImage: true,
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
}

export async function GET(request) {
  const routeTimer = performanceLogger.startTimer("GET /api/instructor/enrollments/pending")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Cache pending enrollments for 30 seconds (frequently changing data)
    const cacheKey = session.user.role === "ADMIN" 
      ? "admin-pending-enrollments" 
      : `instructor-pending-enrollments-${session.user.id}`
    
    const cachedGetPendingEnrollments = unstable_cache(
      () => getPendingEnrollments(session.user.role, session.user.id),
      [cacheKey],
      {
        revalidate: 30,
        tags: [cacheKey],
      }
    )

    const pendingEnrollments = await cachedGetPendingEnrollments()

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/instructor/enrollments/pending", totalTime, {
      status: 200,
      dbTime,
      instructorId: session.user.id,
      enrollmentsCount: pendingEnrollments.length,
    })

    return NextResponse.json({ enrollments: pendingEnrollments })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching pending enrollments:", error)

    performanceLogger.logAPIRoute("GET", "/api/instructor/enrollments/pending", totalTime, {
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
