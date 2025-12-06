import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

async function getDashboardData(instructorId) {
  // Fetch courses with optimized query
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      published: true,
      createdAt: true,
      _count: {
        select: {
          enrollments: true,
          videos: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Calculate stats in parallel
  const [totalEnrollments, totalEarnings, uniqueStudentsCount] = await Promise.all([
    // Total enrollments
    Promise.resolve(
      courses.reduce((sum, course) => sum + course._count.enrollments, 0)
    ),
    // Total earnings
    Promise.resolve(
      courses.reduce((sum, course) => sum + course.price * course._count.enrollments, 0)
    ),
    // Unique students count (optimized with aggregation)
    prisma.enrollment.groupBy({
      by: ["studentId"],
      where: {
        course: { instructorId },
      },
      _count: {
        studentId: true,
      },
    }).then((result) => result.length),
  ])

  return {
    stats: {
      totalCourses: courses.length,
      totalStudents: uniqueStudentsCount,
      totalEnrollments,
      totalEarnings,
    },
    courses,
  }
}

export async function GET(request) {
  const routeTimer = performanceLogger.startTimer("GET /api/instructor/dashboard")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")

    if (instructorId !== session.user.id && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Cache dashboard data for 60 seconds
    const cachedGetDashboardData = unstable_cache(
      getDashboardData,
      [`instructor-dashboard-${instructorId}`],
      {
        revalidate: 60,
        tags: [`instructor-dashboard-${instructorId}`],
      }
    )

    const data = await cachedGetDashboardData(instructorId)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/instructor/dashboard", totalTime, {
      status: 200,
      dbTime,
      instructorId,
      coursesCount: data.courses.length,
    })

    return NextResponse.json(data)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching instructor dashboard:", error)

    performanceLogger.logAPIRoute("GET", "/api/instructor/dashboard", totalTime, {
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
