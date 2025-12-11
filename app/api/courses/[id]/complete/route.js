import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { generateCertificatePDF } from "@/lib/certificate-generator"
import { sendCertificateEmail } from "@/lib/email"
import { getDownloadUrl } from "@/lib/r2"

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
    let certificateUrl = null
    let fileKey = null

    try {
      fileKey = await generateCertificatePDF({
        studentName: user.name || user.email,
        courseTitle: enrollment.course.title,
        certificateId: certificate.id,
        issuedAt: certificate.issuedAt,
      })

      console.log(`[Certificate] Generated PDF and uploaded to R2: ${fileKey}`)

      // Generate presigned download URL (valid for 1 year)
      try {
        certificateUrl = await getDownloadUrl(fileKey, 31536000, `Certificate-${enrollment.course.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`)
        console.log(`[Certificate] Generated presigned URL for certificate ${certificate.id}`)
      } catch (urlError) {
        console.error("[Certificate] Error generating presigned URL (non-fatal):", urlError)
        // Continue with fileKey - we can generate URL on-demand
      }
    } catch (error) {
      console.error("[Certificate] Error generating PDF:", error)
      // Continue with certificate creation even if PDF generation fails
    }

    // Update certificate with URL/file key
    // Always store fileKey if available, even if presigned URL generation failed
    // This allows us to generate a new presigned URL on-demand
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        certificateUrl: fileKey || certificateUrl, // Prefer fileKey over presigned URL (presigned URLs expire)
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
    // Generate a fresh presigned URL for the email (if fileKey exists)
    let emailCertificateUrl = certificateUrl
    if (!emailCertificateUrl && fileKey) {
      try {
        emailCertificateUrl = await getDownloadUrl(fileKey, 31536000, `Certificate-${enrollment.course.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`)
      } catch (error) {
        console.error("[Certificate] Error generating email URL:", error)
      }
    }

    if (emailCertificateUrl && user.email) {
      sendCertificateEmail({
        to: user.email,
        studentName: user.name || user.email,
        courseTitle: enrollment.course.title,
        certificateUrl: emailCertificateUrl,
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

