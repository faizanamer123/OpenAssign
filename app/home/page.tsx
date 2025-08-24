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
  const { user, signOut } = useAuth()
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

  useEffect(() => {
    setMounted(true);
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

  if (!mounted || !user || loadingStats) {
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
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 anonymous-badge px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#4ade80]" />
              <span className="text-sm font-medium text-white">Welcome back!</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Hello,{" "}
              <span className="study-vibe-text">
                {user.username}
              </span>
              ! 👋
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Ready to help others or get help with your assignments? Your anonymous contribution makes a difference.
            </p>
          </div>

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
                <Link href="/upload">
                  <Button className="w-full duolingo-button font-semibold h-14 text-lg group">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
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
                <Link href="/browse">
                  <Button className="w-full duolingo-button-purple font-semibold h-14 text-lg group">
                    <Search className="mr-2 h-5 w-5" />
                    Browse Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card
            className="study-card animate-slide-up border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm"
            style={{ animationDelay: "1.2s" }}
          >
            <CardHeader className="border-b border-gray-700/50 pb-6">
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
                        <div key={activity.id} className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#272729]/30 to-[#272729]/20 rounded-xl border border-gray-700/30 hover:border-green-400/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group">
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
                        </div>
                      );
                    } else {
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#272729]/30 to-[#272729]/20 rounded-xl border border-gray-700/30 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white text-lg mb-1 group-hover:text-[#06b6d4] transition-colors">
                              Solved assignment
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
                        </div>
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
