export interface Notification {
  id: string;
  userId: string;
  type: "assignment_uploaded" | "assignment_solved" | "assignment_rated" | "deadline_reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  assignmentId?: string;
  submissionId?: string;
}
