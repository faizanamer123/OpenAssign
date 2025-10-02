"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Reply, 
  MoreHorizontal,
  Clock,
  User,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { DiscussionComment as DiscussionCommentType } from "@/types/discussion";
import { toast } from "@/hooks/use-toast";

interface CommentProps {
  comment: DiscussionCommentType;
  onReply: (parentId: string, content: string) => void;
  currentUserId?: string;
  maxDepth?: number;
}

export default function DiscussionComment({ 
  comment, 
  onReply, 
  currentUserId,
  maxDepth = 5 
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    const depth = comment.depth || 0;
    return depth < 3; // Auto-collapse deep threads (level 3 and above)
  });

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };


  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const canReply = (comment.depth || 0) < maxDepth;
  const hasReplies = comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0;
  

  return (
    <div className="flex gap-4 group">
      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Comment Header - Reddit Style */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-orange-400 hover:text-orange-300 cursor-pointer transition-colors">
            {comment.username}
          </span>
          <span className="text-gray-500 text-sm">•</span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(comment.createdAt)}
          </div>
          {comment.updatedAt !== comment.createdAt && (
            <>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-xs text-gray-500">edited</span>
            </>
          )}
          {hasReplies && (
            <>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-xs text-blue-400">
                {comment.replies?.length || 0} {comment.replies?.length === 1 ? 'reply' : 'replies'}
              </span>
            </>
          )}
        </div>

        {/* Comment Body */}
        <div className="text-gray-100 text-sm leading-relaxed mb-4 pr-2">
          {comment.content}
        </div>

        {/* Comment Actions - Reddit Style */}
        <div className="flex items-center gap-1 text-xs">
          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-full transition-all duration-200"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronLeft className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1" />
              )}
              {isExpanded ? 'Collapse' : 'Expand'} {comment.replies?.length || 0} {comment.replies?.length === 1 ? 'reply' : 'replies'}
            </Button>
          )}
          
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-full transition-all duration-200"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* Reply Form - Reddit Style */}
        {showReplyForm && (
          <div className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                  <span>Replying to</span>
                  <span className="text-orange-400 font-medium">{comment.username}</span>
                </div>
            <Textarea
              placeholder="What are your thoughts?"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="discussion-textarea min-h-20 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20 focus-visible:ring-orange-500/20 focus-visible:outline-orange-500 rounded-lg resize-none"
            />
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={isSubmittingReply || !replyContent.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 transition-all duration-200"
              >
                {isSubmittingReply ? "Posting..." : "Reply"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
                className="border-gray-600 text-gray-300 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/50 rounded-full px-4 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies - Reddit Style Tree */}
        {hasReplies && isExpanded && (
          <div className="mt-4 ml-6 border-l-2 border-gray-700/40 pl-4 space-y-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="relative">
                {/* Connection line for visual tree structure */}
                <div className="absolute -left-6 top-0 w-4 h-4 border-l-2 border-b-2 border-gray-700/40 rounded-bl-lg"></div>
                <DiscussionComment
                  comment={reply}
                  onReply={onReply}
                  currentUserId={currentUserId}
                  maxDepth={maxDepth}
                />
              </div>
            ))}
          </div>
        )}

        {/* Collapsed Replies Summary */}
        {hasReplies && !isExpanded && (
          <div className="mt-3 ml-6 pl-4 border-l-2 border-gray-700/30">
                <div className="flex items-center gap-2 text-xs text-gray-400 py-2 hover:text-orange-400 transition-colors cursor-pointer" onClick={() => setIsExpanded(true)}>
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <span>
                {comment.replies?.length || 0} {comment.replies?.length === 1 ? 'reply' : 'replies'} hidden
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">Click to expand</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
