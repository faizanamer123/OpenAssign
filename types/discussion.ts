export interface DiscussionComment {
  id: string;
  assignmentId: string;
  userId: string;
  username: string;
  content: string;
  parentId?: string; // null for top-level comments
  createdAt: string;
  updatedAt: string;
  replies?: DiscussionComment[]; // nested replies
  depth?: number; // for rendering indentation, optional with default 0
}

export interface CreateDiscussionRequest {
  assignmentId: string;
  userId: string;
  content: string;
  parentId?: string; // null for top-level comments
}

export interface DiscussionResponse {
  comments: DiscussionComment[];
  totalCount: number;
}
