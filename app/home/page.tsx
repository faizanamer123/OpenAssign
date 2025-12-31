"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Search,
  Activity,
  Bell,
  Trophy,
  LogOut,
  TrendingUp,
  Users,
  BookOpen,
  Star,
  ArrowRight,
  Zap,
  Target,
  Award,
  Flame,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });
import { useState, useEffect } from "react"
import { getAssignments, getSubmissions, getLeaderboard, getNotifications } from "@/utils/api";
import { getRatingBadge, getGemDisplay } from "@/utils/ratingBadge";
import GemIcon from "@/components/ui/GemIcon";

export default function HomePage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalAssignments: 0,
    solvedAssignments: 0,
    points: 0,
    rank: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [trendingAssignments, setTrendingAssignments] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated (after auth loading completes)
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/");
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchStats() {
      // Fetch all assignments and submissions globally
      setLoadingStats(true);
      const assignments = await getAssignments();
      const submissions = await getSubmissions();
      
      // Get user's assignments and submissions
      const userAssignments = assignments.filter(a => a.createdBy === user?.id);
      const userSubmissions = submissions.filter(s => s.submittedBy === user?.id);
      
      // Combine and sort by date (latest first)
      const allActivities = [
        ...userAssignments.map(a => ({
          ...a,
          type: 'upload',
          date: new Date(a.createdAt),
          displayDate: a.createdAt
        })),
        ...userSubmissions.map(s => ({
          ...s,
          type: 'submission',
          date: new Date(s.submittedAt),
          displayDate: s.submittedAt
        }))
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
      
      setRecentUploads(allActivities.filter(a => a.type === 'upload'));
      setRecentSubmissions(allActivities.filter(a => a.type === 'submission'));
      
      // Fetch notifications for the current user (if logged in)
      if (user) {
        const notifs = await getNotifications({ userId: user.id });
        setNotifications(notifs);
      }
      
      // Get trending assignments (recent and unsolved)
      const trending = assignments
        .filter((a: any) => a.status !== "solved")
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      setTrendingAssignments(trending);
      setAllAssignments(assignments);
      
      // Stats (user-specific)
      const userSolvedAssignments = userSubmissions.length; // User's solved assignments
      const userUploadedAssignments = userAssignments.length; // User's uploaded assignments
      const leaderboard = await getLeaderboard();
      // Find current user's rank if logged in
      let rank = 0, points = 0;
      if (user) {
        const userEntry = leaderboard.find(u => u.id === user.id);
        rank = leaderboard.findIndex(u => u.id === user.id) + 1;
        points = userEntry ? userEntry.points : 0;
      }
      setStats({
        totalAssignments: userUploadedAssignments, // User's uploaded assignments
        solvedAssignments: userSolvedAssignments, // User's solved assignments
        points: points,
        rank: rank,
      });
      setLoadingStats(false);
    }
    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Show loading while auth is checking or component is mounting
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen reddit-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ade80]"></div>
      </div>
    )
  }

  // Redirect if no user (will redirect via useEffect, but show nothing while redirecting)
  if (!user) {
    return null;
  }

  // Show loading while fetching stats
  if (loadingStats) {
    return (
      <div className="min-h-screen reddit-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ade80]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen reddit-dark-bg">
      <Header />

      <div className="mobile-padding px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section with Notifications */}
          <div className="mb-12 animate-slide-up">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 anonymous-badge px-4 py-2 mb-4">
                  <Zap className="w-4 h-4 text-[#4ade80]" />
                  <span className="text-sm font-medium text-white">Welcome back!</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 flex items-center gap-3">
                  Hello,{" "}
                  <span className="study-vibe-text">
                    {user.username}
                  </span>
                  !
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/20 rounded-xl">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#4ade80]" />
                  </div>
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl">
                  Ready to help others or get help with your assignments? Your anonymous contribution makes a difference.
                </p>
              </div>
              
              {/* Notifications Quick View */}
              {notifications.length > 0 && (
                <Link href="/notifications">
                  <Card className="study-card card-hover group cursor-pointer min-w-[280px] hover:border-[#4ade80]/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Bell className="h-6 w-6 text-[#4ade80]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">Notifications</span>
                            {notifications.filter((n: any) => !n.read).length > 0 && (
                              <Badge className="bg-[#ef4444] text-white border-0 text-xs px-2 py-0.5 pulse-glow">
                                {notifications.filter((n: any) => !n.read).length} new
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {notifications.filter((n: any) => !n.read).length > 0
                              ? `${notifications.filter((n: any) => !n.read).length} unread notifications`
                              : "All caught up!"}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#4ade80] group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>

          {/* Progress & Goals Section */}
          {stats.points > 0 && (
            <Card className="study-card mb-8 animate-slide-up bg-gradient-to-br from-[#9333ea]/10 via-[#7c3aed]/10 to-[#9333ea]/10 border-2 border-[#9333ea]/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9333ea] to-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Your Progress</h3>
                      <p className="text-sm text-gray-400">Keep going to unlock achievements!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{stats.points}</div>
                    <div className="text-xs text-gray-400">Total Points</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Novice", points: 10, color: "from-[#cd7f32] to-[#b8860b]" },
                    { label: "Contributor", points: 50, color: "from-[#c0c0c0] to-[#a8a8a8]" },
                    { label: "Expert", points: 100, color: "from-[#ffd700] to-[#ffb347]" },
                    { label: "Master", points: 250, color: "from-[#e5e4e2] to-[#b8b8b8]" },
                  ].map((milestone, idx) => {
                    const progress = Math.min((stats.points / milestone.points) * 100, 100);
                    const achieved = stats.points >= milestone.points;
                    return (
                      <div key={idx} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${achieved ? 'text-white' : 'text-gray-400'}`}>
                            {milestone.label} ({milestone.points} pts)
                          </span>
                          <span className={`text-xs ${achieved ? 'text-[#4ade80]' : 'text-gray-500'}`}>
                            {achieved ? '✓ Achieved' : `${Math.max(0, milestone.points - stats.points)} to go`}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${milestone.color} transition-all duration-1000 ${
                              achieved ? 'opacity-100' : 'opacity-60'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            <Card className="study-card card-hover animate-scale-in group hover:shadow-lg hover:shadow-green-500/20 hover:border-green-400/30 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:text-[#4ade80] transition-colors">
                    {stats.totalAssignments}
                  </div>
                  <div className="text-sm text-gray-300 mb-2 font-medium">My Uploads</div>
                  <div className="text-xs text-gray-400">
                    {stats.totalAssignments === 0 ? "Start sharing assignments" : 
                     stats.totalAssignments === 1 ? "1 assignment shared" : 
                     `${stats.totalAssignments} assignments shared`}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="study-card card-hover animate-scale-in group hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/30 transition-all duration-300" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-4 sm:p-6 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:text-[#06b6d4] transition-colors">
                    {stats.solvedAssignments}
                  </div>
                  <div className="text-sm text-gray-300 mb-2 font-medium">My Solutions</div>
                  <div className="text-xs text-gray-400">
                    {stats.solvedAssignments === 0 ? "Start helping others" : 
                     stats.solvedAssignments === 1 ? "1 solution provided" : 
                     `${stats.solvedAssignments} solutions provided`}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="study-card card-hover animate-scale-in group hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-400/30 transition-all duration-300" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-4 sm:p-6 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9333ea] to-[#7c3aed] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:text-[#9333ea] transition-colors">
                    {stats.points}
                  </div>
                  <div className="text-sm text-gray-300 mb-2 font-medium">Total Points</div>
                  <div className="text-xs text-gray-400">
                    {stats.points === 0 ? "Earn points by helping" : 
                     stats.points < 10 ? "Getting started!" : 
                     stats.points < 50 ? "Building reputation" : 
                     stats.points < 100 ? "Well established" : "Top contributor!"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="study-card card-hover animate-scale-in group hover:shadow-lg hover:shadow-pink-500/20 hover:border-pink-400/30 transition-all duration-300" style={{ animationDelay: "0.3s" }}>
              <CardContent className="p-4 sm:p-6 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#ec4899] to-[#db2777] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-pink-500/25">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:text-[#ec4899] transition-colors">
                    #{stats.rank || "—"}
                  </div>
                  <div className="text-sm text-gray-300 mb-2 font-medium">Leaderboard Rank</div>
                  <div className="text-xs text-gray-400">
                    {!stats.rank ? "Not ranked yet" : 
                     stats.rank === 1 ? "🥇 Top of the leaderboard!" : 
                     stats.rank <= 3 ? "🥉 Top 3 position!" : 
                     stats.rank <= 10 ? "🏆 Top 10 contender" : 
                     stats.rank <= 50 ? "📈 Climbing up" : "Keep improving!"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Trending Assignments Section */}
          {trendingAssignments.length > 0 && (
            <Card className="study-card mb-8 animate-slide-up">
              <CardHeader className="border-b border-gray-700/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#fb923c]/20 to-[#f97316]/20 rounded-xl flex items-center justify-center">
                      <Flame className="h-6 w-6 text-[#fb923c]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">Trending Assignments</CardTitle>
                      <CardDescription className="text-gray-300">Help these students now!</CardDescription>
                    </div>
                  </div>
                  <Link href="/browse">
                    <Button variant="ghost" className="text-[#4ade80] hover:text-[#22c55e] hover:bg-[#4ade80]/10">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingAssignments.map((assignment: any, index: number) => (
                    <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
                      <Card className="bubbly-card group cursor-pointer hover:border-[#4ade80]/50 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#fb923c]/20 to-[#f97316]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <BookOpen className="h-5 w-5 text-[#fb923c]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#4ade80] transition-colors">
                                {assignment.title}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                {assignment.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-[#fb923c]/20 text-[#fb923c] border border-[#fb923c]/30 text-xs">
                              {assignment.difficulty}
                            </Badge>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs">
                              Needs Help
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
            <Card
              className="study-card card-hover animate-slide-up group hover:shadow-lg hover:shadow-green-500/20 hover:border-green-400/30 transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white mb-2">Upload Assignment</CardTitle>
                    <CardDescription className="text-gray-300 text-base">Get help from the community</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                  Need help with an assignment? Upload it anonymously and get solutions from talented students in our
                  community. Share your challenges and receive expert help.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Anonymous uploads</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Community solutions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Quick responses</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/upload" className="flex-1">
                    <Button className="w-full duolingo-button font-semibold h-14 text-lg group">
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/activity" className="flex-1">
                    <Button variant="outline" className="w-full h-14 text-lg border-2 border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/10 hover:border-[#4ade80]/50 group">
                      <Activity className="mr-2 h-5 w-5" />
                      View Activity
                      <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card
              className="study-card card-hover animate-slide-up group hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/30 transition-all duration-300"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white mb-2">Browse Assignments</CardTitle>
                    <CardDescription className="text-gray-300 text-base">Help others and earn points</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                  Help fellow students by solving their assignments. Earn points, build your reputation, and climb the
                  leaderboard while contributing to the community.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Earn points</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-sm text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Build reputation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Climb leaderboard</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/browse" className="flex-1">
                    <Button className="w-full duolingo-button-purple font-semibold h-14 text-lg group">
                      <Search className="mr-2 h-5 w-5" />
                      Browse Now
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/leaderboard" className="flex-1">
                    <Button variant="outline" className="w-full h-14 text-lg border-2 border-[#9333ea]/30 text-[#9333ea] hover:bg-[#9333ea]/10 hover:border-[#9333ea]/50 group">
                      <Trophy className="mr-2 h-5 w-5" />
                      Leaderboard
                      <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card
            className="study-card animate-slide-up border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm"
            style={{ animationDelay: "1.2s" }}
          >
            <CardHeader className="border-b border-gray-700/50 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#4ade80]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-base">
                      Your latest contributions to the community and recent achievements
                    </CardDescription>
                  </div>
                </div>
                <Link href="/activity">
                  <Button variant="ghost" className="text-[#4ade80] hover:text-[#22c55e] hover:bg-[#4ade80]/10">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {(() => {
                  // Combine and sort all activities by date (latest first)
                  const allActivities = [
                    ...recentUploads.map(a => ({
                      ...a,
                      type: 'upload',
                      date: new Date(a.createdAt)
                    })),
                    ...recentSubmissions.map(s => ({
                      ...s,
                      type: 'submission',
                      date: new Date(s.submittedAt)
                    }))
                  ].sort((a, b) => b.date.getTime() - a.date.getTime());

                  if (allActivities.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Recent Activity</h3>
                        <p className="text-gray-300 mb-6 max-w-md mx-auto">
                          Start your journey by uploading assignments or solving problems to see your activity here.
                        </p>
                      </div>
                    );
                  }

                  return allActivities.map((activity, index) => {
                    if (activity.type === 'upload') {
                      return (
                        <Link key={activity.id} href={`/assignment/${activity.id}`}>
                          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#272729]/30 to-[#272729]/20 rounded-xl border border-gray-700/30 hover:border-green-400/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group cursor-pointer">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                              <Upload className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white text-lg mb-1 group-hover:text-[#4ade80] transition-colors">
                                Uploaded "{activity.title}"
                              </p>
                              <p className="text-sm text-gray-300 mb-2">
                                {activity.status === "solved" ? "✅ Solved by community" : "⏳ Waiting for solutions"} • {new Date(activity.createdAt).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge className={
                                  activity.status === "solved" 
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1" 
                                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1"
                                }>
                                  {activity.status === "solved" ? "Solved" : "Pending"}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {activity.status === "solved" ? "Community helped you!" : "Help is on the way"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-[#4ade80] group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      );
                    } else {
                      const assignment = allAssignments.find((a: any) => a.id === activity.assignmentId);
                      return (
                        <Link key={activity.id} href={assignment ? `/assignment/${activity.assignmentId}` : "#"}>
                          <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#272729]/30 to-[#272729]/20 rounded-xl border border-gray-700/30 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group cursor-pointer">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white text-lg mb-1 group-hover:text-[#06b6d4] transition-colors">
                                Solved {assignment ? `"${assignment.title}"` : "assignment"}
                              </p>
                              <p className="text-sm text-gray-300 mb-2">
                                {activity.rating ? `⭐ Rated ${activity.rating}/5` : "⏳ Awaiting rating"} • {new Date(activity.submittedAt).toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge className={
                                  activity.rating 
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1" 
                                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1"
                                }>
                                  {activity.rating ? `+${activity.rating * 3} pts earned` : "Pending rating"}
                                </Badge>
                                {activity.rating && (
                                  <span className="text-xs text-gray-400">
                                    Great job helping the community!
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-[#06b6d4] group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      );
                    }
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
