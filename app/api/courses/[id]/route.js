import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache, revalidateTag } from "next/cache"

// Cached function for public course details
const getCachedCourse = unstable_cache(
  async (courseId) => {
    return await prisma.course.findUnique({
      where: { id: courseId },
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
        videos: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            isFree: true,
            order: true,
            cloudflareStreamId: true,
          },
          orderBy: { order: "asc" }
        },
        _count: { 
          select: { 
            enrollments: true, 
            reviews: true 
          } 
        },
      },
    })
  },
  ['course-detail'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['courses'],
  }
)

export async function GET(request, { params }) {
  try {
    // Use cache for course details
    const course = await getCachedCourse(params.id)

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    
    // Return more specific error messages
    let errorMessage = "Failed to fetch course"
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

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { title, description, price, thumbnail, published } = await request.json()

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number.parseFloat(price) }),
        ...(thumbnail && { thumbnail }),
        ...(published !== undefined && { published }),
      },
    })

    // Invalidate cache
    revalidateTag('courses')

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
    })

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 })
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.course.delete({
      where: { id: params.id },
    })

    // Invalidate cache
    revalidateTag('courses')

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
