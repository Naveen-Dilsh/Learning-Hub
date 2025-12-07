"use client"

import { useEffect, useState, useCallback, useMemo, memo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import LoadingBubbles from "@/components/loadingBubbles"
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  DollarSign,
  Calendar,
  User,
  GraduationCap,
  CreditCard,
  Eye,
} from "lucide-react"

export default function InstructorStudents() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState({ totalStudents: 0, totalEnrollments: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "INSTRUCTOR" && session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchStudents()
    }
  }, [session])

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/instructor/students", {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to fetch students")
      const data = await res.json()
      setStudents(data.students || [])
      setStats(data.stats || { totalStudents: 0, totalEnrollments: 0 })
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students

    const query = searchQuery.toLowerCase()
    return students.filter(
      (student) =>
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.studentNumber?.toString().includes(query) ||
        student.phone?.includes(query) ||
        student.city?.toLowerCase().includes(query) ||
        student.district?.toLowerCase().includes(query)
    )
  }, [students, searchQuery])

  const handleViewDetails = useCallback((student) => {
    setSelectedStudent(student)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedStudent(null)
  }, [])

  if (authStatus === "loading" || loading) {
    return <LoadingBubbles />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-border">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  All Students
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Manage and view all student details
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="bg-muted px-3 sm:px-4 py-2 rounded-lg border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">Total Students</div>
                <div className="text-lg sm:text-xl font-bold text-foreground">{stats.totalStudents}</div>
              </div>
              <div className="bg-muted px-3 sm:px-4 py-2 rounded-lg border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">Total Enrollments</div>
                <div className="text-lg sm:text-xl font-bold text-foreground">
                  {stats.totalEnrollments}
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, student number, phone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-input rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-8 sm:p-12 text-center">
            <Users className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              {searchQuery ? "No students found" : "No students yet"}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : "Students will appear here once they enroll in your courses"}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                      Student Number
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <span className="text-sm sm:text-base font-medium text-foreground">
                            {student.name || "Anonymous"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs sm:text-sm font-medium">
                          <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                          #{student.studentNumber || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm sm:text-base text-foreground">
                            {student.phone || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="btn-primary inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium active:scale-[0.98]"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-200 border border-border">
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 sm:px-8 py-5 sm:py-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center border border-border">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                        {selectedStudent.name || "Anonymous"}
                      </h2>
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Student #{selectedStudent.studentNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-muted-foreground hover:text-foreground transition-colors text-2xl sm:text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Contact Information
                  </h3>
                  <div className="space-y-3 bg-muted rounded-xl p-4 sm:p-5 border border-border">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-sm sm:text-base text-foreground">{selectedStudent.email}</p>
                      </div>
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Phone</p>
                          <p className="text-sm sm:text-base text-foreground">
                            {selectedStudent.phone}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Address</p>
                        <p className="text-sm sm:text-base text-foreground">
                          {selectedStudent.addressLine1}
                          {selectedStudent.addressLine2 && `, ${selectedStudent.addressLine2}`}
                          <br />
                          {selectedStudent.city}, {selectedStudent.district}
                          {selectedStudent.postalCode && ` ${selectedStudent.postalCode}`}
                          <br />
                          {selectedStudent.country || "Sri Lanka"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Joined</p>
                        <p className="text-sm sm:text-base text-foreground">
                          {new Date(selectedStudent.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-muted rounded-xl p-4 text-center border border-border">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">Enrollments</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {selectedStudent.enrollmentCount}
                      </p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center border border-border">
                      <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-success mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">Payments</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {selectedStudent.paymentCount}
                      </p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center border border-border">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-chart-5 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        Rs. {selectedStudent.totalPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses */}
                {selectedStudent.courses && selectedStudent.courses.length > 0 && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Enrolled Courses ({selectedStudent.courses.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedStudent.courses.map((course) => (
                        <div
                          key={course.id}
                          className="bg-muted rounded-xl p-4 sm:p-5 border border-border"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-foreground flex-1">{course.title}</h4>
                            <span
                              className={`px-2 sm:px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                course.status === "APPROVED"
                                  ? "bg-success/10 text-success"
                                  : course.status === "PENDING"
                                    ? "bg-chart-5/10 text-chart-5"
                                    : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {course.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                            </span>
                            <span className="font-semibold text-foreground">
                              Rs. {course.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

