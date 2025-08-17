"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Star, Award, TrendingUp, BarChart2, PieChart, Users, BookOpen, Clock, Target, Zap, Upload } from "lucide-react"
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });
import { useAuth } from "@/context/AuthContext"
import { getLeaderboard, getAnalytics } from "@/utils/api"

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
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"points" | "rating">("points")
  const [animateProgress, setAnimateProgress] = useState(false)

  // Helper function to safely get numeric values
  const getSafeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Helper function to safely format rating
  const getSafeRating = (value: any): number => {
    const rating = getSafeNumber(value, 0);
    return Math.max(0, Math.min(5, rating)); // Ensure rating is between 0-5
  };

  useEffect(() => {
    loadLeaderboard()
    loadAnalytics()
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

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    setAnimateProgress(false)
    try {
      const d = await getAnalytics()
      // Ensure all numeric values are properly converted
      const processedData = {
        ...d,
        totalUsers: getSafeNumber(d.totalUsers),
        totalAssignments: getSafeNumber(d.totalAssignments),
        solvedAssignments: getSafeNumber(d.solvedAssignments),
        averageRating: getSafeRating(d.averageRating),
        avgSubmissionSpeed: getSafeNumber(d.avgSubmissionSpeed),
        activeUsers7d: getSafeNumber(d.activeUsers7d),
        activeUsers30d: getSafeNumber(d.activeUsers30d),
        uploadsPerDay: Array.isArray(d.uploadsPerDay) ? d.uploadsPerDay : [],
        ratingsDist: Array.isArray(d.ratingsDist) ? d.ratingsDist : [],
        topUsers: Array.isArray(d.topUsers) ? d.topUsers : [],
        userGrowth: Array.isArray(d.userGrowth) ? d.userGrowth : [],
        assignmentCategories: Array.isArray(d.assignmentCategories) ? d.assignmentCategories : [],
        leaderboardTrends: Array.isArray(d.leaderboardTrends) ? d.leaderboardTrends : [],
      }
      setAnalyticsData(processedData)
      // Trigger progress animations after data is set
      setTimeout(() => setAnimateProgress(true), 100)
    } catch (e: any) {
      console.error("Analytics fetch error:", e)
    }
    setAnalyticsLoading(false)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Logo className="opacity-100" logoSize={60} showText={false} />
      case 2:
        return <Logo className="opacity-80" logoSize={60} showText={false} />
      case 3:
        return <Logo className="opacity-60" logoSize={60} showText={false} />
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
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1c180d] mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-[#fac638] inline-block align-middle" aria-label="Leaderboard" />
              Leaderboard & Analytics
            </h1>
            <p className="text-[#9e8747]">Top contributors and community insights in our anonymous assignment solving platform</p>
          </div>

          {/* Analytics Overview Section */}
          {!analyticsLoading && analyticsData && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1c180d] mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-[#fac638]" /> Community Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Success Rate Card */}
                <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                      <Target className="h-4 w-4 text-purple-500" /> Success Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e9e2ce"
                            strokeWidth="8"
                            fill="transparent"
                            className="opacity-30"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#purpleGradient)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${animateProgress ? Math.min((analyticsData.totalAssignments > 0 ? (analyticsData.solvedAssignments / analyticsData.totalAssignments) * 100 : 0) / 100 * 251.2, 251.2) : 0} 251.2`}
                            strokeDashoffset="0"
                            className="transition-all duration-1500 ease-out"
                            style={{
                              transitionDelay: '0ms'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#1c180d] group-hover:text-purple-600 transition-colors">
                              {analyticsData.totalAssignments > 0 ? Math.round((analyticsData.solvedAssignments / analyticsData.totalAssignments) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[#9e8747] text-sm text-center">Assignments solved</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Rating Card */}
                <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                      <PieChart className="h-4 w-4 text-pink-500" /> Avg Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e9e2ce"
                            strokeWidth="8"
                            fill="transparent"
                            className="opacity-30"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#pinkGradient)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${animateProgress ? Math.min((analyticsData.averageRating / 5) * 251.2, 251.2) : 0} 251.2`}
                            strokeDashoffset="0"
                            className="transition-all duration-1500 ease-out"
                            style={{
                              transitionDelay: '200ms'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#1c180d] group-hover:text-pink-600 transition-colors">
                              {analyticsData.averageRating.toFixed(1)}★
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[#9e8747] text-sm text-center">Community rating</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Avg Submission Speed Card */}
                <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                      <Clock className="h-4 w-4 text-blue-500" /> Avg Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e9e2ce"
                            strokeWidth="8"
                            fill="transparent"
                            className="opacity-30"
                          />
                          {/* Real-time Average Solve Time Progress Bar */}
                          {(() => {
                            // Real-time calculation of average solve time percentage
                            const avgSpeed = analyticsData.avgSubmissionSpeed || 0;
                            
                            // Calculate percentage based on a reasonable benchmark (12 hours = 100%)
                            // Lower time = higher percentage (faster is better)
                            const benchmarkHours = 12; // 12 hours as 100% benchmark
                            const percentage = avgSpeed > 0 ? Math.max(0, Math.min(100, ((benchmarkHours - avgSpeed) / benchmarkHours) * 100)) : 0;
                            
                            const progressBar = (percentage / 100) * 251.2;
                            
                            return (
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="url(#blueGradient)"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${animateProgress ? progressBar : 0} 251.2`}
                                strokeDashoffset="0"
                                className="transition-all duration-1500 ease-out"
                                style={{
                                  transitionDelay: '400ms'
                                }}
                              />
                            );
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#1c180d] group-hover:text-blue-600 transition-colors">
                              {analyticsData.avgSubmissionSpeed > 0 ? `${analyticsData.avgSubmissionSpeed.toFixed(1)}` : '--'}
                            </div>
                            <div className="text-xs text-[#9e8747]">hrs</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[#9e8747] text-sm text-center">Avg solve time</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Community Rating Distribution Card */}
                <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                      <Star className="h-4 w-4 text-green-500" /> Top Ratings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 h-24 mb-3">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e9e2ce"
                            strokeWidth="8"
                            fill="transparent"
                            className="opacity-30"
                          />
                          {/* Real-time 5-Star Rating Progress Bar */}
                          {(() => {
                            // Real-time calculation of 5-star rating percentage
                            const totalRatings = analyticsData.ratingsDist?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
                            const fiveStarRatings = analyticsData.ratingsDist?.find((item: any) => item.rating === 5)?.count || 0;
                            const percentage = totalRatings > 0 ? (fiveStarRatings / totalRatings) * 100 : 0;
                            
                            // Since 5-star percentage can't exceed 100%, we use single loop
                            const progressBar = (percentage / 100) * 251.2;
                            
                            return (
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="url(#greenGradient)"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${animateProgress ? progressBar : 0} 251.2`}
                                strokeDashoffset="0"
                                className="transition-all duration-1500 ease-out"
                                style={{
                                  transitionDelay: '600ms'
                                }}
                              />
                            );
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#1c180d] group-hover:text-green-600 transition-colors">
                              {(() => {
                                const totalRatings = analyticsData.ratingsDist?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
                                const fiveStarRatings = analyticsData.ratingsDist?.find((item: any) => item.rating === 5)?.count || 0;
                                return totalRatings > 0 ? Math.round((fiveStarRatings / totalRatings) * 100) : 0;
                              })()}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[#9e8747] text-sm text-center">5-star ratings</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SVG Gradients for the circular progress bars */}
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}

          <hr className="my-6 border-[#e9e2ce]" />

          {/* Sort Options */}
          <div className="flex justify-center gap-2 mb-6 sticky top-0 z-20 bg-[#fcfbf8] py-2 shadow-sm rounded-b-xl">
            <button
              onClick={() => setSortBy("points")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-colors shadow-sm border border-[#e9e2ce] ${
                sortBy === "points"
                  ? "bg-[#fac638] text-[#1c180d] border-[#fac638]"
                  : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-1 sm:mr-2" />
              Most Points
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-colors shadow-sm border border-[#e9e2ce] ${
                sortBy === "rating"
                  ? "bg-[#fac638] text-[#1c180d] border-[#fac638]"
                  : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
              }`}
            >
              <Star className="inline h-4 w-4 mr-1 sm:mr-2" />
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
                  className={`border-[#e9e2ce] transition-all rounded-2xl shadow-md ${
                    leaderUser.id === user.id
                      ? "bg-[#fac638]/10 border-[#fac638] ring-2 ring-[#fac638]"
                      : "bg-[#fcfbf8] hover:shadow-lg"
                  }`}
                >
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">{getRankIcon(leaderUser.rank)}</div>
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-[#f4f0e6]">
                          <AvatarFallback className="bg-[#f4f0e6] text-[#1c180d] font-semibold">
                            {leaderUser.username?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                            <h3 className="font-semibold text-[#1c180d] text-base sm:text-lg">{leaderUser.username || "Anonymous User"}</h3>
                            {leaderUser.id === user.id && <Badge className="bg-[#fac638] text-[#1c180d] text-xs sm:text-sm">You</Badge>}
                            <Badge className={getRankBadgeColor(leaderUser.rank) + " text-xs sm:text-sm"}>Rank #{leaderUser.rank}</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-[#9e8747]">{leaderUser.assignmentsSolved || 0} assignments solved</p>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="text-center min-w-[70px]">
                          <p className="text-xl sm:text-2xl font-bold text-[#1c180d]">{Number.isFinite(Number(leaderUser.points)) ? Number(leaderUser.points) : 0}</p>
                          <p className="text-xs text-[#9e8747]">Points</p>
                        </div>
                        <div className="text-center min-w-[70px]">
                          <div className="flex items-center gap-1 justify-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-base sm:text-lg font-semibold text-[#1c180d]">{
                              Number.isFinite(Number(leaderUser.averageRating))
                                ? Number(leaderUser.averageRating).toFixed(1)
                                : "0.0"
                            }</span>
                          </div>
                          <p className="text-xs text-[#9e8747]">({Number.isFinite(Number(leaderUser.totalRatings)) ? Number(leaderUser.totalRatings) : 0} ratings)</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
