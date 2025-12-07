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
  const routeTimer = performanceLogger.startTimer('POST /api/courses')
  const dbTimer = performanceLogger.startTimer('DB Queries')

  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, price, thumbnail } = await request.json()

    // Validate input
    if (!title || !description || price === undefined) {
      routeTimer.stop()
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (title.trim().length < 3) {
      routeTimer.stop()
      return NextResponse.json({ message: "Title must be at least 3 characters" }, { status: 400 })
    }

    if (description.trim().length < 10) {
      routeTimer.stop()
      return NextResponse.json({ message: "Description must be at least 10 characters" }, { status: 400 })
    }

    if (Number.parseFloat(price) < 0) {
      routeTimer.stop()
      return NextResponse.json({ message: "Price must be a positive number" }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: Number.parseFloat(price),
        thumbnail: thumbnail?.trim() || null,
        instructorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        thumbnail: true,
        instructorId: true,
        createdAt: true,
      },
    })

    // Invalidate courses cache
    revalidateTag('courses')

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute('POST', '/api/courses', totalTime, {
      status: 201,
      dbTime,
      instructorId: session.user.id,
      courseId: course.id,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error creating course:", error)

    performanceLogger.logAPIRoute('POST', '/api/courses', totalTime, {
      status: 500,
      dbTime,
      error: error.message,
    })

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
