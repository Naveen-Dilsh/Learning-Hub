import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const notification = await prisma.notification.delete({
      where: {
        id: id,
        studentId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Notification deleted", notification })
  } catch (error) {
    console.error("[v0] Error deleting notification:", error)
    return NextResponse.json({ message: "Notification not found" }, { status: 404 })
  }
}
