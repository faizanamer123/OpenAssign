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
  loading: () => <div>Loading...</div>,
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
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadAssignments();
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      loadAssignments();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAssignments();
    setCurrentPage(1); // Reset to first page when filters change
  }, [assignments, searchTerm, difficultyFilter]);

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

    // Filter out assignments that are 8+ hours past deadline
    const now = new Date();
    filtered = filtered.filter((assignment) => {
      const deadlineDate = new Date(assignment.deadline);
      const hoursPastDeadline = (now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60);
      return hoursPastDeadline < 8; // Only show if less than 8 hours past deadline
    });

    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.difficulty === difficultyFilter
      );
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.subject?.toLowerCase() === subjectFilter.toLowerCase()
      );
    }

    setFilteredAssignments(filtered);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and neighbors
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
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
    <div className="min-h-screen bg-[#10221b]">
      <Header />
      <main className="pt-28 flex flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="hidden lg:flex w-72 border-r border-[#283933] p-6 flex-col gap-8 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto bg-[#10221b]">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#9db9af]">Subjects</h3>
            <div className="flex flex-col gap-1">
              <div 
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                  subjectFilter === 'mathematics' ? 'bg-[#13ec9c]/10 text-[#13ec9c] border border-[#13ec9c]/30' : 'hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] hover:border hover:border-[#13ec9c]/30 text-white/60 border border-transparent'
                }`}
                onClick={() => setSubjectFilter(subjectFilter === 'mathematics' ? 'all' : 'mathematics')}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">function</span>
                  <p className="text-sm font-bold">Mathematics</p>
                </div>
                {subjectFilter === 'mathematics' && (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
              </div>
              <div 
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                  subjectFilter === 'computer-science' ? 'bg-[#13ec9c]/10 text-[#13ec9c] border border-[#13ec9c]/30' : 'hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] hover:border hover:border-[#13ec9c]/30 text-white/60 border border-transparent'
                }`}
                onClick={() => setSubjectFilter(subjectFilter === 'computer-science' ? 'all' : 'computer-science')}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">code</span>
                  <p className="text-sm font-bold">Computer Science</p>
                </div>
                {subjectFilter === 'computer-science' && (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
              </div>
              <div 
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                  subjectFilter === 'physics' ? 'bg-[#13ec9c]/10 text-[#13ec9c] border border-[#13ec9c]/30' : 'hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] hover:border hover:border-[#13ec9c]/30 text-white/60 border border-transparent'
                }`}
                onClick={() => setSubjectFilter(subjectFilter === 'physics' ? 'all' : 'physics')}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">science</span>
                  <p className="text-sm font-bold">Physics</p>
                </div>
                {subjectFilter === 'physics' && (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
              </div>
              <div 
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                  subjectFilter === 'biology' ? 'bg-[#13ec9c]/10 text-[#13ec9c] border border-[#13ec9c]/30' : 'hover:bg-[#13ec9c]/10 hover:text-[#13ec9c] hover:border hover:border-[#13ec9c]/30 text-white/60 border border-transparent'
                }`}
                onClick={() => setSubjectFilter(subjectFilter === 'biology' ? 'all' : 'biology')}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">biotech</span>
                  <p className="text-sm font-bold">Biology</p>
                </div>
                {subjectFilter === 'biology' && (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#9db9af]">Difficulty</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  checked={difficultyFilter === 'all' || difficultyFilter === 'easy'}
                  onChange={() => setDifficultyFilter(difficultyFilter === 'easy' ? 'all' : 'easy')}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#13ec9c] focus:ring-[#13ec9c] bg-transparent" 
                  type="checkbox"
                />
                <span className="text-sm font-medium group-hover:text-[#13ec9c] transition-colors text-slate-700 dark:text-white">Beginner</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  checked={difficultyFilter === 'all' || difficultyFilter === 'medium'}
                  onChange={() => setDifficultyFilter(difficultyFilter === 'medium' ? 'all' : 'medium')}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#13ec9c] focus:ring-[#13ec9c] bg-transparent" 
                  type="checkbox"
                />
                <span className="text-sm font-medium group-hover:text-[#13ec9c] transition-colors text-slate-700 dark:text-white">Intermediate</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  checked={difficultyFilter === 'hard'}
                  onChange={() => setDifficultyFilter(difficultyFilter === 'hard' ? 'all' : 'hard')}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#13ec9c] focus:ring-[#13ec9c] bg-transparent" 
                  type="checkbox"
                />
                <span className="text-sm font-medium group-hover:text-[#13ec9c] transition-colors text-slate-700 dark:text-white">Advanced</span>
              </label>
            </div>
          </div>


          <div className="mt-auto">
            <Link href="/upload">
              <button className="w-full bg-[#13ec9c] text-[#10221b] font-bold py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">add_circle</span>
                Create Custom Task
              </button>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 flex flex-col bg-[#0a0a0a]/50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            {/* Headline & Search */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">Explore Assignment Library</h1>
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <Input
                    placeholder="Search by title, topic, or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1a2e26] border-none rounded-xl py-4 pl-12 pr-4 text-base focus:ring-2 focus:ring-[#13ec9c]/50 transition-all shadow-sm text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="bg-[#283933] px-4 rounded-xl flex items-center gap-2 font-medium text-sm border border-transparent text-white hover:bg-[#13ec9c]/20 hover:border-[#13ec9c]/30 transition-colors">
                    <span className="material-symbols-outlined text-xl">tune</span>
                    Sort: Relevant
                  </button>
                  <button className="bg-[#283933] px-4 rounded-xl flex items-center gap-2 font-medium text-sm border border-transparent text-white">
                    <span className="material-symbols-outlined text-xl">view_module</span>
                  </button>
                </div>
              </div>
              {(difficultyFilter !== 'all' || subjectFilter !== 'all' || searchTerm) && (
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-2">
                  {difficultyFilter !== 'all' && (
                    <span className="px-2 sm:px-3 py-1 bg-[#13ec9c]/20 text-[#13ec9c] border border-[#13ec9c]/30 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                      Difficulty: {difficultyFilter} <span className="material-symbols-outlined text-xs sm:text-sm cursor-pointer" onClick={() => setDifficultyFilter('all')}>close</span>
                    </span>
                  )}
                  {subjectFilter !== 'all' && (
                    <span className="px-2 sm:px-3 py-1 bg-[#13ec9c]/20 text-[#13ec9c] border border-[#13ec9c]/30 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                      Subject: {subjectFilter} <span className="material-symbols-outlined text-xs sm:text-sm cursor-pointer" onClick={() => setSubjectFilter('all')}>close</span>
                    </span>
                  )}
                  <button 
                    onClick={() => { setSearchTerm(''); setDifficultyFilter('all'); setSubjectFilter('all'); }}
                    className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#13ec9c] transition-colors whitespace-nowrap"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

          {/* Assignment Grid */}
          {loading ? (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex items-center justify-center min-h-[500px] py-12">
              <div className="max-w-4xl w-full flex flex-col items-center px-4">
                <div className="relative w-full h-[300px] sm:h-[400px] flex items-center justify-center mb-6 sm:mb-8">
                  {/* Floating Icons */}
                  <div className="absolute top-8 sm:top-10 left-1/4 animate-float opacity-80">
                    <div className="size-12 sm:size-16 glass-card rounded-xl sm:rounded-2xl flex items-center justify-center emerald-glow">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#13ec9c]">menu_book</span>
                    </div>
                  </div>
                  <div className="absolute bottom-16 sm:bottom-20 left-1/3 animate-float-delayed opacity-60">
                    <div className="size-10 sm:size-12 glass-card rounded-lg sm:rounded-xl flex items-center justify-center emerald-glow">
                      <span className="material-symbols-outlined text-xl sm:text-2xl text-[#13ec9c]">lightbulb</span>
                    </div>
                  </div>
                  <div className="absolute top-20 sm:top-24 right-1/4 animate-float-delayed opacity-80">
                    <div className="size-11 sm:size-14 glass-card rounded-xl sm:rounded-2xl flex items-center justify-center emerald-glow">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#13ec9c]">lightbulb</span>
                    </div>
                  </div>
                  <div className="absolute bottom-24 sm:bottom-32 right-1/3 animate-float opacity-60">
                    <div className="size-10 sm:size-12 glass-card rounded-lg sm:rounded-xl flex items-center justify-center emerald-glow">
                      <span className="material-symbols-outlined text-xl sm:text-2xl text-[#13ec9c]">auto_stories</span>
                    </div>
                  </div>
                  {/* Robot SVG Illustration */}
                  <div className="relative z-10 scale-90 sm:scale-100 md:scale-110">
                    <svg fill="none" height="200" viewBox="0 0 200 200" width="200" className="sm:h-[280px] sm:w-[280px]" xmlns="http://www.w3.org/2000/svg">
                      <rect fill="#e2e8f0" height="60" rx="15" width="70" x="65" y="80"></rect>
                      <rect fill="#13ec92" fillOpacity="0.2" height="40" rx="8" stroke="#13ec92" strokeWidth="1" width="50" x="75" y="90"></rect>
                      <g transform="translate(0, -5) rotate(-5, 100, 60)">
                        <rect fill="white" height="45" rx="12" width="60" x="70" y="30"></rect>
                        <circle cx="85" cy="50" fill="#0d1411" r="4"></circle>
                        <circle cx="115" cy="50" fill="#0d1411" r="4"></circle>
                        <path d="M80 40 L90 43" stroke="#0d1411" strokeLinecap="round" strokeWidth="2"></path>
                        <path d="M110 43 L120 40" stroke="#0d1411" strokeLinecap="round" strokeWidth="2"></path>
                        <path d="M95 62 Q100 62 105 62" stroke="#0d1411" strokeLinecap="round" strokeWidth="2"></path>
                      </g>
                      <rect fill="#cbd5e1" height="15" width="20" x="90" y="70"></rect>
                      <path d="M65 100 Q40 100 50 120" stroke="#e2e8f0" strokeLinecap="round" strokeWidth="12"></path> 
                      <path d="M135 100 Q170 100 180 140" stroke="#e2e8f0" strokeLinecap="round" strokeWidth="12"></path> 
                      <circle cx="50" cy="120" fill="#cbd5e1" r="8"></circle>
                      <circle cx="180" cy="140" fill="#cbd5e1" r="8"></circle>
                      <rect fill="#cbd5e1" height="25" rx="7.5" width="15" x="75" y="140"></rect>
                      <rect fill="#cbd5e1" height="25" rx="7.5" width="15" x="110" y="140"></rect>
                    </svg>
                  </div>
                </div>
                <div className="text-center max-w-lg px-4">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight text-white">Your desk is looking a bit empty!</h3>
                  <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
                    {searchTerm || difficultyFilter !== 'all' 
                      ? "No assignments found matching your criteria. Try adjusting your filters."
                      : "Upload your first assignment and let me help you find the solution."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                    {!(searchTerm || difficultyFilter !== 'all') && (
                      <Link href="/upload">
                        <button className="animate-pulse-slow flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-[#13ec9c] text-[#0d1411] font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl button-glow hover:scale-105 transition-all active:scale-95 group">
                          <span className="material-symbols-outlined text-xl sm:text-2xl font-bold">upload_file</span>
                          <span>Upload Assignment</span>
                        </button>
                      </Link>
                    )}
                    {(searchTerm || difficultyFilter !== 'all') && (
                      <button 
                        onClick={() => { setSearchTerm(''); setDifficultyFilter('all'); }}
                        className="flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white/5 border border-white/10 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:bg-white/10 hover:border-[#13ec9c]/50 transition-all"
                      >
                        <span className="material-symbols-outlined text-xl sm:text-2xl">refresh</span>
                        <span>Clear Filters</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-48 sm:w-64 h-3 sm:h-4 bg-black/40 blur-xl rounded-[100%] mt-6 sm:mt-8 mx-auto"></div>
              </div>
            </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedAssignments.map((assignment) => (
                  <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
                    <div className="bg-[#1a2621] rounded-xl overflow-hidden border border-[#283933] hover:border-[#13ec9c]/50 transition-all group cursor-pointer shadow-sm hover:shadow-xl">
                      <div className="h-40 bg-slate-200 dark:bg-slate-800 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#13ec9c]/20 to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#10221b]/80 dark:bg-[#0a0f0d]/80 backdrop-blur-md text-[#13ec9c] text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                            {assignment.difficulty === 'easy' ? 'Beginner' : assignment.difficulty === 'medium' ? 'Intermediate' : 'Advanced'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSubjectFilter(assignment.subject?.toLowerCase() || 'all'); }}
                            className="text-xs font-bold text-[#13ec9c] uppercase hover:text-[#13ec9c] hover:underline transition-colors"
                          >
                            {assignment.subject?.toUpperCase() || 'GENERAL'}
                          </button>
                          <span className={`flex items-center gap-1 text-xs font-medium ${
                            formatTimeLeft(assignment.deadline).includes('h') && !formatTimeLeft(assignment.deadline).includes('d') 
                              ? 'text-[#13ec9c] font-bold' 
                              : 'text-slate-400 dark:text-[#9db9af]'
                          }`}>
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {formatTimeLeft(assignment.deadline)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold leading-snug group-hover:text-[#13ec9c] transition-colors text-white">
                          {assignment.title || "No Title"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-[#9db9af] line-clamp-2">
                          {assignment.description || "No Description"}
                        </p>
                        <div className="pt-4 border-t border-slate-100 dark:border-[#283933] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-slate-400 dark:text-[#9db9af]">schedule</span>
                            <span className="text-xs font-medium text-slate-400 dark:text-[#9db9af]">
                              {new Date(assignment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          )}

            {/* Pagination */}
            {filteredAssignments.length > 0 && totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="size-8 sm:size-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-[#283933] hover:bg-[#13ec9c]/20 transition-colors text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                </button>
                <div className="flex gap-1 sm:gap-2">
                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="size-8 sm:size-10 hidden sm:flex items-end justify-center pb-2 text-white/40">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`size-8 sm:size-10 flex items-center justify-center rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base ${
                          currentPage === page
                            ? 'bg-[#13ec9c] text-[#10221b] font-bold'
                            : 'bg-[#283933] hover:bg-[#13ec9c]/20 text-white'
                        } ${typeof page === 'number' && page > 1 && page < totalPages ? 'hidden sm:flex' : ''}`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="size-8 sm:size-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-[#283933] hover:bg-[#13ec9c]/20 transition-colors text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                </button>
        </div>
            )}
      </div>
        </section>
      </main>
    </div>
  );
}