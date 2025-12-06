"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Users, CheckCircle, DollarSign, Plus, Edit, Video, TrendingUp } from "lucide-react"

export default function InstructorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    totalEnrollments: 0,
  })
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/instructor/dashboard?instructorId=${session.user.id}`)
      if (!res.ok) throw new Error("Failed to fetch dashboard data")
      const data = await res.json()
      setStats(data.stats)
      setCourses(data.courses)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "blue",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800"
    },
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "emerald",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800"
    },
    {
      label: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: CheckCircle,
      color: "purple",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      label: "Total Earnings",
      value: `Rs. ${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "amber",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome back, {session?.user?.name || "Instructor"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Track your teaching performance and manage your courses
              </p>
            </div>
            <Link
              href="/instructor/courses/create"
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl shadow-sm hover:shadow-md transition-all border ${stat.borderColor} overflow-hidden group`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Courses Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-8 py-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Courses</h2>
              <p className="text-muted-foreground text-sm mt-1">Manage and monitor your course catalog</p>
            </div>
            <Link
              href="/instructor/courses/create"
              className="sm:hidden flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New
            </Link>
          </div>

          <div className="p-8">
            {courses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start your teaching journey by creating your first course and sharing your knowledge with students worldwide
                </p>
                <Link
                  href="/instructor/courses/create"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course._count.enrollments} students
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            {course._count.videos} videos
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          course.published
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between mb-5 p-4 bg-muted rounded-lg border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Course Price</p>
                        <p className="text-lg font-bold text-foreground">Rs. {course.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          Rs. {(course.price * course._count.enrollments).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/instructor/courses/${course.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Course
                      </Link>
                      <Link
                        href={`/instructor/courses/${course.id}/videos`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all"
                      >
                        <Video className="w-4 h-4" />
                        Manage Videos
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}