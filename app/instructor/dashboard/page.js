"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import LoadingBubbles from "@/components/loadingBubbles"
import { BookOpen, Users, CheckCircle, DollarSign, Plus, Edit, Video, TrendingUp } from "lucide-react"

// Memoized Course Card Component
const CourseCard = memo(({ course }) => {
  const totalEarnings = useMemo(
    () => course.price * course._count.enrollments,
    [course.price, course._count.enrollments]
  )

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 hover:shadow-lg transition-all group">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              {course._count.enrollments} students
            </span>
            <span className="flex items-center gap-1">
              <Video className="w-3 h-3 sm:w-4 sm:h-4" />
              {course._count.videos} videos
            </span>
          </div>
        </div>
        <span
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
            course.published
              ? "bg-success/10 text-success border border-success/20"
              : "bg-chart-5/10 text-chart-5 border border-chart-5/20"
          }`}
        >
          {course.published ? "Published" : "Draft"}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {course.description}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 p-3 sm:p-4 bg-muted rounded-lg border border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Course Price</p>
          <p className="text-base sm:text-lg font-bold text-foreground">Rs. {course.price.toLocaleString()}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
          <p className="text-base sm:text-lg font-bold text-success">
            Rs. {totalEarnings.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Link
          href={`/instructor/courses/${course.id}/edit`}
          className="btn-primary flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          Edit Course
        </Link>
        <Link
          href={`/instructor/courses/${course.id}/videos`}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
        >
          <Video className="w-3 h-3 sm:w-4 sm:h-4" />
          Manage Videos
        </Link>
      </div>
    </div>
  )
})

CourseCard.displayName = "CourseCard"

// Memoized Stat Card Component
const StatCard = memo(({ stat }) => (
  <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all border border-border overflow-hidden group">
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-border`}>
          <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.iconColor}`} />
        </div>
      </div>
      <p className="text-muted-foreground text-xs sm:text-sm font-medium mb-1">{stat.label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
    </div>
  </div>
))

StatCard.displayName = "StatCard"

export default function InstructorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["instructorDashboard", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { stats: {}, courses: [] }
      
      const res = await fetch(`/api/instructor/dashboard?instructorId=${session.user.id}`, {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data")
      }
      
      return await res.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 10 * 1000, // 60 seconds
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load dashboard data. Please try again.",
      })
    },
  })

  const stats = useMemo(() => dashboardData?.stats || {
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    totalEnrollments: 0,
  }, [dashboardData])

  const courses = useMemo(() => dashboardData?.courses || [], [dashboardData])

  const statCards = useMemo(
    () => [
      {
        label: "Total Courses",
        value: stats.totalCourses,
        icon: BookOpen,
        bgColor: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        label: "Total Students",
        value: stats.totalStudents,
        icon: Users,
        bgColor: "bg-success/10",
        iconColor: "text-success",
      },
      {
        label: "Total Enrollments",
        value: stats.totalEnrollments,
        icon: CheckCircle,
        bgColor: "bg-secondary/10",
        iconColor: "text-secondary",
      },
      {
        label: "Total Earnings",
        value: `Rs. ${stats.totalEarnings.toLocaleString()}`,
        icon: DollarSign,
        bgColor: "bg-chart-5/10",
        iconColor: "text-chart-5",
      },
    ],
    [stats]
  )

  if (status === "loading" || isLoading || !session?.user?.id) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Welcome back, {session?.user?.name || "Instructor"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span>Track your teaching performance and manage your courses</span>
              </p>
            </div>
            <Link
              href="/instructor/courses/create"
              className="btn-primary hidden sm:flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Course
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {statCards.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Courses Section */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Courses</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">Manage and monitor your course catalog</p>
            </div>
            <Link
              href="/instructor/courses/create"
              className="btn-primary sm:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Course
            </Link>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {courses.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                  Start your teaching journey by creating your first course and sharing your knowledge with students worldwide
                </p>
                <Link
                  href="/instructor/courses/create"
                  className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}