"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, Users } from "lucide-react";
import { DiscussionComment as DiscussionCommentType } from "@/types/discussion";
import { getDiscussionComments, createDiscussionComment, getUserById } from "@/utils/api";
import { toast } from "@/hooks/use-toast";
import DiscussionComment from "./DiscussionComment";

interface DiscussionSectionProps {
  assignmentId: string;
  currentUserId: string;
  currentUsername: string;
}

export default function DiscussionSection({
  assignmentId,
  currentUserId,
  currentUsername
}: DiscussionSectionProps) {
  const [comments, setComments] = useState<DiscussionCommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top'>('newest');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Cache for usernames to avoid repeated API calls
  const [usernameCache, setUsernameCache] = useState<Record<string, string>>({});

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, [assignmentId, currentUserId]);

  // Helper function to get username with caching
  const getUsername = async (userId: string): Promise<string> => {
    // Check cache first
    if (usernameCache[userId]) {
      return usernameCache[userId];
    }

    // Fetch from API
    let username = `User ${userId}`; // Fallback
    try {
      const user = await getUserById(userId);
      if (user && user.username) {
        username = user.username;
      } else if (user && user.email) {
        // Use email as fallback if no username
        username = user.email.split('@')[0];
      } else if (user && user.name) {
        // Use name as fallback
        username = user.name;
      }
      
      // Cache the result
      setUsernameCache(prev => ({ ...prev, [userId]: username }));
    } catch (error) {
      console.warn(`Failed to fetch user ${userId}:`, error);
      // Still cache the fallback to avoid repeated failed requests
      setUsernameCache(prev => ({ ...prev, [userId]: username }));
    }

    return username;
  };

  // Helper function to transform backend data to frontend format
  const transformBackendComments = async (backendComments: any[]): Promise<DiscussionCommentType[]> => {
    const transformedComments = await Promise.all(
      backendComments.map(async (comment) => {
        // Get username with caching
        const username = await getUsername(comment.userId);

        return {
          id: comment.id.toString(), // Convert number to string
          assignmentId: comment.assignmentId,
          userId: comment.userId,
          username: username,
          content: comment.content,
          parentId: comment.parentId ? comment.parentId.toString() : undefined,
          createdAt: comment.createdAt,
          updatedAt: comment.createdAt, // Use createdAt as updatedAt since backend doesn't provide it
          replies: comment.children ? await transformBackendComments(comment.children) : [],
          depth: 0 // Will be calculated by organizeComments
        };
      })
    );
    return transformedComments;
  };

  // Helper function to calculate depth for comments (backend already provides tree structure)
  const calculateDepth = (comments: DiscussionCommentType[], depth: number = 0): DiscussionCommentType[] => {
    return comments.map(comment => ({
      ...comment,
      depth: depth,
      replies: comment.replies && comment.replies.length > 0 
        ? calculateDepth(comment.replies, depth + 1) 
        : []
    }));
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await getDiscussionComments(assignmentId, currentUserId);
      console.log("Raw backend response:", data);
      
      // Ensure data is always an array
      let commentsData: DiscussionCommentType[] = [];
      if (Array.isArray(data)) {
        commentsData = data;
      } else if (data && Array.isArray(data.comments)) {
        // Handle case where backend returns { comments: [...] }
        commentsData = data.comments;
      } else {
        console.warn("Expected array but got:", typeof data, data);
        commentsData = [];
      }

      // Transform backend data to frontend format
      const transformedComments = await transformBackendComments(commentsData);
      // Calculate depth for comments (backend already provides tree structure)
      const commentsWithDepth = calculateDepth(transformedComments);
      setComments(commentsWithDepth);
    } catch (error) {
      console.error("Failed to load comments:", error);
      // Check if it's a 404 error (API not implemented)
      if (error instanceof Error && error.message.includes("404")) {
        setIsDemoMode(true);
        toast({
          title: "Demo Mode",
          description: "Discussion API not implemented yet. This is a demo version.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load discussion comments.",
          variant: "destructive",
        });
      }
      // Set empty array on error to prevent filter issues
      setComments([]);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createDiscussionComment({
        assignmentId,
        userId: currentUserId,
        content: newComment.trim(),
      });

      console.log("Comment created successfully:", result);
      setNewComment("");
      await loadComments(); // Refresh the comments list
      
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const result = await createDiscussionComment({
        assignmentId,
        userId: currentUserId,
        content: content.trim(),
        parentId,
      });

      console.log("Reply created successfully:", result);
      await loadComments(); // Refresh the comments list
    } catch (error) {
      console.error("Failed to create reply:", error);
      // Show user-friendly error message
      toast({
        title: "Reply Failed",
        description: "Failed to post your reply. Please check your connection and try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the Comment component handle the error
    }
  };


  const sortComments = (comments: DiscussionCommentType[]) => {
    if (!Array.isArray(comments)) return [];
    const sorted = [...comments];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
      case 'top':
        // Since we removed voting, just sort by newest for "top"
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  };

  const getTotalComments = (comments: DiscussionCommentType[]): number => {
    if (!Array.isArray(comments)) return 0;
    return comments.reduce((total, comment) => {
      const repliesCount = comment.replies && Array.isArray(comment.replies) 
        ? getTotalComments(comment.replies) 
        : 0;
      return total + 1 + repliesCount;
    }, 0);
  };

  // Safety checks to ensure comments is always an array
  const safeComments = Array.isArray(comments) ? comments : [];
  const topLevelComments = safeComments.filter(comment => !comment.parentId);
  const totalComments = getTotalComments(safeComments);

  // Don't render until component is properly initialized
  if (!initialized || loading) {
    return (
      <div className="mt-8">
        <div className="bg-[#1a2e26]/30 rounded-2xl border border-[#283933] p-8">
          <div className="flex flex-col justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#13ec9c] mb-4" />
            <p className="text-[#9db9af] text-sm">Loading discussion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#13ec9c] text-xl">forum</span>
          <div className="flex items-center gap-2">
            <span className="text-white text-lg font-bold">Discussion</span>
            <Badge className="bg-[#13ec9c]/10 border border-[#13ec9c]/30 text-[#13ec9c] text-xs">
              <Users className="h-3 w-3 mr-1" />
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
            </Badge>
            {isDemoMode && (
              <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs">
                Demo Mode
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {(['newest', 'oldest', 'top'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === option
                  ? "bg-[#13ec9c] text-[#10221b] shadow-[0_0_15px_rgba(19,236,156,0.3)]"
                  : "bg-[#1a2e26] border border-[#283933] text-[#9db9af] hover:border-[#13ec9c]/50 hover:text-white"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* New Comment Form */}
      <div className="bg-[#1a2e26]/30 rounded-2xl border border-[#283933] p-6 mb-6">
        <div className="flex items-center gap-2 text-sm text-[#9db9af] mb-4">
          <span>Comment as</span>
          <span className="text-[#13ec9c] font-bold">{currentUsername}</span>
          {isDemoMode && (
            <span className="text-xs text-yellow-400">(Demo Mode - Comments won't be saved)</span>
          )}
        </div>
        
        <Textarea
          placeholder={isDemoMode ? "Demo Mode: Comments won't be saved to the server" : "Share your thoughts, ask questions, or help others..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isDemoMode}
          className="min-h-28 bg-[#0d1612] border-[#283933] text-white placeholder:text-[#9db9af]/60 focus:border-[#13ec9c] focus:ring-1 focus:ring-[#13ec9c]/20 rounded-xl resize-none disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        />
        
        <div className="flex justify-end">
          <button
            onClick={handleCreateComment}
            disabled={isSubmitting || !newComment.trim() || isDemoMode}
            className="bg-[#13ec9c] hover:bg-[#10b981] text-[#10221b] font-bold px-6 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(19,236,156,0.3)] hover:shadow-[0_0_25px_rgba(19,236,156,0.4)] flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {isDemoMode ? "Demo Mode" : "Post Comment"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comments List */}
      {topLevelComments.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#1a2e26]/30 rounded-2xl border border-[#283933]">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#13ec9c]/10 rounded-full mb-6 border border-[#13ec9c]/20">
            <span className="material-symbols-outlined text-[#13ec9c] text-4xl">forum</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">No comments yet</h3>
          <p className="text-[#9db9af] text-sm max-w-md mx-auto">
            Be the first to start the discussion! Share your thoughts, ask questions, or help others with this assignment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortComments(topLevelComments).map((comment) => (
            <div
              key={comment.id}
              className="bg-[#1a2e26]/30 rounded-2xl border border-[#283933] p-6 hover:border-[#13ec9c]/50 hover:bg-[#1a2e26]/40 transition-all duration-200"
            >
              <DiscussionComment
                comment={comment}
                onReply={handleReply}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
