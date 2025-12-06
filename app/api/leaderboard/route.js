import prisma from "@/lib/db"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")

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
            enrollments: true,
          },
        },
      },
      orderBy: {
        credits: "desc",
      },
      take: limit,
    })

    // Add rank
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
      coursesEnrolled: user._count.enrollments,
    }))

    return Response.json({ leaderboard: leaderboardWithRank })
  } catch (error) {
    console.error("[v0] Error fetching leaderboard:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
