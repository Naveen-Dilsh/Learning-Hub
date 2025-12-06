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
    
    // Handle Prisma errors with specific constraint violations
    if (error.code === "P2002") {
      // Unique constraint violation
      const target = error.meta?.target
      const field = Array.isArray(target) ? target[0] : target || "field"
      const model = error.meta?.model || "Model"
      
      // Show exact Prisma error message format
      const prismaMessage = `Invalid Prisma.${model.toLowerCase()}.create() invocation:\n\nUnique constraint failed on the fields: (${field})`
      
      return NextResponse.json({ 
        message: prismaMessage,
        error: error.message,
        code: "UNIQUE_CONSTRAINT_VIOLATION",
        field: field,
        fields: target,
        model: model,
        prismaCode: error.code
      }, { status: 400 })
    }
    
    if (error.code === "P2003") {
      // Foreign key constraint violation
      const field = error.meta?.field_name || "field"
      return NextResponse.json({ 
        message: `Invalid Prisma.${error.meta?.model || 'Model'}.create() invocation: Foreign key constraint failed on the field "${field}"`,
        error: error.message,
        code: "FOREIGN_KEY_CONSTRAINT_VIOLATION",
        field: field
      }, { status: 400 })
    }
    
    if (error.code === "P2025") {
      // Record not found
      return NextResponse.json({ 
        message: error.message || "Record not found",
        error: error.message,
        code: "RECORD_NOT_FOUND"
      }, { status: 404 })
    }
    
    // Return more specific error messages
    let errorMessage = "Internal server error"
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.name === "PrismaClientKnownRequestError") {
      errorMessage = `Database error: ${error.message || "An unexpected database error occurred"}`
    } else if (error.name === "ValidationError") {
      errorMessage = error.message || "Validation error"
      statusCode = 400
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: error.message || "An unexpected error occurred",
      code: error.code || "UNKNOWN_ERROR"
    }, { status: statusCode })
  }
}
