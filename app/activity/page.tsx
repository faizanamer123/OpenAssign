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
import { Clock, BookOpen, Star, Trash2 } from "lucide-react";
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

export default function ActivityPage() {
  const { user } = useAuth();
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "solved":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff < 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen reddit-dark-bg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #4ade80 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #22c55e 0%, transparent 50%)`,
          backgroundSize: '400px 400px'
        }}></div>
      </div>
      
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                My Activity Dashboard
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Track your uploaded assignments and submitted solutions with detailed insights and progress tracking.
              </p>
            </div>
            
            {/* Activity Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 text-center hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{myAssignments.length}</h3>
                <p className="text-green-400 text-sm font-medium">Uploaded Assignments</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-center hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{mySubmissions.length}</h3>
                <p className="text-blue-400 text-sm font-medium">Submitted Solutions</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 text-center hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {myAssignments.filter(a => a.status === 'pending').length}
                </h3>
                <p className="text-purple-400 text-sm font-medium">Pending Reviews</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="uploaded" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 study-card p-1 bg-gray-800/50 border border-gray-700/50">
              <TabsTrigger
                value="uploaded"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4ade80] data-[state=active]:to-[#22c55e] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                My Uploads ({myAssignments.length})
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#4ade80] data-[state=active]:to-[#22c55e] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/25 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                My Submissions ({mySubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="uploaded" className="space-y-6">
              <Card className="study-card border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-700/50 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">
                        Assignments You've Uploaded
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Track the status and progress of assignments you've posted for community help.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading your assignments...</p>
                    </div>
                  ) : myAssignments.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Assignments Yet</h3>
                      <p className="text-gray-300 mb-6 max-w-md mx-auto">
                        Start your journey by uploading your first assignment and getting help from the community.
                      </p>
                      <div className="flex justify-center">
                        <Link href="/upload" className="w-full sm:w-auto max-w-xs">
                          <Button className="duolingo-button w-full sm:w-auto px-4 sm:px-8 py-3 text-sm sm:text-base">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                            <span className="truncate">Upload Your First Assignment</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myAssignments.map((assignment) => (
                        <Card
                          key={assignment.id}
                          className="study-card hover:shadow-lg hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300 group"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge
                                    className={`${getStatusColor(
                                      assignment.status
                                    )} px-3 py-1 text-xs font-medium`}
                                  >
                                    {assignment.status.replace("_", " ").toUpperCase()}
                                  </Badge>
                                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 text-xs font-medium">
                                    {assignment.difficulty}
                                  </Badge>
                                  {assignment.status === "pending" && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 text-xs font-medium animate-pulse">
                                      ⏳ Awaiting Solutions
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-white text-lg mb-3 group-hover:text-[#4ade80] transition-colors">
                                  {assignment.title}
                                </h3>
                                <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {assignment.description}
                                </p>
                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                      <BookOpen className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="font-medium text-white">{assignment.subject || "General"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                      <Clock className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <span className={`font-medium ${
                                      formatTimeLeft(assignment.deadline) === "Expired" 
                                        ? "text-red-400" 
                                        : "text-white"
                                    }`}>
                                      {formatTimeLeft(assignment.deadline)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-3 ml-6">
                                <Link href={`/assignment/${assignment.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#4ade80]/30 text-white hover:bg-[#4ade80]/10 bg-transparent hover:border-[#4ade80]/50 transition-all duration-300"
                                  >
                                    View Details
                                  </Button>
                                </Link>
                                {assignment.status === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent hover:border-red-500/50 transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submitted" className="space-y-6">
              <Card className="study-card border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-700/50 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">
                        Solutions You've Submitted
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        View your submitted solutions, track ratings, and see your progress.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-300">Loading your submissions...</p>
                    </div>
                  ) : mySubmissions.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Solutions Yet</h3>
                      <p className="text-gray-300 mb-6 max-w-md mx-auto">
                        Start helping others by solving assignments and earning ratings from the community.
                      </p>
                      <div className="flex justify-center">
                        <Link href="/browse" className="w-full sm:w-auto max-w-xs">
                          <Button className="duolingo-button w-full sm:w-auto px-4 sm:px-8 py-3 text-sm sm:text-base">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                            <span className="truncate">Browse Assignments to Solve</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mySubmissions.map((submission) => (
                        <Card
                          key={submission.id}
                          className="study-card hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300 group"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  {submission.rating ? (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="font-medium text-white text-sm">
                                          {submission.rating}/5
                                        </span>
                                      </div>
                                      {(() => {
                                        const badge = getRatingBadge(submission.rating);
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
                                  ) : (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 text-xs font-medium animate-pulse">
                                      ⏳ Under Review
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-white text-lg mb-3 group-hover:text-blue-400 transition-colors">
                                  Assignment Solution
                                </h3>
                                <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {submission.explanation}
                                </p>
                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                      <Clock className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="font-medium text-white">
                                      Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {submission.rating && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Star className="w-4 h-4 text-green-400" />
                                      </div>
                                      <span className="font-medium text-white">
                                        Rated {submission.rating}/5
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-6">
                                <Link
                                  href={`/assignment/${submission.assignmentId}`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-500/30 text-white hover:bg-blue-500/10 bg-transparent hover:border-blue-500/50 transition-all duration-300"
                                  >
                                    View Assignment
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
