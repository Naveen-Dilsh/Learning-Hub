"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useMemo, useCallback, memo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Search, BookOpen, Users, Video } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"

// Memoized Course Card Component
const CourseCard = memo(({ course }) => (
  <div className="group bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    {/* Course Thumbnail */}
    <div className="relative h-40 sm:h-48 bg-muted overflow-hidden">
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-card px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md border border-border backdrop-blur-sm">
        <span className="text-xs sm:text-sm font-bold text-primary">
          Rs. {course.price}
        </span>
      </div>
    </div>

    {/* Course Content */}
    <div className="p-4 sm:p-5">
      <h3 className="font-bold text-base sm:text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
        {course.title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
        {course.description}
      </p>

      {/* Course Meta */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs font-medium truncate">{course.instructor.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs font-medium">{course._count.videos} videos</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Link
          href={`/student/browse-course/${course.id}`}
          className="btn-primary block w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-center active:scale-[0.98]"
        >
          View Details
        </Link>
        <Link
          href={`/student/browse-course/${course.id}/purchase`}
          className="btn-outline block w-full px-3 py-2 rounded-lg text-xs font-semibold text-center active:scale-[0.98]"
        >
          Enroll Now
        </Link>
      </div>
    </div>
  </div>
))

CourseCard.displayName = 'CourseCard'

export default function CourseBrowser() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses", "published"],
    queryFn: async () => {
      const res = await fetch("/api/courses?published=true", {
        cache: "no-store",
      })
      
      if (!res.ok) throw new Error("Failed to fetch courses")
      
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
    staleTime: 30 * 1000, // 30 seconds
  })

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        course.published &&
        (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [searchTerm, courses])

  const clearSearch = useCallback(() => setSearchTerm(""), [])

  if (isLoading) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Hero Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          Browse Courses
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5">
          Discover and enroll in courses to expand your skills
        </p>
      </div>

      {/* Search Section */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground transition-all text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {isError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Error loading courses: {error?.message || "Failed to load courses. Please try again."}
            </p>
          </div>
        )}
        
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-card rounded-xl shadow-sm border border-border">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Try adjusting your search terms or browse all courses
            </p>
            <button
              onClick={clearSearch}
              className="btn-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold active:scale-[0.98] text-sm sm:text-base"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {searchTerm ? `Results for "${searchTerm}"` : "All Courses"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
