import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

// Update delivery status
export async function PATCH(request, { params }) {
  const routeTimer = performanceLogger.startTimer("PATCH /api/instructor/deliveries/[id]")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, trackingNumber, courier, notes } = body

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
      select: {
        id: true,
        status: true,
        shippedAt: true,
        deliveredAt: true,
        enrollment: {
          select: {
            studentId: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })

    if (!delivery) {
      routeTimer.stop()
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

    // Update delivery and create notification in parallel
    const [updatedDelivery] = await Promise.all([
      prisma.delivery.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          status: true,
          trackingNumber: true,
          courier: true,
          notes: true,
          shippedAt: true,
          deliveredAt: true,
          enrollment: {
            select: {
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
      }),
      // Create notification for student if status changed
      status && status !== delivery.status
        ? (async () => {
            let notificationMessage = ""

            switch (status) {
              case "PROCESSING":
                notificationMessage = `Your course materials for "${delivery.enrollment.course.title}" are being prepared for shipping.`
                break
              case "SHIPPED":
                notificationMessage = `Your course materials for "${delivery.enrollment.course.title}" have been shipped!${
                  trackingNumber ? ` Tracking: ${trackingNumber}` : ""
                }`
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
          })()
        : Promise.resolve(null),
    ])

    // Invalidate cache
    revalidateTag(`instructor-deliveries-${session.user.id}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("PATCH", "/api/instructor/deliveries/[id]", totalTime, {
      status: 200,
      dbTime,
      deliveryId: id,
      instructorId: session.user.id,
    })

    return NextResponse.json(updatedDelivery)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error updating delivery:", error)

    performanceLogger.logAPIRoute("PATCH", "/api/instructor/deliveries/[id]", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// Delete delivery
export async function DELETE(request, { params }) {
  const routeTimer = performanceLogger.startTimer("DELETE /api/instructor/deliveries/[id]")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

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
      select: {
        id: true,
        enrollmentId: true,
      },
    })

    if (!delivery) {
      routeTimer.stop()
      return NextResponse.json({ message: "Delivery not found" }, { status: 404 })
    }

    // Update enrollment and delete delivery in parallel
    await Promise.all([
      prisma.enrollment.update({
        where: { id: delivery.enrollmentId },
        data: { requiresDelivery: false },
      }),
      prisma.delivery.delete({
        where: { id },
      }),
    ])

    // Invalidate cache
    revalidateTag(`instructor-deliveries-${session.user.id}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("DELETE", "/api/instructor/deliveries/[id]", totalTime, {
      status: 200,
      dbTime,
      deliveryId: id,
      instructorId: session.user.id,
    })

    return NextResponse.json({ message: "Delivery deleted successfully" })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error deleting delivery:", error)

    performanceLogger.logAPIRoute("DELETE", "/api/instructor/deliveries/[id]", totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
