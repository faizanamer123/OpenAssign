"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock, Star, Trash2, Sparkles, Upload, Loader2, CheckCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});
import { useAuth } from "@/context/AuthContext";
import type { Notification } from "@/types/notification";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/utils/api";
import { toast } from "sonner";

// Helper functions for localStorage (scoped by userId)
const getDeletedNotificationIds = (userId: string): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const key = `deleted_notifications_${userId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return new Set();
    const ids = JSON.parse(stored) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
};

const addDeletedNotificationId = (userId: string, notificationId: string): void => {
  if (typeof window === "undefined") return;
  try {
    const key = `deleted_notifications_${userId}`;
    const deleted = getDeletedNotificationIds(userId);
    deleted.add(notificationId);
    localStorage.setItem(key, JSON.stringify(Array.from(deleted)));
  } catch (error) {
    console.error("Failed to save deleted notification:", error);
  }
};

const removeDeletedNotificationId = (userId: string, notificationId: string): void => {
  if (typeof window === "undefined") return;
  try {
    const key = `deleted_notifications_${userId}`;
    const deleted = getDeletedNotificationIds(userId);
    deleted.delete(notificationId);
    localStorage.setItem(key, JSON.stringify(Array.from(deleted)));
  } catch (error) {
    console.error("Failed to remove deleted notification:", error);
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [markingAsReadIds, setMarkingAsReadIds] = useState<Set<string>>(new Set());
  const notificationRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  // Auto-mark notifications as read when they come into view (like professional sites)
  useEffect(() => {
    if (!user || notifications.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const notificationId = entry.target.getAttribute("data-notification-id");
            if (notificationId) {
              const notification = notifications.find((n) => n.id === notificationId);
              // Auto-mark as read when viewed (only if unread)
              if (notification && !notification.read && !markingAsReadIds.has(notificationId)) {
                handleMarkAsRead(notificationId, true); // true = auto (silent)
              }
            }
          }
        });
      },
      { threshold: 0.5 } // Mark as read when 50% visible
    );

    // Observe all notification elements
    notificationRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [notifications, user, markingAsReadIds]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications({ userId: user.id });
      // Filter out deleted notifications (stored in localStorage)
      const deletedIds = getDeletedNotificationIds(user.id);
      const filtered = data.filter((notification: Notification) => !deletedIds.has(notification.id));
      
      // Sort notifications by date (newest first), then by read status (unread first)
      const sorted = filtered.sort((a: Notification, b: Notification) => {
        // Unread notifications first
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        // Then by date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setNotifications(sorted);
    } catch (error) {
      setNotifications([]);
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications", {
        description: "Please refresh the page to try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, silent = false) => {
    if (!user) return;
    
    // Prevent duplicate requests
    if (markingAsReadIds.has(notificationId)) return;
    
    setMarkingAsReadIds((prev) => new Set(prev).add(notificationId));
    
    try {
      await markNotificationRead(notificationId, user.id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      if (!silent) {
        toast.success("Notification marked as read");
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      if (!silent) {
        toast.error("Failed to mark as read", {
          description: "Please try again.",
        });
      }
    } finally {
      setMarkingAsReadIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (!user) return;
    
    // Prevent duplicate requests
    if (deletingIds.has(notificationId)) return;
    
    setDeletingIds((prev) => new Set(prev).add(notificationId));
    
    // Store deleted notification ID in localStorage (persists across page reloads)
    addDeletedNotificationId(user.id, notificationId);
    
    // Remove from UI immediately (optimistic update)
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    
    toast.success("Notification deleted");
    
    // Clear the deleting state after a brief delay
    setTimeout(() => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }, 300);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;
    
    setMarkingAllAsRead(true);
    try {
      await markAllNotificationsRead(user.id);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      toast.success(`Marked ${unreadNotifications.length} notification${unreadNotifications.length > 1 ? "s" : ""} as read`);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read", {
        description: "Please try again.",
      });
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment_uploaded":
        return (
          <div className="soft-icon">
            <Upload className="h-5 w-5 text-[#9333ea]" />
          </div>
        );
      case "assignment_solved":
        return (
          <div className="soft-icon">
            <CheckCircle className="h-5 w-5 text-[#4ade80]" />
          </div>
        );
      case "assignment_rated":
        return (
          <div className="soft-icon">
            <Star className="h-5 w-5 text-[#fbbf24]" />
          </div>
        );
      case "deadline_reminder":
        return (
          <div className="soft-icon">
            <Clock className="h-5 w-5 text-[#fb923c]" />
          </div>
        );
      default:
        return (
          <div className="soft-icon">
            <Bell className="h-5 w-5 text-[#60a5fa]" />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background reddit-dark-bg animate-fade-in">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-slide-up">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/20 border border-[#4ade80]/30">
                  <Sparkles className="h-6 w-6 text-[#4ade80]" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white border-0 shadow-lg pulse-glow text-sm px-3 py-1">
                    {unreadCount} {unreadCount === 1 ? "new" : "new"}
                  </Badge>
                )}
                {unreadCount === 0 && notifications.length > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-white border-0 shadow-lg text-sm px-3 py-1">
                    <CheckCheck className="h-3 w-3 mr-1" />
                    All read
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground ml-16">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : notifications.length > 0
                  ? "All caught up! No new notifications."
                  : "Stay updated with your assignment activities and community interactions."}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className="duolingo-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingAllAsRead ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Notifications Card */}
          <Card className="study-card animate-slide-up">
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-16">
                  <Loader2 className="inline-block h-8 w-8 animate-spin text-[#4ade80] mb-4" />
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16 animate-scale-in">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                    <Bell className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No notifications yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    You'll receive notifications when someone solves your
                    assignments or rates your solutions.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification, index) => {
                    const isMarkingAsRead = markingAsReadIds.has(notification.id);
                    const isDeleting = deletingIds.has(notification.id);
                    
                    return (
                      <div
                        key={notification.id}
                        ref={(el) => {
                          if (el) {
                            notificationRefs.current.set(notification.id, el);
                            el.setAttribute("data-notification-id", notification.id);
                          } else {
                            notificationRefs.current.delete(notification.id);
                          }
                        }}
                        className={`bubbly-card m-2 rounded-2xl transition-all duration-300 ${
                          !notification.read
                            ? "neon-border bg-gradient-to-r from-[#4ade80]/5 to-transparent border-l-4 border-l-[#4ade80]"
                            : "hover:bg-muted/30 border-l-4 border-l-transparent"
                        } ${isDeleting ? "opacity-50" : ""}`}
                        style={{
                          animationDelay: `${index * 0.05}s`,
                        }}
                      >
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`font-bold text-lg ${
                                      !notification.read 
                                        ? "text-foreground" 
                                        : "text-foreground/80"
                                    }`}>
                                      {notification.title}
                                    </h3>
                                    {!notification.read && !isMarkingAsRead && (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/30">
                                        <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse shadow-lg shadow-[#4ade80]/50"></span>
                                        <span className="text-xs font-medium text-[#4ade80]">New</span>
                                      </span>
                                    )}
                                    {isMarkingAsRead && (
                                      <Loader2 className="h-4 w-4 animate-spin text-[#4ade80]" />
                                    )}
                                  </div>
                                  <p className={`text-sm mb-3 leading-relaxed ${
                                    !notification.read 
                                      ? "text-foreground/90" 
                                      : "text-muted-foreground"
                                  }`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground/70 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(notification.createdAt)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {!notification.read && !isMarkingAsRead && (
                                    <Button
                                      onClick={() => handleMarkAsRead(notification.id, false)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-[#4ade80] hover:bg-[#4ade80]/10 hover:text-[#4ade80] border border-[#4ade80]/20 transition-all"
                                      title="Mark as read"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    variant="ghost"
                                    size="sm"
                                    disabled={isDeleting}
                                    className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444] disabled:opacity-50 transition-all"
                                    title="Delete notification"
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {(notification.assignmentId ||
                                notification.submissionId) && (
                                <div className="mt-4">
                                  <Link
                                    href={
                                      notification.assignmentId
                                        ? `/assignment/${notification.assignmentId}`
                                        : "#"
                                    }
                                    onClick={() => {
                                      // Mark as read when clicking to view details
                                      if (!notification.read) {
                                        handleMarkAsRead(notification.id, true);
                                      }
                                    }}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="duolingo-button-secondary font-semibold"
                                    >
                                      View Details
                                      <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          {!loading && notifications.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in">
              <p>
                Notifications are automatically marked as read when you view them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
