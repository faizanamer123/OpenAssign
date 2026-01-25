"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchDatasets, type Dataset } from "@/utils/datasets";
import DownloadButton from "@/components/DownloadButton";
import { Star, Trophy, Sparkles, Shield, Zap, BookOpen, TrendingUp, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function ResourcesHub() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setLoading(true);
        const data = await fetchDatasets();
        setDatasets(data);
        setFilteredDatasets(data);
      } catch (error) {
        console.error('Failed to load datasets:', error);
        // Set empty datasets to prevent infinite loading
        setDatasets([]);
        setFilteredDatasets([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a flag to prevent multiple calls
    let isMounted = true;
    if (isMounted) {
      loadDatasets();
    }

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    let filtered = datasets;

    // Apply filter
    if (activeFilter !== "All") {
      filtered = filtered.filter(dataset => dataset.category === activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dataset => 
        dataset.title.toLowerCase().includes(query) ||
        dataset.author.toLowerCase().includes(query)
      );
    }

    setFilteredDatasets(filtered);
  }, [datasets, activeFilter, searchQuery]); // Proper dependencies

  const filters = ["All", "Free", "Premium", "Popular", "Latest"];
  
  const categories = [
    {
      icon: "description",
      title: "Research Papers",
      description: "Over 50,000 peer-reviewed articles and academic journals.",
      color: "primary"
    },
    {
      icon: "work",
      title: "Job Prep",
      description: "Resume templates, case studies, and interview guides.",
      color: "blue"
    },
    {
      icon: "database",
      title: "Datasets",
      description: "Raw data files for ML models and statistical analysis.",
      color: "purple"
    },
    {
      icon: "history_edu",
      title: "Exam Papers",
      description: "Past papers from top universities worldwide.",
      color: "orange"
    },
    {
      icon: "edit_note",
      title: "Study Notes",
      description: "Concise summaries created by top-performing students.",
      color: "yellow"
    },
    {
      icon: "dashboard_customize",
      title: "Templates",
      description: "LaTeX, Notion, and PowerPoint layouts for academia.",
      color: "pink"
    }
  ];

  // Use real datasets instead of dummy data

  const getCategoryColor = (color: string) => {
    const colors: { [key: string]: string } = {
      primary: "bg-primary/10 text-primary",
      blue: "bg-blue-500/10 text-blue-400",
      purple: "bg-purple-500/10 text-purple-400",
      orange: "bg-orange-500/10 text-orange-400",
      yellow: "bg-yellow-500/10 text-yellow-400",
      pink: "bg-pink-500/10 text-pink-400"
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

  // Scroll functions for carousel
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-white overflow-x-hidden font-display">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-3 sm:px-4 lg:px-20 py-2 sm:py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo href="/" variant="default" logoSize={28} showText={false} />
            <h2 className="text-base sm:text-lg font-bold tracking-tight hidden sm:block">
              <span className="text-white">Assign</span><span className="text-[#80e1e1]">Dump</span>
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
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] flex flex-col items-center justify-center text-center p-4 sm:p-6 lg:p-8 border border-white/10 animate-fadeInUp" 
                 style={{ 
                   backgroundImage: `linear-gradient(135deg, rgba(17, 33, 27, 0.7), rgba(17, 33, 27, 0.8), rgba(10, 15, 13, 0.75)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYCgWXyadinN6al8OG-uAlhKM7j_O5oWeUWY-s__jTww5gARpyWflNcfROR_84cy5H-o8nuZdZdvwqC-KXLlal1ozpW-42Vn5HRrjpQU1z6gvd9aJ_5eV88s-gBwdbJp1xtP0Xfdsx_GOXmBFTY7SvOYvqI121V4IIa-h0pAZ__NUZTJJxZmY84gfR5gbTbz9tjGNrIW6UWGbTMaCpvC9BhYUIaCNtlpqW-T4VKuEsI46MuEQWudX5K7YYbqvrxOj48ElqmkQ5goo')`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 }}>
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 max-w-3xl w-full space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-[#30e8a5] text-xs font-bold uppercase tracking-widest" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <span className="material-symbols-outlined text-sm">auto_awesome</span> 
              <span>Exclusive Library</span>
              <span className="material-symbols-outlined text-sm">diamond</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.9)' }}>
              Premium <span className="text-[#30e8a5]" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.9)' }}>Datasets</span> & <span className="text-[#30e8a5]" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.9)' }}>Research</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              Access satellite imagery, sensitive data, research papers, and exclusive datasets.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button className="glossy-pill px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-black text-[#0a0f0d] rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">explore</span>
                Explore
              </button>
              <button className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">play_circle</span>
                How it
              </button>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="space-y-8 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">search</span>
            </div>
            <input 
              type="text"
              placeholder="Search datasets, research papers, satellite imagery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-16 pr-6 py-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl shadow-xl hover-lift"
            />
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
              <kbd className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-600">⌘K</kbd>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 stagger-children">
            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Quick Filters:
            </span>
            <button className="glossy-pill px-6 py-3 text-sm font-black text-[#0a0f0d] rounded-full hover-lift gpu-accelerated">
              All Datasets
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-green-400">public</span>
              Free Resources
            </button>
            <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md border border-yellow-500/30 hover:border-yellow-500/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-yellow-400">workspace_premium</span>
              Premium Datasets
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-red-400">trending_up</span>
              Popular
            </button>
            <button className="px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all text-sm font-medium hover-lift flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-blue-400">update</span>
              Latest
            </button>
          </div>
        </section>

        {/* Category Grid */}
        <section className="space-y-8 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight text-white">Browse by Category</h2>
            <Link href="#" className="text-primary text-sm font-bold flex items-center gap-2 hover:underline transition-colors">
              View All Categories 
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {categories.map((category) => (
              <div key={category.title} className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group hover-lift gpu-accelerated border border-white/5 hover:border-primary/20 transition-all">
                <div className={`size-20 rounded-2xl ${getCategoryColor(category.color)} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="material-symbols-outlined text-5xl">{category.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{category.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{category.description}</p>
                <div className="mt-4 text-xs text-slate-500 uppercase tracking-wider">
                  {Math.floor(Math.random() * 500 + 100)} Resources
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Resources Carousel */}
        <section className="space-y-8 pb-20 animate-fadeInUp" style={{ animationDelay: '1s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight text-white">Featured Datasets</h2>
            <div className="flex gap-3">
              <button 
                onClick={scrollLeft}
                className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover-lift"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button 
                onClick={scrollRight}
                className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover-lift"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div 
            ref={carouselRef}
            className="flex gap-8 overflow-x-auto pb-6 custom-scrollbar snap-x scroll-smooth"
          >
            {loading ? (
              // Enhanced loading skeleton with stagger
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="min-w-[350px] snap-start glass-card rounded-3xl overflow-hidden flex flex-col border border-white/5 animate-scaleIn" style={{ animationDelay: `${index * 0.1}s` }}>
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
            ) : filteredDatasets.length > 0 ? (
              filteredDatasets.slice(0, 8).map((resource: Dataset, index: number) => (
                <div key={resource.id} className={`min-w-[350px] md:min-w-[380px] lg:min-w-[400px] snap-start glass-card rounded-2xl flex flex-col p-5 relative hover-lift gpu-accelerated group animate-scaleIn ${
                  !(resource.category === "Premium" || (resource.price && resource.price > 0)) ? 'border-primary/20 hover:border-primary/40' : ''
                }`} style={{ animationDelay: `${index * 0.15}s` }}>
                  {/* Enhanced Status Badge */}
                  <div className={`absolute top-4 right-4 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border tracking-widest flex items-center gap-1 shadow-lg backdrop-blur-md transition-all duration-300 ${
                    resource.category === "Premium" || (resource.price && resource.price > 0)
                      ? "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30"
                      : "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/40 hover:from-primary/30 hover:to-primary/40 shadow-primary/30"
                  }`}>
                    {(resource.category === "Premium" || (resource.price && resource.price > 0)) && (
                      <span className="material-symbols-outlined text-[12px] animate-pulse">lock</span>
                    )}
                    {resource.category === "Premium" || (resource.price && resource.price > 0) ? "Premium" : "Free"}
                  </div>
                  
                  {/* Enhanced Icon with Glow */}
                  <div className={`size-14 sm:size-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                    resource.category === "Premium" || (resource.price && resource.price > 0)
                      ? "bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-500 shadow-red-500/20"
                      : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-primary/20"
                  }`}>
                    <span className="material-symbols-outlined text-3xl sm:text-4xl">
                      {resource.fileType === "dataset" ? "database" : 
                       resource.fileType === "assignment" ? "description" : "forum"}
                    </span>
                    {/* Icon glow effect */}
                    <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 ${
                      resource.category === "Premium" || (resource.price && resource.price > 0)
                        ? "bg-red-500"
                        : "bg-primary"
                    }`}></div>
                  </div>
                  
                  {/* Enhanced Title */}
                  <h3 className="text-white font-bold text-xl sm:text-lg lg:text-xl mb-3 leading-tight group-hover:text-primary transition-all duration-300 group-hover:translate-x-1">
                    {resource.title}
                  </h3>
                  
                  {/* Enhanced Description */}
                  <p className="text-slate-300 text-sm sm:text-xs lg:text-sm mb-5 line-clamp-2 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {resource.publication || `High-quality dataset for ${resource.fileType === "dataset" ? "machine learning and research" : "academic projects and assignments"}.`}
                  </p>
                  
                  {/* Enhanced Tags */}
                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 text-[11px] font-medium rounded-lg uppercase tracking-wider border border-slate-600/30 hover:border-primary/30 transition-all duration-300">
                      {resource.fileType === "dataset" ? "DATA" : 
                       resource.fileType === "assignment" ? "ASSIGN" : "SOLUTION"}
                    </span>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-300 text-[11px] font-medium rounded-lg uppercase tracking-wider border border-slate-600/30 hover:border-primary/30 transition-all duration-300">
                      {resource.fileName?.split('.').pop()?.toUpperCase() || "CSV"}
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
                    variant={resource.category === "Premium" || (resource.price && resource.price > 0) ? "ghost" : "default"}
                    size="sm"
                    className={`w-full transition-all duration-300 ${
                      resource.category === "Premium" || (resource.price && resource.price > 0)
                        ? "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/10"
                        : "hover:shadow-lg hover:shadow-primary/30"
                    }`}
                  />
                  
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-16">
                <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">search_off</span>
                <p className="text-slate-400 text-lg">No datasets found. Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
