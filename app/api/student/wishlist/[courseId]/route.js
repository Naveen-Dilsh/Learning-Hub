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

    const { courseId } = params

    const wishlistItem = await prisma.wishlist.delete({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId,
        },
      },
    })

    return NextResponse.json({ message: "Removed from wishlist", wishlistItem })
  } catch (error) {
    console.error("[v0] Error removing from wishlist:", error)
    return NextResponse.json({ message: "Item not found" }, { status: 404 })
  }
}
