"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchDatasets, type Dataset } from "@/utils/datasets";
import DownloadButton from "@/components/DownloadButton";
import {
  Star,
  Trophy,
  Sparkles,
  Shield,
  Zap,
  BookOpen,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Carousel from "./ui/carousel";
import { toast } from "./ui/use-toast";
import { Input } from "./ui/input";

export default function ResourcesHub() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(8); // Initially show 8 datasets
  const hasLoadedRef = useRef(false);
  const DatasetDivRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  const scrollToDiv = () => {
    DatasetDivRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  };

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 8); // Show 8 more datasets each time
  };

  const handleShowLess = () => {
    setDisplayCount(8); // Reset to initial 8 datasets
  };

  const displayedDatasets = filteredDatasets.slice(0, displayCount);
  const hasMoreDatasets = filteredDatasets.length > displayCount;

  useEffect(() => {
    let isMounted = true;

    if (hasLoadedRef.current) {
      return;
    }

    const loadDatasets = async () => {
      if (!isMounted || hasLoadedRef.current) return;

      try {
        setLoading(true);
        const data = await fetchDatasets();
        if (isMounted) {
          setDatasets(data);
          setFilteredDatasets(data);
          hasLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to load datasets:", error);
        if (isMounted) {
          setDatasets([]);
          setFilteredDatasets([]);
          hasLoadedRef.current = true;
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDatasets();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array

  useEffect(() => {
    let filtered = datasets;

    // Apply filter
    if (activeFilter !== "All") {
      filtered = filtered.filter(
        (dataset) => dataset.category === activeFilter
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dataset) =>
          dataset.title.toLowerCase().includes(query) ||
          dataset.author.toLowerCase().includes(query)
      );
    }

    // Only update if the filtered result is different (using length and first item as simple check)
    if (
      filtered.length !== filteredDatasets.length ||
      (filtered.length > 0 &&
        filteredDatasets.length > 0 &&
        filtered[0].id !== filteredDatasets[0].id)
    ) {
      setFilteredDatasets(filtered);
    }
  }, [datasets, activeFilter, searchQuery]); // Proper dependencies

  const filters = ["All", "Free", "Premium", "Popular", "Latest"];

  const categories = [
    {
      icon: "description",
      title: "Research Papers",
      description: "Over 50,000 peer-reviewed articles and academic journals.",
      color: "primary",
    },
    {
      icon: "work",
      title: "Job Prep",
      description: "Resume templates, case studies, and interview guides.",
      color: "blue",
    },
    {
      icon: "database",
      title: "Datasets",
      description: "Raw data files for ML models and statistical analysis.",
      color: "purple",
    },
    {
      icon: "history_edu",
      title: "Exam Papers",
      description: "Past papers from top universities worldwide.",
      color: "orange",
    },
    {
      icon: "edit_note",
      title: "Study Notes",
      description: "Concise summaries created by top-performing students.",
      color: "yellow",
    },
    {
      icon: "dashboard_customize",
      title: "Templates",
      description: "LaTeX, Notion, and PowerPoint layouts for academia.",
      color: "pink",
    },
  ];

  // Use real datasets instead of dummy data

  const getCategoryColor = (color: string) => {
    const colors: { [key: string]: string } = {
      primary: "bg-primary/10 text-primary",
      blue: "bg-blue-500/10 text-blue-400",
      purple: "bg-purple-500/10 text-purple-400",
      orange: "bg-orange-500/10 text-orange-400",
      yellow: "bg-yellow-500/10 text-yellow-400",
      pink: "bg-pink-500/10 text-pink-400",
    };
    return colors[color] || colors.primary;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Premium":
        return "bg-background-dark/80 backdrop-blur text-primary border border-primary/20";
      case "Popular":
        return "bg-primary text-background-dark";
      case "Free":
        return "bg-background-dark/80 backdrop-blur text-slate-400 border border-white/10";
      default:
        return "bg-background-dark/80 backdrop-blur text-slate-400 border border-white/10";
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Check file size (increased to 50MB for larger files like videos, presentations, etc.)
    if (selectedFile.size > 50 * 1024 * 1024) {
      // 50MB
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    // Optional: Warn about very large files
    if (selectedFile.size > 25 * 1024 * 1024) {
      // 25MB
      toast({
        title: "Large file detected",
        description: `Uploading ${selectedFile.name} (${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(1)}MB). This may take a while.`,
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

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-white overflow-x-hidden font-display">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-3 sm:px-4 lg:px-20 py-2 sm:py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* <Logo variant="default" logoSize={28} showText={false} /> */}
            <h2 className="text-base sm:text-lg font-bold tracking-tight hidden sm:block">
              <span className="text-white">Assign</span>
              <span className="text-[#80e1e1]">Dump</span>
            </h2>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-white hover:text-[#13ec9c] transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={handleLogout}
              className="text-white hover:text-[#13ec9c] transition-colors p-2 rounded-lg hover:bg-white/10"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-24 pb-10 space-y-12">
        {/* Hero Section */}
        <Carousel scroll={scrollToDiv} />

        {/**Upload Area */}
        <div className="mb-10">
          <label className="block mb-3 text-sm font-medium text-white">
            Upload Excel/CSV Files for Data Cleaning and Preprocessing
          </label>
          <div
            className={`dashed-border p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#30e86e]/5 transition-colors group rounded-lg border-2 border-dashed border-white/20 ${
              dragActive ? "bg-[#30e86e]/5 border-[#30e86e]" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-[#30e86e]/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[#30e86e] text-3xl">
                cloud_upload
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1 text-white">
              Drag and drop your files here
            </h3>
            <p className="text-white/40 text-sm mb-6">
              Support for Excel and CSV
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
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("file")?.click()}
              className="bg-[#30e86e] text-[#112116] px-6 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <section
          className="space-y-8 animate-fadeInUp"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">
                search
              </span>
            </div>
            <input
              type="text"
              placeholder="Search datasets, research papers, satellite imagery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-16 pr-6 py-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl shadow-xl hover-lift"
            />
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
              <kbd className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-600">
                ⌘K
              </kbd>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 stagger-children">
            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                filter_list
              </span>
              Quick Filters:
            </span>
            <button className="glossy-pill px-6 py-3 text-sm font-black text-[#0a0f0d] rounded-full hover-lift gpu-accelerated">
              All Datasets
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-green-400">
                public
              </span>
              Free Resources
            </button>
            <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border border-yellow-500/30 hover:border-yellow-500/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-yellow-400">
                workspace_premium
              </span>
              Premium Datasets
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-red-400">
                trending_up
              </span>
              Popular
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-blue-400">
                update
              </span>
              Latest
            </button>
          </div>
        </section>

        {/* Featured Resources Grid */}
        <section
          className="space-y-8 pb-20 animate-fadeInUp"
          style={{ animationDelay: "1s" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight text-white">
              Featured Datasets
              <span className="text-lg font-normal text-slate-400 ml-3">
                ({displayedDatasets.length} of {filteredDatasets.length})
              </span>
            </h2>
          </div>

          <div
            ref={DatasetDivRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {loading ? (
              // Enhanced loading skeleton with stagger
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col border border-white/5 animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-48 bg-slate-800 loading-skeleton relative">
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-700 loading-skeleton w-16 h-6"></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="h-7 bg-slate-700 rounded loading-skeleton mb-3"></div>
                    <div className="h-5 bg-slate-700 rounded loading-skeleton mb-6 w-3/4"></div>
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-slate-700 rounded loading-skeleton w-1/3"></div>
                        <div className="h-5 bg-slate-700 rounded loading-skeleton w-1/4"></div>
                      </div>
                      <div className="h-10 bg-slate-700 rounded loading-skeleton"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : displayedDatasets.length > 0 ? (
              displayedDatasets.map((resource: Dataset, index: number) => (
                <div
                  key={resource.id}
                  className={`glass-card rounded-2xl flex flex-col p-5 relative hover-lift gpu-accelerated group animate-scaleIn transition-all duration-300 hover:scale-105 ${
                    !(
                      resource.category === "Premium" ||
                      (resource.price && resource.price > 0)
                    )
                      ? "border-primary/20 hover:border-primary/40"
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Enhanced Status Badge */}
                  <div
                    className={`absolute top-4 right-4 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border tracking-widest flex items-center gap-1 shadow-lg backdrop-blur-md transition-all duration-300 z-10 ${
                      resource.category === "Premium" ||
                      (resource.price && resource.price > 0)
                        ? "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30"
                        : "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/40 hover:from-primary/30 hover:to-primary/40 shadow-primary/30"
                    }`}
                  >
                    {(resource.category === "Premium" ||
                      (resource.price && resource.price > 0)) && (
                      <span className="material-symbols-outlined text-[12px] animate-pulse">
                        lock
                      </span>
                    )}
                    {resource.category === "Premium" ||
                    (resource.price && resource.price > 0)
                      ? "Premium"
                      : "Free"}
                  </div>

                  {/* Enhanced Icon with Glow */}
                  <div
                    className={`size-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                      resource.category === "Premium" ||
                      (resource.price && resource.price > 0)
                        ? "bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-500 shadow-red-500/20"
                        : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-primary/20"
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {resource.fileType === "dataset"
                        ? "database"
                        : resource.fileType === "assignment"
                        ? "description"
                        : "forum"}
                    </span>
                    {/* Icon glow effect */}
                    <div
                      className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${
                        resource.category === "Premium" ||
                        (resource.price && resource.price > 0)
                          ? "bg-red-500"
                          : "bg-primary"
                      }`}
                    ></div>
                  </div>

                  {/* Enhanced Title */}
                  <h3 className="text-white font-bold text-lg mb-3 leading-tight group-hover:text-primary transition-all duration-300 group-hover:translate-x-1 line-clamp-2">
                    {resource.title}
                  </h3>

                  {/* Enhanced Description */}
                  <p className="text-slate-300 text-sm mb-5 line-clamp-2 leading-relaxed group-hover:text-slate-200 transition-colors duration-300 flex-1">
                    {resource.publication ||
                      `High-quality dataset for ${
                        resource.fileType === "dataset"
                          ? "machine learning and research"
                          : "academic projects and assignments"
                      }.`}
                  </p>

                  {/* Enhanced Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 text-[11px] font-medium rounded-lg uppercase tracking-wider border border-slate-600/30 hover:border-primary/30 transition-all duration-300">
                      {resource.fileType === "dataset"
                        ? "DATA"
                        : resource.fileType === "assignment"
                        ? "ASSIGN"
                        : "SOLUTION"}
                    </span>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 text-[11px] font-medium rounded-lg uppercase tracking-wider border border-slate-600/30 hover:border-primary/30 transition-all duration-300">
                      {resource.fileName?.split(".").pop()?.toUpperCase() ||
                        "CSV"}
                    </span>
                    {resource.price && resource.price > 0 && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-[11px] font-medium rounded-lg uppercase tracking-wider border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300">
                        ${resource.price}
                      </span>
                    )}
                    <span className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-[11px] font-medium rounded-lg uppercase tracking-wider border border-primary/30 hover:border-primary/50 transition-all duration-300">
                      {resource.downloads} DLs
                    </span>
                  </div>

                  {/* Enhanced Download Button */}
                  <DownloadButton
                    fileId={resource.fileId}
                    fileName={resource.fileName || "Download"}
                    fileType={resource.fileType}
                    variant={
                      resource.category === "Premium" ||
                      (resource.price && resource.price > 0)
                        ? "ghost"
                        : "default"
                    }
                    size="sm"
                    className={`w-full transition-all duration-300 ${
                      resource.category === "Premium" ||
                      (resource.price && resource.price > 0)
                        ? "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10"
                        : "hover:shadow-lg hover:shadow-primary/30"
                    }`}
                  />

                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              ))
            ) : (
              <div className="col-span-full w-full text-center py-16">
                <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">
                  search_off
                </span>
                <p className="text-slate-400 text-lg">
                  No datasets found. Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </div>

          {/* Show More/Less Buttons */}
          {!loading && filteredDatasets.length > 8 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-4 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                {displayCount > 8 && (
                  <button
                    onClick={handleShowLess}
                    className="px-6 py-3 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">
                      expand_less
                    </span>
                    Show Less
                  </button>
                )}

                <div className="px-4 py-2 text-slate-400 text-sm">
                  {displayedDatasets.length} of {filteredDatasets.length}
                </div>

                {hasMoreDatasets && (
                  <button
                    onClick={handleShowMore}
                    className="px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-medium rounded-xl hover:from-primary/30 hover:to-primary/40 transition-all duration-300 flex items-center gap-2 border border-primary/30 hover:border-primary/50"
                  >
                    <span className="material-symbols-outlined">
                      expand_more
                    </span>
                    Show More
                    <span className="px-2 py-1 bg-primary/20 rounded-lg text-xs">
                      +{Math.min(8, filteredDatasets.length - displayCount)}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
