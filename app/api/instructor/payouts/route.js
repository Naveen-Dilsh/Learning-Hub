import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const payouts = await prisma.payout.findMany({
      where: { instructorId: session.user.id },
      orderBy: { requestedAt: "desc" },
    })

    return NextResponse.json(payouts)
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { amount, paymentMethod, accountNumber, accountHolder } = await request.json()

    if (!amount || !paymentMethod) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const payout = await prisma.payout.create({
      data: {
        instructorId: session.user.id,
        amount: Number.parseFloat(amount),
        paymentMethod,
        accountNumber,
        accountHolder,
        status: "PENDING",
      },
    })

    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error("Error creating payout:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
