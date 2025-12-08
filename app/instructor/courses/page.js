"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Plus, Edit, Video, Users, DollarSign, BookOpen, Search, Filter, Calendar } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

export default function InstructorCourses() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all") // all, published, draft

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["instructorCourses", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []
      
      const res = await fetch(`/api/courses?instructorId=${session.user.id}`, {
        cache: "no-store",
      })
      
      if (!res.ok) {
        throw new Error("Failed to fetch courses")
      }
      
      return await res.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 10 * 1000, // 10 seconds
  })

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filter === "all" || 
                           (filter === "published" && course.published) ||
                           (filter === "draft" && !course.published)
      return matchesSearch && matchesFilter
    })
  }, [courses, searchTerm, filter])

  if (status === "loading" || isLoading || !session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Courses</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Manage your course catalog and content
              </p>
            </div>
            <Link
              href="/instructor/courses/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Course
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                >
                  <option value="all">All Courses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm || filter !== "all" ? "No courses found" : "No courses created yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || filter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start your teaching journey by creating your first course"}
            </p>
            {!searchTerm && filter === "all" && (
              <Link
                href="/instructor/courses/create"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredCourses.length} of {courses.length} courses
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* Course Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm ${
                          course.published
                            ? "bg-emerald-500/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3.5rem]">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                      {course.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-foreground">{course._count.videos}</span>
                        <span className="text-xs">videos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-foreground">{course._count.enrollments}</span>
                        <span className="text-xs">students</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xl font-bold text-foreground">
                        Rs. {course.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/instructor/courses/${course.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                      <Link
                        href={`/instructor/courses/${course.id}/videos`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all"
                      >
                        <Video className="w-4 h-4" />
                        Videos
                      </Link>
                      <Link
                        href={`/instructor/courses/${course.id}/live-sessions`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                        Live
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}