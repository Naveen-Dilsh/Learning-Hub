import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

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

/**
 * Generate a certificate PDF and upload to R2
 * @param {Object} options - Certificate generation options
 * @param {string} options.studentName - Name of the student
 * @param {string} options.courseTitle - Title of the course
 * @param {string} options.certificateId - Unique certificate ID
 * @param {Date} options.issuedAt - Date when certificate was issued
 * @returns {Promise<string>} - R2 file key (URL path)
 */
export async function generateCertificatePDF({
  studentName,
  courseTitle,
  certificateId,
  issuedAt,
}) {
  try {
    // Create a new PDF document (landscape A4: 842 x 595 points)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([842, 595]) // Landscape A4

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const width = page.getWidth()
    const height = page.getHeight()

    // Background gradient effect (simulated with rectangles)
    // Top section - light blue
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.89, 0.95, 0.99), // #E3F2FD
    })

    // Middle section - lighter blue
    page.drawRectangle({
      x: 0,
      y: height * 0.3,
      width: width,
      height: height * 0.4,
      color: rgb(0.73, 0.87, 0.98), // #BBDEFB
    })

    // Bottom section - white
    page.drawRectangle({
      x: 0,
      y: height * 0.7,
      width: width,
      height: height * 0.3,
      color: rgb(1, 1, 1), // White
    })

    // Outer decorative border
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: height - 80,
      borderColor: rgb(0.098, 0.463, 0.824), // #1976D2
      borderWidth: 8,
    })

    // Inner decorative border
    page.drawRectangle({
      x: 60,
      y: 60,
      width: width - 120,
      height: height - 120,
      borderColor: rgb(0.392, 0.710, 0.965), // #64B5F6
      borderWidth: 3,
    })

    // Header decorative lines
    page.drawLine({
      start: { x: 120, y: height - 120 },
      end: { x: 320, y: height - 120 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: 2,
    })

    page.drawLine({
      start: { x: 522, y: height - 120 },
      end: { x: 722, y: height - 120 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: 2,
    })

    // Certificate Title
    const titleWidth = helveticaBoldFont.widthOfTextAtSize("CERTIFICATE", 48)
    page.drawText("CERTIFICATE", {
      x: (width - titleWidth) / 2,
      y: height - 140,
      size: 48,
      font: helveticaBoldFont,
      color: rgb(0.082, 0.396, 0.753), // #1565C0
    })

    // Subtitle
    const subtitleWidth = helveticaFont.widthOfTextAtSize("of Completion", 20)
    page.drawText("of Completion", {
      x: (width - subtitleWidth) / 2,
      y: height - 200,
      size: 20,
      font: helveticaFont,
      color: rgb(0.259, 0.259, 0.259), // #424242
    })

    // This certifies text
    const certifiesText = "This is to certify that"
    const certifiesWidth = helveticaFont.widthOfTextAtSize(certifiesText, 16)
    page.drawText(certifiesText, {
      x: (width - certifiesWidth) / 2,
      y: height - 260,
      size: 16,
      font: helveticaFont,
      color: rgb(0.380, 0.380, 0.380), // #616161
    })

    // Student Name (highlighted)
    const nameWidth = helveticaBoldFont.widthOfTextAtSize(studentName, 36)
    const maxNameWidth = width - 200
    let nameSize = 36
    let actualNameWidth = nameWidth

    // Truncate name if too long
    let displayName = studentName
    if (nameWidth > maxNameWidth) {
      // Reduce font size if name is too long
      nameSize = Math.max(24, (maxNameWidth / nameWidth) * 36)
      actualNameWidth = helveticaBoldFont.widthOfTextAtSize(studentName, nameSize)
      if (actualNameWidth > maxNameWidth) {
        // Truncate with ellipsis
        let truncated = studentName
        while (helveticaBoldFont.widthOfTextAtSize(truncated + "...", nameSize) > maxNameWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        displayName = truncated + "..."
        actualNameWidth = helveticaBoldFont.widthOfTextAtSize(displayName, nameSize)
      }
    }

    page.drawText(displayName, {
      x: (width - actualNameWidth) / 2,
      y: height - 300,
      size: nameSize,
      font: helveticaBoldFont,
      color: rgb(0.098, 0.463, 0.824), // #1976D2
    })

    // Has successfully completed text
    const completedText = "has successfully completed the course"
    const completedWidth = helveticaFont.widthOfTextAtSize(completedText, 16)
    page.drawText(completedText, {
      x: (width - completedWidth) / 2,
      y: height - 360,
      size: 16,
      font: helveticaFont,
      color: rgb(0.380, 0.380, 0.380),
    })

    // Course Title
    const courseWidth = helveticaBoldFont.widthOfTextAtSize(courseTitle, 28)
    const maxCourseWidth = width - 200
    let courseSize = 28
    let actualCourseWidth = courseWidth
    let displayCourseTitle = courseTitle

    // Truncate course title if too long
    if (courseWidth > maxCourseWidth) {
      courseSize = Math.max(20, (maxCourseWidth / courseWidth) * 28)
      actualCourseWidth = helveticaBoldFont.widthOfTextAtSize(courseTitle, courseSize)
      if (actualCourseWidth > maxCourseWidth) {
        let truncated = courseTitle
        while (helveticaBoldFont.widthOfTextAtSize(truncated + "...", courseSize) > maxCourseWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        displayCourseTitle = truncated + "..."
        actualCourseWidth = helveticaBoldFont.widthOfTextAtSize(displayCourseTitle, courseSize)
      }
    }

    page.drawText(displayCourseTitle, {
      x: (width - actualCourseWidth) / 2,
      y: height - 390,
      size: courseSize,
      font: helveticaBoldFont,
      color: rgb(0.082, 0.396, 0.753), // #1565C0
    })

    // Date section
    const dateStr = new Date(issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const dateText = `Issued on ${dateStr}`
    const dateWidth = helveticaFont.widthOfTextAtSize(dateText, 14)
    page.drawText(dateText, {
      x: (width - dateWidth) / 2,
      y: 480,
      size: 14,
      font: helveticaFont,
      color: rgb(0.459, 0.459, 0.459), // #757575
    })

    // Certificate ID (small, bottom)
    const certIdText = `Certificate ID: ${certificateId}`
    const certIdWidth = helveticaFont.widthOfTextAtSize(certIdText, 10)
    page.drawText(certIdText, {
      x: (width - certIdWidth) / 2,
      y: 60,
      size: 10,
      font: helveticaFont,
      color: rgb(0.620, 0.620, 0.620), // #9E9E9E
    })

    // Decorative corner elements
    const cornerSize = 20
    const cornerThickness = 2

    // Top-left corner
    page.drawLine({
      start: { x: 80, y: height - 80 },
      end: { x: 100, y: height - 80 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: 100, y: height - 80 },
      end: { x: 100, y: height - 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: 80, y: height - 100 },
      end: { x: 100, y: height - 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })

    // Top-right corner
    page.drawLine({
      start: { x: width - 80, y: height - 80 },
      end: { x: width - 100, y: height - 80 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: width - 100, y: height - 80 },
      end: { x: width - 100, y: height - 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: width - 80, y: height - 100 },
      end: { x: width - 100, y: height - 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })

    // Bottom-left corner
    page.drawLine({
      start: { x: 80, y: 80 },
      end: { x: 100, y: 80 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: 100, y: 80 },
      end: { x: 100, y: 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: 80, y: 100 },
      end: { x: 100, y: 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })

    // Bottom-right corner
    page.drawLine({
      start: { x: width - 80, y: 80 },
      end: { x: width - 100, y: 80 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: width - 100, y: 80 },
      end: { x: width - 100, y: 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })
    page.drawLine({
      start: { x: width - 80, y: 100 },
      end: { x: width - 100, y: 100 },
      color: rgb(0.098, 0.463, 0.824),
      thickness: cornerThickness,
    })

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Generate file key for R2
    const fileKey = `certificates/${certificateId}.pdf`

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: pdfBytes,
      ContentType: "application/pdf",
    })

    await S3.send(command)

    console.log(`[Certificate] Generated PDF and uploaded to R2: ${fileKey}`)
    return fileKey
  } catch (error) {
    console.error("[Certificate] Error generating PDF:", error)
    throw error
  }
}
