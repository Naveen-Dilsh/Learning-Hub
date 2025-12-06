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

    const wishlist = await prisma.wishlist.findMany({
      where: { studentId: session.user.id },
      include: {
        course: { include: { instructor: { select: { name: true } } } },
      },
      orderBy: { addedAt: "desc" },
    })

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("[v0] Error fetching wishlist:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ message: "Course ID is required" }, { status: 400 })
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ message: "Course already in wishlist" }, { status: 409 })
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
      },
      include: {
        course: { include: { instructor: { select: { name: true } } } },
      },
    })

    return NextResponse.json(wishlistItem)
  } catch (error) {
    console.error("[v0] Error adding to wishlist:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
