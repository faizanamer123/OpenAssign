"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Clock, User, BookOpen, Upload, Download, Send, Loader2 } from "lucide-react"
import Header from "@/components/Header"
import { useAuth } from "@/context/AuthContext"
import { getAssignment, submitSolution, getSubmissions, rateSubmission, getLeaderboard } from "@/utils/api"
import type { Assignment } from "@/types/assignment"
import { toast } from "@/hooks/use-toast"

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [solution, setSolution] = useState("")
  const [solutionFile, setSolutionFile] = useState<File | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [ratingDialog, setRatingDialog] = useState<{ open: boolean; submissionId: string | null }>({ open: false, submissionId: null })
  const [selectedRating, setSelectedRating] = useState<number>(5)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  const loadAssignment = async (id: string) => {
    try {
      const data = await getAssignment(id)
      setAssignment(data)
    } catch (error) {
      console.error("Failed to load assignment:", error)
      toast({
        title: "Error",
        description: "Failed to load assignment details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async (assignmentId: string) => {
    try {
      const data = await getSubmissions({ assignmentId })
      setSubmissions(data)
    } catch (error) {
      setSubmissions([])
    }
  }

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard()
      setLeaderboard(data)
    } catch {}
  }

  useEffect(() => {
    if (params.id) {
      loadAssignment(params.id as string)
      loadSubmissions(params.id as string)
    }
    loadLeaderboard()
  }, [params.id])

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);
  if (!user) return null;

  const handleSubmitSolution = async () => {
    if (!assignment || !user) return

    if (!solution.trim() && !solutionFile) {
      toast({
        title: "Error",
        description: "Please provide either a text solution or upload a file.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await submitSolution({
        assignmentId: assignment.id,
        submittedBy: user.id,
        submittedByUsername: user.username,
        explanation: solution,
        file: solutionFile,
      })

      toast({
        title: "Success!",
        description: "Your solution has been submitted successfully.",
      })

      setShowSubmitDialog(false)
      setSolution("")
      setSolutionFile(null)

      // Reload assignment to update status
      await loadAssignment(assignment.id)
      await loadSubmissions(assignment.id)
      await loadLeaderboard() // <-- ensure leaderboard is refreshed after submission
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRateSubmission = async () => {
    if (!ratingDialog.submissionId || !user) return
    await rateSubmission(ratingDialog.submissionId, selectedRating, user.id)
    setRatingDialog({ open: false, submissionId: null })
    setSelectedRating(5)
    if (assignment) await loadSubmissions(assignment.id)
    await loadLeaderboard()
  }

  const formatTimeLeft = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()

    if (diff < 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "solved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  function getFileTypeIcon(filename: string) {
    if (!filename) return null;
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <span className="inline-block text-red-500 font-bold">PDF</span>;
      case 'doc':
      case 'docx': return <span className="inline-block text-blue-700 font-bold">DOC</span>;
      case 'txt': return <span className="inline-block text-gray-500 font-bold">TXT</span>;
      case 'zip': return <span className="inline-block text-yellow-600 font-bold">ZIP</span>;
      default: return <span className="inline-block text-gray-400 font-bold">FILE</span>;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf8]">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#9e8747]" />
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#fcfbf8]">
        <Header />
        <div className="text-center py-20">
          <p className="text-[#9e8747]">Assignment not found.</p>
          <Button onClick={() => router.back()} className="mt-4 bg-[#fac638] text-[#1c180d]">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const isExpired = new Date(assignment.deadline) < new Date()
  const canSubmit = assignment.status !== "solved" && !isExpired && assignment.createdBy !== user.id

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#9e8747] mb-6">
            <button onClick={() => router.back()} className="hover:text-[#1c180d]">
              Assignments
            </button>
            <span>/</span>
            <span className="text-[#1c180d]">Assignment Details</span>
          </div>

          {/* Assignment Header */}
          <Card className="border-[#e9e2ce] bg-[#fcfbf8] mb-8">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={getStatusColor(assignment.status)}>{assignment.status.replace("_", " ")}</Badge>
                    <Badge className={getDifficultyColor(assignment.difficulty)}>{assignment.difficulty}</Badge>
                    {isExpired && <Badge className="bg-red-100 text-red-800">Expired</Badge>}
                  </div>
                  <CardTitle className="text-2xl text-[#1c180d] mb-2">{assignment.title}</CardTitle>
                  <CardDescription className="text-[#9e8747] text-base">{assignment.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-[#9e8747]">
                  <BookOpen className="h-4 w-4" />
                  <span>{assignment.subject || "General"}</span>
                </div>
                <div className="flex items-center gap-2 text-[#9e8747]">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeLeft(assignment.deadline)}</span>
                </div>
                <div className="flex items-center gap-2 text-[#9e8747]">
                  <User className="h-4 w-4" />
                  <span>Posted by {assignment.createdByUsername}</span>
                </div>
              </div>

              {/* Assignment File Download */}
              {assignment?.fileUrl && (
                <a
                  href={`http://localhost:4000/files/${assignment.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fac638] to-[#e6b332] text-[#1c180d] rounded-lg font-semibold shadow hover:from-[#e6b332] hover:to-[#fac638] transition-all duration-200 mb-4"
                  download
                >
                  <Download className="h-5 w-5" />
                  {getFileTypeIcon(assignment.fileUrl)}
                  Download Assignment File
                </a>
              )}
            </CardContent>
          </Card>

          {/* Action Section */}
          <Card className="border-[#e9e2ce] bg-[#fcfbf8]">
            <CardHeader>
              <CardTitle className="text-[#1c180d]">
                {assignment.status === "solved" ? "Solution Submitted" : "Submit Your Solution"}
              </CardTitle>
              <CardDescription className="text-[#9e8747]">
                {assignment.status === "solved"
                  ? "This assignment has been solved and submitted."
                  : canSubmit
                    ? "Help solve this assignment and earn points!"
                    : isExpired
                      ? "This assignment has expired."
                      : assignment.createdBy === user.id
                        ? "This is your assignment."
                        : "Submission not available."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canSubmit ? (
                <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Solution
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Your Solution</DialogTitle>
                      <DialogDescription>
                        Provide your solution to help solve this assignment. You can submit text, upload a file, or
                        both.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="solution">Solution Explanation</Label>
                        <Textarea
                          id="solution"
                          placeholder="Explain your solution here..."
                          value={solution}
                          onChange={(e) => setSolution(e.target.value)}
                          className="min-h-32 border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">Upload Solution File (Optional)</Label>
                        <div className="border-2 border-dashed border-[#e9e2ce] rounded-lg p-6 text-center">
                          <Upload className="mx-auto h-8 w-8 text-[#9e8747] mb-2" />
                          <p className="text-sm text-[#1c180d] mb-2">Upload your solution file</p>
                          <p className="text-xs text-[#9e8747] mb-4">PDF, DOC, DOCX, TXT (Max 10MB)</p>
                          <Input
                            id="file"
                            type="file"
                            onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                            className="border-[#e9e2ce] bg-[#fcfbf8]"
                          />
                        </div>
                        {solutionFile && <p className="text-sm text-[#1c180d]">Selected: {solutionFile.name}</p>}
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowSubmitDialog(false)}
                          className="flex-1 border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6]"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitSolution}
                          disabled={submitting}
                          className="flex-1 bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90"
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
              ) : assignment.status === "solved" ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-[#1c180d] font-medium">Solution has been submitted!</p>
                  <p className="text-[#9e8747] text-sm mt-1">The assignment creator will be notified.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#9e8747]">
                    {isExpired ? "This assignment has expired." : "Submission not available."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {submissions.length > 0 && (
            <Card className="border-[#e9e2ce] bg-[#fcfbf8] mt-8">
              <CardHeader>
                <CardTitle className="text-[#1c180d]">Submitted Solutions</CardTitle>
                <CardDescription className="text-[#9e8747]">All solutions submitted for this assignment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="border-[#e9e2ce] bg-[#fcfbf8]">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {submission.rating ? (
                                <Badge className="bg-green-100 text-green-800">Rated</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-[#1c180d] mb-2">Solution</h3>
                            <p className="text-[#9e8747] text-sm mb-3 line-clamp-2">{submission.explanation}</p>
                            <div className="flex items-center gap-4 text-sm text-[#9e8747]">
                              <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                              {submission.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="font-medium">{submission.rating}/5</span>
                                </div>
                              )}
                            </div>
                            {/* Rating button for assignment creator */}
                            {user && assignment && assignment.createdBy === user.id && !submission.rating && (
                              <Button className="mt-4 bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90" onClick={() => setRatingDialog({ open: true, submissionId: submission.id })}>
                                Rate Solution
                              </Button>
                            )}
                            {/* Submission File Download */}
                            {submission.fileUrl && (
                              <a
                                href={`http://localhost:4000/files/${submission.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded font-medium shadow hover:from-blue-600 hover:to-blue-500 transition-all duration-200 mt-2"
                                download
                              >
                                <Download className="h-4 w-4" />
                                {getFileTypeIcon(submission.fileUrl)}
                                Download Solution
                              </a>
                            )}
                          </div>
                          <div className="ml-4">
                            <Badge className="bg-blue-100 text-blue-800">{submission.submittedByUsername}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Rating Dialog */}
          <Dialog open={ratingDialog.open} onOpenChange={open => setRatingDialog({ open, submissionId: ratingDialog.submissionId })}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Rate Solution</DialogTitle>
                <DialogDescription>Select a rating for this solution (1-5 stars).</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 justify-center my-4">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setSelectedRating(star)}>
                    <Star className={`h-8 w-8 ${selectedRating >= star ? 'text-yellow-500' : 'text-gray-300'}`} fill={selectedRating >= star ? '#facc15' : 'none'} />
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setRatingDialog({ open: false, submissionId: null })} className="flex-1 border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6]">Cancel</Button>
                <Button onClick={handleRateSubmission} className="flex-1 bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90">Submit Rating</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
