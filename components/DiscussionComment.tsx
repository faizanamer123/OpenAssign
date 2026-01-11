"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Reply, 
  MoreHorizontal,
  Clock,
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
        {/* Comment Header */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-sm font-bold text-[#13ec9c] hover:text-[#10b981] cursor-pointer transition-colors">
            {comment.username}
          </span>
          <span className="text-[#283933] text-sm">•</span>
          <div className="flex items-center gap-1 text-xs text-[#9db9af]">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(comment.createdAt)}
          </div>
          {comment.updatedAt !== comment.createdAt && (
            <>
              <span className="text-[#283933] text-sm">•</span>
              <span className="text-xs text-[#9db9af]">edited</span>
            </>
          )}
          {hasReplies && (
            <>
              <span className="text-[#283933] text-sm">•</span>
              <span className="text-xs text-[#13ec9c] font-medium">
                {comment.replies?.length || 0} {comment.replies?.length === 1 ? 'reply' : 'replies'}
              </span>
            </>
          )}
        </div>

        {/* Comment Body */}
        <div className="text-white text-sm leading-relaxed mb-4 pr-2">
          {comment.content}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasReplies && (
            <button
              className="h-8 px-3 text-[#9db9af] hover:text-[#13ec9c] hover:bg-[#13ec9c]/10 rounded-lg transition-all duration-200 text-xs font-medium flex items-center gap-1.5 border border-transparent hover:border-[#13ec9c]/30"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              {isExpanded ? 'Collapse' : 'Expand'} {comment.replies?.length || 0}
            </button>
          )}
          
          {canReply && (
            <button
              className="h-8 px-3 text-[#9db9af] hover:text-[#13ec9c] hover:bg-[#13ec9c]/10 rounded-lg transition-all duration-200 text-xs font-medium flex items-center gap-1.5 border border-transparent hover:border-[#13ec9c]/30"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          )}
          
          <button
            className="h-8 px-3 text-[#9db9af] hover:text-[#13ec9c] hover:bg-[#13ec9c]/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 border border-transparent hover:border-[#13ec9c]/30"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 p-4 bg-[#0d1612] rounded-xl border border-[#283933]">
            <div className="flex items-center gap-2 mb-3 text-xs text-[#9db9af]">
              <span>Replying to</span>
              <span className="text-[#13ec9c] font-bold">{comment.username}</span>
            </div>
            <Textarea
              placeholder="What are your thoughts?"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-20 bg-[#10221b] border-[#283933] text-white placeholder:text-[#9db9af]/60 focus:border-[#13ec9c] focus:ring-1 focus:ring-[#13ec9c]/20 rounded-xl resize-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                disabled={isSubmittingReply || !replyContent.trim()}
                className="bg-[#13ec9c] hover:bg-[#10b981] text-[#10221b] font-bold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-[0_0_15px_rgba(19,236,156,0.3)] hover:shadow-[0_0_20px_rgba(19,236,156,0.4)]"
              >
                {isSubmittingReply ? "Posting..." : "Reply"}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
                className="bg-[#1a2e26] border border-[#283933] text-[#9db9af] hover:bg-[#283933] hover:text-white hover:border-[#13ec9c]/50 rounded-lg px-4 py-2 transition-all duration-200 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && isExpanded && (
          <div className="mt-4 ml-6 border-l-2 border-[#13ec9c]/30 pl-4 space-y-4">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="relative">
                {/* Connection line for visual tree structure */}
                <div className="absolute -left-6 top-0 w-4 h-4 border-l-2 border-b-2 border-[#13ec9c]/30 rounded-bl-lg"></div>
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
          <div className="mt-3 ml-6 pl-4 border-l-2 border-[#13ec9c]/20">
            <div 
              className="flex items-center gap-2 text-xs text-[#9db9af] py-2 hover:text-[#13ec9c] transition-colors cursor-pointer" 
              onClick={() => setIsExpanded(true)}
            >
              <div className="w-2 h-2 bg-[#13ec9c]/50 rounded-full"></div>
              <span>
                {comment.replies?.length || 0} {comment.replies?.length === 1 ? 'reply' : 'replies'} hidden
              </span>
              <span className="text-[#283933]">•</span>
              <span className="text-[#283933]">Click to expand</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
