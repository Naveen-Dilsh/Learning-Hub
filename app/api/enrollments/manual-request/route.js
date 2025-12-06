import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

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
      console.log("Number 111111")
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Fetch user profile to get delivery address if required
    let user = null
    if (requiresDelivery) {
      user = await prisma.user.findUnique({
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
      })

      if (!user || !user.phone || !user.addressLine1 || !user.city || !user.district) {
        console.log("Number 222222")
        return NextResponse.json(
          {
            message: "Please update your delivery address in Settings before requesting materials",
          },
          { status: 400 },
        )
      }
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled (approved)
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment) {
      if (existingEnrollment.status === "APPROVED") {
        console.log("Number 333")
        return NextResponse.json({ message: "Already enrolled in this course" }, { status: 400 })
      }
      if (existingEnrollment.status === "PENDING") {
        console.log("Number 444")
        return NextResponse.json({ message: "You already have a pending enrollment request" }, { status: 400 })
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
        status: "PENDING",
        paymentMethod: "manual",
        receiptImage: receiptImage,
        requiresDelivery: requiresDelivery || false,
        // Create delivery record if required using user profile data
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

    await prisma.payment.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
        amount: course.price,
        currency: "LKR",
        status: "PENDING",
        paymentMethod: "manual_atm",
        enrollmentId: enrollment.id,
      },
    })

    await prisma.notification.create({
      data: {
        studentId: enrollment.course.instructorId,
        title: "New Manual Enrollment Request",
        message: `${enrollment.student.name} (Student #${enrollment.student.studentNumber}) has requested enrollment for "${enrollment.course.title}" with payment receipt.${requiresDelivery ? " Delivery address provided." : ""}`,
        type: "info",
      },
    })

    return NextResponse.json(
      {
        message: "Enrollment request submitted successfully. Waiting for instructor approval.",
        enrollment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Manual enrollment request error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
