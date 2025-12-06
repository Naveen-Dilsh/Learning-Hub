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

    const certificates = await prisma.certificate.findMany({
      where: { studentId: session.user.id },
      include: {
        course: { select: { title: true, thumbnail: true } },
        student: { select: { name: true } },
      },
      orderBy: { completedAt: "desc" },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error("[v0] Error fetching certificates:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
