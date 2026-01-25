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
import { useState, useEffect } from "react"
import { getAssignments, getSubmissions, getLeaderboard, getNotifications } from "@/utils/api";
import { getRatingBadge, getGemDisplay } from "@/utils/ratingBadge";
import GemIcon from "@/components/ui/GemIcon";
import Header from "@/components/Header";
import ResourcesHub from "@/components/ResourcesHub";

export default function HomePage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalAssignments: 0,
    solvedAssignments: 0,
    points: 0,
    rank: 0,
    averageRating: 0,
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
    
    let isMounted = true;
    
    async function fetchStats() {
      if (!isMounted) return;
      
      try {
        console.log('Fetching stats for user:', user?.id);
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
        
        if (isMounted) {
          setRecentUploads(allActivities.filter(a => a.type === 'upload'));
          setRecentSubmissions(allActivities.filter(a => a.type === 'submission'));
          
          // Fetch notifications for the current user (if logged in)
          if (user) {
            const notifs = await getNotifications({ userId: user.id });
            setNotifications(notifs);
          }
          
          // Get trending assignments (recent and unsolved, and not removed)
          const now = new Date();
          const trending = assignments
            .filter((a: any) => {
              // Filter out assignments 8+ hours past deadline
              const deadlineDate = new Date(a.deadline);
              const hoursPastDeadline = (now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60);
              return a.status !== "solved" && hoursPastDeadline < 8;
            })
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setTrendingAssignments(trending);
          setAllAssignments(assignments);
          
          // Stats (user-specific)
          const userSolvedAssignments = userSubmissions.length; // User's solved assignments
          const userUploadedAssignments = userAssignments.length; // User's uploaded assignments
          const leaderboard = await getLeaderboard();
          // Find current user's rank if logged in
          let rank = 0, points = 0, averageRating = 0;
          if (user) {
            const userEntry = leaderboard.find(u => u.id === user.id);
            rank = leaderboard.findIndex(u => u.id === user.id) + 1;
            points = userEntry ? userEntry.points : 0;
            averageRating = userEntry?.averageRating || user.averageRating || 0;
          }
          setStats({
            totalAssignments: userUploadedAssignments, // User's uploaded assignments
            solvedAssignments: userSolvedAssignments, // User's solved assignments
            points: points,
            rank: rank,
            averageRating: averageRating,
          });
          setLoadingStats(false);
          console.log('Stats loaded successfully');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching stats:', error);
          setLoadingStats(false);
        }
      }
    }
    
    fetchStats();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      console.log('Polling for updates...');
      fetchStats();
    }, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]); // Only depend on user ID to prevent re-renders

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

  return <ResourcesHub />
}
