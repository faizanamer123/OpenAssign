"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});
import { uploadAssignment, createNotification, getUsers } from "@/utils/api";

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    deadline: "",
    subject: "",
    objectives: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Debug logging
    console.log("formData:", formData);
    console.log("user.id:", user.id);
    console.log("user.username:", user.username);
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.difficulty.trim() ||
      !formData.deadline.trim() ||
      !user.id ||
      !user.username
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newAssignment = await uploadAssignment({
        ...formData,
        file,
        createdBy: user.id,
        createdByUsername: user.username,
      });

      // Create notifications for all users about the new assignment
      try {
        const allUsers = await getUsers();
        const otherUsers = allUsers.filter((u: any) => u.id !== user.id);
        
        // Create notifications for other users (limit to avoid overwhelming)
        const notificationsToCreate = otherUsers.slice(0, 50).map((otherUser: any) =>
          createNotification({
            userId: otherUser.id,
            type: "assignment_uploaded",
            title: "New Assignment Available",
            message: `${user.username} uploaded a new assignment: "${formData.title}"`,
            assignmentId: newAssignment.id || newAssignment.assignmentId,
            read: false,
          }).catch((err) => {
            console.error(`Failed to create notification for user ${otherUser.id}:`, err);
          })
        );
        
        // Create notifications in parallel but don't wait for all
        Promise.all(notificationsToCreate).catch(() => {
          // Silently fail - notifications are not critical
        });
      } catch (notifError) {
        console.error("Failed to create notifications:", notifError);
        // Don't block the upload if notifications fail
      }

      toast({
        title: "Success!",
        description: "Your assignment has been uploaded successfully.",
      });
      router.replace("/activity");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (selectedFile: File) => {
    // Check file size (increased to 50MB for larger files like videos, presentations, etc.)
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    // Optional: Warn about very large files
    if (selectedFile.size > 25 * 1024 * 1024) { // 25MB
      toast({
        title: "Large file detected",
        description: `Uploading ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). This may take a while.`,
        variant: "default",
      });
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Function to handle calendar icon click
  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.focus();
      dateInputRef.current.showPicker?.();
    }
  };

  // Function to set quick deadline options
  const setQuickDeadline = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    const isoString = now.toISOString().slice(0, 16);
    handleInputChange("deadline", isoString);
  };

  return (
    <div className="min-h-screen bg-[#112116] dark:bg-[#112116]">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-12">
        {/* Headline Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Submit New Assignment</h1>
          <p className="text-slate-400">Complete the details below to submit your work for review.</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-[#30e86e] flex items-center justify-center text-[#112116]">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#30e86e]">Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#30e86e]/30 mx-4 -mt-6"></div>
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-10 h-10 rounded-full border-2 border-[#30e86e] bg-[#30e86e]/10 flex items-center justify-center text-[#30e86e]">
              <span className="material-symbols-outlined text-sm">upload_file</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#30e86e]">Upload</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/10 mx-4 -mt-6"></div>
          <div className="flex flex-col items-center gap-2 group opacity-50">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">verified</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Review</span>
          </div>
        </div>

        {/* Submission Form Container */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 shadow-sm">
          {/* Details Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="col-span-1">
                <label className="block mb-2 text-sm font-medium text-white">Assignment Title</label>
                <Input
                  id="title"
                  placeholder="e.g. Calculus Final Project"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#30e86e]/20 focus:border-[#30e86e] outline-none transition-all text-white placeholder:text-white/40"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 text-sm font-medium text-white">Subject Area</label>
                <div className="relative">
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      handleInputChange("subject", value)
                    }
                  >
                    <SelectTrigger className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#30e86e]/20 focus:border-[#30e86e] outline-none transition-all pr-10 text-white">
                      <SelectValue placeholder="Select subject area" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2e26] border border-[#283933]">
                      <SelectItem value="mathematics" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Mathematics & Logic</SelectItem>
                      <SelectItem value="computer-science" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Computer Science</SelectItem>
                      <SelectItem value="history" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Modern History</SelectItem>
                      <SelectItem value="physics" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Advanced Physics</SelectItem>
                      <SelectItem value="science" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Science</SelectItem>
                      <SelectItem value="chemistry" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Chemistry</SelectItem>
                      <SelectItem value="biology" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Biology</SelectItem>
                      <SelectItem value="english" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">English</SelectItem>
                      <SelectItem value="economics" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Economics</SelectItem>
                      <SelectItem value="other" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                </div>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 text-sm font-medium text-white">Submission Deadline</label>
                <div className="relative">
                  <Input
                    ref={dateInputRef}
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#30e86e]/20 focus:border-[#30e86e] outline-none transition-all text-white pr-10"
                    required
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-lg">calendar_today</span>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="mb-10">
              <label className="block mb-3 text-sm font-medium text-white">Upload Documents</label>
              <div 
                className={`dashed-border p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#30e86e]/5 transition-colors group rounded-lg border-2 border-dashed border-white/20 ${
                  dragActive ? 'bg-[#30e86e]/5 border-[#30e86e]' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 bg-[#30e86e]/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#30e86e] text-3xl">cloud_upload</span>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-white">Drag and drop your files here</h3>
                <p className="text-white/40 text-sm mb-6">Support for PDF, DOCX, and ZIP up to 50MB</p>
                <Input
                  id="file"
                  type="file"
                  accept="*/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      handleFileSelect(selectedFile);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('file')?.click()}
                  className="bg-[#30e86e] text-[#112116] px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {/* Description and Objectives */}
            <div className="mb-10 space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Problem Description</label>
                <Textarea
                  id="description"
                  placeholder="Describe the problem or assignment requirements..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#30e86e]/20 focus:border-[#30e86e] outline-none transition-all text-white placeholder:text-white/40 min-h-[120px]"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Objectives (one per line)</label>
                <Textarea
                  id="objectives"
                  placeholder="Enter learning objectives, one per line...&#10;Example:&#10;Understand the core concepts&#10;Provide a comprehensive solution&#10;Ensure all requirements are met"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange("objectives", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#30e86e]/20 focus:border-[#30e86e] outline-none transition-all text-white placeholder:text-white/40 min-h-[100px]"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Difficulty Level</label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange("difficulty", value)}
                >
                  <SelectTrigger className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#30e86e]/20 focus:border-[#30e86e] outline-none transition-all text-white">
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2e26] border border-[#283933]">
                    <SelectItem value="easy" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Beginner</SelectItem>
                    <SelectItem value="medium" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Intermediate</SelectItem>
                    <SelectItem value="hard" className="hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] focus:bg-[#13ec9c]/10 focus:text-[#13ec9c]">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File List */}
            {file && (
              <div className="space-y-3 mb-10">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#30e86e]/20 p-2 rounded text-[#30e86e]">
                      <span className="material-symbols-outlined text-xl">description</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors border-white/10"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back to Course
              </Button>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="px-6 py-2.5 rounded-lg font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors border-white/10"
                  onClick={() => {/* Save as draft logic */}}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#30e86e] text-[#112116] px-8 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Review Submission
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Help/Info Text */}
        <div className="mt-8 flex items-start gap-3 p-4 bg-[#30e86e]/10 border border-[#30e86e]/20 rounded-lg">
          <span className="material-symbols-outlined text-[#30e86e]">info</span>
          <p className="text-sm text-white/70 leading-relaxed">
            <span className="font-bold text-[#30e86e]">Note:</span> Your assignment will be automatically scanned for plagiarism after submission. Ensure all sources are properly cited in your bibliography section.
          </p>
        </div>
      </main>
    </div>
  );
}