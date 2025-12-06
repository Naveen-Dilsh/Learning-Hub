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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, image: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, image } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        ...(image && { image }),
      },
      select: { id: true, email: true, name: true, image: true, updatedAt: true },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
