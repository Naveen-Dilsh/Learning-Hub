import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const {
      courseId,
      receiptImage,
      requiresDelivery,
    } = await request.json()

    if (!courseId || !receiptImage) {
      return NextResponse.json({ 
        message: "Missing required fields",
        details: !courseId ? "Course ID is required" : "Receipt image is required"
      }, { status: 400 })
    }

    // Parallel queries for better performance
    const [user, course, existingEnrollment] = await Promise.all([
      // Fetch user profile only if delivery is required
      requiresDelivery ? prisma.user.findUnique({
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
        },
      }) : Promise.resolve(null),
      
      // Fetch course
      prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          title: true,
          price: true,
          instructorId: true,
        },
      }),
      
      // Check existing enrollment
      prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: courseId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      }),
    ])

    // Validate delivery address if required
    if (requiresDelivery) {
      if (!user || !user.phone || !user.addressLine1 || !user.city || !user.district) {
        return NextResponse.json(
          {
            message: "Please update your delivery address in Settings before requesting materials",
            code: "MISSING_ADDRESS",
          },
          { status: 400 },
        )
      }
    }

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check existing enrollment status
    if (existingEnrollment) {
      if (existingEnrollment.status === "APPROVED") {
        return NextResponse.json({ 
          message: "Already enrolled in this course",
          code: "ALREADY_ENROLLED"
        }, { status: 400 })
      }
      if (existingEnrollment.status === "PENDING") {
        return NextResponse.json({ 
          message: "You already have a pending enrollment request",
          code: "PENDING_EXISTS"
        }, { status: 400 })
      }
    }

    // Use transaction for atomic operations (enrollment and payment only)
    const enrollment = await prisma.$transaction(async (tx) => {
      // Create enrollment
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId: session.user.id,
          courseId: courseId,
          status: "PENDING",
          paymentMethod: "manual",
          receiptImage: receiptImage,
          requiresDelivery: requiresDelivery || false,
          // Create delivery record if required
          ...(requiresDelivery && user && {
            delivery: {
              create: {
                fullName: user.name,
                phone: user.phone,
                email: user.email,
                addressLine1: user.addressLine1,
                addressLine2: user.addressLine2 || null,
                city: user.city,
                district: user.district,
                postalCode: user.postalCode || null,
                status: "PENDING",
              },
            },
          }),
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentNumber: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              instructorId: true,
            },
          },
          delivery: true,
        },
      })

      // Create payment record
      await tx.payment.create({
        data: {
          studentId: session.user.id,
          courseId: courseId,
          amount: course.price,
          currency: "LKR",
          status: "PENDING",
          paymentMethod: "manual_atm",
          enrollmentId: newEnrollment.id,
        },
      })

      return newEnrollment
    }, {
      timeout: 10000, // 10 second timeout
    })

    // Create notification for instructor OUTSIDE transaction
    // This prevents transaction errors from affecting enrollment creation
    if (course.instructorId && enrollment.student && enrollment.course) {
      try {
        await prisma.notification.create({
          data: {
            studentId: course.instructorId, // This is the instructor's userId
            title: "New Manual Enrollment Request",
            message: `${enrollment.student.name}${enrollment.student.studentNumber ? ` (Student #${enrollment.student.studentNumber})` : ''} has requested enrollment for "${course.title}" with payment receipt.${requiresDelivery ? " Delivery address provided." : ""}`,
            type: "info",
          },
        })
      } catch (notificationError) {
        // Log error but don't fail the enrollment
        console.error("Failed to create notification (non-critical):", notificationError)
      }
    }

    // Invalidate relevant caches
    revalidatePath("/api/student/enrollments")
    revalidatePath("/api/user/profile")

    return NextResponse.json(
      {
        message: "Enrollment request submitted successfully. Waiting for instructor approval.",
        enrollment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Manual enrollment request error:", error)
    
    // Handle Prisma errors
    if (error.code === "P2002") {
      const field = Array.isArray(error.meta?.target) ? error.meta.target[0] : error.meta?.target || "field"
      const model = error.meta?.model || "Model"
      
      return NextResponse.json({ 
        message: `Invalid Prisma.${model.toLowerCase()}.create() invocation:\n\nUnique constraint failed on the fields: (${field})`,
        error: error.message,
        code: "UNIQUE_CONSTRAINT_VIOLATION",
        field: field,
        model: model,
        prismaCode: error.code
      }, { status: 400 })
    }
    
    if (error.code === "P2003") {
      const field = error.meta?.field_name || "field"
      return NextResponse.json({ 
        message: `Invalid Prisma.${error.meta?.model || 'Model'}.create() invocation: Foreign key constraint failed on the field "${field}"`,
        error: error.message,
        code: "FOREIGN_KEY_CONSTRAINT_VIOLATION",
        field: field
      }, { status: 400 })
    }
    
    // Return more specific error messages
    let errorMessage = "Internal server error"
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.name === "PrismaClientKnownRequestError") {
      errorMessage = `Database error: ${error.message || "An unexpected database error occurred"}`
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: error.message || "An unexpected error occurred",
      code: error.code || "UNKNOWN_ERROR"
    }, { status: statusCode })
  }
}
