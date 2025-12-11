import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { getDownloadUrl } from "@/lib/r2"
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3"
import { generateCertificatePDF } from "@/lib/certificate-generator"

// Initialize S3 client for Cloudflare R2
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "lms-resources"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: certificateId } = await params

    if (!certificateId) {
      return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 })
    }

    // Get certificate
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Verify ownership (student can only download their own certificates)
    if (certificate.studentId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if certificateUrl exists - if not, regenerate the certificate PDF
    if (!certificate.certificateUrl) {
      console.log(`[Certificate] Certificate ${certificateId} has no certificateUrl. Attempting to regenerate PDF...`)
      
      try {
        // Get full certificate data with course and student info
        const fullCertificate = await prisma.certificate.findUnique({
          where: { id: certificateId },
          include: {
            course: {
              select: {
                title: true,
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

        if (!fullCertificate) {
          return NextResponse.json(
            { error: "Certificate not found" },
            { status: 404 }
          )
        }

        // Generate certificate PDF
        const fileKey = await generateCertificatePDF({
          studentName: fullCertificate.student.name || fullCertificate.student.email,
          courseTitle: fullCertificate.course.title,
          certificateId: certificateId,
          issuedAt: fullCertificate.issuedAt,
        })

        // Update certificate with file key
        await prisma.certificate.update({
          where: { id: certificateId },
          data: {
            certificateUrl: fileKey,
          },
        })

        console.log(`[Certificate] Successfully regenerated PDF for certificate ${certificateId}: ${fileKey}`)
        
        // Continue with download using the new file key
        const fileName = `Certificate-${fullCertificate.course.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
        const downloadUrl = await getDownloadUrl(
          fileKey,
          3600, // 1 hour expiry
          fileName
        )
        return NextResponse.redirect(downloadUrl)
      } catch (error) {
        console.error(`[Certificate] Error regenerating certificate PDF:`, error)
        return NextResponse.json(
          { 
            error: "Failed to generate certificate PDF. Please try again or contact support.",
            details: error.message,
            certificateId: certificateId 
          },
          { status: 500 }
        )
      }
    }

    console.log(`[Certificate] Download request for certificate ${certificateId}, certificateUrl: ${certificate.certificateUrl?.substring(0, 100)}...`)

    // If certificateUrl is already a full URL (presigned URL), check if it's still valid
    if (certificate.certificateUrl.startsWith("http")) {
      // Try to redirect, but if it fails, regenerate
      try {
        return NextResponse.redirect(certificate.certificateUrl)
      } catch (error) {
        console.warn(`[Certificate] Presigned URL may be expired, will regenerate: ${error.message}`)
        // Fall through to regenerate
      }
    }

    // If certificateUrl is a file key, generate presigned URL
    // Extract file key (remove any URL parts if it's a full URL)
    let fileKey = certificate.certificateUrl
    if (fileKey.startsWith("http")) {
      // Extract key from URL if it's a full R2 URL
      try {
        const url = new URL(fileKey)
        fileKey = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname
      } catch (e) {
        // If URL parsing fails, use the original value
        console.warn(`[Certificate] Could not parse URL, using as file key: ${fileKey}`)
      }
    }

    // Verify file exists in R2 before generating presigned URL
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      })
      await S3.send(headCommand)
      console.log(`[Certificate] File exists in R2: ${fileKey}`)
    } catch (error) {
      if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
        console.error(`[Certificate] File not found in R2: ${fileKey}`)
        return NextResponse.json(
          { 
            error: "Certificate file not found in storage. The PDF may not have been generated successfully.",
            certificateId: certificateId,
            fileKey: fileKey
          },
          { status: 404 }
        )
      }
      console.warn(`[Certificate] Could not verify file existence (non-fatal): ${error.message}`)
      // Continue anyway - might be a permissions issue
    }

    try {
      const fileName = `Certificate-${certificate.course.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      const downloadUrl = await getDownloadUrl(
        fileKey,
        3600, // 1 hour expiry
        fileName
      )
      console.log(`[Certificate] Generated download URL for certificate ${certificateId}`)
      return NextResponse.redirect(downloadUrl)
    } catch (error) {
      console.error(`[Certificate] Error generating download URL for file key ${fileKey}:`, error)
      return NextResponse.json(
        { 
          error: "Failed to generate certificate download link. The file may not exist in storage.",
          details: error.message,
          fileKey: fileKey
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[Certificate] Error downloading certificate:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

