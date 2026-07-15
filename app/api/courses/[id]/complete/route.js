import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { generateCertificatePDF } from "@/lib/certificate-generator"
import { sendCertificateEmail } from "@/lib/email"

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

    // Certificates only for APPROVED (paid/accepted) enrollments
    if (enrollment.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Your enrollment is not approved yet. Certificates are only issued for approved enrollments." },
        { status: 403 }
      )
    }

    // Get total videos in course
    const totalVideos = enrollment.course._count.videos

    if (totalVideos === 0) {
      return NextResponse.json({ error: "Course has no videos" }, { status: 400 })
    }

    // Simple check: Get count of completed videos
    const completedVideoCount = await prisma.videoProgress.count({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    })

    // Check if all videos are completed
    if (completedVideoCount < totalVideos) {
      return NextResponse.json({
        completed: false,
        message: `Complete all ${totalVideos} videos to get your certificate.`,
        completedVideos: completedVideoCount,
        totalVideos: totalVideos,
      })
    }

    // If the course has a final quiz, the student must pass it before the
    // certificate is issued
    const quiz = await prisma.quiz.findUnique({
      where: { courseId },
      select: {
        id: true,
        passingScore: true,
        _count: { select: { questions: true } },
      },
    })

    if (quiz && quiz._count.questions > 0) {
      const passedAttempt = await prisma.quizAttempt.findFirst({
        where: { quizId: quiz.id, studentId: user.id, passed: true },
        select: { id: true },
      })

      if (!passedAttempt) {
        return NextResponse.json({
          completed: false,
          quizRequired: true,
          message: `All videos completed! Pass the final quiz (${quiz.passingScore}% or higher) to earn your certificate.`,
          completedVideos: completedVideoCount,
          totalVideos: totalVideos,
        })
      }
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

    // Create certificate record first to get the ID
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
            email: true,
          },
        },
      },
    })

    // Generate certificate PDF and upload to R2
    let fileKey = null

    try {
      fileKey = await generateCertificatePDF({
        studentName: user.name || user.email,
        fallbackStudentName: user.email,
        courseTitle: enrollment.course.title,
        certificateId: certificate.id,
        issuedAt: certificate.issuedAt,
      })

      console.log(`[Certificate] Generated PDF and uploaded to R2: ${fileKey}`)
    } catch (error) {
      console.error("[Certificate] Error generating PDF:", error)
      // Continue with certificate creation even if PDF generation fails
    }

    // Store the R2 file key (never a presigned URL - those expire after
    // 7 days at most). Download links are minted on-demand from the key.
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        certificateUrl: fileKey,
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
            email: true,
          },
        },
      },
    })

    // Send certificate email (non-blocking)
    // Link to our own download endpoint instead of a presigned R2 URL:
    // presigned URLs expire (7-day hard limit), this link works forever
    // and regenerates the PDF on-demand if the file is ever missing.
    if (user.email) {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      sendCertificateEmail({
        to: user.email,
        studentName: user.name || user.email,
        courseTitle: enrollment.course.title,
        certificateUrl: `${baseUrl}/api/certificates/${certificate.id}/download`,
        dashboardUrl: `${baseUrl}/student/certificates`,
      }).catch((error) => {
        console.error("[Certificate] Error sending email:", error)
        // Don't fail the request if email fails
      })
    }

    // Invalidate cache
    revalidateTag(`student-${user.id}`)

    console.log(`[Certificate] Created certificate for user ${user.email} for course ${enrollment.course.title}`)

    return NextResponse.json({
      completed: true,
      certificate: updatedCertificate,
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

