export interface User {
  id: string
  email: string
  username: string
  points: number
  totalRatings: number
  ratingSum: number
  averageRating: number
  createdAt: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  deadline: string
  status: "pending" | "in_progress" | "solved"
  createdBy: string
  createdByUsername: string
  subject?: string
  fileUrl?: string
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  submittedBy: string
  submittedByUsername: string
  fileUrl?: string
  explanation: string
  submittedAt: string
  rating: number | null
  ratedBy: string | null
}

export interface Notification {
  id: string
  userId: string
  type: "assignment_solved" | "assignment_rated" | "deadline_reminder"
  title: string
  message: string
  read: boolean
  createdAt: string
  assignmentId?: string
  submissionId?: string
}
