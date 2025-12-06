"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Users, BookOpen, CheckCircle, DollarSign, TrendingUp, Eye } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchAdminData()
    }
  }, [session])

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard")
      if (!res.ok) throw new Error("Failed to fetch admin data")
      const data = await res.json()
      setStats(data.stats)
      setUsers(data.users)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-border overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
            </motion.div>
          ))}
        </div>

        {/* Users Management */}
        <div className="bg-card rounded-2xl shadow-sm border-2 border-border overflow-hidden">
          <div className="px-8 py-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">Recent Users</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage platform users and roles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b-2 border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{user.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          user.role === "ADMIN"
                            ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                            : user.role === "INSTRUCTOR"
                              ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                              : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
