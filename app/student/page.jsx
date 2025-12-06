"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { BookOpen, Zap, Award } from "lucide-react"
import { useDashboard } from "@/lib/hooks"
import LoadingBubbles from "@/components/loadingBubbles"


export default function StudentDashboard() {
  const { data: session } = useSession()
  const { setActiveTab } = useDashboard()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [stats, setStats] = useState({ totalCourses: 0, hoursWatched: 0, completedCourses: 0, certificates: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveTab("dashboard")
  }, [setActiveTab])

  useEffect(() => {
    if (session?.user?.id) {
      fetchEnrolledCourses()
    }
  }, [session])

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch(`/api/student/enrollments?studentId=${session.user.id}`)
      if (!res.ok) throw new Error("Failed to fetch enrollments")
      const data = await res.json()
      setEnrolledCourses(data.enrollments.slice(0, 3))
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingBubbles/>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Continue learning and expand your skills
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">Enrolled Courses</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{stats.totalCourses}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">Learning Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{stats.hoursWatched}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-secondary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">Completed Courses</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{stats.completedCourses}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-chart-4/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-chart-4" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">Certificates Earned</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{stats.certificates}</p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-chart-5/10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 text-chart-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent Courses</h2>
          <Link 
            href="/student/courses" 
            className="text-primary hover:text-primary/80 font-medium text-sm sm:text-base transition"
          >
            View All
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-card rounded-xl shadow-sm border border-border p-8 sm:p-12 text-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2 text-sm sm:text-base">No courses yet</p>
            <p className="text-muted-foreground mb-4 text-xs sm:text-sm">Start learning by enrolling in courses</p>
            <Link
              href="/courses"
              className="btn-primary inline-block px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base active:scale-[0.98]"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {enrolledCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition"
              >
                {enrollment.course.thumbnail && (
                  <img
                    src={enrollment.course.thumbnail || "/placeholder.svg"}
                    alt={enrollment.course.title}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 line-clamp-1">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">
                    {enrollment.course.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground font-medium">Progress</span>
                      <span className="text-xs font-bold text-primary">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <Link
                    href={`/courses/${enrollment.course.id}/watch`}
                    className="btn-primary block w-full px-3 py-2 rounded-lg text-center text-xs sm:text-sm font-medium active:scale-[0.98]"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
