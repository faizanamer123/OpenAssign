"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> })
import { useAuth } from "@/context/AuthContext"
import { getAssignments, getSubmissions, getNotifications, getLeaderboard } from "@/utils/api"
import { getRatingBadge } from "@/utils/ratingBadge"
import type { Assignment } from "@/types/assignment"
import type { Submission } from "@/types/submission"

interface ActivityItem {
  id: string
  type: 'upload' | 'solution' | 'reward' | 'milestone'
  title: string
  description: string
  timestamp: string
  icon: string
  color: string
  assignmentId?: string
}

export default function ActivityPage() {
  const { user, loading: authLoading } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Stats
  const [weeklySolveRate, setWeeklySolveRate] = useState(0)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [currentTier, setCurrentTier] = useState("Bronze I")
  const [tierProgress, setTierProgress] = useState(0)
  const [nextTier, setNextTier] = useState("Copper I")
  const [milestones, setMilestones] = useState([
    { name: "Library Architect", progress: 0, total: 10 },
    { name: "Problem Solver", progress: 0, total: 50 }
  ])
  const [boostMessage, setBoostMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      loadActivityData()
      // Set up polling for real-time updates (every 30 seconds)
      const interval = setInterval(() => {
        loadActivityData()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user, mounted])

  const loadActivityData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch all data
      const [assignments, submissions, notifications, leaderboard] = await Promise.all([
        getAssignments(),
        getSubmissions({ userId: user.id }),
        getNotifications({ userId: user.id }),
        getLeaderboard("points")
      ])

      // Get user's assignments and submissions
      const userAssignments = assignments.filter((a: Assignment) => a.createdBy === user.id)
      const userSubmissions = submissions.filter((s: Submission) => s.submittedBy === user.id)

      // Calculate stats
      const solvedAssignments = userAssignments.filter((a: Assignment) => a.status === "solved").length
      const totalAssignments = userAssignments.length
      const solveRate = totalAssignments > 0 ? Math.round((solvedAssignments / totalAssignments) * 100) : 0
      setWeeklySolveRate(solveRate)
      setQuestionsAsked(userAssignments.length)
      
      // Get user's points from leaderboard
      const userEntry = leaderboard.find((u: any) => u.id === user.id)
      const points = userEntry?.points || user.points || 0
      setTotalPoints(points)

      // Calculate streak (based on consecutive days with activity)
      const allActivities = [...userAssignments, ...userSubmissions]
        .map((activity: any) => ({
          date: new Date(activity.createdAt || activity.submittedAt).toDateString()
        }))
      
      const uniqueDays = new Set(allActivities.map(a => a.date))
      const today = new Date().toDateString()
      let streak = 0
      
      // Check consecutive days starting from today
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date()
        checkDate.setDate(checkDate.getDate() - i)
        const dateString = checkDate.toDateString()
        
        if (uniqueDays.has(dateString)) {
          streak++
        } else if (i > 0) {
          // Stop if we hit a gap
          break
        }
      }
      setStreakDays(streak)

      // Determine tier based on rating
      const averageRating = userEntry?.averageRating || user.averageRating || 0
      let tier = "Bronze I"
      let nextTierName = "Copper I"
      let progress = 0
      
      if (averageRating >= 4.5) {
        tier = "Platinum I"
        nextTierName = "Platinum I"
        progress = 100
      } else if (averageRating >= 4.0) {
        tier = "Gold III"
        nextTierName = "Platinum I"
        progress = Math.round(((averageRating - 4.0) / 0.5) * 100)
      } else if (averageRating >= 3.5) {
        tier = "Silver II"
        nextTierName = "Gold III"
        progress = Math.round(((averageRating - 3.5) / 0.5) * 100)
      } else if (averageRating >= 3.0) {
        tier = "Copper I"
        nextTierName = "Silver II"
        progress = Math.round(((averageRating - 3.0) / 0.5) * 100)
      } else {
        tier = "Bronze I"
        nextTierName = "Copper I"
        progress = averageRating > 0 ? Math.round((averageRating / 3.0) * 100) : 0
      }
      
      setCurrentTier(tier)
      setNextTier(nextTierName)
      setTierProgress(Math.min(progress, 100))

      // Update milestones with real data
      setMilestones([
        { name: "Library Architect", progress: userAssignments.length, total: 10 },
        { name: "Problem Solver", progress: userSubmissions.length, total: 50 }
      ])

      // Build activity timeline
      const activityItems: ActivityItem[] = []

      // Add uploads
      userAssignments.forEach((assignment: Assignment) => {
        activityItems.push({
          id: assignment.id,
          type: 'upload',
          title: 'Assignment Uploaded',
          description: `You uploaded "${assignment.title}" for analysis. Processing complete.`,
          timestamp: assignment.createdAt,
          icon: 'upload_file',
          color: '#13ec9c',
          assignmentId: assignment.id
        })
      })

      // Add solutions
      userSubmissions.forEach((submission: Submission) => {
        // Get assignment title
        const assignment = assignments.find((a: Assignment) => a.id === submission.assignmentId)
        activityItems.push({
          id: submission.id,
          type: 'solution',
          title: 'Solution Unlocked',
          description: assignment ? `Unlocked step-by-step solution for "${assignment.title}".` : 'Unlocked step-by-step solution for assignment.',
          timestamp: submission.submittedAt,
          icon: 'key',
          color: '#22d3ee',
          assignmentId: submission.assignmentId
        })
      })

      // Add rewards from notifications (assignment rated)
      const rewardNotifications = notifications.filter((n: any) => 
        n.type === 'assignment_rated'
      )
      rewardNotifications.slice(0, 10).forEach((notif: any) => {
        activityItems.push({
          id: notif.id,
          type: 'reward',
          title: 'Earned Rating',
          description: notif.message || 'Your solution was rated by the community.',
          timestamp: notif.createdAt,
          icon: 'diamond',
          color: '#ef4444'
        })
      })

      // Sort by timestamp (newest first)
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Limit to most recent 20
      setActivities(activityItems.slice(0, 20))

      // Calculate boost message (assignments today)
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const todaySubmissions = userSubmissions.filter((s: Submission) => {
        const subDate = new Date(s.submittedAt)
        subDate.setHours(0, 0, 0, 0)
        return subDate.getTime() === todayDate.getTime()
      })
      
      const remaining = 3 - todaySubmissions.length
      if (remaining > 0) {
        setBoostMessage(`Complete ${remaining} more assignment${remaining > 1 ? 's' : ''} today to earn a Double Gem Bonus.`)
      } else {
        setBoostMessage("Great work! You've completed your daily goal.")
      }

    } catch (error) {
      console.error("Failed to load activity:", error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const getActivityIcon = (icon: string, color: string) => {
    return (
      <span 
        className="material-symbols-outlined text-3xl" 
        style={{ color }}
      >
        {icon}
      </span>
    )
  }

  if (!mounted) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0a110e]">
        <div className='h-16' />
        <main className="px-8 flex flex-1 justify-center pt-28 pb-12">
          <div className="text-center py-12 text-white">Loading...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0a110e]">
        <Header />
        <main className="px-8 flex flex-1 justify-center pt-28 pb-12">
          <div className="text-center py-12 text-white">Please log in to view your activity</div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0a110e]">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(19,236,156,0.15)_0%,rgba(0,0,0,0)_70%)] blur-[40px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(19,236,156,0.15)_0%,rgba(0,0,0,0)_70%)] blur-[40px] opacity-50"></div>
      </div>
      
      <Header />

      <main className="flex-1 flex flex-col overflow-y-auto relative z-10 pt-28">
        <div className="p-8 space-y-8">
          {/* Hero Header */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-[rgba(40,57,51,0.4)] backdrop-blur-[12px] border border-white/10 flex items-center px-12 group">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"
              style={{ 
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD2u96k9l0c0ZNjBujNoLTjxQufoCevfTCoXaSMQ-4ZNyWwmN50aeQRKpC7AiIkriMUVK-wT-siIX17JXVj-XhToV98tOIOUwQggOZLfJ_qpXpZLwsApDkC30XyE7oCcb4nIW0EhVuv8zmKEcDC1Ymj6KsT9p8erIIu-XbPM-EncE_tTm3V8sp5VHgZ7SXdLb7WjC1ya-7TjCX3-qz5u3i1u5wNDcqEXqZ1rSfjEYYD3V84uKlgvuU3mCtvtmVB0KCHMt5k5V-rO1E')"
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a110e] via-[#0a110e]/80 to-transparent"></div>
            <div className="relative z-10 space-y-2">
              <h2 className="text-4xl font-bold tracking-tight text-white">My Journey</h2>
              <p className="text-white/60 text-lg max-w-md">
                Track your evolution from a curious student to an academic master. Your daily progress is your greatest asset.
              </p>
              <div className="flex gap-4 mt-4">
                <span className="px-4 py-1.5 bg-[rgba(40,57,51,0.4)] backdrop-blur-[12px] border border-white/10 rounded-full text-xs font-bold text-[#13ec9c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>bolt</span>
                  {streakDays} DAY STREAK
                </span>
              </div>
            </div>
            {/* Robot Icon Placeholder/Graphic */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center z-20">
              <div className="relative w-full h-full animate-pulse opacity-80 blur-xl bg-[#13ec9c]/30 rounded-full"></div>
              <span className="material-symbols-outlined absolute text-[#13ec9c] drop-shadow-[0_0_30px_rgba(19,236,156,0.6)]" style={{ fontSize: '120px', lineHeight: '1' }}>smart_toy</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-[#13ec9c]/30 transition-all">
              <div className="absolute -right-4 -bottom-4 size-24 bg-[#13ec9c]/5 rounded-full blur-2xl group-hover:bg-[#13ec9c]/10 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#13ec9c]/10 rounded-lg text-[#13ec9c]">
                  <span className="material-symbols-outlined">trending_up</span>
                    </div>
                {weeklySolveRate > 0 && (
                  <span className="text-[#13ec9c] text-xs font-bold px-2 py-1 bg-[#13ec9c]/20 rounded">+{weeklySolveRate}%</span>
                    )}
                  </div>
              <p className="text-white/50 text-sm font-medium">Weekly Solve Rate</p>
              <h3 className="text-3xl font-bold mt-1 text-white">{weeklySolveRate}%</h3>
                  </div>

            <div className="bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-cyan-400/30 transition-all">
              <div className="absolute -right-4 -bottom-4 size-24 bg-cyan-400/5 rounded-full blur-2xl group-hover:bg-cyan-400/10 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cyan-400/10 rounded-lg text-cyan-400">
                  <span className="material-symbols-outlined">quiz</span>
                    </div>
                {questionsAsked > 0 && (
                  <span className="text-cyan-400 text-xs font-bold px-2 py-1 bg-cyan-400/20 rounded">+{questionsAsked}</span>
                    )}
                  </div>
              <p className="text-white/50 text-sm font-medium">Questions Asked</p>
              <h3 className="text-3xl font-bold mt-1 text-white">{questionsAsked}</h3>
                  </div>

            <div className="bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-red-500/30 transition-all">
              <div className="absolute -right-4 -bottom-4 size-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                  <span className="material-symbols-outlined">diamond</span>
                    </div>
                {totalPoints > 0 && (
                  <span className="text-red-500 text-xs font-bold px-2 py-1 bg-red-500/20 rounded">+{totalPoints}</span>
                    )}
                  </div>
              <p className="text-white/50 text-sm font-medium">Total Points Earned</p>
              <h3 className="text-3xl font-bold mt-1 text-white">{totalPoints.toLocaleString()}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Activity Feed (2/3 Column) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filters */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13ec9c]">analytics</span>
                  Recent Activity
                </h4>
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                  <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#13ec9c] text-[#0a110e]">All</button>
                  <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-white/50 hover:text-white transition-colors">Uploads</button>
                  <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-white/50 hover:text-white transition-colors">Rewards</button>
                  <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-white/50 hover:text-white transition-colors">Milestones</button>
                      </div>
                    </div>

              {/* Timeline */}
                  {loading ? (
                <div className="text-center py-12 text-white/60">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 text-white/60">No activities yet. Start by uploading an assignment!</div>
              ) : (
                <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-[#13ec9c] before:via-[#13ec9c]/30 before:to-transparent">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="relative group">
                      <div 
                        className="absolute -left-[28px] top-1 size-4 rounded-full border-4 border-[#0a110e] shadow-[0_0_10px_rgba(19,236,156,0.5)] z-10 group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: activity.color }}
                      ></div>
                      <div className="bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border border-white/5 p-5 rounded-xl flex gap-5 transition-all hover:bg-[rgba(40,57,51,0.6)] hover:border-[#13ec9c]/30">
                        <div 
                          className="size-14 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-inner"
                          style={{ 
                            backgroundColor: `${activity.color}10`,
                            borderColor: `${activity.color}20`
                          }}
                        >
                          {getActivityIcon(activity.icon, activity.color)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-white">{activity.title}</h5>
                            <span className="text-xs text-white/40 font-medium">{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                          <p className="text-white/60 text-sm">{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                  )}
                      </div>

            {/* Sidebar Progress (1/3 Column) */}
            <div className="space-y-6">
              {/* Tier Progress */}
              <div className="bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border border-white/5 p-8 rounded-xl text-center relative overflow-hidden group">
                <div className="relative size-48 mx-auto mb-6 flex items-center justify-center">
                  <svg className="size-full -rotate-90">
                    <circle cx="96" cy="96" fill="transparent" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="12"></circle>
                    <circle 
                      className="drop-shadow-[0_0_8px_rgba(19,236,156,0.6)]" 
                      cx="96" 
                      cy="96" 
                      fill="transparent" 
                      r="88" 
                      stroke="#13ec9c" 
                      strokeDasharray="552.92" 
                      strokeDashoffset={552.92 - (552.92 * tierProgress / 100)} 
                      strokeLinecap="round" 
                      strokeWidth="12"
                    ></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-white">{tierProgress}%</span>
                    <span className="text-[10px] text-[#13ec9c]/80 uppercase font-bold tracking-widest">To {nextTier}</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Tier Progress</h4>
                <p className="text-sm text-white/50 mb-6">Current Rank: <span className="text-white font-bold">{currentTier}</span></p>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all text-white">
                  View Perks Catalog
                </button>
              </div>

              {/* Active Milestones */}
              <div className="bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border border-white/5 p-6 rounded-xl space-y-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#13ec9c] text-[20px]">emoji_events</span>
                  Active Milestones
                </h4>
                    <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/60">{milestone.name}</span>
                        <span className="text-white font-bold">{milestone.progress}/{milestone.total}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 transition-all"
                          style={{ width: `${Math.min((milestone.progress / milestone.total) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                                      </div>
                                    </div>

              {/* Boost Card */}
              <div className="bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border border-white/5 p-6 rounded-xl bg-gradient-to-br from-[#13ec9c]/10 to-transparent">
                <h4 className="font-bold text-white mb-2">Need a boost?</h4>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  {boostMessage || "Complete 3 more assignments today to earn a Double Gem Bonus."}
                </p>
                <Link href="/browse" className="flex items-center gap-2 text-[#13ec9c] font-bold text-sm hover:underline">
                  Start Now
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                  </Link>
                                </div>
                              </div>
                    </div>
        </div>
      </main>
    </div>
  )
}