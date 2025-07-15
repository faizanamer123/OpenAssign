"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Star, Award, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });
import { useAuth } from "@/context/AuthContext"
import { getLeaderboard } from "@/utils/api"

interface LeaderboardUser {
  id: string
  username: string
  points: number
  averageRating: number
  totalRatings: number
  assignmentsSolved: number
  rank: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"points" | "rating">("points")

  useEffect(() => {
    loadLeaderboard()
  }, [sortBy])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboard(sortBy)
      setLeaderboard(data)
    } catch (error) {
      setLeaderboard([])
      console.error("Failed to load leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Logo className="!gap-0" iconSize={12} dotSize={4} textClassName="hidden" />
      case 2:
        return <Logo className="!gap-0 opacity-80" iconSize={12} dotSize={4} textClassName="hidden" />
      case 3:
        return <Logo className="!gap-0 opacity-60" iconSize={12} dotSize={4} textClassName="hidden" />
      default:
        return <span className="text-lg font-bold text-[#9e8747]">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800"
      case 2:
        return "bg-gray-100 text-gray-800"
      case 3:
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (!user) return null

  // Find the current user's stats from the leaderboard
  const currentUserStats = leaderboard.find((u) => u.id === user.id);

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1c180d] mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-[#fac638] inline-block align-middle" aria-label="Leaderboard" />
              Leaderboard
            </h1>
            <p className="text-[#9e8747]">Top contributors in our anonymous assignment solving community</p>
          </div>

          {/* Sort Options */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setSortBy("points")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === "points"
                  ? "bg-[#fac638] text-[#1c180d]"
                  : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-2" />
              Most Points
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === "rating"
                  ? "bg-[#fac638] text-[#1c180d]"
                  : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
              }`}
            >
              <Star className="inline h-4 w-4 mr-2" />
              Top Rated
            </button>
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#9e8747]">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9e8747]">
                No data available yet. Start solving assignments to appear on the leaderboard!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((leaderUser, index) => (
                <Card
                  key={leaderUser.id}
                  className={`border-[#e9e2ce] transition-all ${
                    leaderUser.id === user.id
                      ? "bg-[#fac638]/10 border-[#fac638] shadow-md"
                      : "bg-[#fcfbf8] hover:shadow-md"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12">{getRankIcon(leaderUser.rank)}</div>
                        <Avatar className="h-12 w-12 bg-[#f4f0e6]">
                          <AvatarFallback className="bg-[#f4f0e6] text-[#1c180d] font-semibold">
                            {leaderUser.username?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#1c180d]">{leaderUser.username || "Anonymous User"}</h3>
                            {leaderUser.id === user.id && <Badge className="bg-[#fac638] text-[#1c180d]">You</Badge>}
                            <Badge className={getRankBadgeColor(leaderUser.rank)}>Rank #{leaderUser.rank}</Badge>
                          </div>
                          <p className="text-sm text-[#9e8747]">{leaderUser.assignmentsSolved || 0} assignments solved</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-[#1c180d]">{leaderUser.points || 0}</p>
                            <p className="text-xs text-[#9e8747]">Points</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-lg font-semibold text-[#1c180d]">
                                {leaderUser.averageRating?.toFixed(1) || "0.0"}
                              </span>
                            </div>
                            <p className="text-xs text-[#9e8747]">({leaderUser.totalRatings || 0} ratings)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {/* Your Stats */}
          {user && (
            <Card className="border-[#e9e2ce] bg-[#fcfbf8] mt-8">
              <CardHeader>
                <CardTitle className="text-[#1c180d]">Your Statistics</CardTitle>
                <CardDescription className="text-[#9e8747]">
                  Keep solving assignments to improve your ranking!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">{currentUserStats?.points || 0}</p>
                    <p className="text-sm text-[#9e8747]">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">
                      {currentUserStats?.averageRating?.toFixed(1) || "0.0"}
                    </p>
                    <p className="text-sm text-[#9e8747]">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">{currentUserStats?.totalRatings || 0}</p>
                    <p className="text-sm text-[#9e8747]">Total Ratings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">
                      {currentUserStats?.rank || "Unranked"}
                    </p>
                    <p className="text-sm text-[#9e8747]">Your Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}