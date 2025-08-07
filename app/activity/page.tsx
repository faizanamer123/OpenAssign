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
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "solved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c180d] mb-2">
              My Activity
            </h1>
            <p className="text-[#9e8747]">
              Track your uploaded assignments and submitted solutions.
            </p>
          </div>

          <Tabs defaultValue="uploaded" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-[#f4f0e6]">
              <TabsTrigger
                value="uploaded"
                className="data-[state=active]:bg-[#fac638] data-[state=active]:text-[#1c180d]"
              >
                My Uploads ({myAssignments.length})
              </TabsTrigger>
              <TabsTrigger
                value="submitted"
                className="data-[state=active]:bg-[#fac638] data-[state=active]:text-[#1c180d]"
              >
                My Submissions ({mySubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="uploaded" className="space-y-6">
              <Card className="border-[#e9e2ce] bg-[#fcfbf8]">
                <CardHeader>
                  <CardTitle className="text-[#1c180d]">
                    Assignments You've Uploaded
                  </CardTitle>
                  <CardDescription className="text-[#9e8747]">
                    Track the status of assignments you've posted for help.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-[#9e8747] text-center py-8">
                      Loading your assignments...
                    </p>
                  ) : myAssignments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#9e8747] mb-4">
                        You haven't uploaded any assignments yet.
                      </p>
                      <Link href="/upload">
                        <Button className="bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90">
                          Upload Your First Assignment
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myAssignments.map((assignment) => (
                        <Card
                          key={assignment.id}
                          className="border-[#e9e2ce] bg-[#fcfbf8]"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className={getStatusColor(
                                      assignment.status
                                    )}
                                  >
                                    {assignment.status.replace("_", " ")}
                                  </Badge>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {assignment.difficulty}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-[#1c180d] mb-2">
                                  {assignment.title}
                                </h3>
                                <p className="text-[#9e8747] text-sm mb-3 line-clamp-2">
                                  {assignment.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-[#9e8747]">
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>
                                      {assignment.subject || "General"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {formatTimeLeft(assignment.deadline)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Link href={`/assignment/${assignment.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6] bg-transparent"
                                  >
                                    View
                                  </Button>
                                </Link>
                                {assignment.status === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
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
              <Card className="border-[#e9e2ce] bg-[#fcfbf8]">
                <CardHeader>
                  <CardTitle className="text-[#1c180d]">
                    Solutions You've Submitted
                  </CardTitle>
                  <CardDescription className="text-[#9e8747]">
                    View your submitted solutions and their ratings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-[#9e8747] text-center py-8">
                      Loading your submissions...
                    </p>
                  ) : mySubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#9e8747] mb-4">
                        You haven't submitted any solutions yet.
                      </p>
                      <Link href="/browse">
                        <Button className="bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90">
                          Browse Assignments to Solve
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mySubmissions.map((submission) => (
                        <Card
                          key={submission.id}
                          className="border-[#e9e2ce] bg-[#fcfbf8]"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {submission.rating ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      Rated
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      Under Review
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-[#1c180d] mb-2">
                                  Assignment Solution
                                </h3>
                                <p className="text-[#9e8747] text-sm mb-3 line-clamp-2">
                                  {submission.explanation}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-[#9e8747]">
                                  <span>
                                    Submitted{" "}
                                    {new Date(
                                      submission.submittedAt
                                    ).toLocaleDateString()}
                                  </span>
                                  {submission.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                      <span className="font-medium">
                                        {submission.rating}/5
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <Link
                                  href={`/assignment/${submission.assignmentId}`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6] bg-transparent"
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
