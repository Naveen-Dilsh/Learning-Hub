import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Run all dashboard queries in parallel
    const [enrollments, allEnrollments, completedProgress] = await Promise.all([
      // Recent enrollments with progress
      prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        include: {
          course: {
            include: {
              instructor: { select: { name: true } },
              _count: { select: { videos: true } },
            },
          },
          progress: true,
        },
        orderBy: { enrolledAt: "desc" },
        take: 5,
      }),
      // Per-course totals for the stats
      prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        select: {
          course: { select: { _count: { select: { videos: true } } } },
          _count: { select: { progress: { where: { completed: true } } } },
        },
      }),
      // Durations of completed videos for hours watched
      prisma.videoProgress.findMany({
        where: {
          enrollment: { studentId: session.user.id },
          completed: true,
        },
        select: { video: { select: { duration: true } } },
      }),
    ])

    // Calculate progress
    const enrollmentsWithProgress = enrollments.map((enrollment) => {
      const totalVideos = enrollment.course._count.videos
      const watchedVideos = enrollment.progress.filter((p) => p.completed).length
      const progress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0

      return {
        ...enrollment,
        progress,
      }
    })

    const totalSecondsWatched = completedProgress.reduce(
      (sum, p) => sum + (p.video?.duration || 0),
      0,
    )

    const stats = {
      enrolledCourses: allEnrollments.length,
      hoursWatched: Math.round(totalSecondsWatched / 3600),
      completedCourses: allEnrollments.filter((e) => {
        const totalVideos = e.course._count.videos
        return totalVideos > 0 && e._count.progress === totalVideos
      }).length,
    }

    return NextResponse.json({
      stats,
      recentCourses: enrollmentsWithProgress,
    })
  } catch (error) {
    console.error("[v0] Error fetching student dashboard:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
