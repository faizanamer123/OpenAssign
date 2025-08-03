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
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "solved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c180d] mb-2">
              Browse Assignments
            </h1>
            <p className="text-[#9e8747]">
              Find assignments to solve and earn points. Help your fellow
              students while building your reputation.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="border-[#e9e2ce] bg-[#fcfbf8] mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#9e8747]" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40 border-[#e9e2ce] bg-[#fcfbf8]">
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
                  <SelectTrigger className="w-full md:w-40 border-[#e9e2ce] bg-[#fcfbf8]">
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
              <p className="text-[#9e8747]">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9e8747]">
                No assignments found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="border-[#e9e2ce] bg-[#fcfbf8] hover:shadow-lg transition-shadow"
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
                    <CardTitle className="text-[#1c180d] text-lg line-clamp-2">
                      {assignment.title || "No Title"}
                    </CardTitle>
                    <CardDescription className="text-[#9e8747] line-clamp-3">
                      {assignment.description || "No Description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-[#9e8747]">
                        <BookOpen className="h-4 w-4" />
                        <span>{assignment.subject || "General"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9e8747]">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeLeft(assignment.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9e8747]">
                        <User className="h-4 w-4" />
                        <span>
                          Posted by{" "}
                          {assignment.createdByUsername || "Anonymous"}
                        </span>
                      </div>
                      <div className="h-8"></div>
                      <Link href={`/assignment/${assignment.id}`}>
                        <Button className="w-full bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90">
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
