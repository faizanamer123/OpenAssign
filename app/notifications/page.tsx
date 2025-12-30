"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock, Star, Trash2, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});
import { useAuth } from "@/context/AuthContext";
import type { Notification } from "@/types/notification";
import { getNotifications, markNotificationRead } from "@/utils/api";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications({ userId: user.id });
      // Sort notifications by date (newest first)
      const sorted = data.sort((a: Notification, b: Notification) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setNotifications(sorted);
    } catch (error) {
      setNotifications([]);
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    await Promise.all(
      unreadNotifications.map((n) => markNotificationRead(n.id))
    );
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
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
                  <Badge className="ml-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white border-0 shadow-lg pulse-glow">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground ml-16">
                Stay updated with your assignment activities and community
                interactions.
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="game-styled-button"
              >
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Notifications Card */}
          <Card className="study-card animate-slide-up">
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
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
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`bubbly-card m-2 rounded-2xl transition-all duration-300 ${
                        !notification.read
                          ? "neon-border bg-gradient-to-r from-[#4ade80]/5 to-transparent"
                          : "hover:bg-muted/30"
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
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
                                  <h3 className="font-bold text-foreground text-lg">
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <span className="inline-block w-2.5 h-2.5 bg-[#4ade80] rounded-full animate-pulse shadow-lg shadow-[#4ade80]/50"></span>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground/70">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!notification.read && (
                                  <Button
                                    onClick={() => markAsRead(notification.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#4ade80] hover:bg-[#4ade80]/10 hover:text-[#4ade80] border border-[#4ade80]/20"
                                  >
                                    Mark Read
                                  </Button>
                                )}
                                <Button
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
                                >
                                  <Trash2 className="h-4 w-4" />
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
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="game-styled-button-purple border-0"
                                  >
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
