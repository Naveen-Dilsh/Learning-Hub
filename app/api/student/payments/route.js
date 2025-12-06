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

    const payments = await prisma.payment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: { select: { title: true, thumbnail: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("[v0] Error fetching payments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
