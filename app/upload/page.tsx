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
    <div className="min-h-screen reddit-dark-bg">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Upload Assignment
            </h1>
            <p className="text-gray-300">
              Share your assignment anonymously and get help from the community.
            </p>
          </div>

          <Card className="study-card">
            <CardHeader>
              <CardTitle className="text-white">
                Assignment Details
              </CardTitle>
              <CardDescription className="text-gray-300">
                Fill out the form below to submit your assignment. All
                submissions are anonymous.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Assignment Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter the title of your assignment"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="border-[#4ade80]/30 bg-[#1a1a1b]/50 text-white focus:border-[#4ade80] placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your assignment, including any specific requirements or guidelines"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="border-[#4ade80]/30 bg-[#1a1a1b]/50 text-white focus:border-[#4ade80] placeholder:text-gray-400 min-h-32"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">
                      Subject Area
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        handleInputChange("subject", value)
                      }
                    >
                      <SelectTrigger
                        id="subject"
                        className="border-[#4ade80]/30 bg-[#1a1a1b]/50 text-white focus:border-[#4ade80] data-[placeholder]:text-gray-400"
                      >
                        <SelectValue placeholder="Select subject area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="computer-science">
                          Computer Science
                        </SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="economics">Economics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-white">
                      Difficulty Level *
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        handleInputChange("difficulty", value)
                      }
                    >
                      <SelectTrigger
                        id="difficulty"
                        className="border-[#4ade80]/30 bg-[#1a1a1b]/50 text-white focus:border-[#4ade80] data-[placeholder]:text-gray-400"
                      >
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-white">
                    Deadline *
                  </Label>
                  <div className="relative">
                    <Input
                      ref={dateInputRef}
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) =>
                        handleInputChange("deadline", e.target.value)
                      }
                      className="border-[#4ade80]/30 bg-[#1a1a1b]/50 text-white focus:border-[#4ade80] pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCalendarClick}
                      className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-[#4ade80]/10"
                    >
                      <Calendar className="h-4 w-4 text-gray-300 hover:text-[#4ade80]" />
                    </Button>
                  </div>
                  
                  {/* Quick deadline buttons */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDeadline(1)}
                      className="text-xs px-3 py-1 h-auto border-[#4ade80]/30 text-gray-300 hover:text-white hover:border-[#4ade80]"
                    >
                      Tomorrow
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDeadline(3)}
                      className="text-xs px-3 py-1 h-auto border-[#4ade80]/30 text-gray-300 hover:text-white hover:border-[#4ade80]"
                    >
                      3 Days
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDeadline(7)}
                      className="text-xs px-3 py-1 h-auto border-[#4ade80]/30 text-gray-300 hover:text-white hover:border-[#4ade80]"
                    >
                      1 Week
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickDeadline(14)}
                      className="text-xs px-3 py-1 h-auto border-[#4ade80]/30 text-gray-300 hover:text-white hover:border-[#4ade80]"
                    >
                      2 Weeks
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-white">
                    Assignment File (Optional)
                  </Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-[#4ade80] bg-[#4ade80]/10' 
                        : 'border-[#4ade80]/30'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className={`mx-auto h-8 w-8 mb-2 transition-colors ${
                      dragActive ? 'text-[#4ade80]' : 'text-gray-300'
                    }`} />
                    <p className="text-sm text-white mb-2">
                      {dragActive ? 'Drop your file here' : 'Drag & drop your file here or click to browse'}
                    </p>
                    <p className="text-xs text-gray-300 mb-4">
                      Supports all file formats (Max 50MB) - Documents, Images, Videos, Archives, Code files, etc.
                    </p>
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
                      className="border-[#4ade80]/30 bg-[#1a1a1b]/50"
                    />
                  </div>
                  {file && (
                    <div className="flex items-center justify-between gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-sm text-green-400 font-medium">
                            Selected: {file.name}
                          </p>
                          <p className="text-xs text-gray-300">
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB • Type: {file.type || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-auto p-1"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 duolingo-button-secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 duolingo-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Assignment"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}