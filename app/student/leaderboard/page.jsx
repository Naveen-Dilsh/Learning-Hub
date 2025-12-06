"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserRank, setCurrentUserRank] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard")
      const data = await res.json()
      
      if (res.ok) {
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
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <Award className="w-5 h-5 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/student"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-blue-600" />
            Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">
            Top learners ranked by credits earned
          </p>
        </div>

        {/* Current User Stats */}
        {currentUserRank && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Your Rank</p>
                <p className="text-4xl font-bold">#{currentUserRank.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Total Credits</p>
                <p className="text-4xl font-bold">{currentUserRank.credits}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Courses
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      user.email === session?.user?.email
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(user.rank)}
                        <span className="font-bold text-lg text-gray-900">
                          {user.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || "Anonymous"}
                            {user.email === session?.user?.email && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        {user.credits}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-gray-600 font-medium">
                        {user.coursesEnrolled}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No users on the leaderboard yet.</p>
              <p className="text-sm mt-2">
                Complete video lessons to earn credits and appear here!
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>How to earn credits:</strong> Complete video lessons to earn
            10 credits per video. The more you learn, the higher you rank!
          </p>
        </div>
      </div>
    </div>
  )
}
