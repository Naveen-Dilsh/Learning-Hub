import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

async function getLeaderboardData(limit) {
  // Get top users by credits
  const leaderboard = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      credits: {
        gt: 0,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      credits: true,
      image: true,
      _count: {
        select: {
          enrollments: {
            where: {
              status: "APPROVED",
            },
          },
        },
      },
    },
    orderBy: {
      credits: "desc",
    },
    take: limit,
  })

  // Add rank
  return leaderboard.map((user, index) => ({
    ...user,
    rank: index + 1,
    coursesEnrolled: user._count.enrollments,
  }))
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    // Cache leaderboard for 60 seconds
    const cachedGetLeaderboard = unstable_cache(
      getLeaderboardData,
      [`leaderboard-${limit}`],
      {
        revalidate: 60,
        tags: ["leaderboard"],
      }
    )

    const leaderboardWithRank = await cachedGetLeaderboard(limit)

    return NextResponse.json({ leaderboard: leaderboardWithRank })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    
    // Return more specific error messages
    let errorMessage = "Failed to fetch leaderboard"
    let statusCode = 500
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.name === "PrismaClientKnownRequestError") {
      errorMessage = "Database error occurred. Please try again."
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      message: error.message || "An unexpected error occurred"
    }, { status: statusCode })
  }
}
