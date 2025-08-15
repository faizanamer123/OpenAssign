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
      router.push(`/browse?search=${encodeURIComponent(searchTerm)}`)
      setSearchTerm("")
    }
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: "/browse", label: "Browse", icon: Search },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/activity", label: "Activity", icon: Activity },
  ]

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-[#f4f0e6]/50 px-4 sm:px-6 lg:px-10 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Logo href="/home" variant="default" logoSize={48} />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false}>
              <Button
                variant="ghost"
                className={`text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[#fac638]/10 text-[#1c180d] border border-[#fac638]/20"
                    : "text-[#9e8747] hover:text-[#1c180d] hover:bg-[#f4f0e6]/50"
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Upload Button */}
          <Link href="/upload" prefetch={false}>
            <Button className="bg-gradient-to-r from-[#fac638] to-[#e6b332] text-[#1c180d] hover:from-[#e6b332] hover:to-[#fac638] font-semibold transition-all duration-300 transform hover:scale-105 hidden sm:flex">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </Link>

          {/* Notifications */}
          <Link href="/notifications" prefetch={false}>
            <Button variant="ghost" size="icon" className="text-[#1c180d] hover:bg-[#f4f0e6]/50 relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-0 h-5">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Menu - Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden sm:flex">
              <Button variant="ghost" className="flex items-center gap-2 text-[#1c180d] hover:bg-[#f4f0e6]/50 px-3">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-[#fac638] to-[#e6b332]">
                  <AvatarFallback className="bg-gradient-to-br from-[#fac638] to-[#e6b332] text-[#1c180d] text-sm font-bold">
                    {user.username?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-semibold">{user.username}</div>
                  <div className="text-xs text-[#9e8747]">{userStats.points || 0} points</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border-[#e9e2ce]/50">
              <div className="p-3 border-b border-[#e9e2ce]/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-[#fac638] to-[#e6b332]">
                    <AvatarFallback className="bg-gradient-to-br from-[#fac638] to-[#e6b332] text-[#1c180d] font-bold">
                      {user.username?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-[#1c180d]">{user.username}</div>
                    <div className="text-sm text-[#9e8747]">{userStats.points || 0} points • Rank #{userStats.rank}</div>
                  </div>
                </div>
              </div>

              <DropdownMenuItem asChild>
                <Link href="/activity" prefetch={false} className="flex items-center gap-2 cursor-pointer">
                  <Activity className="h-4 w-4" />
                  My Activity
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leaderboard" prefetch={false} className="flex items-center gap-2 cursor-pointer">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics" prefetch={false} className="flex items-center gap-2 cursor-pointer">
                  <BarChart2 className="h-4 w-4" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications" prefetch={false} className="flex items-center gap-2 cursor-pointer">
                  <Bell className="h-4 w-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">{unreadCount}</Badge>
                  )}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon" className="text-[#1c180d]">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-sm border-[#e9e2ce]/50">
              {/* Accessibility: Add SheetTitle and SheetDescription for screen readers */}
              <SheetTitle asChild>
                <span className="sr-only">Mobile Navigation Menu</span>
              </SheetTitle>
              <SheetDescription asChild>
                <span className="sr-only">Main navigation links and user actions</span>
              </SheetDescription>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 bg-gradient-to-br from-[#fac638] to-[#e6b332]">
                    <AvatarFallback className="bg-gradient-to-br from-[#fac638] to-[#e6b332] text-[#1c180d] font-bold">
                      {user.username?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-[#1c180d]">{user.username}</div>
                    <div className="text-sm text-[#9e8747]">{userStats.points || 0} points</div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-6">
                <Link href="/upload" prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start bg-gradient-to-r from-[#fac638] to-[#e6b332] text-[#1c180d] hover:from-[#e6b332] hover:to-[#fac638] font-semibold">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Assignment
                  </Button>
                </Link>

                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? "bg-[#fac638]/10 text-[#1c180d] border border-[#fac638]/20"
                          : "text-[#9e8747] hover:text-[#1c180d] hover:bg-[#f4f0e6]/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                <Link href="/notifications" prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#9e8747] hover:text-[#1c180d] hover:bg-[#f4f0e6]/50"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">{unreadCount}</Badge>
                    )}
                  </Button>
                </Link>
              </nav>

              <div className="border-t border-[#e9e2ce]/50 pt-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
