"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Clock, User, BookOpen } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});
import { useAuth } from "@/context/AuthContext";
import { getAssignments } from "@/utils/api";
import { getRatingBadge, getGemDisplay } from "@/utils/ratingBadge";
import type { Assignment } from "@/types/assignment";

export default function BrowsePage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm, statusFilter, difficultyFilter]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch (error) {
      setAssignments([]);
      console.error("Failed to load assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.status === statusFilter
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.difficulty === difficultyFilter
      );
    }

    setFilteredAssignments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "solved":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const formatTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff < 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen reddit-dark-bg">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Browse Assignments
            </h1>
            <p className="text-gray-300">
              Find assignments to solve and earn points. Help your fellow
              students while building your reputation.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="study-card mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#4ade80]/30 bg-[#1a1a1f]/50 focus:border-[#4ade80] text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40 border-[#4ade80]/30 bg-[#1a1a1f]/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="w-full md:w-40 border-[#4ade80]/30 bg-[#1a1a1f]/50">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-300">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300">
                No assignments found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="study-card hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={getDifficultyColor(assignment.difficulty)}
                      >
                        {assignment.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg line-clamp-2">
                      {assignment.title || "No Title"}
                    </CardTitle>
                    <CardDescription className="text-gray-300 line-clamp-3">
                      {assignment.description || "No Description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <BookOpen className="h-4 w-4" />
                        <span>{assignment.subject || "General"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeLeft(assignment.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <User className="h-4 w-4" />
                        <span>
                          Posted by{" "}
                          {assignment.createdByUsername || "Anonymous"}
                        </span>
                      </div>
                      <div className="h-8"></div>
                      <Link href={`/assignment/${assignment.id}`}>
                        <Button className="w-full duolingo-button">
                          {assignment.status === "solved"
                            ? "View Solution"
                            : "View & Solve"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
