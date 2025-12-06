import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// Update delivery status
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { id } = params
    const { status, trackingNumber, courier, notes } = await request.json()

    // Check if delivery exists and belongs to instructor's course
    const delivery = await prisma.delivery.findFirst({
      where: {
        id,
        enrollment: {
          course: {
            instructorId: session.user.id,
          },
        },
      },
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
    })

    if (!delivery) {
      return NextResponse.json({ message: "Delivery not found" }, { status: 404 })
    }

    // Update delivery
    const updateData = {}

    if (status) {
      updateData.status = status

      // Set timestamps based on status
      if (status === "SHIPPED" && !delivery.shippedAt) {
        updateData.shippedAt = new Date()
      } else if (status === "DELIVERED" && !delivery.deliveredAt) {
        updateData.deliveredAt = new Date()
      }
    }

    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (courier !== undefined) updateData.courier = courier
    if (notes !== undefined) updateData.notes = notes

    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
      include: {
        enrollment: {
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
              },
            },
          },
        },
      },
    })

    // Create notification for student if status changed
    if (status && status !== delivery.status) {
      let notificationMessage = ""

      switch (status) {
        case "PROCESSING":
          notificationMessage = `Your course materials for "${delivery.enrollment.course.title}" are being prepared for shipping.`
          break
        case "SHIPPED":
          notificationMessage = `Your course materials for "${delivery.enrollment.course.title}" have been shipped!${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}`
          break
        case "DELIVERED":
          notificationMessage = `Your course materials for "${delivery.enrollment.course.title}" have been marked as delivered.`
          break
      }

      if (notificationMessage) {
        await prisma.notification.create({
          data: {
            studentId: delivery.enrollment.studentId,
            title: `Delivery ${status.charAt(0) + status.slice(1).toLowerCase()}`,
            message: notificationMessage,
            type: "info",
          },
        })
      }
    }

    return NextResponse.json(updatedDelivery)
  } catch (error) {
    console.error("Error updating delivery:", error)
    console.error("Error name:", error.name)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    console.error("Error updating delivery:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Delete delivery
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Check if delivery exists and belongs to instructor's course
    const delivery = await prisma.delivery.findFirst({
      where: {
        id,
        enrollment: {
          course: {
            instructorId: session.user.id,
          },
        },
      },
    })

    if (!delivery) {
      return NextResponse.json({ message: "Delivery not found" }, { status: 404 })
    }

    // Update enrollment to not require delivery
    await prisma.enrollment.update({
      where: { id: delivery.enrollmentId },
      data: { requiresDelivery: false },
    })

    // Delete delivery
    await prisma.delivery.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Delivery deleted successfully" })
  } catch (error) {
    console.error("Error deleting delivery:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
