import nodemailer from "nodemailer"

/**
 * Create a nodemailer transporter using Gmail SMTP
 * @returns {Promise<nodemailer.Transporter>}
 */
function createTransporter() {
  // Check if email credentials are configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[Email] Gmail credentials not configured. Email sending will be disabled.")
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  })
}

/**
 * Send certificate email to student
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.studentName - Name of the student
 * @param {string} options.courseTitle - Title of the course
 * @param {string} options.certificateUrl - URL to download the certificate
 * @returns {Promise<void>}
 */
export async function sendCertificateEmail({
  to,
  studentName,
  courseTitle,
  certificateUrl,
}) {
  const transporter = createTransporter()

  if (!transporter) {
    console.warn("[Email] Email transporter not available. Skipping email send.")
    return
  }

  try {
    const mailOptions = {
      from: `"SmartLearn LMS" <${process.env.GMAIL_USER}>`,
      to,
      subject: `🎓 Certificate of Completion - ${courseTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #1976D2;
                margin: 0;
                font-size: 28px;
              }
              .content {
                margin-bottom: 30px;
              }
              .content p {
                margin-bottom: 15px;
                font-size: 16px;
              }
              .highlight {
                color: #1976D2;
                font-weight: bold;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #1976D2;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
              }
              .button:hover {
                background-color: #1565C0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                text-align: center;
                color: #757575;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Congratulations!</h1>
              </div>
              <div class="content">
                <p>Dear <span class="highlight">${studentName}</span>,</p>
                <p>We are thrilled to inform you that you have successfully completed the course:</p>
                <p style="text-align: center; font-size: 20px; font-weight: bold; color: #1976D2; margin: 20px 0;">
                  ${courseTitle}
                </p>
                <p>Your dedication and hard work have paid off! You can now download your certificate of completion.</p>
                <div style="text-align: center;">
                  <a href="${certificateUrl}" class="button">Download Certificate</a>
                </div>
                <p style="font-size: 14px; color: #757575; margin-top: 20px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${certificateUrl}" style="color: #1976D2; word-break: break-all;">${certificateUrl}</a>
                </p>
              </div>
              <div class="footer">
                <p>Best regards,<br><strong>SmartLearn LMS Team</strong></p>
                <p style="font-size: 12px; margin-top: 10px;">
                  This is an automated email. Please do not reply to this message.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Congratulations ${studentName}!
        
        You have successfully completed the course: ${courseTitle}
        
        Download your certificate: ${certificateUrl}
        
        Best regards,
        SmartLearn LMS Team
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("[Email] Certificate email sent successfully:", info.messageId)
  } catch (error) {
    console.error("[Email] Error sending certificate email:", error)
    // Don't throw - email failure shouldn't break certificate generation
  }
}

