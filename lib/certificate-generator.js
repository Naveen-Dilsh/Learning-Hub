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
 * Generate a professional certificate PDF and upload to R2
 * @param {Object} options - Certificate generation options
 * @param {string} options.studentName - Name of the student
 * @param {string} options.courseTitle - Title of the course
 * @param {string} options.certificateId - Unique certificate ID
 * @param {Date} options.issuedAt - Date when certificate was issued
 * @param {string} options.instructorName - Name of the instructor (optional)
 * @param {string} options.organizationName - Name of organization (optional, defaults to "E-Pencil")
 * @returns {Promise<string>} - R2 file key (URL path)
 */
export async function generateCertificatePDF({
  studentName,
  courseTitle,
  certificateId,
  issuedAt,
  instructorName = "Course Instructor",
  organizationName = "E-Pencil",
}) {
  try {
    // Create a new PDF document (landscape A4: 842 x 595 points)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([842, 595])

    // Load fonts
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const width = page.getWidth()
    const height = page.getHeight()

    // === ELEGANT BACKGROUND ===
    // Cream/off-white background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.98, 0.97, 0.95), // Warm cream color
    })

    // Subtle accent bars at top and bottom
    page.drawRectangle({
      x: 0,
      y: height - 30,
      width: width,
      height: 30,
      color: rgb(0.15, 0.25, 0.45), // Deep navy blue
    })

    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 30,
      color: rgb(0.15, 0.25, 0.45),
    })

    // Gold accent line on top of navy bars
    page.drawRectangle({
      x: 0,
      y: height - 32,
      width: width,
      height: 2,
      color: rgb(0.83, 0.69, 0.22), // Gold
    })

    page.drawRectangle({
      x: 0,
      y: 30,
      width: width,
      height: 2,
      color: rgb(0.83, 0.69, 0.22),
    })

    // === MAIN BORDER ===
    // Outer gold border
    page.drawRectangle({
      x: 50,
      y: 50,
      width: width - 100,
      height: height - 100,
      borderColor: rgb(0.83, 0.69, 0.22),
      borderWidth: 3,
    })

    // Inner navy border
    page.drawRectangle({
      x: 56,
      y: 56,
      width: width - 112,
      height: height - 112,
      borderColor: rgb(0.15, 0.25, 0.45),
      borderWidth: 1.5,
    })

    // === DECORATIVE CORNER FLOURISHES ===
    const cornerSize = 40
    const cornerColor = rgb(0.83, 0.69, 0.22)
    
    // Top-left corner
    for (let i = 0; i < 3; i++) {
      const offset = i * 3
      page.drawLine({
        start: { x: 60 + offset, y: height - 60 },
        end: { x: 60 + cornerSize, y: height - 60 },
        color: cornerColor,
        thickness: 0.5,
      })
      page.drawLine({
        start: { x: 60, y: height - 60 - offset },
        end: { x: 60, y: height - 60 - cornerSize },
        color: cornerColor,
        thickness: 0.5,
      })
    }

    // Top-right corner
    for (let i = 0; i < 3; i++) {
      const offset = i * 3
      page.drawLine({
        start: { x: width - 60 - offset, y: height - 60 },
        end: { x: width - 60 - cornerSize, y: height - 60 },
        color: cornerColor,
        thickness: 0.5,
      })
      page.drawLine({
        start: { x: width - 60, y: height - 60 - offset },
        end: { x: width - 60, y: height - 60 - cornerSize },
        color: cornerColor,
        thickness: 0.5,
      })
    }

    // Bottom-left corner
    for (let i = 0; i < 3; i++) {
      const offset = i * 3
      page.drawLine({
        start: { x: 60 + offset, y: 60 },
        end: { x: 60 + cornerSize, y: 60 },
        color: cornerColor,
        thickness: 0.5,
      })
      page.drawLine({
        start: { x: 60, y: 60 + offset },
        end: { x: 60, y: 60 + cornerSize },
        color: cornerColor,
        thickness: 0.5,
      })
    }

    // Bottom-right corner
    for (let i = 0; i < 3; i++) {
      const offset = i * 3
      page.drawLine({
        start: { x: width - 60 - offset, y: 60 },
        end: { x: width - 60 - cornerSize, y: 60 },
        color: cornerColor,
        thickness: 0.5,
      })
      page.drawLine({
        start: { x: width - 60, y: 60 + offset },
        end: { x: width - 60, y: 60 + cornerSize },
        color: cornerColor,
        thickness: 0.5,
      })
    }

    // === ORGANIZATION NAME (TOP) ===
    const orgNameSize = 16
    const orgNameWidth = timesBoldFont.widthOfTextAtSize(organizationName, orgNameSize)
    page.drawText(organizationName, {
      x: (width - orgNameWidth) / 2,
      y: height - 80,
      size: orgNameSize,
      font: timesBoldFont,
      color: rgb(0.15, 0.25, 0.45),
    })

    // === CERTIFICATE OF ACHIEVEMENT ===
    const titleSize = 52
    const titleText = "Certificate"
    const titleWidth = timesBoldFont.widthOfTextAtSize(titleText, titleSize)
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 140,
      size: titleSize,
      font: timesBoldFont,
      color: rgb(0.15, 0.25, 0.45),
    })

    // Subtitle with decorative lines
    const subtitleSize = 18
    const subtitleText = "OF ACHIEVEMENT"
    const subtitleWidth = timesFont.widthOfTextAtSize(subtitleText, subtitleSize)
    const subtitleX = (width - subtitleWidth) / 2
    const subtitleY = height - 170

    // Decorative lines around subtitle
    const lineLength = 60
    page.drawLine({
      start: { x: subtitleX - lineLength - 15, y: subtitleY + 8 },
      end: { x: subtitleX - 15, y: subtitleY + 8 },
      color: rgb(0.83, 0.69, 0.22),
      thickness: 1.5,
    })
    page.drawLine({
      start: { x: subtitleX + subtitleWidth + 15, y: subtitleY + 8 },
      end: { x: subtitleX + subtitleWidth + lineLength + 15, y: subtitleY + 8 },
      color: rgb(0.83, 0.69, 0.22),
      thickness: 1.5,
    })

    page.drawText(subtitleText, {
      x: subtitleX,
      y: subtitleY,
      size: subtitleSize,
      font: timesFont,
      color: rgb(0.83, 0.69, 0.22),
    })

    // === PRESENTED TO TEXT ===
    const presentedSize = 14
    const presentedText = "This certificate is proudly presented to"
    const presentedWidth = timesItalicFont.widthOfTextAtSize(presentedText, presentedSize)
    page.drawText(presentedText, {
      x: (width - presentedWidth) / 2,
      y: height - 230,
      size: presentedSize,
      font: timesItalicFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    // === STUDENT NAME (FEATURED) ===
    const maxNameWidth = width - 200
    let nameSize = 42
    let nameWidth = timesBoldFont.widthOfTextAtSize(studentName, nameSize)
    
    // Auto-adjust name size if too long
    if (nameWidth > maxNameWidth) {
      nameSize = Math.max(28, (maxNameWidth / nameWidth) * 42)
      nameWidth = timesBoldFont.widthOfTextAtSize(studentName, nameSize)
    }

    const nameX = (width - nameWidth) / 2
    const nameY = height - 280

    // Underline for name (elegant)
    page.drawLine({
      start: { x: nameX - 20, y: nameY - 8 },
      end: { x: nameX + nameWidth + 20, y: nameY - 8 },
      color: rgb(0.83, 0.69, 0.22),
      thickness: 2,
    })

    page.drawText(studentName, {
      x: nameX,
      y: nameY,
      size: nameSize,
      font: timesBoldFont,
      color: rgb(0.15, 0.25, 0.45),
    })

    // === RECOGNITION TEXT ===
    const recognitionSize = 13
    const recognitionText = "For outstanding performance and successful completion of"
    const recognitionWidth = timesItalicFont.widthOfTextAtSize(recognitionText, recognitionSize)
    page.drawText(recognitionText, {
      x: (width - recognitionWidth) / 2,
      y: height - 330,
      size: recognitionSize,
      font: timesItalicFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    // === COURSE TITLE ===
    const maxCourseWidth = width - 200
    let courseSize = 26
    let courseWidth = timesBoldFont.widthOfTextAtSize(courseTitle, courseSize)
    
    if (courseWidth > maxCourseWidth) {
      courseSize = Math.max(20, (maxCourseWidth / courseWidth) * 26)
      courseWidth = timesBoldFont.widthOfTextAtSize(courseTitle, courseSize)
    }

    page.drawText(courseTitle, {
      x: (width - courseWidth) / 2,
      y: height - 365,
      size: courseSize,
      font: timesBoldFont,
      color: rgb(0.15, 0.25, 0.45),
    })

    // === DATE ===
    const dateStr = new Date(issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // === SIGNATURE SECTION ===
    const sigY = 150
    const sigLineWidth = 180

    // Date on left
    const dateLabel = "Date"
    const dateLabelWidth = helveticaFont.widthOfTextAtSize(dateLabel, 10)
    const dateWidth = helveticaFont.widthOfTextAtSize(dateStr, 11)
    const dateX = 150

    page.drawLine({
      start: { x: dateX, y: sigY },
      end: { x: dateX + sigLineWidth, y: sigY },
      color: rgb(0.3, 0.3, 0.3),
      thickness: 1,
    })

    page.drawText(dateStr, {
      x: dateX + (sigLineWidth - dateWidth) / 2,
      y: sigY + 8,
      size: 11,
      font: helveticaFont,
      color: rgb(0.15, 0.25, 0.45),
    })

    page.drawText(dateLabel, {
      x: dateX + (sigLineWidth - dateLabelWidth) / 2,
      y: sigY - 15,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    // Instructor signature on right
    const instructorLabelText = "Instructor"
    const instructorLabelWidth = helveticaFont.widthOfTextAtSize(instructorLabelText, 10)
    const instructorNameWidth = timesItalicFont.widthOfTextAtSize(instructorName, 12)
    const instructorX = width - 150 - sigLineWidth

    page.drawLine({
      start: { x: instructorX, y: sigY },
      end: { x: instructorX + sigLineWidth, y: sigY },
      color: rgb(0.3, 0.3, 0.3),
      thickness: 1,
    })

    page.drawText(instructorName, {
      x: instructorX + (sigLineWidth - instructorNameWidth) / 2,
      y: sigY + 8,
      size: 12,
      font: timesItalicFont,
      color: rgb(0.15, 0.25, 0.45),
    })

    page.drawText(instructorLabelText, {
      x: instructorX + (sigLineWidth - instructorLabelWidth) / 2,
      y: sigY - 15,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    // === DECORATIVE SEAL/BADGE (Left side) ===
    const sealCenterX = 120
    const sealCenterY = sigY + 70
    const sealRadius = 35

    // Outer circle (gold)
    page.drawCircle({
      x: sealCenterX,
      y: sealCenterY,
      size: sealRadius,
      borderColor: rgb(0.83, 0.69, 0.22),
      borderWidth: 3,
    })

    // Inner circle (navy)
    page.drawCircle({
      x: sealCenterX,
      y: sealCenterY,
      size: sealRadius - 8,
      borderColor: rgb(0.15, 0.25, 0.45),
      borderWidth: 1.5,
    })

    // Star pattern in center (simulated with lines)
    const starSize = 18
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 * Math.PI) / 180 - Math.PI / 2
      const x1 = sealCenterX + Math.cos(angle) * starSize
      const y1 = sealCenterY + Math.sin(angle) * starSize
      const angle2 = ((i + 2) * 144 * Math.PI) / 180 - Math.PI / 2
      const x2 = sealCenterX + Math.cos(angle2) * starSize
      const y2 = sealCenterY + Math.sin(angle2) * starSize
      
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        color: rgb(0.83, 0.69, 0.22),
        thickness: 2,
      })
    }

    // === CERTIFICATE ID (Bottom, small) ===
    const certIdText = `Certificate No. ${certificateId}`
    const certIdWidth = helveticaFont.widthOfTextAtSize(certIdText, 9)
    page.drawText(certIdText, {
      x: (width - certIdWidth) / 2,
      y: 70,
      size: 9,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    })

    // Verification URL/text
    const verifyText = "Verify this certificate at your organization's website"
    const verifyWidth = helveticaFont.widthOfTextAtSize(verifyText, 8)
    page.drawText(verifyText, {
      x: (width - verifyWidth) / 2,
      y: 55,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    })

    // === GENERATE AND UPLOAD ===
    const pdfBytes = await pdfDoc.save()
    const fileKey = `certificates/${certificateId}.pdf`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: pdfBytes,
      ContentType: "application/pdf",
    })

    await S3.send(command)

    console.log(`[Certificate] Generated professional PDF and uploaded to R2: ${fileKey}`)
    return fileKey
  } catch (error) {
    console.error("[Certificate] Error generating PDF:", error)
    throw error
  }
}