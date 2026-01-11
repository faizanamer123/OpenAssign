"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Search, Bell, Upload, LogOut, Activity, Trophy, Menu, User, Settings, HelpCircle, BarChart2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getNotifications, getLeaderboard } from "@/utils/api"
import Logo from "@/components/ui/Logo"

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0);
  const [userStats, setUserStats] = useState({ points: 0, rank: 0 });

  useEffect(() => {
    async function fetchNotifs() {
      if (user) {
        const notifs = await getNotifications({ userId: user.id });
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
      }
    }
    fetchNotifs();
  }, [user]);

  useEffect(() => {
    async function fetchUserStats() {
      if (user) {
        try {
          const leaderboard = await getLeaderboard("points");
          const userEntry = leaderboard.find((u: any) => u.id === user.id);
          if (userEntry) {
            const rank = leaderboard.findIndex((u: any) => u.id === user.id) + 1;
            setUserStats({
              points: userEntry.points || 0,
              rank: rank
            });
          }
        } catch (error) {
          console.error("Failed to fetch user stats:", error);
        }
      }
    }
    fetchUserStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // router.push(`/browse?search=${encodeURIComponent(searchTerm)}`) // Hidden
      router.push(`/home`) // Redirect to home instead
      setSearchTerm("")
    }
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: "/home", label: "Dashboard", icon: BarChart2 },
    // { href: "/browse", label: "Browse", icon: Search }, // Hidden
    // { href: "/leaderboard", label: "Leaderboard", icon: Trophy }, // Hidden
    { href: "/activity", label: "Activity", icon: Activity },
  ]

  // Show loading placeholder instead of null to prevent flash
  if (!user) {
    return (
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="navbar-glass max-w-7xl w-full h-16 sm:h-20 rounded-full flex items-center justify-between px-4 sm:px-6 lg:px-10 transition-all duration-500 opacity-50">
          <div className="w-32 h-8 bg-white/10 rounded-full"></div>
          <div className="w-64 h-8 bg-white/10 rounded-full"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="navbar-glass max-w-7xl w-full h-16 sm:h-20 rounded-full flex items-center justify-between px-4 sm:px-6 lg:px-10 transition-all duration-500">
        {/* Logo */}
        <Logo href="/home" variant="default" logoSize={32} />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false}>
              <button
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[#13ec9c]/20 text-white border border-[#13ec9c]/30"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Upload Button */}
          <Link href="/upload" prefetch={false}>
            <button className="glossy-pill px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-[#0a0f0d] rounded-full hover:scale-105 active:scale-95 transition-all relative hidden sm:flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="relative z-10">Upload</span>
            </button>
          </Link>

          {/* Notifications */}
          <Link href="/notifications" prefetch={false}>
            <button className="p-2 rounded-full text-white hover:bg-white/10 relative transition-all">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </Link>

          {/* User Menu - Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden sm:flex">
              <button className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-full transition-all">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-[#13ec9c] to-[#0ba36b]">
                  <AvatarFallback className="bg-gradient-to-br from-[#13ec9c] to-[#0ba36b] text-[#0a0f0d] text-sm font-bold">
                    {user.username?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-semibold">{user.username}</div>
                  <div className="text-xs text-white/60">{userStats.points || 0} pts</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#0a0f0d]/95 backdrop-blur-xl border border-[#13ec9c]/20 rounded-2xl shadow-2xl">
              <div className="p-3 border-b border-[#13ec9c]/20">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-[#13ec9c] to-[#0ba36b]">
                    <AvatarFallback className="bg-gradient-to-br from-[#13ec9c] to-[#0ba36b] text-[#0a0f0d] font-bold">
                      {user.username?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">{user.username}</div>
                    <div className="text-sm text-white/60">
                      {userStats.points || 0} points 
                      {userStats.points >= 100 && userStats.rank > 0 ? ` • Rank #${userStats.rank}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              <DropdownMenuItem asChild className="focus:bg-[#13ec9c]/10 focus:text-[#13ec9c] hover:bg-[#13ec9c]/10 hover:text-[#13ec9c]">
                <Link href="/activity" prefetch={false} className="flex items-center gap-2 cursor-pointer">
                  <Activity className="h-4 w-4" />
                  My Activity
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild className="focus:bg-[#13ec9c]/10 focus:text-[#13ec9c] hover:bg-[#13ec9c]/10 hover:text-[#13ec9c]">
                <Link href="/leaderboard" prefetch={false} className="flex items-center gap-2 cursor-pointer">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
              </DropdownMenuItem> */}

              <DropdownMenuItem asChild className="focus:bg-[#13ec9c]/10 focus:text-[#13ec9c] hover:bg-[#13ec9c]/10 hover:text-[#13ec9c]">
                <Link href="/notifications" prefetch={false} className="flex items-center gap-2 cursor-pointer">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">{unreadCount}</Badge>
                  )}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <button className="p-2 rounded-full text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#0a0f0d]/95 backdrop-blur-xl border-[#13ec9c]/20">
              {/* Accessibility: Add SheetTitle and SheetDescription for screen readers */}
              <SheetTitle asChild>
                <span className="sr-only">Mobile Navigation Menu</span>
              </SheetTitle>
              <SheetDescription asChild>
                <span className="sr-only">Main navigation links and user actions</span>
              </SheetDescription>
                              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-[#13ec9c] to-[#0ba36b]">
                    <AvatarFallback className="bg-gradient-to-br from-[#13ec9c] to-[#0ba36b] text-[#0a0f0d] font-bold">
                      {user.username?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">{user.username}</div>
                    <div className="text-sm text-white/60">{userStats.points || 0} points</div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-6">
                <Link href="/upload" prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full justify-start glossy-pill px-6 py-3 text-sm font-black text-[#0a0f0d] rounded-full flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Assignment
                  </button>
                </Link>

                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                    <button
                      className={`w-full justify-start px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive(item.href)
                          ? "bg-[#13ec9c]/20 text-white border border-[#13ec9c]/30"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </span>
                    </button>
                  </Link>
                ))}

                <Link href="/notifications" prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full justify-start px-4 py-2 rounded-full text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </button>
                </Link>
              </nav>

              <div className="border-t border-[#13ec9c]/20 pt-4 space-y-2">
                <button
                  className="w-full justify-start px-4 py-2 rounded-full text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
