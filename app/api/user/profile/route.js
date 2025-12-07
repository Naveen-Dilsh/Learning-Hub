import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache"

async function getUserProfile(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      studentNumber: true,
      credits: true,
      role: true,
      createdAt: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      district: true,
      postalCode: true,
      country: true,
    },
  })
}

export async function GET() {
  const routeTimer = performanceLogger.startTimer("GET /api/user/profile")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Cache user profile for 120 seconds
    const cachedGetUserProfile = unstable_cache(
      getUserProfile,
      [`user-profile-${session.user.id}`],
      {
        revalidate: 120,
        tags: [`user-profile-${session.user.id}`],
      }
    )

    const user = await cachedGetUserProfile(session.user.id)

    if (!user) {
      routeTimer.stop()
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/user/profile", totalTime, {
      status: 200,
      dbTime,
      userId: session.user.id,
    })

    return NextResponse.json(user)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("[Profile] Error fetching user:", error)
    
    let errorMessage = "Failed to fetch profile"
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.name === "PrismaClientKnownRequestError") {
      errorMessage = "Database error occurred. Please try again."
    }

    performanceLogger.logAPIRoute("GET", "/api/user/profile", totalTime, {
      status: statusCode,
      dbTime,
      error: error.message,
    })
    
    return NextResponse.json({ 
      message: errorMessage,
      error: error.message || "An unexpected error occurred"
    }, { status: statusCode })
  }
}

export async function PATCH(request) {
  const routeTimer = performanceLogger.startTimer("PATCH /api/user/profile")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, image, phone, addressLine1, addressLine2, city, district, postalCode, country } = body

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
        ...(phone !== undefined && { phone }),
        ...(addressLine1 !== undefined && { addressLine1 }),
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country !== undefined && { country }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        studentNumber: true,
        credits: true,
        role: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        district: true,
        postalCode: true,
        country: true,
      },
    })

    // Invalidate cache
    revalidatePath("/api/user/profile")
    revalidateTag(`user-profile-${session.user.id}`)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("PATCH", "/api/user/profile", totalTime, {
      status: 200,
      dbTime,
      userId: session.user.id,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0
    console.error("[Profile] Error updating user:", error)
    
    // Handle Prisma errors
    if (error.code === "P2002") {
      const field = Array.isArray(error.meta?.target) ? error.meta.target[0] : error.meta?.target || "field"
      const model = error.meta?.model || "Model"
      
      performanceLogger.logAPIRoute("PATCH", "/api/user/profile", totalTime, {
        status: 400,
        dbTime,
        error: error.message,
        code: error.code,
      })

      return NextResponse.json({ 
        message: `Invalid Prisma.${model.toLowerCase()}.update() invocation:\n\nUnique constraint failed on the fields: (${field})`,
        error: error.message,
        code: "UNIQUE_CONSTRAINT_VIOLATION",
        field: field,
        model: model,
        prismaCode: error.code
      }, { status: 400 })
    }
    
    let errorMessage = "Failed to update profile"
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.name === "PrismaClientKnownRequestError") {
      errorMessage = "Database error occurred. Please try again."
    }

    performanceLogger.logAPIRoute("PATCH", "/api/user/profile", totalTime, {
      status: statusCode,
      dbTime,
      error: error.message,
    })
    
    return NextResponse.json({ 
      message: errorMessage,
      error: error.message || "An unexpected error occurred"
    }, { status: statusCode })
  }
}
