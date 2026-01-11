export interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  deadline: string;
  status: "pending" | "in_progress" | "solved";
  createdBy: string;
  createdByUsername: string;
  subject?: string;
  awsfileUrl?: string;
  objectives?: string;
  createdAt: string;
}
