import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all stats
    const totalUsers = await prisma.user.count()
    const totalCourses = await prisma.course.count()
    const totalEnrollments = await prisma.enrollment.count()

    const payments = await prisma.payment.findMany({
      where: { status: "COMPLETED" },
    })

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

    // Get recent users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const stats = {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
    }

    return NextResponse.json({
      stats,
      users,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
