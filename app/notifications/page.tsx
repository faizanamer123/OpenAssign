"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> })
import { useAuth } from "@/context/AuthContext"
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/utils/api"
import type { Notification } from "@/types/notification"

interface GroupedNotifications {
  today: Notification[]
  yesterday: Notification[]
  older: Notification[]
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotifications>({
    today: [],
    yesterday: [],
    older: []
  })
  const [loading, setLoading] = useState(true)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      loadNotifications()
      // Set up polling for real-time updates (every 30 seconds)
      const interval = setInterval(() => {
        loadNotifications()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user, mounted])

  const loadNotifications = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getNotifications({ userId: user.id })
      
      // Sort by date (newest first)
      const sorted = data.sort((a: Notification, b: Notification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setNotifications(sorted)
      
      // Group by date
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const grouped: GroupedNotifications = {
        today: [],
        yesterday: [],
        older: []
      }
      
      sorted.forEach((notif: Notification) => {
        const notifDate = new Date(notif.createdAt)
        notifDate.setHours(0, 0, 0, 0)
        
        if (notifDate.getTime() === today.getTime()) {
          grouped.today.push(notif)
        } else if (notifDate.getTime() === yesterday.getTime()) {
          grouped.yesterday.push(notif)
        } else {
          grouped.older.push(notif)
        }
      })
      
      setGroupedNotifications(grouped)
    } catch (error) {
      console.error("Failed to load notifications:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return
    try {
      await markNotificationRead(notificationId, user.id)
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
      // Update grouped notifications
      const updated = { ...groupedNotifications }
      Object.keys(updated).forEach((key) => {
        updated[key as keyof GroupedNotifications] = updated[key as keyof GroupedNotifications].map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      })
      setGroupedNotifications(updated)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    const unreadNotifications = notifications.filter(n => !n.read)
    if (unreadNotifications.length === 0) return
    
    setMarkingAllAsRead(true)
    try {
      await markAllNotificationsRead(user.id)
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
      // Update grouped notifications
      const updated = { ...groupedNotifications }
      Object.keys(updated).forEach((key) => {
        updated[key as keyof GroupedNotifications] = updated[key as keyof GroupedNotifications].map(n => ({ ...n, read: true }))
      })
      setGroupedNotifications(updated)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment_uploaded":
        return "upload_file"
      case "assignment_solved":
        return "check_circle"
      case "assignment_rated":
        return "star"
      case "deadline_reminder":
        return "schedule"
      default:
        return "notifications"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "assignment_uploaded":
        return "#13ec9c"
      case "assignment_solved":
        return "#13ec9c"
      case "assignment_rated":
        return "#fbbf24"
      case "deadline_reminder":
        return "#fb923c"
      default:
        return "#60a5fa"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0c0b] font-display text-white">
        <div className='h-16' />
        <main className="flex flex-1 justify-center py-8 px-6 lg:px-20">
          <div className="text-center py-12 text-white">Loading...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0c0b] font-display text-white">
        <Header />
        <main className="flex flex-1 justify-center py-8 px-6 lg:px-20">
          <div className="text-center py-12 text-white">Please log in to view notifications</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0c0b] font-display text-white">
      {/* Background Cinematic Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[300px] bg-[#13ec9c]/5 blur-[120px] rounded-full rotate-45"></div>
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[300px] bg-[#13ec9c]/5 blur-[120px] rounded-full -rotate-45"></div>
      </div>

      <Header />

      <main className="flex flex-1 justify-center py-8 px-6 lg:px-20 max-w-[1400px] mx-auto w-full">
        {/* Main Notification Feed */}
        <section className="flex-1 flex flex-col gap-6">
          {/* Feed Header */}
          <div className="flex flex-wrap justify-between items-end gap-4 px-2">
            <div className="flex flex-col gap-1">
              <p className="text-white text-4xl font-black tracking-tight">Notifications</p>
              <p className="text-white/40 text-base font-normal">Monitor your academic trajectory</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">done_all</span>
                <span className="text-sm font-bold">Mark all as read</span>
              </button>
            )}
          </div>

          {/* Feed Content */}
              {loading ? (
            <div className="text-center py-16 text-white/60">Loading notifications...</div>
          ) : notifications.length === 0 ? (
                <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                <span className="material-symbols-outlined text-4xl text-white/40">notifications</span>
                </div>
              <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
              <p className="text-sm text-white/40 max-w-md mx-auto">
                You'll receive notifications when someone solves your assignments or rates your solutions.
                  </p>
                </div>
              ) : (
            <div className="flex flex-col gap-8 mt-4">
              {/* Today Group */}
              {groupedNotifications.today.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 px-2">
                    <h3 className="text-[#13ec9c]/80 text-xs font-black uppercase tracking-[0.3em]">Today</h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#13ec9c]/30 to-transparent"></div>
                  </div>
                  {groupedNotifications.today.map((notification) => {
                    const icon = getNotificationIcon(notification.type)
                    const color = getNotificationColor(notification.type)
                    return (
                      <div
                        key={notification.id}
                        className={`group relative bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border rounded-2xl p-5 flex items-center gap-6 transition-all hover:translate-x-1 border-l-4 ${
                          !notification.read
                            ? `border-l-[${color}] bg-gradient-to-r from-[#13ec9c]/5 to-transparent`
                            : 'border-l-white/20 opacity-80 hover:opacity-100'
                        }`}
                        style={{ borderLeftColor: !notification.read ? color : 'rgba(255,255,255,0.2)' }}
                      >
                        <div 
                          className="size-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}10` }}
                        >
                          <span className="material-symbols-outlined text-4xl" style={{ color, fontWeight: 300 }}>
                            {icon}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color }}>
                                {notification.type.replace('_', ' ').toUpperCase()} • {formatTimeAgo(notification.createdAt)}
                              </p>
                              <h4 className="text-white text-lg font-bold">{notification.title}</h4>
                              <p className="text-white/50 text-sm max-w-xl mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <span className="size-2 rounded-full bg-[#13ec9c] shadow-[0_0_8px_#13ec9c]"></span>
                            )}
                          </div>
                        </div>
                        {notification.assignmentId && (
                          <Link 
                            href={`/assignment/${notification.assignmentId}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#13ec9c] to-[#0eb37a] text-black font-black text-sm rounded-lg hover:shadow-[0_0_20px_rgba(19,236,156,0.4)] transition-all">
                              View Details
                              <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                          </Link>
                                    )}
                                  </div>
                    )
                  })}
                                </div>
              )}

              {/* Yesterday Group */}
              {groupedNotifications.yesterday.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 px-2">
                    <h3 className="text-white/30 text-xs font-black uppercase tracking-[0.3em]">Yesterday</h3>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>
                  {groupedNotifications.yesterday.map((notification) => {
                    const icon = getNotificationIcon(notification.type)
                    const color = getNotificationColor(notification.type)
                    return (
                      <div
                        key={notification.id}
                        className="group relative bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border rounded-2xl p-5 flex items-center gap-6 transition-all hover:translate-x-1 border-l-4 border-l-white/20 opacity-80 hover:opacity-100"
                      >
                        <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                          <span className="material-symbols-outlined text-4xl" style={{ fontWeight: 300 }}>
                            {icon}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                                {notification.type.replace('_', ' ').toUpperCase()} • {formatTimeAgo(notification.createdAt)}
                              </p>
                              <h4 className="text-white text-lg font-bold">{notification.title}</h4>
                              <p className="text-white/40 text-sm max-w-xl mt-1">{notification.message}</p>
                            </div>
                                </div>
                              </div>
                        {notification.assignmentId && (
                                  <Link
                            href={`/assignment/${notification.assignmentId}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white font-black text-sm rounded-lg transition-all">
                              Check Details
                            </button>
                                  </Link>
                        )}
                      </div>
                    )
                  })}
                                </div>
                              )}

              {/* Older Group */}
              {groupedNotifications.older.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 px-2">
                    <h3 className="text-white/30 text-xs font-black uppercase tracking-[0.3em]">Older</h3>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>
                  {groupedNotifications.older.slice(0, 10).map((notification) => {
                    const icon = getNotificationIcon(notification.type)
                    return (
                      <div
                        key={notification.id}
                        className="group relative bg-[rgba(28,39,35,0.4)] backdrop-blur-[12px] border rounded-2xl p-5 flex items-center gap-6 transition-all hover:translate-x-1 border-l-4 border-l-white/20 opacity-80 hover:opacity-100"
                      >
                        <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                          <span className="material-symbols-outlined text-4xl" style={{ fontWeight: 300 }}>
                            {icon}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                                {notification.type.replace('_', ' ').toUpperCase()} • {formatTimeAgo(notification.createdAt)}
                              </p>
                              <h4 className="text-white text-lg font-bold">{notification.title}</h4>
                              <p className="text-white/40 text-sm max-w-xl mt-1">{notification.message}</p>
                            </div>
                          </div>
                        </div>
                        {notification.assignmentId && (
                          <Link 
                            href={`/assignment/${notification.assignmentId}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white font-black text-sm rounded-lg transition-all">
                              View
                            </button>
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Footer Info */}
              {notifications.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-white/20 text-xs font-medium">
                    Viewing {notifications.length} notification{notifications.length > 1 ? 's' : ''}.
              </p>
            </div>
          )}
        </div>
          )}
        </section>
      </main>
    </div>
  )
}