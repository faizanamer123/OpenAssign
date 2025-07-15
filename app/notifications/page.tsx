"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, Clock, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });
import { useAuth } from "@/context/AuthContext"
import type { Notification } from "@/types/assignment"
import { getNotifications, markNotificationRead } from "@/utils/api"

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return;
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true)
    try {
      const data = await getNotifications({ userId: user.id })
      setNotifications(data)
    } catch (error) {
      setNotifications([])
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    await markNotificationRead(notificationId)
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment_solved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "assignment_rated":
        return <Star className="h-5 w-5 text-yellow-600" />
      case "deadline_reminder":
        return <Clock className="h-5 w-5 text-orange-600" />
      default:
        return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1c180d] mb-2">
                Notifications
                {unreadCount > 0 && <Badge className="ml-2 bg-red-100 text-red-800">{unreadCount} new</Badge>}
              </h1>
              <p className="text-[#9e8747]">Stay updated with your assignment activities and community interactions.</p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6] bg-transparent"
              >
                Mark All as Read
              </Button>
            )}
          </div>

          <Card className="border-[#e9e2ce] bg-[#fcfbf8]">
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-[#9e8747]">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-[#9e8747] mb-4" />
                  <p className="text-[#9e8747] mb-4">No notifications yet.</p>
                  <p className="text-sm text-[#9e8747]">
                    You'll receive notifications when someone solves your assignments or rates your solutions.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#e9e2ce]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 transition-colors ${
                        !notification.read ? "bg-[#fac638]/5" : "hover:bg-[#f4f0e6]/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#1c180d] mb-1">
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </h3>
                              <p className="text-[#9e8747] text-sm mb-2">{notification.message}</p>
                              <p className="text-xs text-[#9e8747]">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {!notification.read && (
                                <Button
                                  onClick={() => markAsRead(notification.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#1c180d] hover:bg-[#f4f0e6]"
                                >
                                  Mark as Read
                                </Button>
                              )}
                              <Button
                                onClick={() => deleteNotification(notification.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {(notification.assignmentId || notification.submissionId) && (
                            <div className="mt-3">
                              <Link href={notification.assignmentId ? `/assignment/${notification.assignmentId}` : "#"}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6] bg-transparent"
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          )}
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
  )
}
