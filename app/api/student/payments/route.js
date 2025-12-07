import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { performanceLogger } from "@/lib/performance-logger"

async function getPayments(studentId) {
  return await prisma.payment.findMany({
    where: { studentId },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentMethod: true,
      payHereOrderId: true,
      payHerePaymentId: true,
      createdAt: true,
      updatedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function GET(request) {
  const routeTimer = performanceLogger.startTimer('GET /api/student/payments')
  const dbTimer = performanceLogger.startTimer('DB Queries')
  
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Cache payments for 60 seconds
    const cachedGetPayments = unstable_cache(
      getPayments,
      [`student-payments-${session.user.id}`],
      {
        revalidate: 60,
        tags: [`payments-${session.user.id}`],
      }
    )

    const payments = await cachedGetPayments(session.user.id)

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute('GET', '/api/student/payments', totalTime, {
      status: 200,
      dbTime,
      studentId: session.user.id,
      count: payments.length,
    })

    return NextResponse.json(payments)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching payments:", error)
    
    performanceLogger.logAPIRoute('GET', '/api/student/payments', totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })
    
    // Return more specific error messages
    let errorMessage = "Failed to fetch payments"
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
