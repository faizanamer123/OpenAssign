"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Star, Award, TrendingUp, BarChart2, PieChart, Users, BookOpen, Clock, Target, Zap, Upload } from "lucide-react"
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
import GemIcon from "@/components/ui/GemIcon";
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });
import { useAuth } from "@/context/AuthContext"
import { getLeaderboard, getAnalytics } from "@/utils/api"
import { getRatingBadge, getGemDisplay } from "@/utils/ratingBadge"

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
      // Filter out users who haven't solved any assignments or earned points
      const filteredData = data.filter((user: LeaderboardUser) => 
        (user.assignmentsSolved && user.assignmentsSolved > 0) || 
        (user.points && user.points > 0)
      )
      setLeaderboard(filteredData)
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
        return <span className="text-lg font-bold text-gray-300">#{rank}</span>
    }
  }

 const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-emerald-500/25 to-green-400/25 text-emerald-200 border border-emerald-400/50 shadow-lg shadow-emerald-500/30 backdrop-blur-sm"
    case 2:
      return "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border border-green-500/40 shadow-lg shadow-green-500/25 backdrop-blur-sm"
    case 3:
      return "bg-gradient-to-r from-green-700/15 to-green-800/15 text-green-400 border border-green-600/35 shadow-lg shadow-green-600/20 backdrop-blur-sm"
    default:
      return "bg-gradient-to-r from-green-800/10 to-green-900/10 text-green-500 border border-green-700/25 shadow-md shadow-green-700/15 backdrop-blur-sm"
  }
}

  if (!user) return null

  // Find the current user's stats from the leaderboard
  const currentUserStats = leaderboard.find((u) => u.id === user.id);

  return (
    <div className="min-h-screen reddit-dark-bg">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-[#4ade80] inline-block align-middle" aria-label="Leaderboard" />
              Leaderboard & Analytics
            </h1>
            <p className="text-gray-300">Top contributors and community insights in our anonymous assignment solving platform</p>
          </div>

          {/* Analytics Overview Section */}
          {!analyticsLoading && analyticsData && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-[#4ade80]" /> Community Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Success Rate Card */}
                <Card className="study-card hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-white text-sm">
                      <Target className="h-4 w-4 text-[#9333ea]" /> Success Rate
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
                            stroke="#4ade80"
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
                            <div className="text-2xl font-bold text-white group-hover:text-[#9333ea] transition-colors">
                              {analyticsData.totalAssignments > 0 ? Math.round((analyticsData.solvedAssignments / analyticsData.totalAssignments) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm text-center">Assignments solved</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Rating Card */}
                 <Card className="study-card hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                     <CardTitle className="flex items-center gap-2 text-white text-sm">
                       <PieChart className="h-4 w-4 text-[#ec4899]" /> Avg Rating
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
                             stroke="#4ade80"
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
                             <div className="text-2xl font-bold text-white group-hover:text-[#ec4899] transition-colors">
                              {analyticsData.averageRating.toFixed(1)}★
                            </div>
                          </div>
                        </div>
                      </div>
                       <div className="text-gray-300 text-sm text-center">Community rating</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Avg Submission Speed Card */}
                 <Card className="study-card hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                     <CardTitle className="flex items-center gap-2 text-white text-sm">
                       <Clock className="h-4 w-4 text-[#06b6d4]" /> Avg Speed
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
                             stroke="#4ade80"
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
                             <div className="text-2xl font-bold text-white group-hover:text-[#06b6d4] transition-colors">
                              {analyticsData.avgSubmissionSpeed > 0 ? `${analyticsData.avgSubmissionSpeed.toFixed(1)}` : '--'}
                            </div>
                             <div className="text-xs text-gray-300">hrs</div>
                          </div>
                        </div>
                      </div>
                       <div className="text-gray-300 text-sm text-center">Avg solve time</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Community Rating Distribution Card */}
                 <Card className="study-card hover:shadow-lg transition-all duration-300 group analytics-card">
                  <CardHeader className="pb-3">
                     <CardTitle className="flex items-center gap-2 text-white text-sm">
                       <Star className="h-4 w-4 text-[#4ade80]" /> Top Ratings
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
                             stroke="#4ade80"
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
                             <div className="text-2xl font-bold text-white group-hover:text-[#4ade80] transition-colors">
                              {(() => {
                                const totalRatings = analyticsData.ratingsDist?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
                                const fiveStarRatings = analyticsData.ratingsDist?.find((item: any) => item.rating === 5)?.count || 0;
                                return totalRatings > 0 ? Math.round((fiveStarRatings / totalRatings) * 100) : 0;
                              })()}%
                            </div>
                          </div>
                        </div>
                      </div>
                       <div className="text-gray-300 text-sm text-center">5-star ratings</div>
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

                     <hr className="my-6 border-[#4ade80]/30" />

          {/* Rating Tiers Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-[#4ade80]" />
              Rating Tiers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-[#cd7f32]/20 to-[#b8860b]/20 border border-[#cd7f32]/30">
                <div className="text-xs font-bold text-[#cd7f32] mb-1">BRONZE</div>
                <div className="text-xs text-gray-300">3.0+ stars</div>
                <div className="text-xs text-gray-400">3 rubies</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-[#b87333]/20 to-[#a0522d]/20 border border-[#b87333]/30">
                <div className="text-xs font-bold text-[#b87333] mb-1">COPPER</div>
                <div className="text-xs text-gray-300">3.5+ stars</div>
                <div className="text-xs text-gray-400">7 rubies</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-[#c0c0c0]/20 to-[#a8a8a8]/20 border border-[#c0c0c0]/30">
                <div className="text-xs font-bold text-[#a8a8a8] mb-1">SILVER</div>
                <div className="text-xs text-gray-300">4.0+ stars</div>
                <div className="text-xs text-gray-400">1 emerald</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-[#ffd700]/20 to-[#ffb347]/20 border border-[#ffd700]/30">
                <div className="text-xs font-bold text-[#ffb347] mb-1">GOLD</div>
                <div className="text-xs text-gray-300">4.5+ stars</div>
                <div className="text-xs text-gray-400">3 emeralds</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-[#e5e4e2]/20 to-[#b8b8b8]/20 border border-[#e5e4e2]/30">
                <div className="text-xs font-bold text-[#b8b8b8] mb-1">PLATINUM</div>
                <div className="text-xs text-gray-300">4.5+ stars</div>
                <div className="text-xs text-gray-400">5 emeralds</div>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-xs text-gray-400">
                💎 1 Emerald = 10 Rubies | 🔴 Rubies for lower tiers, 💎 Emeralds for higher tiers
              </p>
            </div>
          </div>

          {/* Sort Options */}
           <div className="flex justify-center gap-2 mb-6 sticky top-0 z-20 reddit-dark-bg py-2 shadow-sm rounded-b-xl backdrop-blur-sm">
            <button
              onClick={() => setSortBy("points")}
               className={`duolingo-button ${
                sortBy === "points"
                   ? "shadow-lg shadow-green-500/25"
                   : "duolingo-button-secondary"
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-1 sm:mr-2" />
              Most Points
            </button>
            <button
              onClick={() => setSortBy("rating")}
               className={`duolingo-button ${
                sortBy === "rating"
                   ? "duolingo-button-purple shadow-lg shadow-purple-500/25"
                   : "duolingo-button-secondary"
              }`}
            >
              <Star className="inline h-4 w-4 mr-1 sm:mr-2" />
              Top Rated
            </button>
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="text-center py-12">
               <p className="text-gray-300">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Leaderboard is Empty</h3>
                <p className="text-gray-300 mb-4">
                  No users have qualified for the leaderboard yet. Users need to solve at least one assignment or earn points to appear here.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                  <h4 className="font-semibold text-white mb-2">How to Qualify</h4>
                  <ul className="text-sm text-gray-300 text-left space-y-1">
                    <li>• Solve at least one assignment</li>
                    <li>• Earn points through contributions</li>
                    <li>• Get rated by other users</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <h4 className="font-semibold text-white mb-2">Get Started</h4>
                  <ul className="text-sm text-gray-300 text-left space-y-1">
                    <li>• Browse available assignments</li>
                    <li>• Upload your own assignments</li>
                    <li>• Rate other submissions</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((leaderUser, index) => (
                <Card
                  key={leaderUser.id}
                   className={`study-card transition-all duration-300 rounded-2xl shadow-md group ${
                    leaderUser.id === user.id
                       ? "border-[#4ade80] ring-2 ring-[#4ade80] shadow-lg shadow-green-500/20"
                       : "hover:shadow-xl hover:scale-[1.02] hover:border-green-400/30 hover:shadow-green-500/10"
                  }`}
                >
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">{getRankIcon(leaderUser.rank)}</div>
                         <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-[#4ade80] to-[#22c55e] group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
                           <AvatarFallback className="bg-gradient-to-br from-[#4ade80] to-[#22c55e] text-white font-semibold group-hover:from-green-400 group-hover:to-green-600 transition-all duration-300">
                            {leaderUser.username?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                             <h3 className="font-semibold text-white text-base sm:text-lg">{leaderUser.username || "Anonymous User"}</h3>
                             {leaderUser.id === user.id && <Badge className="bg-[#4ade80] text-white text-xs sm:text-sm">You</Badge>}
                            <Badge className={getRankBadgeColor(leaderUser.rank) + " text-xs sm:text-sm"}>Rank #{leaderUser.rank}</Badge>
                          </div>
                           <p className="text-xs sm:text-sm text-gray-300">{leaderUser.assignmentsSolved || 0} assignments solved</p>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="text-center min-w-[70px]">
                           <p className="text-xl sm:text-2xl font-bold text-white">{Number.isFinite(Number(leaderUser.points)) ? Number(leaderUser.points) : 0}</p>
                           <p className="text-xs text-gray-300">Points</p>
                        </div>
                        <div className="text-center min-w-[70px]">
                          <div className="flex items-center gap-1 justify-center mb-1">
                            {(() => {
                              const rating = Number.isFinite(Number(leaderUser.averageRating)) ? Number(leaderUser.averageRating) : 0;
                              const badge = getRatingBadge(rating);
                              return (
                                <div className={badge.className}>
                                  <span className="text-xs font-bold">{badge.displayText}</span>
                                  <span className="text-xs flex items-center gap-1">
                                    {badge.emeralds > 0 ? (
                                      <>
                                        {badge.emeralds} <GemIcon type="emerald" size={12} />
                                      </>
                                    ) : (
                                      <>
                                        {badge.rubies} <GemIcon type="ruby" size={12} />
                                      </>
                                    )}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                          <p className="text-xs text-gray-300">({Number.isFinite(Number(leaderUser.totalRatings)) ? Number(leaderUser.totalRatings) : 0} ratings)</p>
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
             <Card className="study-card mt-8 border-[#4ade80]/20 shadow-lg shadow-green-500/10">
              <CardHeader>
                 <CardTitle className="text-white flex items-center gap-2">
                   <TrendingUp className="h-5 w-5 text-[#4ade80]" />
                   Your Statistics
                 </CardTitle>
                 <CardDescription className="text-gray-300">
                  Keep solving assignments to improve your ranking!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentUserStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                     <p className="text-2xl font-bold text-white">{currentUserStats?.points || 0}</p>
                     <p className="text-sm text-gray-300">Points</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
                     <div className="flex flex-col items-center gap-2">
                       {(() => {
                         const rating = currentUserStats?.averageRating || 0;
                         const badge = getRatingBadge(rating);
                         return (
                           <div className={badge.className}>
                             <span className="text-xs font-bold">{badge.displayText}</span>
                               <span className="text-xs flex items-center gap-1">
                                 {badge.emeralds > 0 ? (
                                   <>
                                     {badge.emeralds} <GemIcon type="emerald" size={12} />
                                   </>
                                 ) : (
                                   <>
                                     {badge.rubies} <GemIcon type="ruby" size={12} />
                                   </>
                                 )}
                               </span>
                           </div>
                         );
                       })()}
                       <p className="text-sm text-gray-300">Avg Rating</p>
                     </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                     <p className="text-2xl font-bold text-white">{currentUserStats?.totalRatings || 0}</p>
                     <p className="text-sm text-gray-300">Total Ratings</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                     <p className="text-2xl font-bold text-white">
                      {currentUserStats?.rank || "Unranked"}
                    </p>
                     <p className="text-sm text-gray-300">Your Rank</p>
                  </div>
                </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Not on Leaderboard Yet</h3>
                      <p className="text-gray-300 mb-4">
                        You need to solve at least one assignment or earn points to appear on the leaderboard.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                        <p className="text-2xl font-bold text-white">0</p>
                        <p className="text-sm text-gray-300">Points</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <p className="text-2xl font-bold text-white">0</p>
                        <p className="text-sm text-gray-300">Assignments Solved</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <p className="text-2xl font-bold text-white">--</p>
                        <p className="text-sm text-gray-300">Rating</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm text-gray-400 mb-3">Start your journey by:</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Badge className="bg-[#4ade80] text-white px-3 py-1">
                          <Upload className="w-3 h-3 mr-1" />
                          Upload an assignment
                        </Badge>
                        <Badge className="bg-[#8b5cf6] text-white px-3 py-1">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Solve assignments
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
