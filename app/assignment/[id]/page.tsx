"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  Clock,
  User,
  BookOpen,
  Upload,
  Download,
  Send,
  Loader2,
  MoreVertical,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import {
  getAssignment,
  submitSolution,
  getSubmissions,
  rateSubmission,
  getLeaderboard,
  createNotification,
} from "@/utils/api";
import type { Assignment } from "@/types/assignment";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { da } from "date-fns/locale";
import { getFileTypeInfo } from "@/utils/file-type";
import { Submission } from "@/types/submission";
import { getRatingBadge, getGemDisplay } from "@/utils/ratingBadge";
import GemIcon from "@/components/ui/GemIcon";
import DiscussionSection from "@/components/DiscussionSection";

const BASE_API = process.env.NEXT_PUBLIC_API_BASE;

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [solution, setSolution] = useState("");
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [ratingDialog, setRatingDialog] = useState<{
    open: boolean;
    submissionId: string | null;
  }>({ open: false, submissionId: null });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [editDescription, setEditDescription] = useState("");
  const [downloadLoader, setDownloadLoader] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const loadAssignment = async (id: string) => {
    try {
      const data = await getAssignment(id);
      console.log(data);
      setAssignment(data);
    } catch (error) {
      console.error("Failed to load assignment:", error);
      toast({
        title: "Error",
        description: "Failed to load assignment details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    try {
      const data = await getSubmissions({ assignmentId });
      setSubmissions(data);
    } catch (error) {
      setSubmissions([]);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch {}
  };

  useEffect(() => {
    if (params.id) {
      loadAssignment(params.id as string);
      loadSubmissions(params.id as string);
    }
    loadLeaderboard();
  }, [params.id]);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);
  if (!user) return null;

  const handleSubmitSolution = async () => {
    if (!assignment || !user) return;

    if (!solution.trim() && !solutionFile) {
      toast({
        title: "Error",
        description: "Please provide either a text solution or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newSubmission = await submitSolution({
        assignmentId: assignment.id,
        submittedBy: user.id,
        submittedByUsername: user.username,
        explanation: solution,
        file: solutionFile,
      });

      // Create notification for assignment creator (if not the same user)
      if (assignment.createdBy && assignment.createdBy !== user.id) {
        try {
          await createNotification({
            userId: assignment.createdBy,
            type: "assignment_solved",
            title: "Your Assignment Was Solved!",
            message: `${user.username} submitted a solution to your assignment: "${assignment.title}"`,
            assignmentId: assignment.id,
            submissionId: newSubmission.id || newSubmission.submissionId,
            read: false,
          });
        } catch (notifError) {
          console.error("Failed to create notification:", notifError);
          // Don't block submission if notification fails
        }
      }

      toast({
        title: "Success!",
        description: "Your solution has been submitted successfully.",
      });

      setShowSubmitDialog(false);
      setSolution("");
      setSolutionFile(null);

      // Reload assignment to update status
      await loadAssignment(assignment.id);
      await loadSubmissions(assignment.id);
      await loadLeaderboard(); // <-- ensure leaderboard is refreshed after submission
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRateSubmission = async () => {
    if (!ratingDialog.submissionId || !user) return;
    
    try {
      await rateSubmission(ratingDialog.submissionId, selectedRating, user.id);
      
      // Find the submission to get the creator from existing state
      const ratedSubmission = submissions.find((s) => s.id === ratingDialog.submissionId);
      
      // Create notification for submission creator (if not the same user)
      if (ratedSubmission && ratedSubmission.submittedBy && ratedSubmission.submittedBy !== user.id) {
        try {
          await createNotification({
            userId: ratedSubmission.submittedBy,
            type: "assignment_rated",
            title: "Your Solution Was Rated!",
            message: `${user.username} rated your solution ${selectedRating}/5 stars for "${assignment?.title || "assignment"}"`,
            assignmentId: assignment?.id,
            submissionId: ratingDialog.submissionId,
            read: false,
          });
        } catch (notifError) {
          console.error("Failed to create notification:", notifError);
          // Don't block rating if notification fails
        }
      }
      
      // Show success message
      toast({
        title: "Rating Submitted!",
        description: `You rated this solution ${selectedRating}/5 stars.`,
      });
      
      // Close dialog and reset
      setRatingDialog({ open: false, submissionId: null });
      setSelectedRating(5);
      
      // Refresh all data to show updates
      if (assignment) {
        await loadSubmissions(assignment.id);
      }
      await loadLeaderboard();
      
    } catch (error) {
      toast({
        title: "Rating Failed",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen reddit-dark-bg">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#4ade80]" />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen reddit-dark-bg">
        <Header />
        <div className="text-center py-20">
          <p className="text-gray-300">Assignment not found.</p>
                     <Button
             onClick={() => router.back()}
             className="mt-4 duolingo-button"
           >
             Go Back
           </Button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(assignment.deadline) < new Date();
  const canSubmit =
    assignment.status !== "solved" &&
    !isExpired &&
    assignment.createdBy !== user.id;

  async function handleDownload(
    url: string,
    query: URLSearchParams
  ): Promise<void> {
    setDownloadLoader(true);
    const response = await fetch(`${url}?${query.toString()}`);

    if (!response.ok) {
      console.error("Failed to download file");
      setDownloadLoader(false);
      return;
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;

    // Get filename from Content-Disposition header or use assignment title
    const contentDisposition = response.headers.get("content-disposition");
    let fileName = "downloaded-file";

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        fileName = filenameMatch[1];
      }
    }

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(downloadUrl); // Cleanup
    setDownloadLoader(false);
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file size (10MB) - only size restriction, no type restriction
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSolutionFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  return (
    <div className="min-h-screen reddit-dark-bg">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
            <button
              onClick={() => router.back()}
              className="hover:text-white"
            >
              Assignments
            </button>
            <span>/</span>
            <span className="text-white">Assignment Details</span>
          </div>

          {/* Assignment Header */}
          <Card className="study-card mb-8">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      className={getDifficultyColor(assignment.difficulty)}
                    >
                      {assignment.difficulty}
                    </Badge>
                    {isExpired && (
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Expired</Badge>
                    )}
                    <div className="ml-auto">
                      {assignment.createdBy === user.id && (
                        <DropdownMenu
                          open={dropdownOpen}
                          onOpenChange={setDropdownOpen}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 p-0"
                              aria-label="More options"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                /* handle edit */
                                if (assignment) {
                                  setEditDescription(assignment.description);
                                }
                                setDropdownOpen(false);
                                setShowSubmitDialog(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                /* handle delete */
                              }}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Dialog
                        open={showSubmitDialog}
                        onOpenChange={setShowSubmitDialog}
                      >
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Assignment</DialogTitle>
                            <DialogDescription>Cute Pie</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="solution">Edit Explanation</Label>
                              <Textarea
                                id="solution"
                                placeholder="Explain your solution here..."
                                value={editDescription}
                                onChange={(e) => {
                                  setEditDescription(e.target.value);
                                }}
                                className="min-h-32 border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="file">Edit File</Label>
                              <div className="border-2 border-dashed border-[#e9e2ce] rounded-lg p-6 text-center">
                                <Upload className="mx-auto h-8 w-8 text-[#9e8747] mb-2" />
                                <p className="text-sm text-[#1c180d] mb-2">
                                  Upload your solution file
                                </p>
                                <p className="text-xs text-[#9e8747] mb-4">
                                  PDF, DOC, DOCX, TXT (Max 10MB)
                                </p>
                                <Input
                                  id="file"
                                  type="file"
                                  onChange={(e) =>
                                    setSolutionFile(e.target.files?.[0] || null)
                                  }
                                  className="border-[#e9e2ce] bg-[#fcfbf8]"
                                />
                              </div>
                              {solutionFile && (
                                <p className="text-sm text-[#1c180d]">
                                  Selected: {solutionFile.name}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-4">
                              <Button
                                variant="outline"
                                onClick={() => setShowSubmitDialog(false)}
                                className="flex-1 border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6]"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => console.log("Edited")}
                                disabled={submitting}
                                className="flex-1 bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90"
                              >
                                {submitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Edited"
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">
                    {assignment.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    {assignment.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <BookOpen className="h-4 w-4" />
                  <span>{assignment.subject || "General"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeLeft(assignment.deadline)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="h-4 w-4" />
                  <span>Posted by {assignment.createdByUsername}</span>
                </div>
              </div>
              <div className="h-8"></div>
              {/* Assignment File Download */}
              {assignment?.awsfileUrl && (
                                 <Button
                   type="button"
                   onClick={() =>
                     handleDownload(
                       `${BASE_API}/assignments/download`,
                       new URLSearchParams({
                         email: user.email,
                         fileId: assignment.id,
                       })
                     )
                   }
                   className="inline-flex items-center gap-2 px-4 py-2 duolingo-button mb-4"
                 >
                  {downloadLoader ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download Assignment File
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Action Section */}
          <Card className="study-card">
            <CardHeader>
              <CardTitle className="text-white">
                {assignment.status === "solved"
                  ? "Solution Submitted"
                  : "Submit Your Solution"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {assignment.status === "solved"
                  ? "This assignment has been solved and submitted."
                  : canSubmit
                  ? "Help solve this assignment and earn points!"
                  : isExpired
                  ? "This assignment has expired."
                  : assignment.createdBy === user.id
                  ? "This is your assignment."
                  : "Submission not available."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canSubmit ? (
                <Dialog
                  open={showSubmitDialog}
                  onOpenChange={setShowSubmitDialog}
                >
                                     <DialogTrigger asChild>
                     <Button className="duolingo-button">
                       <Send className="h-4 w-4 mr-2" />
                       Submit Solution
                     </Button>
                   </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Your Solution</DialogTitle>
                      <DialogDescription>
                        Provide your solution to help solve this assignment. You
                        can submit text, upload a file, or both.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="solution">Solution Explanation</Label>
                        <Textarea
                            id="solution"
                            placeholder="Explain your solution here..."
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            className="min-h-32 w-full rounded-lg border border-[#4ade80]/30 bg-[#1a1a1b]/50 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] focus:outline-none transition-all duration-200"
                          />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">
                          Upload Solution File (Optional)
                        </Label>
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                            isDragOver 
                              ? 'border-[#4ade80] bg-[#4ade80]/5' 
                              : 'border-[#4ade80]/30'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <Upload className={`mx-auto h-8 w-8 mb-2 transition-colors ${
                            isDragOver ? 'text-[#4ade80]' : 'text-gray-300'
                          }`} />
                          <p className="text-sm text-white mb-2">
                            {isDragOver ? 'Drop your file here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-xs text-gray-300 mb-4">
                            All file types supported (Max 10MB)
                          </p>
                          <Input
                            id="file"
                            type="file"
                            onChange={(e) =>
                              setSolutionFile(e.target.files?.[0] || null)
                            }
                            className="border-[#4ade80]/30 bg-[#1a1a1b]/50"
                          />
                        </div>
                        {solutionFile && (
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <Upload className="h-4 w-4 text-green-400" />
                            <p className="text-sm text-green-400 font-medium">
                              {solutionFile.name}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSolutionFile(null)}
                              className="ml-auto h-6 w-6 p-0 text-green-400 hover:text-green-300"
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                                                 <Button
                           variant="outline"
                           onClick={() => setShowSubmitDialog(false)}
                           className="flex-1 duolingo-button-secondary"
                         >
                           Cancel
                         </Button>
                         <Button
                           onClick={handleSubmitSolution}
                           disabled={submitting}
                           className="flex-1 duolingo-button"
                         >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Solution"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : assignment.status === "solved" ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                    <Star className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-white font-medium">
                    Solution has been submitted!
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    The assignment creator will be notified.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-300">
                    {isExpired
                      ? "This assignment has expired."
                      : "Submission not available."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {submissions.length > 0 && (
            <Card className="study-card mt-8">
              <CardHeader>
                <CardTitle className="text-white">
                  Submitted Solutions
                </CardTitle>
                <CardDescription className="text-gray-300">
                  All solutions submitted for this assignment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="study-card"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {submission.rating ? (
                                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                  Rated
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                  Under Review
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-white mb-2">
                              Solution
                            </h3>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                              {submission.explanation}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                              <span>
                                Submitted{" "}
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleDateString()}
                              </span>
                              {submission.rating ? (
                                <div className="flex items-center gap-2">
                                 <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="font-medium">
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
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400">Not rated yet</span>
                                  <Badge variant="outline" className="text-xs">
                                    Needs Rating
                                  </Badge>
                                </div>
                               )}
                            </div>
                            {/* Rating button for assignment creator */}
                            {user &&
                              assignment &&
                              assignment.createdBy === user.id &&
                              !submission.rating && (
                                                                 <Button
                                   className="mt-4 duolingo-button"
                                   onClick={() =>
                                     setRatingDialog({
                                       open: true,
                                       submissionId: submission.id,
                                     })
                                   }
                                 >
                                   Rate Solution
                                 </Button>
                              )}
                            <div className="h-8"></div>
                            {/* Submission File Download */}
                            {submission.fileUrl && (
                                                             <Button
                                 type="button"
                                 onClick={() =>
                                   handleDownload(
                                     `${BASE_API}/submissions/download`,
                                     new URLSearchParams({
                                       email: user.email,
                                       fileId: submission.id,
                                     })
                                   )
                                 }
                                 className="inline-flex items-center gap-2 px-4 py-2 duolingo-button mb-4"
                               >
                                {downloadLoader ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <>
                                    <Download className="h-5 w-5" />
                                    Download Solution
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          <div className="ml-4">
                            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {submission.submittedByUsername}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discussion Section */}
          <DiscussionSection
            assignmentId={assignment.id}
            currentUserId={user.id}
            currentUsername={user.username}
          />

          {/* Rating Dialog */}
          <Dialog
            open={ratingDialog.open}
            onOpenChange={(open) =>
              setRatingDialog({ open, submissionId: ratingDialog.submissionId })
            }
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Rate Solution</DialogTitle>
                <DialogDescription>
                  Select a rating tier for this solution. Higher ratings unlock better badge tiers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 my-6">
                {[
                  { rating: 3.0, tier: 'bronze', label: 'BRONZE', description: '3 rubies' },
                  { rating: 3.5, tier: 'copper', label: 'COPPER', description: '7 rubies' },
                  { rating: 4.0, tier: 'silver', label: 'SILVER', description: '1 emerald' },
                  { rating: 4.5, tier: 'gold', label: 'GOLD', description: '3 emeralds' },
                  { rating: 4.5, tier: 'platinum', label: 'PLATINUM', description: '5 emeralds' }
                ].map((tier) => {
                  const badge = getRatingBadge(tier.rating);
                  return (
                    <button
                      key={tier.tier}
                      onClick={() => setSelectedRating(tier.rating)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        selectedRating === tier.rating
                          ? 'border-[#4ade80] ring-2 ring-[#4ade80] shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`${badge.className} mb-2`}>
                        <span className="text-xs font-bold">{tier.label}</span>
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
                      <div className="text-center">
                        <div className="text-xs text-gray-500">{tier.description}</div>
                      </div>
                  </button>
                  );
                })}
              </div>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Selected Rating: <span className="font-semibold">{selectedRating}/5</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  💎 1 Emerald = 10 Rubies | 🔴 Rubies for lower tiers, 💎 Emeralds for higher tiers
                </p>
                {selectedRating >= 3.0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">This rating will give the solution:</p>
                    {(() => {
                      const badge = getRatingBadge(selectedRating);
                      return (
                        <div className={`${badge.className} inline-block`}>
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
                )}
              </div>
              <div className="flex gap-4">
                                 <Button
                   variant="outline"
                   onClick={() =>
                     setRatingDialog({ open: false, submissionId: null })
                   }
                   className="flex-1 duolingo-button-secondary"
                 >
                   Cancel
                 </Button>
                 <Button
                   onClick={handleRateSubmission}
                   className="flex-1 duolingo-button"
                 >
                   Submit Rating
                 </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
