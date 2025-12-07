import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

async function getDeliveries(studentId) {
  return await prisma.delivery.findMany({
    where: {
      enrollment: {
        studentId: studentId,
      },
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      district: true,
      postalCode: true,
      country: true,
      status: true,
      trackingNumber: true,
      courier: true,
      createdAt: true,
      shippedAt: true,
      deliveredAt: true,
      enrollment: {
        select: {
          id: true,
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
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Cache deliveries for 60 seconds
    const cachedGetDeliveries = unstable_cache(
      getDeliveries,
      [`student-deliveries-${session.user.id}`],
      {
        revalidate: 60,
        tags: [`deliveries-${session.user.id}`],
      }
    )

    const deliveries = await cachedGetDeliveries(session.user.id)

    return NextResponse.json(deliveries)
  } catch (error) {
    console.error("Error fetching student deliveries:", error)
    
    // Return more specific error messages
    let errorMessage = "Failed to fetch deliveries"
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.name === "PrismaClientKnownRequestError") {
      errorMessage = "Database error occurred. Please try again."
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: error.message || "An unexpected error occurred"
    }, { status: statusCode })
  }
}
