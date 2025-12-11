import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 })
    }

    // Find the payment
    const payment = await prisma.payment.findFirst({
      where: {
        payHereOrderId: orderId,
        studentId: session.user.id,
      },
      include: {
        course: true,
        enrollment: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.json({ message: "Payment already completed" })
    }

    // For sandbox testing: automatically mark as completed since PayHere can't reach localhost
    // In production, this would verify with PayHere API
    const isSandbox = process.env.PAYHERE_SANDBOX_MODE === "true"

    if (isSandbox) {
      // Update payment status to COMPLETED
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED" },
      })

      let enrollmentId = null

      // Update or create enrollment with APPROVED status
      if (payment.enrollmentId) {
        await prisma.enrollment.update({
          where: { id: payment.enrollmentId },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
          },
        })
        enrollmentId = payment.enrollmentId
      } else {
        // Check if enrollment already exists
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: session.user.id,
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

          // Link enrollment to payment
          await prisma.payment.update({
            where: { id: payment.id },
            data: { enrollmentId: existingEnrollment.id },
          })
        } else {
          // Create new enrollment
          const newEnrollment = await prisma.enrollment.create({
            data: {
              studentId: session.user.id,
              courseId: payment.courseId,
              status: "APPROVED",
              paymentMethod: "online",
              approvedAt: new Date(),
            },
          })
          enrollmentId = newEnrollment.id

          // Link enrollment to payment
          await prisma.payment.update({
            where: { id: payment.id },
            data: { enrollmentId: newEnrollment.id },
          })
        }
      }

      if (enrollmentId) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
        })

        console.log(`[Verify Payment] Enrollment ${enrollmentId} requiresDelivery:`, enrollment?.requiresDelivery)

        if (enrollment?.requiresDelivery) {
          // Get user's delivery address
          const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
              name: true,
              email: true,
              phone: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              district: true,
              postalCode: true,
              country: true,
            },
          })

          console.log(`[Verify Payment] User address data:`, {
            hasAddress: Boolean(user?.addressLine1 && user?.city && user?.district),
            addressLine1: user?.addressLine1,
            city: user?.city,
            district: user?.district
          })

          // Check if delivery already exists
          const existingDelivery = await prisma.delivery.findUnique({
            where: { enrollmentId: enrollmentId },
          })

          console.log(`[Verify Payment] Existing delivery:`, existingDelivery?.id || 'None')

          if (!existingDelivery && user?.addressLine1 && user?.city && user?.district) {
            const deliveryRecord = await prisma.delivery.create({
              data: {
                enrollmentId: enrollmentId,
                fullName: user.name || "Student",
                phone: user.phone || "",
                email: user.email,
                addressLine1: user.addressLine1,
                addressLine2: user.addressLine2 || null,
                city: user.city,
                district: user.district,
                postalCode: user.postalCode || null,
                country: user.country || "Sri Lanka",
                status: "PENDING",
              },
            })
            console.log(`[Verify Payment] ✅ Delivery created successfully:`, deliveryRecord.id)
          } else if (!existingDelivery) {
            console.log(`[Verify Payment] ❌ Cannot create delivery - missing address fields`)
          }
        }
      }

      // Create notification
      await prisma.notification.create({
        data: {
          studentId: session.user.id,
          title: "Payment Successful",
          message: `Your payment for "${payment.course.title}" was successful! You can now access the course.`,
          type: "success",
        },
      })

      return NextResponse.json({
        success: true,
        message: "Payment verified and enrollment activated successfully!",
        courseId: payment.courseId,
        payment: {
          id: payment.id,
          courseId: payment.courseId,
          course: {
            id: payment.course.id,
            title: payment.course.title,
          },
        },
      })
    }

    // In production, verify with PayHere API
    return NextResponse.json(
      {
        error: "Payment verification pending. Please wait for confirmation.",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
