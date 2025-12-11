import { prisma } from "@/lib/db"
import { performanceLogger } from "@/lib/performance-logger"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

async function getStudentsData(userRole, userId) {
  let studentIds = []
  let courseIds = []

  if (userRole === "ADMIN") {
    // ADMIN: Get ALL students directly (not filtered by courses)
    // We'll get studentIds from the students query itself
    studentIds = [] // Will be populated from all students
  } else {
    // INSTRUCTOR: Get courses by this instructor
    const instructorCourses = await prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true },
    })
    courseIds = instructorCourses.map((c) => c.id)

    if (courseIds.length === 0) {
      return { students: [], stats: { totalStudents: 0, totalEnrollments: 0 } }
    }

    // Get all unique students enrolled in instructor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      select: {
        studentId: true,
      },
      distinct: ["studentId"],
    })

    studentIds = enrollments.map((e) => e.studentId)

    if (studentIds.length === 0) {
      return { students: [], stats: { totalStudents: 0, totalEnrollments: 0 } }
    }
  }

  // Fetch students first
  const students = await prisma.user.findMany({
    where: userRole === "ADMIN" 
      ? { role: "STUDENT" }
      : {
          id: { in: studentIds },
          role: "STUDENT",
        },
    select: {
      id: true,
      name: true,
      email: true,
      studentNumber: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      district: true,
      postalCode: true,
      country: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Get student IDs from the fetched students
  const fetchedStudentIds = students.map((s) => s.id)

  if (fetchedStudentIds.length === 0) {
    return { students: [], stats: { totalStudents: 0, totalEnrollments: 0 } }
  }

  // Fetch enrollment and payment counts with correct student IDs
  const [enrollmentCounts, paymentCounts] = await Promise.all([
    prisma.enrollment.groupBy({
      by: ["studentId"],
      where: {
        studentId: { in: fetchedStudentIds },
        ...(userRole === "INSTRUCTOR" && courseIds.length > 0 ? { courseId: { in: courseIds } } : {}),
      },
      _count: {
        id: true,
      },
    }),
    prisma.payment.groupBy({
      by: ["studentId"],
      where: {
        studentId: { in: fetchedStudentIds },
        ...(userRole === "INSTRUCTOR" && courseIds.length > 0 ? { courseId: { in: courseIds } } : {}),
        status: "COMPLETED",
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  // Create maps for quick lookup
  const enrollmentMap = new Map(enrollmentCounts.map((e) => [e.studentId, e._count.id]))
  const paymentMap = new Map(
    paymentCounts.map((p) => [
      p.studentId,
      { count: p._count.id, totalAmount: p._sum.amount || 0 },
    ])
  )

  // Get all enrollments with course details in a single query
  const allEnrollments = await prisma.enrollment.findMany({
    where: {
      studentId: { in: fetchedStudentIds },
      ...(userRole === "INSTRUCTOR" && courseIds.length > 0 ? { courseId: { in: courseIds } } : {}),
    },
    select: {
      studentId: true,
      course: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
      status: true,
      enrolledAt: true,
    },
    orderBy: { enrolledAt: "desc" },
  })

  // Group enrollments by studentId
  const coursesMap = new Map()
  allEnrollments.forEach((enrollment) => {
    if (!coursesMap.has(enrollment.studentId)) {
      coursesMap.set(enrollment.studentId, [])
    }
    coursesMap.get(enrollment.studentId).push({
      id: enrollment.course.id,
      title: enrollment.course.title,
      price: enrollment.course.price,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    })
  })

  // Combine all data
  const studentsWithDetails = students.map((student) => ({
    ...student,
    enrollmentCount: enrollmentMap.get(student.id) || 0,
    paymentCount: paymentMap.get(student.id)?.count || 0,
    totalPaid: paymentMap.get(student.id)?.totalAmount || 0,
    courses: coursesMap.get(student.id) || [],
  }))

  // Calculate stats
  // For ADMIN, count all enrollments; for INSTRUCTOR, count only course-specific enrollments
  const totalEnrollments = userRole === "ADMIN"
    ? await prisma.enrollment.count({
        where: {
          studentId: { in: fetchedStudentIds },
        },
      })
    : enrollmentCounts.reduce((sum, e) => sum + e._count.id, 0)

  return {
    students: studentsWithDetails,
    stats: {
      totalStudents: students.length,
      totalEnrollments,
    },
  }
}

export async function GET(request) {
  const routeTimer = performanceLogger.startTimer("GET /api/instructor/students")
  const dbTimer = performanceLogger.startTimer("DB Queries")

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      routeTimer.stop()
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      routeTimer.stop()
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Cache students data for 60 seconds
    const cacheKey = session.user.role === "ADMIN"
      ? "admin-students"
      : `instructor-students-${session.user.id}`
    
    const cachedGetStudentsData = unstable_cache(
      () => getStudentsData(session.user.role, session.user.id),
      [cacheKey],
      {
        revalidate: 60,
        tags: [cacheKey],
      }
    )

    const data = await cachedGetStudentsData()

    const dbTime = dbTimer.stop()
    const totalTime = routeTimer.stop()

    // Log performance
    performanceLogger.logAPIRoute("GET", "/api/instructor/students", totalTime, {
      status: 200,
      dbTime,
      userId: session.user.id,
      userRole: session.user.role,
      studentsCount: data.students.length,
    })

    return NextResponse.json(data)
  } catch (error) {
    const totalTime = routeTimer.stop()
    const dbTime = dbTimer.duration || 0

    console.error("Error fetching students:", error)

    performanceLogger.logAPIRoute("GET", "/api/instructor/students", totalTime, {
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

