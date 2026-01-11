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
      loadLeaderboard();
      // Set up polling for real-time updates (every 30 seconds)
      const interval = setInterval(() => {
        loadAssignment(params.id as string);
        loadSubmissions(params.id as string);
        loadLeaderboard();
      }, 30000);
      return () => clearInterval(interval);
    }
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
      <div className="min-h-screen bg-[#10221b]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1a2e26]/50 rounded-full mb-4 border border-[#283933]">
              <span className="material-symbols-outlined text-[#13ec9c] text-4xl">error_outline</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Assignment not found</h1>
            <p className="text-[#9db9af]">The assignment you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.back()}
              className="mt-6 bg-[#13ec9c] hover:bg-[#10b981] text-[#10221b] font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(19,236,156,0.3)] hover:shadow-[0_0_25px_rgba(19,236,156,0.4)] flex items-center gap-2 mx-auto"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(assignment.deadline) < new Date();
  const now = new Date();
  const deadlineDate = new Date(assignment.deadline);
  const hoursPastDeadline = (now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60);
  const isRemoved = hoursPastDeadline >= 8; // Removed if 8+ hours past deadline
  const isWithinRemovalWindow = isExpired && hoursPastDeadline < 8; // Expired but within 8-hour window
  
  const canSubmit =
    assignment.status !== "solved" &&
    !isExpired &&
    assignment.createdBy !== user.id;

  // Don't show assignment if it's been removed (8+ hours past deadline)
  if (isRemoved) {
    return (
      <div className="min-h-screen bg-[#10221b]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-112px)] px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1a2e26]/50 rounded-full mb-4 border border-[#283933]">
              <span className="material-symbols-outlined text-[#ef4444] text-4xl">delete_forever</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Assignment Removed</h1>
            <p className="text-[#9db9af]">This assignment has been automatically removed 8 hours after its deadline.</p>
            <button
              onClick={() => router.back()}
              className="mt-6 bg-[#13ec9c] hover:bg-[#10b981] text-[#10221b] font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(19,236,156,0.3)] hover:shadow-[0_0_25px_rgba(19,236,156,0.4)] flex items-center gap-2 mx-auto"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[#10221b]">
      <Header />
      <div className="pt-28">

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => router.back()}
            className="text-[#9db9af] text-sm font-medium hover:text-[#13ec9c] transition-colors"
            >
            Courses
            </button>
          <span className="text-[#283933] text-sm">/</span>
          <button
            onClick={() => router.back()}
            className="text-[#9db9af] text-sm font-medium hover:text-[#13ec9c] transition-colors"
          >
            {assignment.subject || 'Assignments'}
          </button>
          <span className="text-[#283933] text-sm">/</span>
          <span className="text-white text-sm font-medium">{assignment.title}</span>
          </div>

        {/* Warning Banner - Expired but within 8-hour window */}
        {isWithinRemovalWindow && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-400 text-xl">warning</span>
              </div>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-bold text-lg mb-2">Assignment Expired - Removal Warning</h3>
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                  This assignment has passed its deadline and will be <strong className="text-yellow-400">automatically removed in {Math.max(0, Math.floor(8 - hoursPastDeadline))} hours</strong> (8 hours after the deadline).
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  <strong className="text-yellow-400">Important:</strong> Please download any solutions, resources, or materials you need before the assignment is removed. Once removed, the assignment and all associated data will no longer be accessible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#283933] pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-[#13ec9c]/20 text-[#13ec9c] text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest">Premium Content</span>
              <span className="text-[#9db9af] text-xs">{formatTimeLeft(assignment.deadline)}</span>
            </div>
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">{assignment.title}</h1>
            <p className="text-[#9db9af] text-lg font-normal">Module 4: Practical Applications of BFS and DFS</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a2e26] text-white text-sm font-bold border border-[#283933] hover:bg-[#283933] transition-all">
              <span className="material-symbols-outlined text-sm">bookmark</span> Save
            </button>
            {canSubmit && (
              <button 
                onClick={() => setShowSubmitDialog(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13ec9c] text-[#10221b] text-sm font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(19,236,156,0.2)]"
              >
                <span className="truncate">Submit Solution</span>
              </button>
            )}
            {assignment.status === "solved" && (
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13ec9c] text-[#10221b] text-sm font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(19,236,156,0.2)]">
                <span className="truncate">Mark as Complete</span>
              </button>
            )}
          </div>
                            </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Left Column: Assignment Detail */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <section className="bg-[#1a2e26]/30 p-8 rounded-2xl border border-[#283933]">
              <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec9c]">description</span> Problem Statement
              </h2>
              <div className="space-y-4 text-[#d1dfd9] leading-relaxed">
                <p>{assignment.description}</p>
                {assignment.objectives && (
                  <div className="bg-[#10221b] p-4 rounded-xl border-l-4 border-[#13ec9c] mt-6">
                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Objectives</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-[#d1dfd9]">
                      {assignment.objectives.split('\n').filter((line: string) => line.trim()).map((objective: string, index: number) => (
                        <li key={index}>{objective.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
                            </div>
            </section>

            {/* Resource Files */}
            {assignment?.awsfileUrl && (
              <section>
                <h3 className="text-white text-lg font-bold mb-4 px-2">Resource Files</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => {
                      if (assignment.awsfileUrl) {
                        window.open(assignment.awsfileUrl, '_blank');
                      }
                    }}
                    className="flex items-center justify-between p-4 bg-[#1a2e26] rounded-xl border border-[#283933] hover:border-[#13ec9c]/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#13ec9c]">description</span>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">
                          {assignment.awsfileUrl.split('/').pop() || 'Resource File'}
                        </p>
                        <p className="text-xs text-[#9db9af]">Click to download</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#9db9af]">download</span>
                  </div>
                </div>
              </section>
            )}
                            </div>

          {/* Right Column: Partial Solution Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="relative rounded-2xl overflow-hidden border border-[#283933] bg-[#0d1612]">
                <div className="p-4 border-b border-[#283933] flex justify-between items-center bg-[#1a2e26]">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#9db9af]">Solution Preview: solution.py</span>
                  <span className="text-[10px] bg-[#13ec9c]/10 text-[#13ec9c] border border-[#13ec9c]/20 px-2 py-0.5 rounded-full">Python 3.10</span>
                          </div>
                {/* Blurred Content */}
                <div className="p-6 h-[480px] overflow-hidden relative">
                  <pre className="text-sm leading-6 mask-gradient font-mono text-white">
                    <span className="text-purple-400">import</span> collections{'\n\n'}
                    <span className="text-gray-500"># Function to detect cycles in directed graph</span>{'\n'}
                    <span className="text-blue-400">def</span> <span className="text-yellow-400">is_cyclic</span>(graph, V):{'\n'}
                    {'    '}in_degree = [<span className="text-orange-400">0</span>] * V{'\n\n'}
                    {'    '}<span className="text-blue-400">for</span> u <span className="text-blue-400">in</span> <span className="text-yellow-400">range</span>(V):{'\n'}
                    {'        '}<span className="text-blue-400">for</span> v <span className="text-blue-400">in</span> graph[u]:{'\n'}
                    {'            '}in_degree[v] += <span className="text-orange-400">1</span>{'\n            '}
                    {'            '}<span className="text-gray-400 blur-sm">while queue:</span>{'\n'}
                    {'            '}<span className="text-gray-400 blur-md">    u = queue.popleft()</span>{'\n'}
                    {'            '}<span className="text-gray-400 blur-lg">    top_order.append(u)</span>{'\n'}
                    {'            '}<span className="text-gray-400 blur-xl">    for v in graph[u]:</span>{'\n'}
                    {'            '}<span className="text-gray-400 blur-2xl">        in_degree[v] -= 1</span>{'\n'}
                    {'            '}<span className="text-gray-400 blur-3xl">        if in_degree[v] == 0:</span>
                  </pre>
                  {/* Glassmorphic Paywall */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="glass-overlay w-full max-w-sm p-8 rounded-2xl text-center shadow-2xl flex flex-col items-center bg-[#1a2e26]/40 backdrop-blur-md border border-white/10">
                      <div className="size-16 bg-[#13ec9c]/20 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-[#13ec9c] text-3xl">lock</span>
                    </div>
                      <h3 className="text-xl font-bold mb-2 text-white">Unlock Full Solution</h3>
                      <p className="text-sm text-[#9db9af] mb-8 leading-relaxed">
                        Get step-by-step explanations, time complexity analysis, and 5 alternative approaches.
                      </p>
                      <button className="w-full py-4 rounded-xl bg-[#13ec9c] text-[#10221b] font-black text-base hover:scale-[1.02] transition-transform shadow-[0_10px_30px_rgba(19,236,156,0.3)] mb-4">
                        UNLOCK NOW — $4.99
                      </button>
                      <p className="text-[10px] text-[#9db9af] uppercase tracking-widest font-bold">Included in Pro Subscription</p>
                  </div>
                </div>
              </div>
                <div className="p-4 bg-[#1a2e26] border-t border-[#283933] flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#13ec9c] text-sm">verified_user</span>
                    <span className="text-[11px] text-[#9db9af]">Verified by Experts</span>
                </div>
                  <div className="w-1 h-1 rounded-full bg-[#283933]"></div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#13ec9c] text-sm">trending_up</span>
                    <span className="text-[11px] text-[#9db9af]">98% Success Rate</span>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments / Reviews Section */}
        <section className="max-w-4xl">
          {/* Discussion Component */}
          <DiscussionSection
            assignmentId={assignment.id}
            currentUserId={user.id}
            currentUsername={user.username}
          />

          {/* Submit Solution Dialog */}
          {canSubmit && (
                <Dialog
                  open={showSubmitDialog}
                  onOpenChange={setShowSubmitDialog}
                >
              <DialogContent className="max-w-2xl bg-[#1a2e26] border-[#283933]">
                    <DialogHeader>
                  <DialogTitle className="text-white">Submit Your Solution</DialogTitle>
                  <DialogDescription className="text-[#9db9af]">
                    Provide your solution to help solve this assignment. You can submit text, upload a file, or both.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                    <Label htmlFor="solution" className="text-white">Solution Explanation</Label>
                        <Textarea
                            id="solution"
                            placeholder="Explain your solution here..."
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                      className="min-h-32 w-full rounded-lg border border-[#283933] bg-[#0d1612] px-4 py-3 text-sm text-white placeholder:text-[#9db9af] focus:border-[#13ec9c] focus:ring-1 focus:ring-[#13ec9c] focus:outline-none transition-all"
                          />
                      </div>

                      <div className="space-y-2">
                    <Label htmlFor="file" className="text-white">Upload Solution File (Optional)</Label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                        isDragOver ? 'border-[#13ec9c] bg-[#13ec9c]/5' : 'border-[#283933]'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                      <Upload className={`mx-auto h-8 w-8 mb-2 transition-colors ${isDragOver ? 'text-[#13ec9c]' : 'text-[#9db9af]'}`} />
                          <p className="text-sm text-white mb-2">
                            {isDragOver ? 'Drop your file here' : 'Drag & drop or click to upload'}
                          </p>
                      <p className="text-xs text-[#9db9af] mb-4">All file types supported (Max 10MB)</p>
                          <Input
                            id="file"
                            type="file"
                        onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('file')?.click()}
                        className="text-[#13ec9c] hover:text-[#10b981] text-sm font-medium"
                      >
                        Browse Files
                      </button>
                        </div>
                        {solutionFile && (
                      <div className="flex items-center gap-2 p-3 bg-[#13ec9c]/10 border border-[#13ec9c]/30 rounded-lg">
                        <Upload className="h-4 w-4 text-[#13ec9c]" />
                        <p className="text-sm text-[#13ec9c] font-medium flex-1">{solutionFile.name}</p>
                        <button
                              onClick={() => setSolutionFile(null)}
                          className="text-[#9db9af] hover:text-red-400"
                            >
                              ×
                        </button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                                                 <Button
                           variant="outline"
                           onClick={() => setShowSubmitDialog(false)}
                      className="flex-1 border-[#283933] text-white hover:bg-[#283933]"
                         >
                           Cancel
                         </Button>
                         <Button
                           onClick={handleSubmitSolution}
                           disabled={submitting}
                      className="flex-1 bg-[#13ec9c] text-[#10221b] hover:brightness-110"
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
          )}


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
                <p className="text-sm text-white/70">
                  Selected Rating: <span className="font-semibold">{selectedRating}/5</span>
                </p>
                <p className="text-xs text-white/50 mt-1">
                  💎 1 Emerald = 10 Rubies | 🔴 Rubies for lower tiers, 💎 Emeralds for higher tiers
                </p>
                {selectedRating >= 3.0 && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-white/70 mb-2">This rating will give the solution:</p>
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
        </section>
      </main>
      </div>
    </div>
  );
}
