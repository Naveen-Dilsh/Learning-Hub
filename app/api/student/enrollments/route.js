import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { performanceLogger } from "@/lib/performance-logger"

// Optimized function to calculate stats using database aggregation
async function calculateStudentStats(studentId) {
  // Use Promise.all for parallel queries - much faster
  const [enrollmentCount, completedVideosData, certificateCount] = await Promise.all([
    // Count total approved enrollments
    prisma.enrollment.count({
      where: {
        studentId,
        status: "APPROVED",
      },
    }),

    // Get all completed video durations in one efficient query
    prisma.videoProgress.findMany({
      where: {
        enrollment: {
          studentId,
          status: "APPROVED",
        },
        completed: true,
      },
      select: {
        video: {
          select: { duration: true },
        },
      },
    }),

    // Count certificates
    prisma.certificate.count({
      where: { studentId },
    }),
  ])

  // Calculate hours watched from aggregated data
  const totalSeconds = completedVideosData.reduce((sum, item) => {
    return sum + (item.video?.duration || 0)
  }, 0)
  const hoursWatched = Math.round(totalSeconds / 3600)

  // Get completed courses count efficiently
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: "APPROVED",
    },
    select: {
      id: true,
      course: {
        select: {
          _count: { select: { videos: true } },
        },
      },
      _count: {
        select: {
          progress: {
            where: { completed: true },
          },
        },
      },
    },
  })

  const completedCourses = enrollments.filter((e) => {
    const totalVideos = e.course._count.videos
    const watchedVideos = e._count.progress
    return totalVideos > 0 && watchedVideos === totalVideos
  }).length

  return {
    totalCourses: enrollmentCount,
    hoursWatched,
    completedCourses,
    certificates: certificateCount,
  }
}

export async function GET(request) {
  const routeTimer = performanceLogger.startTimer('GET /api/student/enrollments')
  const dbTimer = performanceLogger.startTimer('DB Queries')
  
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (studentId !== session.user.id && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Use unstable_cache for better performance (cache for 2 minutes)
    const getCachedStats = unstable_cache(
      async (userId) => calculateStudentStats(userId),
      [`student-stats-${session.user.id}`],
      {
        revalidate: 120, // Cache for 2 minutes
        tags: [`student-${session.user.id}`],
      }
    )

    // Parallel queries for better performance
    const [enrollments, stats] = await Promise.all([
      prisma.enrollment.findMany({
        where: {
          studentId: session.user.id,
          status: "APPROVED",
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,
              instructor: { select: { name: true } },
              _count: { select: { videos: true } },
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          _count: {
            select: {
              progress: {
                where: { completed: true },
              },
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      }),
      getCachedStats(session.user.id),
    ])

    // Calculate progress efficiently
    const enrollmentsWithProgress = enrollments.map((enrollment) => {
      const totalVideos = enrollment.course._count.videos
      const watchedVideos = enrollment._count.progress
      const progress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0

      return {
        ...enrollment,
        progress,
      }
    })

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute('GET', '/api/student/enrollments', totalTime, {
      status: 200,
      dbTime,
      studentId: session.user.id,
    })

    return NextResponse.json({
      enrollments: enrollmentsWithProgress,
      stats,
    })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching enrollments:", error)
    
    performanceLogger.logAPIRoute('GET', '/api/student/enrollments', totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
