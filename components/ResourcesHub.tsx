"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function ResourcesHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  const featuredResources = [
    {
      title: "AI Ethics: A 2024 Comprehensive Framework",
      author: "Dr. Julian Thorne • Computer Science",
      category: "Premium",
      rating: 4.9,
      downloads: "8.4k",
      reviews: "1.2k",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuHSKZsVdgmXS6AHXBKV7pMITS1Rfzx3cfnAShUzMLMXbPRe41-E6OE1rN-ptlEoNbOyz8qtP5JQ3raHgJ6-NlSvXq_1xOK2D015f6UJP4fvP9VhkG8QgD3BfpOsfjMs6nZqTIFDm48M4iiNXSmJc2OZbe_k97OSiChNZX50kTpEF_G4SmNpzzGE6lbR-mA37zuVWiHsd0lOnZnke-PDe5clvBmXKWOF1zk4eaOhMD6BgwwwKIgASKXBJMwuGVGFsv2KSi9tMq1e8"
    },
    {
      title: "FAANG Technical Interview Mastery Guide",
      author: "AssignDump Team • Careers",
      category: "Popular",
      rating: 5.0,
      downloads: "22k",
      reviews: "3.5k",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJPcLzQsNHMbo7X4CL9iUfAVr8j_IImU9UyBjVtsWftDZeoBZ1z_GxeQ7Tu-G6q36U9oGKuQudPxaSJ3m3TkqgvZhDZEcaxRhFig34pqrVX01pKO79LUX-kxYk5rNYh-bDusif18ixZ-wosWaLBU_OPne0enLYJnbu4NxMdp3bX-ftaZwsboXl87mf-96hGhbKAcS_kUP-B8Ugou0k7VKkaQlCOksTnljPXbpDlO11Veq82BMLrf9uqFq1Rlkms48YRCYE4feVc0M"
    },
    {
      title: "Global Climate Patterns (1990-2023) Dataset",
      author: "OpenScience Org • Environment",
      category: "Free",
      rating: 4.7,
      downloads: "4.1k",
      reviews: "842",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrMFHggqsdu3bSqE1BYTPlU7cUXrPTXGFX5vqzXCb6ZiBUAWMeNi0aO6ePhPFvEmjaufMea7yLMhxRnUqGWjpmHJOy6zORBwgPblqRnIGMzHrfQnigkCRSYo-g1Q5r9AaV0oi9kthUoXBCi1ryJrHg_8o6Muko9Xu220ikXQYtvUNLgjDSUfmqbTVdWBBAQ57_LGwfhx87TO2HDiOVWadoCa-WpkWSGdlRHXj7rqfGfFfo4lIIacniAersi77MZaNMVTDWpvVOQ6g"
    },
    {
      title: "Organic Chemistry II: Reaction Mechanisms",
      author: "Sarah Jenkins • Chemistry",
      category: "Premium",
      rating: 4.8,
      downloads: "2.5k",
      reviews: "621",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxrNoFNxqCW3Hyc4Y25HJubigU7mRcsPzHoCukJllkg7z3ZW4kVsnlJlp0oYENUIZmO4OsmA6VOoQeewQfIRSFaclDnF-PitjRdlz8Dk7g2fSz9XO6dKiS2EjbYr51GtinA9CD7lIrJyX-UP-pkHk8Fw6sqsGOwri9_RNIC8INWgHuI22AVaHZfFcNq2kR7jZA4n-oFMUY0Zo_MTcym8D9ajwX1Gtp3X2aLLMYHd6zSB2DnUr9tsXkYnXvFo1iuvVJLQAyC75jOzU"
    }
  ];

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

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-white overflow-x-hidden font-display">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo href="/" variant="default" logoSize={40} showText={false} />
            <h2 className="text-xl font-bold tracking-tight hidden sm:block text-white">AssignDump</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-white hover:text-primary transition-colors" href="#">Dashboard</a>
            <a className="text-sm font-medium text-white hover:text-primary transition-colors" href="#">Courses</a>
            <a className="text-sm font-medium text-primary" href="#">Resources</a>
            <a className="text-sm font-medium text-white hover:text-primary transition-colors" href="#">Community</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all text-white">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-10 w-10 rounded-full border-2 border-primary/30 p-0.5">
              <img className="w-full h-full rounded-full object-cover" alt="User profile avatar with green border" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXddbb6tIbVnrS5xxLwMi6MfXl94t3ve1dRxOHvxWMYHZXIXuX0TC2_mhzW9xLebmnUHUFFLQdPBCg52Pv2FsdNoUoxYQ2pKY2rwy2BFwZpF8q8Lmf_T2UxaB9XaWm9G-EpzGEPLr4BjLFP7C_91HVGavIi0UMVro6_nHKFejAnR-hAzvGDyj4G-uEQ47BvjWNprstweL-MfpUZSktnG7p9C_49vJqeMXLJZcEBIisAQbCke-X-ToHZZ0s85PVzxP3jqxJ04PLdPs"/>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1200px] mx-auto px-6 py-10 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9] flex flex-col items-center justify-center text-center p-8 border border-white/10" 
                 style={{ 
                   backgroundImage: `linear-gradient(to bottom, rgba(17, 33, 27, 0.7), rgba(17, 33, 27, 0.95)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYCgWXyadinN6al8OG-uAlhKM7j_O5oWeUWY-s__jTww5gARpyWflNcfROR_84cy5H-o8nuZdZdvwqC-KXLlal1ozpW-42Vn5HRrjpQU1z6gvd9aJ_5eV88s-gBwdbJp1xtP0Xfdsx_GOXmBFTY7SvOYvqI121V4IIa-h0pAZ__NUZTJJxZmY84gfR5gbTbz9tjGNrIW6UWGbTMaCpvC9BhYUIaCNtlpqW-T4VKuEsI46MuEQWudX5K7YYbqvrxOj48ElqmkQ5goo')`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 }}>
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">auto_awesome</span> Exclusive Library
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">Student Resources</h1>
            <p className="text-slate-400 text-lg">Access a premium vault of academic materials, from peer-reviewed research to industry-leading job prep kits.</p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="bg-primary text-background-dark px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                Get Started <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="bg-white/5 text-white border border-white/10 backdrop-blur-md px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors">
                How it works
              </button>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
            </div>
            <input 
              type="text"
              placeholder="Search for papers, datasets, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-400 mr-2 uppercase tracking-wider">Quick Filters:</span>
            <button className="px-5 py-2 rounded-xl bg-primary text-background-dark font-bold text-sm shadow-[0_0_15px_rgba(48,232,165,0.2)]">All</button>
            <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors text-sm font-medium">Free</button>
            <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-yellow-500">star</span> Premium
            </button>
            <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors text-sm font-medium">Popular</button>
            <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors text-sm font-medium">Latest</button>
          </div>
        </section>

        {/* Category Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Browse by Category</h2>
            <Link href="#" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              View All Categories <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.title} className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group">
                <div className={`size-16 rounded-2xl ${getCategoryColor(category.color)} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-4xl">{category.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                <p className="text-slate-400 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Resources Carousel */}
        <section className="space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Featured Resources</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {featuredResources.map((resource, index) => (
              <div key={index} className="min-w-[300px] snap-start glass-card rounded-2xl overflow-hidden flex flex-col">
                <div className="h-40 bg-slate-800 relative" 
                     style={{ 
                       backgroundImage: `url('${resource.image}')`,
                       backgroundSize: 'cover'
                     }}>
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getCategoryBadgeColor(resource.category)}`}>
                    {resource.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-bold text-lg mb-1 leading-tight">{resource.title}</h4>
                  <p className="text-slate-400 text-xs mb-4">{resource.author}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="material-symbols-outlined text-sm fill-1">star</span>
                      <span className="text-sm font-bold">{resource.rating}</span>
                      <span className="text-slate-500 text-[10px] font-medium">({resource.reviews})</span>
                    </div>
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">download</span> {resource.downloads}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
