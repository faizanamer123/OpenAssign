"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="study-card mt-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-orange-400" />
            Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-400 text-sm">Loading discussion...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="study-card mt-8" data-discussion-section>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-orange-400" />
            Discussion
            <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300">
              <Users className="h-3 w-3 mr-1" />
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
            </Badge>
            {isDemoMode && (
              <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/30 text-yellow-400">
                Demo Mode
              </Badge>
            )}
          </CardTitle>
          
          {/* Sort Options */}
          <div className="flex gap-2 flex-wrap">
            {(['newest', 'oldest', 'top'] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option)}
                className={
                  sortBy === option
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div className="space-y-4 p-4 bg-gray-800/20 rounded-lg border border-gray-700/30">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>Comment as</span>
            <span className="text-orange-400 font-medium">u/{currentUsername}</span>
            {isDemoMode && (
              <span className="text-xs text-yellow-400">(Demo Mode - Comments won't be saved)</span>
            )}
          </div>
          
          <Textarea
            placeholder={isDemoMode ? "Demo Mode: Comments won't be saved to the server" : "What are your thoughts on this assignment?"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isDemoMode}
            className="discussion-textarea min-h-24 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20 focus-visible:ring-orange-500/20 focus-visible:outline-orange-500 rounded-lg resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          <div className="flex justify-end">
            <Button
              onClick={handleCreateComment}
              disabled={isSubmitting || !newComment.trim() || isDemoMode}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 transition-all duration-200 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {isDemoMode ? "Demo Mode" : "Post Comment"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Comments List - Reddit Style */}
        {topLevelComments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800/30 rounded-full mb-6 border border-gray-700/50">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-gray-300 text-xl font-semibold mb-2">No comments yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Be the first to start the discussion! Share your thoughts, ask questions, or help others with this assignment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortComments(topLevelComments).map((comment) => (
              <div
                key={comment.id}
                className="p-5 bg-gray-800/20 rounded-xl border border-gray-700/30 hover:border-orange-500/50 hover:bg-gray-800/30 transition-all duration-200 shadow-sm"
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
      </CardContent>
    </Card>
  );
}
