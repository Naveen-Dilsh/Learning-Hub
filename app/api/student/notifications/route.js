import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const notifications = await prisma.notification.findMany({
      where: {
        studentId: session.user.id,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: "desc" },
    })

    const unreadCount = await prisma.notification.count({
      where: {
        studentId: session.user.id,
        read: false,
      },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { notificationIds } = await request.json()

    if (!notificationIds || notificationIds.length === 0) {
      return NextResponse.json({ message: "No notification IDs provided" }, { status: 400 })
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        studentId: session.user.id,
      },
      data: { read: true },
    })

    return NextResponse.json({ message: "Notifications marked as read", updated })
  } catch (error) {
    console.error("[v0] Error updating notifications:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
