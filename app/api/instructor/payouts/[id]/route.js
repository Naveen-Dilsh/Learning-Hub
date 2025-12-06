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

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
    })

    if (!payout) {
      return NextResponse.json({ message: "Payout not found" }, { status: 404 })
    }

    if (payout.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { status } = await request.json()

    const updatedPayout = await prisma.payout.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === "PROCESSING" && { processedAt: new Date() }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
      },
    })

    return NextResponse.json(updatedPayout)
  } catch (error) {
    console.error("Error updating payout:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
    })

    if (!payout) {
      return NextResponse.json({ message: "Payout not found" }, { status: 404 })
    }

    if (payout.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    if (payout.status !== "PENDING") {
      return NextResponse.json({ message: "Cannot delete non-pending payout" }, { status: 400 })
    }

    await prisma.payout.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Payout cancelled successfully" })
  } catch (error) {
    console.error("Error deleting payout:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
