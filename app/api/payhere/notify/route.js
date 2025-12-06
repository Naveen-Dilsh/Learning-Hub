import { prisma } from "@/lib/db"
import { verifyPayHereNotification } from "@/lib/payhere"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const formData = await request.formData()

    const merchant_id = formData.get("merchant_id")
    const order_id = formData.get("order_id")
    const payhere_amount = formData.get("payhere_amount")
    const payhere_currency = formData.get("payhere_currency")
    const status_code = formData.get("status_code")
    const md5sig = formData.get("md5sig")
    const payment_id = formData.get("payment_id")
    const method = formData.get("method")
    const status_message = formData.get("status_message")

    console.log("[v0] PayHere notification received:", {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
      method,
    })

    // Verify merchant ID
    if (merchant_id !== process.env.PAYHERE_MERCHANT_ID) {
      console.error("[v0] Invalid merchant ID")
      return NextResponse.json({ message: "Invalid merchant" }, { status: 400 })
    }

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
    const isValidHash = verifyPayHereNotification(
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      merchantSecret,
    )

    if (!isValidHash) {
      console.error("[v0] Invalid PayHere hash - possible tampering detected")
      return NextResponse.json({ message: "Invalid hash" }, { status: 400 })
    }

    console.log("[v0] PayHere hash verified successfully")

    // Find payment with enrollment
    const payment = await prisma.payment.findUnique({
      where: { payHereOrderId: order_id },
      include: {
        student: true,
        course: true,
        enrollment: true, // Include enrollment
      },
    })

    if (!payment) {
      console.error("[v0] Payment not found for order:", order_id)
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    // Status codes: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargedback
    const statusCodeNum = Number.parseInt(status_code)

    if (statusCodeNum === 2) {
      // Payment successful
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          payHerePaymentId: payment_id,
          paymentMethod: method,
        },
      })

      let enrollmentId = payment.enrollmentId

      if (enrollmentId) {
        await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
          },
        })
      } else {
        // Fallback: create enrollment if not linked
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: payment.studentId,
              courseId: payment.courseId,
            },
          },
        })

        if (existingEnrollment) {
          await prisma.enrollment.update({
            where: { id: existingEnrollment.id },
            data: {
              status: "APPROVED",
              approvedAt: new Date(),
            },
          })
          enrollmentId = existingEnrollment.id
        } else {
          const newEnrollment = await prisma.enrollment.create({
            data: {
              studentId: payment.studentId,
              courseId: payment.courseId,
              status: "APPROVED",
              paymentMethod: "online",
              approvedAt: new Date(),
            },
          })
          enrollmentId = newEnrollment.id
        }
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { student: true },
      })

      console.log(`[PayHere Notify] Enrollment ${enrollmentId} requiresDelivery:`, enrollment?.requiresDelivery)

      if (enrollment?.requiresDelivery && enrollment.student) {
        const student = enrollment.student

        console.log(`[PayHere Notify] Student address data:`, {
          hasAddress: Boolean(student.addressLine1 && student.city && student.district),
          addressLine1: student.addressLine1,
          city: student.city,
          district: student.district
        })

        // Check if delivery already exists
        const existingDelivery = await prisma.delivery.findUnique({
          where: { enrollmentId: enrollmentId },
        })

        console.log(`[PayHere Notify] Existing delivery:`, existingDelivery?.id || 'None')

        if (!existingDelivery && student.addressLine1 && student.city && student.district) {
          const deliveryRecord = await prisma.delivery.create({
            data: {
              enrollmentId: enrollmentId,
              fullName: student.name || "Student",
              phone: student.phone || "",
              email: student.email,
              addressLine1: student.addressLine1,
              addressLine2: student.addressLine2 || null,
              city: student.city,
              district: student.district,
              postalCode: student.postalCode || null,
              country: student.country || "Sri Lanka",
              status: "PENDING",
            },
          })
          console.log(`[PayHere Notify] ✅ Delivery created successfully:`, deliveryRecord.id)
        } else if (!existingDelivery) {
          console.log(`[PayHere Notify] ❌ Cannot create delivery - missing address fields`)
        }
      }

      // Create notification for student
      await prisma.notification.create({
        data: {
          studentId: payment.studentId,
          title: "Payment Successful",
          message: `Your payment for "${payment.course.title}" was successful! You can now access the course.`,
          type: "success",
        },
      })

      console.log(`[v0] Payment ${order_id} completed successfully via ${method}`)
    } else if (statusCodeNum === 0) {
      // Payment pending
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PENDING" },
      })
      console.log(`[v0] Payment ${order_id} is pending`)
    } else if (statusCodeNum === -1) {
      // Payment canceled
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "CANCELLED" },
      })

      if (payment.enrollmentId) {
        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: { status: "CANCELLED" },
        })
      }

      console.log(`[v0] Payment ${order_id} was canceled`)
    } else if (statusCodeNum === -2) {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      })
      console.log(`[v0] Payment ${order_id} failed: ${status_message}`)
    } else if (statusCodeNum === -3) {
      // Payment chargedback
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "CHARGEDBACK" },
      })

      if (payment.enrollmentId) {
        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: { status: "CANCELLED" },
        })
      }

      console.log(`[v0] Payment ${order_id} chargedback - enrollment cancelled`)
    }

    return NextResponse.json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("[v0] Error processing PayHere webhook:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
