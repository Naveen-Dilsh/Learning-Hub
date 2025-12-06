import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    let studentNumber = null
    if (role === "STUDENT" || !role) {
      // Get the highest student number
      const lastStudent = await prisma.user.findFirst({
        where: { studentNumber: { not: null } },
        orderBy: { studentNumber: "desc" },
        select: { studentNumber: true },
      })

      // Start from 200, increment by 5
      studentNumber = lastStudent?.studentNumber ? lastStudent.studentNumber + 5 : 200
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT",
        studentNumber,
      },
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          studentNumber: user.studentNumber,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
