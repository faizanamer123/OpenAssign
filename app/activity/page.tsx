"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  BookOpen, 
  Star, 
  Trash2, 
  TrendingUp, 
  Upload, 
  CheckCircle2,
  LayoutDashboard,
  ArrowRight,
  Calendar,
  Loader2,
  FileText,
  Trophy,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});
import { useAuth } from "@/context/AuthContext";
import type { Assignment } from "@/types/assignment";
import type { Submission } from "@/types/submission";
import { getAssignments, getSubmissions } from "@/utils/api";
import { getRatingBadge } from "@/utils/ratingBadge";
import GemIcon from "@/components/ui/GemIcon";

// Skeleton loader component
const ActivityCardSkeleton = () => (
  <Card className="study-card animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex gap-3">
            <div className="h-6 w-20 bg-gray-700/50 rounded-full"></div>
            <div className="h-6 w-16 bg-gray-700/50 rounded-full"></div>
          </div>
          <div className="h-6 w-3/4 bg-gray-700/50 rounded"></div>
          <div className="h-4 w-full bg-gray-700/50 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-700/50 rounded"></div>
          <div className="flex gap-6">
            <div className="h-5 w-24 bg-gray-700/50 rounded"></div>
            <div className="h-5 w-20 bg-gray-700/50 rounded"></div>
          </div>
        </div>
        <div className="h-9 w-28 bg-gray-700/50 rounded-lg"></div>
      </div>
    </CardContent>
  </Card>
);

export default function ActivityPage() {
  const { user } = useAuth();
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uploaded");

  useEffect(() => {
    if (user) {
      loadUserActivity();
    }
  }, [user]);

  const loadUserActivity = async () => {
    setLoading(true);
    try {
      // Fetch all assignments and filter by user
      const allAssignments = await getAssignments();
      setMyAssignments(
        allAssignments.filter((a: any) => a.createdBy === user?.id)
      );
      // Fetch submissions for the current user
      const submissions = await getSubmissions({ userId: user?.id });
      setMySubmissions(submissions);
    } catch (error) {
      setMyAssignments([]);
      setMySubmissions([]);
      console.error("Failed to load activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-yellow-500/20";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-blue-500/20";
      case "solved":
        return "bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/20";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff < 0) return { text: "Expired", urgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 1 };
    if (hours > 0) return { text: `${hours}h ${minutes}m left`, urgent: hours <= 6 };
    return { text: `${minutes}m left`, urgent: true };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const pendingCount = myAssignments.filter(a => a.status === 'pending').length;
  const solvedCount = myAssignments.filter(a => a.status === 'solved').length;
  const ratedSubmissions = mySubmissions.filter(s => s.rating).length;
  const averageRating = mySubmissions.filter(s => s.rating).length > 0
    ? (mySubmissions.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSubmissions).toFixed(1)
    : "0.0";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background reddit-dark-bg relative overflow-hidden animate-fade-in">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, #4ade80 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, #22c55e 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, #9333ea 0%, transparent 50%)`,
          backgroundSize: '600px 600px, 500px 500px, 400px 400px'
        }}></div>
      </div>
      
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Enhanced Header Section */}
          <div className="mb-10 animate-slide-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#4ade80] via-[#22c55e] to-[#16a34a] rounded-2xl mb-6 shadow-lg shadow-[#4ade80]/30 animate-in zoom-in duration-500 group">
                <LayoutDashboard className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h1 className="text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
                My Activity Dashboard
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                Track your uploaded assignments and submitted solutions with detailed insights and progress tracking.
              </p>
            </div>
            
            {/* Enhanced Activity Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Card className="study-card bg-gradient-to-br from-green-500/10 via-green-600/10 to-green-700/10 border-green-500/30 hover:border-green-400/50 hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/20">
                      <Upload className="w-7 h-7 text-green-400" />
                    </div>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-green-400/50" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1 tabular-nums">
                    {loading ? "..." : myAssignments.length}
                  </h3>
                  <p className="text-green-400 text-sm font-semibold">Uploaded Assignments</p>
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <p className="text-xs text-gray-400">
                      {solvedCount} solved • {pendingCount} pending
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="study-card bg-gradient-to-br from-blue-500/10 via-blue-600/10 to-blue-700/10 border-blue-500/30 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500 delay-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                      <FileText className="w-7 h-7 text-blue-400" />
                    </div>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-blue-400/50" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1 tabular-nums">
                    {loading ? "..." : mySubmissions.length}
                  </h3>
                  <p className="text-blue-400 text-sm font-semibold">Submitted Solutions</p>
                  <div className="mt-3 pt-3 border-t border-blue-500/20">
                    <p className="text-xs text-gray-400">
                      {ratedSubmissions} rated • {mySubmissions.length - ratedSubmissions} pending
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="study-card bg-gradient-to-br from-purple-500/10 via-purple-600/10 to-purple-700/10 border-purple-500/30 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500 delay-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                      <Clock className="w-7 h-7 text-purple-400" />
                    </div>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    ) : pendingCount > 0 ? (
                      <AlertCircle className="w-5 h-5 text-purple-400 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-purple-400/50" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1 tabular-nums">
                    {loading ? "..." : pendingCount}
                  </h3>
                  <p className="text-purple-400 text-sm font-semibold">Pending Reviews</p>
                  <div className="mt-3 pt-3 border-t border-purple-500/20">
                    <p className="text-xs text-gray-400">
                      Awaiting community feedback
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="study-card bg-gradient-to-br from-yellow-500/10 via-yellow-600/10 to-yellow-700/10 border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500 delay-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-500/20">
                      <Trophy className="w-7 h-7 text-yellow-400" />
                    </div>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                    ) : (
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/50" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1 tabular-nums">
                    {loading ? "..." : averageRating}
                  </h3>
                  <p className="text-yellow-400 text-sm font-semibold">Average Rating</p>
                  <div className="mt-3 pt-3 border-t border-yellow-500/20">
                    <p className="text-xs text-gray-400">
                      Based on {ratedSubmissions} ratings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <Tabs defaultValue="uploaded" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 study-card p-1.5 bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm h-auto">
              <TabsTrigger
                value="uploaded"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4ade80] data-[state=active]:to-[#22c55e] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 rounded-lg transition-all duration-300 flex items-center gap-2 py-3 font-semibold data-[state=inactive]:text-gray-400 hover:text-white"
              >
                <BookOpen className="w-4 h-4" />
                <span>My Uploads</span>
                {!loading && myAssignments.length > 0 && (
                  <Badge className="ml-1 bg-white/20 text-white border-0 text-xs px-2 py-0.5">
                    {myAssignments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4ade80] data-[state=active]:to-[#22c55e] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 rounded-lg transition-all duration-300 flex items-center gap-2 py-3 font-semibold data-[state=inactive]:text-gray-400 hover:text-white"
              >
                <Star className="w-4 h-4" />
                <span>My Submissions</span>
                {!loading && mySubmissions.length > 0 && (
                  <Badge className="ml-1 bg-white/20 text-white border-0 text-xs px-2 py-0.5">
                    {mySubmissions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="uploaded" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="study-card border-0 bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 backdrop-blur-sm shadow-2xl">
                <CardHeader className="border-b border-gray-700/50 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                        <Upload className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-white text-xl sm:text-2xl mb-1 truncate">
                          Assignments You've Uploaded
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-sm sm:text-base">
                          Track the status and progress of assignments you've posted for community help.
                        </CardDescription>
                      </div>
                    </div>
                    {!loading && myAssignments.length > 0 && (
                      <div className="flex-shrink-0">
                        <Link href="/upload" className="block w-full sm:w-auto">
                          <Button className="duolingo-button font-semibold group w-full sm:w-auto">
                            <Upload className="mr-2 h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                            Upload New
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <ActivityCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : myAssignments.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 px-4 animate-scale-in">
                      <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-2xl mb-4 sm:mb-6 shadow-lg">
                        <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 px-2">No Assignments Yet</h3>
                      <p className="text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-lg leading-relaxed px-2">
                        Start your journey by uploading your first assignment and getting help from the community.
                      </p>
                      <div className="px-2">
                        <Link href="/upload" className="inline-block w-full sm:w-auto max-w-xs">
                          <Button className="duolingo-button px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base group w-full sm:w-auto">
                            <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-y-[-2px] transition-transform flex-shrink-0" />
                            <span className="truncate">Upload Your First Assignment</span>
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform flex-shrink-0 hidden sm:inline-block" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myAssignments.map((assignment, index) => {
                        const timeInfo = formatTimeLeft(assignment.deadline);
                        return (
                          <Card
                            key={assignment.id}
                            className="study-card hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-400/40 hover:-translate-y-1 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <Badge
                                      className={`${getStatusColor(
                                        assignment.status
                                      )} px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold shadow-lg`}
                                    >
                                      {assignment.status.replace("_", " ").toUpperCase()}
                                    </Badge>
                                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold">
                                      {assignment.difficulty}
                                    </Badge>
                                    {assignment.status === "pending" && (
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold animate-pulse shadow-lg shadow-yellow-500/20">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">Awaiting Solutions</span>
                                        <span className="sm:hidden">Awaiting</span>
                                      </Badge>
                                    )}
                                    {assignment.status === "solved" && (
                                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Solved
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-white text-lg sm:text-xl mb-2 sm:mb-3 group-hover:text-[#4ade80] transition-colors line-clamp-1">
                                    {assignment.title}
                                  </h3>
                                  <p className="text-gray-300 text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
                                    {assignment.description}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 sm:gap-6 text-sm">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-gray-400 text-xs">Subject</p>
                                        <p className="font-semibold text-white truncate">{assignment.subject || "General"}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${timeInfo.urgent ? 'bg-red-500/20' : 'bg-orange-500/20'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                                        <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${timeInfo.urgent ? 'text-red-400' : 'text-orange-400'}`} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-gray-400 text-xs">Deadline</p>
                                        <p className={`font-semibold ${timeInfo.urgent ? 'text-red-400' : 'text-white'} truncate`}>
                                          {timeInfo.text}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
                                  <Link href={`/assignment/${assignment.id}`} className="flex-1 sm:flex-initial">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="duolingo-button-secondary border-0 font-semibold group w-full sm:w-auto"
                                    >
                                      <span className="hidden sm:inline">View Details</span>
                                      <span className="sm:hidden">View</span>
                                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submitted" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="study-card border-0 bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 backdrop-blur-sm shadow-2xl">
                <CardHeader className="border-b border-gray-700/50 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Star className="w-6 h-6 text-blue-400 fill-blue-400/30" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-white text-xl sm:text-2xl mb-1 truncate">
                          Solutions You've Submitted
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-sm sm:text-base">
                          View your submitted solutions, track ratings, and see your progress.
                        </CardDescription>
                      </div>
                    </div>
                    {!loading && mySubmissions.length > 0 && (
                      <div className="flex-shrink-0">
                        <Link href="/browse" className="block w-full sm:w-auto">
                          <Button className="duolingo-button font-semibold group w-full sm:w-auto">
                            <FileText className="mr-2 h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                            Browse More
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <ActivityCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : mySubmissions.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 px-4 animate-scale-in">
                      <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-2xl mb-4 sm:mb-6 shadow-lg">
                        <Star className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 px-2">No Solutions Yet</h3>
                      <p className="text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-lg leading-relaxed px-2">
                        Start helping others by solving assignments and earning ratings from the community.
                      </p>
                      <div className="px-2">
                        <Link href="/browse" className="inline-block w-full sm:w-auto max-w-xs">
                          <Button className="duolingo-button px-4 sm:px-8 py-4 sm:py-6 text-sm sm:text-base group w-full sm:w-auto">
                            <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-y-[-2px] transition-transform flex-shrink-0" />
                            <span className="truncate">Browse Assignments to Solve</span>
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform flex-shrink-0 hidden sm:inline-block" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mySubmissions.map((submission, index) => {
                        const badge = submission.rating ? getRatingBadge(submission.rating) : null;
                        return (
                          <Card
                            key={submission.id}
                            className="study-card hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    {submission.rating ? (
                                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                          <span className="font-bold text-white text-sm">
                                            {submission.rating}/5
                                          </span>
                                        </div>
                                        {badge && (
                                          <div className={`${badge.className} px-2 sm:px-3 py-1.5 flex items-center gap-2 shadow-lg`}>
                                            <span className="text-xs font-bold">{badge.displayText}</span>
                                            <span className="text-xs flex items-center gap-1 font-semibold">
                                              {badge.emeralds > 0 ? (
                                                <>
                                                  {badge.emeralds} <GemIcon type="emerald" size={14} />
                                                </>
                                              ) : (
                                                <>
                                                  {badge.rubies} <GemIcon type="ruby" size={14} />
                                                </>
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 sm:px-3 py-1.5 text-xs font-semibold animate-pulse shadow-lg shadow-yellow-500/20">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Under Review
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-bold text-white text-lg sm:text-xl mb-2 sm:mb-3 group-hover:text-blue-400 transition-colors">
                                    Assignment Solution
                                  </h3>
                                  <p className="text-gray-300 text-sm mb-4 sm:mb-5 line-clamp-2 leading-relaxed">
                                    {submission.explanation}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 sm:gap-6 text-sm">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-gray-400 text-xs">Submitted</p>
                                        <p className="font-semibold text-white truncate">{formatDate(submission.submittedAt)}</p>
                                      </div>
                                    </div>
                                    {submission.rating && (
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-gray-400 text-xs">Rating</p>
                                          <p className="font-semibold text-white truncate">{submission.rating}/5 Stars</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 w-full sm:w-auto">
                                  <Link href={`/assignment/${submission.assignmentId}`} className="block w-full sm:w-auto">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="duolingo-button-secondary border-0 font-semibold group w-full sm:w-auto"
                                    >
                                      <span className="hidden sm:inline">View Assignment</span>
                                      <span className="sm:hidden">View</span>
                                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
