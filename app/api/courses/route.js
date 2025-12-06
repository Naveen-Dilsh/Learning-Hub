import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache, revalidateTag } from "next/cache"
import { performanceLogger } from "@/lib/performance-logger"

// Cached function to fetch published courses
const getCachedCourses = unstable_cache(
  async (where) => {
    return await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        thumbnail: true,
        published: true,
        createdAt: true,
        instructor: { 
          select: { 
            id: true, 
            name: true 
          } 
        },
        _count: { 
          select: { 
            enrollments: true, 
            videos: true 
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    })
  },
  ['courses-list'],
  {
    revalidate: 120, // Cache for 2 minutes
    tags: ['courses'],
  }
)

export async function GET(request) {
  const routeTimer = performanceLogger.startTimer('GET /api/courses')
  const dbTimer = performanceLogger.startTimer('DB Queries')
  
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")
    const published = searchParams.get("published")

    const where = {}
    if (instructorId) where.instructorId = instructorId
    if (published !== null) where.published = published === "true"

    // Use cache for published courses (public view)
    let courses
    if (published === "true" && !instructorId) {
      courses = await getCachedCourses(where)
    } else {
      // No cache for instructor-specific or admin views
      courses = await prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          thumbnail: true,
          published: true,
          createdAt: true,
          instructor: { 
            select: { 
              id: true, 
              name: true,
              email: true 
            } 
          },
          _count: { 
            select: { 
              enrollments: true, 
              videos: true 
            } 
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute('GET', '/api/courses', totalTime, {
      status: 200,
      dbTime,
      cached: published === "true" && !instructorId,
      count: courses.length,
    })

    return NextResponse.json(courses)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching courses:", error)
    
    performanceLogger.logAPIRoute('GET', '/api/courses', totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, price, thumbnail } = await request.json()

    if (!title || !description || price === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: Number.parseFloat(price),
        thumbnail,
        instructorId: session.user.id,
      },
    })

    // Invalidate courses cache
    revalidateTag('courses')

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
