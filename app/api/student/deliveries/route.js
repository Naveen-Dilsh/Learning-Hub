import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        enrollment: {
          studentId: session.user.id,
        },
      },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(deliveries)
  } catch (error) {
    console.error("Error fetching student deliveries:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
