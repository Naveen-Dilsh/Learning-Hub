import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request) {
  const routeTimer = performanceLogger.startTimer('POST /api/auth/register')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const { name, email, password, role } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      routeTimer.stop()
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      routeTimer.stop()
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 8) {
      routeTimer.stop()
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user already exists (optimized query - only select email)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { email: true },
    })

    if (existingUser) {
      const totalTime = routeTimer.stop()
      performanceLogger.logAPIRoute('POST', '/api/auth/register', totalTime, {
        status: 400,
        error: 'Email already registered',
      })
      return NextResponse.json({ message: "Email already registered" }, { status: 400 })
    }

    // Hash password and get student number in parallel
    const [hashedPassword, lastStudent] = await Promise.all([
      bcrypt.hash(password, 10),
      role === "STUDENT" || !role
        ? prisma.user.findFirst({
            where: { studentNumber: { not: null } },
            orderBy: { studentNumber: "desc" },
            select: { studentNumber: true },
          })
        : Promise.resolve(null),
    ])

    // Calculate student number
    let studentNumber = null
    if (role === "STUDENT" || !role) {
      studentNumber = lastStudent?.studentNumber ? lastStudent.studentNumber + 5 : 200
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || "STUDENT",
        studentNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentNumber: true,
      },
    })

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute('POST', '/api/auth/register', totalTime, {
      status: 201,
      dbTime,
      userId: user.id,
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field"
      performanceLogger.logAPIRoute('POST', '/api/auth/register', totalTime, {
        status: 400,
        dbTime,
        error: `Unique constraint failed on ${field}`,
      })
      return NextResponse.json(
        { message: `This ${field} is already registered` },
        { status: 400 },
      )
    }

    console.error("Registration error:", error)
    
    performanceLogger.logAPIRoute('POST', '/api/auth/register', totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    )
  }
}
