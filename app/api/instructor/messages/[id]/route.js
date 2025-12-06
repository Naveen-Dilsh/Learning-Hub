import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    })

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 })
    }

    if (message.recipientId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const updatedMessage = await prisma.message.update({
      where: { id: params.id },
      data: { read: true },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    })

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 })
    }

    if (message.senderId !== session.user.id && message.recipientId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.message.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
