"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Leaf, Zap, Award, BookOpen } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [stats, setStats] = useState({ totalCourses: 0, hoursWatched: 0, completedCourses: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      if (session?.user?.role === "INSTRUCTOR") {
        router.push("/instructor/dashboard")
      } else if (session?.user?.role === "ADMIN") {
        router.push("/instructor/enrollments/pending")
      }
    }
  }, [status, session, router])

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
      setEnrolledCourses(data.enrollments)
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {session?.user?.name}!</h1>
            <p className="text-muted-foreground mt-1">Continue learning and expand your skills</p>
          </div>
          <Link
            href="/courses"
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-md hover:shadow-primary/30 transition"
          >
            Browse Courses
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Enrolled Courses</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.totalCourses}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Learning Hours</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.hoursWatched}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/60 rounded-lg flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-border p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Completed Courses</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.completedCourses}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">My Courses</h2>

          {enrolledCourses.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-primary/5 rounded-2xl shadow-sm border border-primary/20 p-12 text-center">
              <Leaf className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No courses yet</p>
              <p className="text-muted-foreground mb-4">Start your science journey by exploring available courses</p>
              <Link
                href="/courses"
                className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md hover:border-primary/40 transition"
                >
                  {enrollment.course.thumbnail && (
                    <img
                      src={enrollment.course.thumbnail || "/placeholder.svg"}
                      alt={enrollment.course.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-foreground mb-2">{enrollment.course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{enrollment.course.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-muted-foreground font-medium">Progress</span>
                        <span className="text-xs font-bold text-primary">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/courses/${enrollment.course.id}/watch`}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-center text-sm hover:shadow-md transition font-medium"
                      >
                        Continue
                      </Link>
                      <button className="flex-1 px-3 py-2 border-2 border-primary text-primary rounded-lg text-center text-sm hover:bg-primary/5 transition font-medium">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
