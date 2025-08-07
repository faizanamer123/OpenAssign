export interface Submission {
  id: string;
  assignmentId: string;
  submittedBy: string;
  submittedByUsername: string;
  fileUrl?: string;
  explanation: string;
  submittedAt: string;
  rating: number | null;
  ratedBy: string | null;
}
