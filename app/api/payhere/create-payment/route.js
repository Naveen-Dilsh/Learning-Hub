import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generatePayHereHash, formatPayHereAmount } from "@/lib/payhere"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { courseId, requiresDelivery } = await request.json()

    if (!courseId) {
      return NextResponse.json({ message: "Course ID is required" }, { status: 400 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
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

    if (requiresDelivery) {
      if (!user.phone || !user.addressLine1 || !user.city || !user.district) {
        return NextResponse.json(
          {
            message: "Please update your delivery address in Settings before ordering materials",
            code: "MISSING_ADDRESS",
          },
          { status: 400 },
        )
      }
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment?.status === "APPROVED") {
      return NextResponse.json({ message: "Already enrolled in this course" }, { status: 400 })
    }

    let enrollment = existingEnrollment
    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          studentId: session.user.id,
          courseId: courseId,
          status: "PENDING",
          paymentMethod: "online",
          requiresDelivery: requiresDelivery || false, // Save delivery requirement
        },
      })
    } else {
      enrollment = await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { requiresDelivery: requiresDelivery || false },
      })
    }

    // Create payment record
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const currency = "LKR"

    const payment = await prisma.payment.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
        amount: course.price,
        currency: currency,
        status: "PENDING",
        payHereOrderId: orderId,
        paymentMethod: "online",
        enrollmentId: enrollment.id,
      },
    })

    const merchantId = process.env.PAYHERE_MERCHANT_ID
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
    // Format amount with 2 decimal places as required by PayHere
    const formattedAmount = formatPayHereAmount(course.price)

    const hash = generatePayHereHash(merchantId, orderId, course.price, currency, merchantSecret)

    const isSandbox = process.env.PAYHERE_SANDBOX_MODE === "true"

    // Prepare PayHere redirect data
    const payHereData = {
      sandbox: isSandbox,
      merchant_id: merchantId,
      return_url: `${process.env.NEXTAUTH_URL}/payment/success?order_id=${orderId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${courseId}?payment=cancelled`,
      notify_url: `${process.env.NEXTAUTH_URL}/api/payhere/notify`,
      order_id: orderId,
      items: course.title,
      amount: formattedAmount,
      currency: currency,
      first_name: user.name?.split(" ")[0] || "Student",
      last_name: user.name?.split(" ")[1] || "",
      email: user.email,
      phone: user.phone || "0000000000", // Use user's phone if available
      address: user.addressLine1 || "N/A", // Use user's address if available
      city: user.city || "N/A", // Use user's city if available
      country: user.country || "Sri Lanka",
      hash: hash,
    }

    return NextResponse.json({
      paymentId: payment.id,
      orderId: orderId,
      payHereData: payHereData,
      sandbox: isSandbox,
      payHereUrl: isSandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout",
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
