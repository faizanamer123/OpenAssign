"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });
import { useAuth } from "@/context/AuthContext"
import { getLeaderboard } from "@/utils/api"
import { getRatingBadge } from "@/utils/ratingBadge"

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
  const { user, loading: authLoading } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"points" | "rating">("points")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
    loadLeaderboard()
    }
  }, [sortBy, mounted])

  // Minimum points required to appear on leaderboard
  const MIN_POINTS_FOR_LEADERBOARD = 100

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboard(sortBy)
      const filteredData = data
        .filter((user: LeaderboardUser) => 
          // Must have minimum points to appear on leaderboard
          (user.points && user.points >= MIN_POINTS_FOR_LEADERBOARD) &&
          user.id && user.username
        )
        .map((user: LeaderboardUser, index: number) => ({
          ...user,
          rank: index + 1,
          points: user.points || 0,
          averageRating: user.averageRating || 0,
          totalRatings: user.totalRatings || 0,
          assignmentsSolved: user.assignmentsSolved || 0,
        }))
      
      setLeaderboard(filteredData)
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  // Point-based tier system
  const getTierFromPoints = (points: number) => {
    if (points >= 10000) return { name: "Platinum", color: "text-[#e5e7eb]", border: "border-[#e5e7eb]", minPoints: 10000, difficulty: "Elite" }
    if (points >= 5000) return { name: "Gold", color: "text-[#fbbf24]", border: "border-[#fbbf24]", minPoints: 5000, difficulty: "Expert" }
    if (points >= 2500) return { name: "Silver", color: "text-[#94a3b8]", border: "border-[#94a3b8]", minPoints: 2500, difficulty: "Advanced" }
    if (points >= 1000) return { name: "Copper", color: "text-[#b45309]", border: "border-[#b45309]", minPoints: 1000, difficulty: "Intermediate" }
    if (points >= 100) return { name: "Bronze", color: "text-[#854d0e]", border: "border-[#854d0e]", minPoints: 100, difficulty: "Beginner" }
    return { name: "Novice", color: "text-[#6b7280]", border: "border-[#6b7280]", minPoints: 0, difficulty: "Novice" }
  }

  // Rating-based tier for backward compatibility (used for gem display)
  const getTierInfo = (rating: number) => {
    if (rating >= 4.5) return { name: "Platinum", color: "text-[#e5e7eb]", border: "border-[#e5e7eb]" }
    if (rating >= 4.0) return { name: "Gold", color: "text-[#fbbf24]", border: "border-[#fbbf24]" }
    if (rating >= 3.5) return { name: "Silver", color: "text-[#94a3b8]", border: "border-[#94a3b8]" }
    if (rating >= 3.0) return { name: "Copper", color: "text-[#b45309]", border: "border-[#b45309]" }
    return { name: "Bronze", color: "text-[#854d0e]", border: "border-[#854d0e]" }
  }

  const getGemDisplayForRating = (rating: number) => {
    const badge = getRatingBadge(rating)
    const gems = []
    if (badge.emeralds > 0) {
      for (let i = 0; i < Math.min(badge.emeralds, 5); i++) {
        gems.push({ type: "emerald", key: `emerald-${i}` })
      }
    } else {
      for (let i = 0; i < Math.min(badge.rubies, 10); i++) {
        gems.push({ type: "ruby", key: `ruby-${i}` })
      }
    }
    return gems
  }

  // Hidden sort control - preserved functionality
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "points" | "rating")
  }

  // Get current user stats from leaderboard or use user object
  let currentUserStats: LeaderboardUser | null = null
  if (user) {
    currentUserStats = leaderboard.find((u) => u.id === user.id) || null
    
    // If user is not in leaderboard but has points, create stats from user object
    if (!currentUserStats && user && (user.points || 0) >= MIN_POINTS_FOR_LEADERBOARD) {
      // Calculate rank - find where user would rank based on points
      let userRank = leaderboard.length + 1
      for (let i = 0; i < leaderboard.length; i++) {
        if ((user.points || 0) > (leaderboard[i].points || 0)) {
          userRank = i + 1
          break
        }
      }
      
      currentUserStats = {
        id: user.id,
        username: user.username,
        points: user.points || 0,
        averageRating: user.averageRating || 0,
        totalRatings: user.totalRatings || 0,
        assignmentsSolved: 0,
        rank: userRank
      }
    } else if (!currentUserStats && user && (user.points || 0) > 0 && (user.points || 0) < MIN_POINTS_FOR_LEADERBOARD) {
      // User has points but not enough for leaderboard - show stats but no rank
      currentUserStats = {
        id: user.id,
        username: user.username,
        points: user.points || 0,
        averageRating: user.averageRating || 0,
        totalRatings: user.totalRatings || 0,
        assignmentsSolved: 0,
        rank: 0 // 0 means unranked
      }
    } else if (!currentUserStats && user && (user.points || 0) === 0) {
      // User has 0 points - show stats but no rank or gems
      currentUserStats = {
        id: user.id,
        username: user.username,
        points: 0,
        averageRating: user.averageRating || 0,
        totalRatings: user.totalRatings || 0,
        assignmentsSolved: 0,
        rank: 0 // 0 means unranked
      }
    }
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  // Always show content, don't wait for auth
  if (!mounted) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0a110e]">
        <div className='h-16' />
        <main className="px-4 md:px-12 lg:px-24 flex flex-1 justify-center pt-28 pb-12" style={{ background: 'radial-gradient(circle at center, rgba(48, 232, 165, 0.15) 0%, transparent 70%)', minHeight: 'calc(100vh - 80px)' }}>
          <div className="flex flex-col max-w-[1100px] flex-1 relative z-10">
            <div className="text-center py-12 text-white">Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0a110e]">
      <Header />
      <main className="px-4 md:px-12 lg:px-24 flex flex-1 justify-center pt-28 pb-12" style={{ background: 'radial-gradient(circle at center, rgba(48, 232, 165, 0.15) 0%, transparent 70%)', minHeight: 'calc(100vh - 80px)' }}>
        <div className="flex flex-col max-w-[1100px] flex-1 relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black leading-none tracking-tight">Top Contributors</h1>
              <p className="text-[#9db8ae] text-base sm:text-lg font-medium opacity-80">The prestige of academic excellence, measured in gems.</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col gap-2 w-full md:w-auto">
              <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-500 tracking-widest">Conversion Guide</span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-white">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#10b981] gem-3d text-base sm:text-lg">pentagon</span>
                  <span>1 Emerald</span>
          </div>
                <span className="text-slate-600 hidden sm:inline">=</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#ef4444] gem-3d text-base sm:text-lg">hexagon</span>
                  <span>10 Rubies</span>
                            </div>
                          </div>
                        </div>
                      </div>

          {/* Hidden Sort Control - Preserved functionality */}
          <div className="hidden">
            <select value={sortBy} onChange={handleSortChange}>
              <option value="points">Most Points</option>
              <option value="rating">Top Rated</option>
            </select>
                    </div>

          {/* Podium Section - Show if we have at least 3 users */}
          {loading ? (
            <div className="text-center py-12 text-white">Loading leaderboard...</div>
          ) : leaderboard.length >= 3 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 items-end w-full">
              {/* 2nd Place - Left */}
              <div className="flex flex-col items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl sm:rounded-3xl podium-card relative group">
                <div className="absolute inset-0 bg-[#fbbf24]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl sm:rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="bg-cover bg-center rounded-full size-20 sm:size-24 lg:size-28 border-4 border-[#fbbf24] shadow-2xl" style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1]?.username || "User")}&background=fbbf24&color=0a110e&size=112&bold=true)` }}></div>
                  <div className="absolute -bottom-2 -right-2 bg-[#fbbf24] text-slate-950 font-black rounded-full size-8 sm:size-10 flex items-center justify-center text-base sm:text-lg shadow-xl">2</div>
                </div>
                <div className="text-center z-10">
                  <h3 className="text-white text-lg sm:text-xl font-bold line-clamp-1">{topThree[1]?.username || "Anonymous"}</h3>
                  <div className="flex flex-col items-center mt-2 sm:mt-3 gap-1">
                    {(() => {
                      const tier = getTierFromPoints(topThree[1]?.points || 0)
                      return (
                        <>
                          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] ${tier.color}`}>{tier.name} Tier - {tier.difficulty}</span>
                          <div className="flex gap-0.5">
                            {getGemDisplayForRating(topThree[1]?.averageRating || 0).slice(0, 3).map((gem) => (
                              <span key={gem.key} className={`material-symbols-outlined text-lg sm:text-xl ${gem.type === "emerald" ? "text-[#10b981]" : "text-[#ef4444]"} gem-3d`}>
                                {gem.type === "emerald" ? "pentagon" : "hexagon"}
                              </span>
                            ))}
                          </div>
                        </>
                      )
                    })()}
                          </div>
                        </div>
                      </div>

              {/* 1st Place - Center (Elevated) */}
              <div className="flex flex-col items-center gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[2.5rem] podium-card border-2 border-[#30e8a5]/30 ring-4 ring-[#30e8a5]/5 transform md:-translate-y-4 lg:-translate-y-8 shadow-[0_0_60px_-15px_rgba(48,232,165,0.3)] relative group">
                <div className="absolute -top-8 sm:-top-10 lg:-top-12 left-1/2 -translate-x-1/2 z-10">
                  <span className="material-symbols-outlined text-[#30e8a5] text-4xl sm:text-5xl lg:text-6xl" style={{ fontVariationSettings: '"FILL" 1' }}>military_tech</span>
                            </div>
                <div className="relative z-10">
                  <div className="bg-cover bg-center rounded-full size-28 sm:size-32 lg:size-36 border-4 border-[#30e8a5] shadow-2xl" style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0]?.username || "User")}&background=30e8a5&color=0a110e&size=144&bold=true)` }}></div>
                  <div className="absolute -bottom-3 -right-3 bg-[#30e8a5] text-slate-950 font-black rounded-full size-10 sm:size-12 flex items-center justify-center text-lg sm:text-xl shadow-2xl shadow-[#30e8a5]/40">1</div>
                          </div>
                <div className="text-center z-10">
                  <h2 className="text-white text-2xl sm:text-3xl font-black platinum-shine line-clamp-1">{topThree[0]?.username || "Anonymous"}</h2>
                  <div className="flex flex-col items-center mt-3 sm:mt-4 gap-1">
                    {(() => {
                      const tier = getTierFromPoints(topThree[0]?.points || 0)
                      return (
                        <>
                          <span className="text-[#e5e7eb] text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] drop-shadow-md">{tier.name} Tier - {tier.difficulty}</span>
                          <div className="flex gap-0.5 sm:gap-1 mt-1">
                            {getGemDisplayForRating(topThree[0]?.averageRating || 0).slice(0, 5).map((gem) => (
                              <span key={gem.key} className={`material-symbols-outlined text-lg sm:text-xl lg:text-2xl ${gem.type === "emerald" ? "text-[#10b981]" : "text-[#ef4444]"} gem-3d`}>
                                {gem.type === "emerald" ? "pentagon" : "hexagon"}
                              </span>
                            ))}
                          </div>
                        </>
                      )
                    })()}
                            </div>
                          </div>
                        </div>

              {/* 3rd Place - Right */}
              <div className="flex flex-col items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl sm:rounded-3xl podium-card relative group">
                <div className="absolute inset-0 bg-[#94a3b8]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl sm:rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="bg-cover bg-center rounded-full size-20 sm:size-24 lg:size-28 border-4 border-[#94a3b8] shadow-2xl" style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2]?.username || "User")}&background=94a3b8&color=0a110e&size=112&bold=true)` }}></div>
                  <div className="absolute -bottom-2 -right-2 bg-[#94a3b8] text-slate-950 font-black rounded-full size-8 sm:size-10 flex items-center justify-center text-base sm:text-lg shadow-xl">3</div>
                      </div>
                <div className="text-center z-10">
                  <h3 className="text-white text-lg sm:text-xl font-bold line-clamp-1">{topThree[2]?.username || "Anonymous"}</h3>
                  <div className="flex flex-col items-center mt-2 sm:mt-3 gap-1">
                    {(() => {
                      const tier = getTierFromPoints(topThree[2]?.points || 0)
                      return (
                        <>
                          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] ${tier.color}`}>{tier.name} Tier - {tier.difficulty}</span>
                          <div className="flex">
                            {getGemDisplayForRating(topThree[2]?.averageRating || 0).slice(0, 1).map((gem) => (
                              <span key={gem.key} className={`material-symbols-outlined text-lg sm:text-xl ${gem.type === "emerald" ? "text-[#10b981]" : "text-[#ef4444]"} gem-3d`}>
                                {gem.type === "emerald" ? "pentagon" : "hexagon"}
                              </span>
                            ))}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="text-center py-12 text-white">Not enough users for podium. Showing leaderboard below.</div>
          ) : (
            <div className="text-center py-12 text-white">No leaderboard data available yet.</div>
          )}

          {/* Rest of Leaderboard Table - Show if we have data beyond top 3 */}
          {restOfLeaderboard.length > 0 && (
                <div className="flex flex-col gap-3 sm:gap-4 mb-24 sm:mb-32 overflow-x-auto">
                  <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 min-w-[600px]">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-4">Student</div>
                    <div className="col-span-4 text-center">Rating Tier</div>
                    <div className="col-span-3 text-right">Progress</div>
              </div>
                  {restOfLeaderboard.map((leaderUser) => {
                    // Use point-based tier system
                    const tier = getTierFromPoints(leaderUser.points || 0)
                    const gems = getGemDisplayForRating(leaderUser.averageRating || 0)
                    
                    // Get avatar URL based on tier
                    const getAvatarBackground = (tierName: string) => {
                      if (tierName === "Platinum") return "e5e7eb"
                      if (tierName === "Gold") return "fbbf24"
                      if (tierName === "Silver") return "94a3b8"
                      if (tierName === "Copper") return "b45309"
                      if (tierName === "Bronze") return "854d0e"
                      return "30e8a5"
                    }
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderUser.username || "User")}&background=${getAvatarBackground(tier.name)}&color=0a110e&size=44&bold=true`
                    
                    return (
                      <div
                  key={leaderUser.id}
                        className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl glass-row items-center border border-white/5 min-w-[600px]"
                      >
                        <div className="col-span-1 font-black text-slate-500 text-sm sm:text-base">#{leaderUser.rank}</div>
                        <div className="col-span-4 flex items-center gap-2 sm:gap-4 min-w-0">
                          <div className={`size-9 sm:size-10 lg:size-11 rounded-full bg-cover bg-center border-2 flex-shrink-0 ${tier.border}`} style={{ backgroundImage: avatarUrl }}></div>
                          <span className="font-bold text-white text-sm sm:text-base truncate">{leaderUser.username || "Anonymous"}</span>
                        </div>
                        <div className="col-span-4 flex flex-col items-center gap-1">
                          <span className={`text-[9px] sm:text-[10px] font-black ${tier.color} uppercase tracking-widest`}>{tier.name} - {tier.difficulty}</span>
                          <div className="flex gap-0.5 flex-wrap justify-center">
                            {gems.slice(0, 7).map((gem) => (
                              <span key={gem.key} className={`material-symbols-outlined text-xs sm:text-sm ${gem.type === "emerald" ? "text-[#10b981]" : "text-[#ef4444]"} gem-3d`}>
                                {gem.type === "emerald" ? "pentagon" : "hexagon"}
                                  </span>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-3 text-right font-black text-[#30e8a5] text-base sm:text-lg">{(leaderUser.points || 0).toLocaleString()}</div>
                      </div>
                    )
                  })}
            </div>
          )}
                  </div>
      </main>

      {/* Fixed Bottom Bar - Current User Stats - Always show if user is logged in */}
      {user && currentUserStats && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 bg-[#0a110e]/90 backdrop-blur-2xl border-t border-white/5 z-50">
          <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-[#30e8a5]/10 rounded-xl sm:rounded-[2rem] border border-[#30e8a5]/20 shadow-[0_-10px_40px_-15px_rgba(48,232,165,0.2)]">
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 sm:flex-initial">
                <div className="size-10 sm:size-12 rounded-full bg-cover bg-center border-2 border-[#30e8a5] flex-shrink-0" style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || currentUserStats.username || "User")}&background=30e8a5&color=0a110e&size=48&bold=true)` }}></div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-black text-base sm:text-lg leading-tight truncate">Me ({user.username || currentUserStats.username || "User"})</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {(() => {
                      const tier = getTierFromPoints(currentUserStats.points || 0)
                      return (
                        <>
                          <span className={`text-[9px] sm:text-[10px] uppercase font-bold ${tier.color} tracking-widest`}>
                            {tier.name} Tier - {tier.difficulty}
                          </span>
                          <div className="flex">
                            {getGemDisplayForRating(currentUserStats.averageRating || 0).slice(0, 10).map((gem) => (
                              <span key={gem.key} className={`material-symbols-outlined text-[9px] sm:text-[10px] ${gem.type === "emerald" ? "text-[#10b981]" : "text-[#ef4444]"} gem-3d`}>
                                {gem.type === "emerald" ? "pentagon" : "hexagon"}
                              </span>
                            ))}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-12 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <p className="text-[9px] sm:text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Total Points</p>
                <p className="text-[#30e8a5] font-black text-xl sm:text-2xl tracking-tighter">{(currentUserStats.points || 0).toLocaleString()}</p>
              </div>
              <div className="bg-[#30e8a5] text-slate-950 font-black rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm shadow-xl shadow-[#30e8a5]/20 flex-shrink-0">
                {currentUserStats.points >= MIN_POINTS_FOR_LEADERBOARD && currentUserStats.rank > 0 
                  ? `Rank #${currentUserStats.rank}` 
                  : "Unranked"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}