import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: courseId } = await params

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: courseId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            _count: {
              select: { videos: true },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
    }

    // Get total videos in course
    const totalVideos = enrollment.course._count.videos

    if (totalVideos === 0) {
      return NextResponse.json({ error: "Course has no videos" }, { status: 400 })
    }

    // Get all completed videos for this enrollment
    const completedVideos = await prisma.videoProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
      select: {
        videoId: true,
      },
    })

    const completedVideoCount = completedVideos.length

    // Check if all videos are completed
    if (completedVideoCount < totalVideos) {
      return NextResponse.json({
        completed: false,
        message: `You have completed ${completedVideoCount} out of ${totalVideos} videos. Complete all videos to get your certificate.`,
        completedVideos: completedVideoCount,
        totalVideos: totalVideos,
      })
    }

    // All videos completed - check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: courseId,
        },
      },
    })

    if (existingCertificate) {
      return NextResponse.json({
        completed: true,
        certificate: existingCertificate,
        message: "Certificate already exists",
      })
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        studentId: user.id,
        courseId: courseId,
        completedAt: new Date(),
        issuedAt: new Date(),
      },
      include: {
        course: {
          select: {
            title: true,
            thumbnail: true,
          },
        },
        student: {
          select: {
            name: true,
          },
        },
      },
    })

    // Invalidate cache
    revalidateTag(`student-${user.id}`)

    console.log(`[Certificate] Created certificate for user ${user.email} for course ${enrollment.course.title}`)

    return NextResponse.json({
      completed: true,
      certificate: certificate,
      message: "Congratulations! You've completed the course and earned your certificate!",
    })
  } catch (error) {
    console.error("[Certificate] Error checking completion:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

