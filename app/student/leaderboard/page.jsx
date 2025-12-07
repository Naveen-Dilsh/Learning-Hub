"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import LoadingBubbles from "@/components/loadingBubbles"
import { Trophy, Medal, Award, TrendingUp, ArrowLeft, Star, Users } from 'lucide-react'

// Rank icon component
const RankIcon = ({ rank }) => {
  if (rank === 1) return <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-chart-5" />
  if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
  if (rank === 3) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-chart-5" />
  return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
}

// User avatar component
const UserAvatar = ({ user, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }
  const sizeClass = sizeClasses[size] || sizeClasses.md

  if (user.image) {
    return (
      <div className={`relative ${sizeClass.split(' ')[0]} ${sizeClass.split(' ')[1]} rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0`}>
        <Image
          src={user.image}
          alt={user.name || "User"}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 border-2 border-primary/20`}>
      {user.name?.[0]?.toUpperCase() || "?"}
    </div>
  )
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserRank, setCurrentUserRank] = useState(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard", {
        next: { revalidate: 60 }
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch leaderboard")
      }

      const data = await res.json()
      
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard)
        
        // Find current user's rank
        const userEntry = data.leaderboard.find(
          (entry) => entry.email === session?.user?.email
        )
        if (userEntry) {
          setCurrentUserRank(userEntry)
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Loading Leaderboard",
        description: error.message || "Failed to load leaderboard. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email, toast])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Memoized top 3
  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard])
  
  // Memoized rest of leaderboard
  const restOfLeaderboard = useMemo(() => leaderboard.slice(3), [leaderboard])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingBubbles />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/student"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 sm:mb-4 font-medium transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Leaderboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Top learners ranked by credits earned
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Current User Stats */}
        {currentUserRank && (
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-primary-foreground shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-primary-foreground/80 text-xs sm:text-sm mb-1 font-medium">Your Rank</p>
                <p className="text-3xl sm:text-4xl font-bold">#{currentUserRank.rank}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-primary-foreground/80 text-xs sm:text-sm mb-1 font-medium">Total Credits</p>
                <p className="text-3xl sm:text-4xl font-bold">{currentUserRank.credits.toLocaleString()}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-primary-foreground/80 text-xs sm:text-sm mb-1 font-medium">Courses Enrolled</p>
                <p className="text-3xl sm:text-4xl font-bold">{currentUserRank.coursesEnrolled}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium - Desktop */}
        {topThree.length > 0 && (
          <div className="hidden md:grid grid-cols-3 gap-4 mb-6 sm:mb-8">
            {topThree.map((user, index) => {
              const positions = [
                { order: 2, height: "h-32", mt: "mt-8" },
                { order: 1, height: "h-40", mt: "mt-0" },
                { order: 3, height: "h-28", mt: "mt-12" },
              ]
              const pos = positions[index]
              
              return (
                <div
                  key={user.id}
                  className={`${pos.order === 1 ? 'order-2' : pos.order === 2 ? 'order-1' : 'order-3'} ${pos.mt} flex flex-col items-center`}
                >
                  <div className={`${pos.height} w-full bg-card rounded-xl border-2 ${
                    pos.order === 1 ? 'border-chart-5' : pos.order === 2 ? 'border-muted-foreground' : pos.order === 3 ? 'border-chart-5' : 'border-border'
                  } p-4 flex flex-col items-center justify-end shadow-lg`}>
                    <UserAvatar user={user} size="lg" />
                    <p className="font-bold text-foreground mt-3 text-sm sm:text-base truncate w-full text-center">
                      {user.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate w-full text-center mt-1">
                      {user.email}
                    </p>
                    <div className="mt-3 flex items-center gap-1">
                      <Star className="w-4 h-4 text-chart-5 fill-chart-5" />
                      <span className="font-bold text-foreground text-lg">{user.credits.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <RankIcon rank={user.rank} />
                    <span className="text-2xl font-bold text-foreground">#{user.rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="hidden md:table w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                    Courses
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      user.email === session?.user?.email
                        ? "bg-primary/5 border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RankIcon rank={user.rank} />
                        <span className="font-bold text-base sm:text-lg text-foreground">
                          {user.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {user.name || "Anonymous"}
                            {user.email === session?.user?.email && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-chart-5/10 text-chart-5 border border-chart-5/20">
                        <Star className="w-3.5 h-3.5 fill-chart-5" />
                        {user.credits.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                        <Users className="w-4 h-4" />
                        {user.coursesEnrolled}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {leaderboard.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 ${
                    user.email === session?.user?.email
                      ? "bg-primary/5 border-l-4 border-l-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      <RankIcon rank={user.rank} />
                      <span className="font-bold text-lg text-foreground">#{user.rank}</span>
                    </div>
                    <UserAvatar user={user} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user.name || "Anonymous"}
                        {user.email === session?.user?.email && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-chart-5 fill-chart-5" />
                      <span className="font-bold text-foreground">{user.credits.toLocaleString()} Credits</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{user.coursesEnrolled} Courses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 px-4">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-foreground font-medium mb-2">No users on the leaderboard yet.</p>
              <p className="text-sm text-muted-foreground">
                Complete video lessons to earn credits and appear here!
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-foreground font-semibold mb-1">How to earn credits</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Complete video lessons to earn 10 credits per video. The more you learn, the higher you rank!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
