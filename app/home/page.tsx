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
      <div className="min-h-screen bg-gradient-to-br from-[#fcfbf8] via-[#f8f5e8] to-[#f4f0e6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fac638]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcfbf8] via-[#f8f5e8] to-[#f4f0e6]">
      <Header />

      <div className="mobile-padding px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-[#fac638]/10 border border-[#fac638]/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#fac638]" />
              <span className="text-sm font-medium text-[#1c180d]">Welcome back!</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1c180d] mb-4">
              Hello,{" "}
              <span className="bg-gradient-to-r from-[#fac638] to-[#e6b332] bg-clip-text text-transparent">
                {user.username}
              </span>
              ! 👋
            </h1>
            <p className="text-lg text-[#9e8747] max-w-2xl mx-auto">
              Ready to help others or get help with your assignments? Your anonymous contribution makes a difference.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            <Card className="border-[#e9e2ce]/50 bg-white/80 backdrop-blur-sm card-hover animate-scale-in">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#1c180d]">{stats.totalAssignments}</div>
                <div className="text-xs sm:text-sm text-[#9e8747]">My Uploads</div>
              </CardContent>
            </Card>

            <Card
              className="border-[#e9e2ce]/50 bg-white/80 backdrop-blur-sm card-hover animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#1c180d]">{stats.solvedAssignments}</div>
                <div className="text-xs sm:text-sm text-[#9e8747]">My Solutions</div>
              </CardContent>
            </Card>

            <Card
              className="border-[#e9e2ce]/50 bg-white/80 backdrop-blur-sm card-hover animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#fac638] to-[#e6b332] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-[#1c180d]" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#1c180d]">{stats.points}</div>
                <div className="text-xs sm:text-sm text-[#9e8747]">Points</div>
              </CardContent>
            </Card>

            <Card
              className="border-[#e9e2ce]/50 bg-white/80 backdrop-blur-sm card-hover animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#1c180d]">#{stats.rank}</div>
                <div className="text-xs sm:text-sm text-[#9e8747]">Rank</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
            <Card
              className="border-[#e9e2ce]/50 bg-white/80 backdrop-blur-sm card-hover animate-slide-up group"
              style={{ animationDelay: "0.4s" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#fac638] to-[#e6b332] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6 text-[#1c180d]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#1c180d]">Upload Assignment</CardTitle>
                    <CardDescription className="text-[#9e8747]">Get help from the community</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-[#9e8747] mb-6 leading-relaxed">
                  Need help with an assignment? Upload it anonymously and get solutions from talented students in our
                  community.
                </p>
                <Link href="/upload">
                  <Button className="w-full bg-gradient-to-r from-[#fac638] to-[#e6b332] text-[#1c180d] hover:from-[#e6b332] hover:to-[#fac638] font-semibold h-12 group">
                    Upload Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card
              className="border-[#e9e2ce]/50 bg-white/80 backdrop-blur-sm card-hover animate-slide-up group"
              style={{ animationDelay: "0.5s" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#1c180d]">Browse Assignments</CardTitle>
                    <CardDescription className="text-[#9e8747]">Help others and earn points</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-[#9e8747] mb-6 leading-relaxed">
                  Help fellow students by solving their assignments. Earn points, build your reputation, and climb the
                  leaderboard.
                </p>
                <Link href="/browse">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 font-semibold h-12 group">
                    Browse Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card
            className="border-[#e9e2ce]/50 bg-white/80 backdrop-blur-sm animate-slide-up"
            style={{ animationDelay: "1.2s" }}
          >
            <CardHeader>
              <CardTitle className="text-xl text-[#1c180d] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-[#9e8747]">Your latest contributions to the community</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <div className="text-center text-[#9e8747] py-8">No recent activity yet.</div>
                    );
                  }

                  return allActivities.map((activity) => {
                    if (activity.type === 'upload') {
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-4 bg-[#f4f0e6]/50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#fac638] to-[#e6b332] rounded-lg flex items-center justify-center">
                            <Upload className="h-5 w-5 text-[#1c180d]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#1c180d]">Uploaded "{activity.title}"</p>
                            <p className="text-sm text-[#9e8747]">
                              {activity.status === "solved" ? "Solved" : "Waiting for solutions"} • {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={
                            activity.status === "solved" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }>
                            {activity.status === "solved" ? "Solved" : "Pending"}
                          </Badge>
                        </div>
                      );
                    } else {
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-4 bg-[#f4f0e6]/50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#1c180d]">Solved assignment</p>
                            <p className="text-sm text-[#9e8747]">
                              {activity.rating ? `Rated ${activity.rating}/5` : "Awaiting rating"} • {new Date(activity.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={
                            activity.rating 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }>
                            {activity.rating ? `+${activity.rating * 3} pts` : "Pending"}
                          </Badge>
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
