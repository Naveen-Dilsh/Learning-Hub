"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Award, Download, Calendar, BookOpen, Sparkles } from "lucide-react"
import LoadingBubbles from "@/components/loadingBubbles"
import Link from "next/link"
import Image from "next/image"

export default function Certificates() {
  const { data: session, status: authStatus } = useSession()

  const {
    data: certificateData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["certificates", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { certificates: [] }
      }

      const res = await fetch(`/api/student/certificates?studentId=${session.user.id}`, {
        cache: "no-store",
      })

      if (!res.ok) throw new Error("Failed to fetch certificates")

      return await res.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 60 * 1000, // 1 minute
  })

  const certificates = certificateData?.certificates || []

  // Show loading if query is loading OR if session is not ready yet
  if (isLoading || authStatus === "loading" || !session?.user?.id) {
    return <LoadingBubbles />
  }

  const handleDownload = (certificateId) => {
    window.open(`/api/certificates/${certificateId}/download`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          My Certificates
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {certificates.length > 0
            ? `You've earned ${certificates.length} ${certificates.length === 1 ? "certificate" : "certificates"}`
            : "Complete courses to earn certificates"}
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Error loading certificates: {error?.message || "Failed to load certificates. Please try again."}
            </p>
          </div>
        )}

        {certificates.length === 0 ? (
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 sm:p-12 lg:p-16 text-center transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              No certificates yet
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">
              Complete courses to earn certificates and showcase your achievements
            </p>
            <Link
              href="/student/courses"
              className="btn-primary inline-block px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base active:scale-[0.98]"
            >
              View My Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="group relative bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Certificate Preview Card - Visual Design */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 via-blue-100 to-white overflow-hidden">
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(25,118,210,0.1),transparent_50%)]" />
                  </div>

                  {/* Border Design */}
                  <div className="absolute inset-4 border-4 border-primary/30 rounded-lg" />
                  <div className="absolute inset-6 border-2 border-primary/20 rounded-lg" />

                  {/* Corner Decorations */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-lg" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-lg" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />

                  {/* Certificate Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                    {/* Award Icon */}
                    <div className="mb-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg mb-3">
                        <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                    </div>

                    {/* Certificate Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 line-clamp-2 px-4">
                      CERTIFICATE
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">of Completion</p>

                    {/* Student Name */}
                    <p className="text-sm sm:text-base font-semibold text-foreground mb-2 line-clamp-1 px-4">
                      {session?.user?.name || session?.user?.email || "Student"}
                    </p>

                    {/* Course Title */}
                    <p className="text-xs sm:text-sm text-primary font-medium line-clamp-2 px-4 mb-3">
                      {cert.course?.title || "Course Certificate"}
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Thumbnail (if available) - Small overlay */}
                {cert.course?.thumbnail && (
                  <div className="absolute top-2 right-2 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-white shadow-md opacity-80 group-hover:opacity-100 transition-opacity">
                    <Image
                      src={cert.course.thumbnail}
                      alt={cert.course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Bottom Info Section */}
                <div className="p-4 sm:p-6 bg-card border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-1 mb-1">
                        {cert.course?.title || "Course Certificate"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(cert.id)}
                    className="btn-primary flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold active:scale-[0.98] group/btn"
                  >
                    <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
                    <span>Download PDF</span>
                  </button>
                </div>

                {/* Sparkle Effect on Hover */}
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
