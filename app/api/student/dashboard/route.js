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

    // Get enrollments with progress
    const enrollments = await prisma.enrollment.findMany({
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
    })

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

    // Get stats
    const allEnrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: { include: { _count: { select: { videos: true } } } },
        progress: true,
      },
    })

    const stats = {
      enrolledCourses: allEnrollments.length,
      hoursWatched: Math.round(
        allEnrollments.reduce((total, e) => {
          return (
            total +
            e.progress.reduce((sum, p) => {
              return sum + (p.completed ? (p.course.videos.find((v) => v.id === p.videoId)?.duration || 0) / 3600 : 0)
            }, 0)
          )
        }, 0),
      ),
      completedCourses: allEnrollments.filter((e) => {
        const totalVideos = e.course._count.videos
        const watchedVideos = e.progress.filter((p) => p.completed).length
        return totalVideos > 0 && watchedVideos === totalVideos
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
