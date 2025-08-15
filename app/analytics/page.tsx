"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart2, PieChart, Users, BookOpen, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { getAnalytics } from "@/utils/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend
} from "recharts";

const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });

const COLORS = ["#fac638", "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animateProgress, setAnimateProgress] = useState(false);

  // Helper function to safely get numeric values
  const getSafeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Helper function to safely format rating
  const getSafeRating = (value: any): number => {
    const rating = getSafeNumber(value, 0);
    return Math.max(0, Math.min(5, rating)); // Ensure rating is between 0-5
  };

  async function fetchData() {
    setLoading(true);
    setAnimateProgress(false); // Reset animation state
    try {
      const d = await getAnalytics();
      // Ensure all numeric values are properly converted
      const processedData = {
        ...d,
        totalUsers: getSafeNumber(d.totalUsers),
        totalAssignments: getSafeNumber(d.totalAssignments),
        solvedAssignments: getSafeNumber(d.solvedAssignments),
        averageRating: getSafeRating(d.averageRating),
        avgSubmissionSpeed: getSafeNumber(d.avgSubmissionSpeed),
        activeUsers7d: getSafeNumber(d.activeUsers7d),
        activeUsers30d: getSafeNumber(d.activeUsers30d),
        uploadsPerDay: Array.isArray(d.uploadsPerDay) ? d.uploadsPerDay : [],
        ratingsDist: Array.isArray(d.ratingsDist) ? d.ratingsDist : [],
        topUsers: Array.isArray(d.topUsers) ? d.topUsers : [],
        userGrowth: Array.isArray(d.userGrowth) ? d.userGrowth : [],
        assignmentCategories: Array.isArray(d.assignmentCategories) ? d.assignmentCategories : [],
        leaderboardTrends: Array.isArray(d.leaderboardTrends) ? d.leaderboardTrends : [],
      };
      setData(processedData);
      setError("");
      // Trigger progress animations after data is set
      setTimeout(() => setAnimateProgress(true), 100);
    } catch (e: any) {
      console.error("Analytics fetch error:", e);
      setError("Failed to load analytics");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Don't render anything until data is loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#fac638] mx-auto mb-4"></div>
          <p className="text-[#9e8747] text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-500 text-lg mb-2">Failed to load analytics</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-[#fac638] text-[#1c180d] rounded-lg hover:bg-[#e6b332] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure data exists before rendering
  if (!data) {
    return (
      <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#9e8747] text-lg">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />
      <div className="px-2 py-8 sm:px-4 lg:px-8 bg-gradient-to-b from-[#fcfbf8] to-[#f7f3e9] min-h-screen">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-[#1c180d] mb-2 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-[#fac638]" /> Analytics
          </h1>
          <p className="text-[#9e8747] mb-8">Track your progress, assignment stats, and community growth.</p>
          
              {/* Overview Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-[#fac638]" /> Overview
                </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Students Card */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                    <Users className="h-4 w-4 text-blue-500" /> Students
                      </CardTitle>
                    </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e9e2ce"
                          strokeWidth="8"
                          fill="transparent"
                          className="opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#blueGradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${animateProgress ? Math.min((data.totalUsers / 100) * 251.2, 251.2) : 0} 251.2`}
                          strokeDashoffset="0"
                          className="transition-all duration-1500 ease-out"
                          style={{
                            transitionDelay: '0ms'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#1c180d] group-hover:text-blue-600 transition-colors">
                            {data.totalUsers}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[#9e8747] text-sm text-center">Active users</div>
                  </div>
                    </CardContent>
                  </Card>

              {/* Assignments Card */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                    <BookOpen className="h-4 w-4 text-green-500" /> Assignments
                      </CardTitle>
                    </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e9e2ce"
                          strokeWidth="8"
                          fill="transparent"
                          className="opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#greenGradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${animateProgress ? Math.min((data.totalAssignments / 200) * 251.2, 251.2) : 0} 251.2`}
                          strokeDashoffset="0"
                          className="transition-all duration-1500 ease-out"
                          style={{
                            transitionDelay: '200ms'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#1c180d] group-hover:text-green-600 transition-colors">
                            {data.totalAssignments}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[#9e8747] text-sm text-center">Assignments uploaded</div>
                  </div>
                    </CardContent>
                  </Card>

              {/* Success Rate Card */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                    <BarChart2 className="h-4 w-4 text-purple-500" /> Success Rate
                      </CardTitle>
                    </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e9e2ce"
                          strokeWidth="8"
                          fill="transparent"
                          className="opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#purpleGradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${animateProgress ? Math.min((data.totalAssignments > 0 ? (data.solvedAssignments / data.totalAssignments) * 100 : 0) / 100 * 251.2, 251.2) : 0} 251.2`}
                          strokeDashoffset="0"
                          className="transition-all duration-1500 ease-out"
                          style={{
                            transitionDelay: '400ms'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#1c180d] group-hover:text-purple-600 transition-colors">
                        {data.totalAssignments > 0 ? Math.round((data.solvedAssignments / data.totalAssignments) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[#9e8747] text-sm text-center">Assignments solved</div>
                  </div>
                    </CardContent>
                  </Card>

              {/* Ratings Card */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group analytics-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                    <PieChart className="h-4 w-4 text-pink-500" /> Ratings
                      </CardTitle>
                    </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#e9e2ce"
                          strokeWidth="8"
                          fill="transparent"
                          className="opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#pinkGradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${animateProgress ? Math.min((data.averageRating / 5) * 251.2, 251.2) : 0} 251.2`}
                          strokeDashoffset="0"
                          className="transition-all duration-1500 ease-out"
                          style={{
                            transitionDelay: '600ms'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#1c180d] group-hover:text-pink-600 transition-colors">
                            {data.averageRating.toFixed(1)}★
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[#9e8747] text-sm text-center">Average rating</div>
                  </div>
                    </CardContent>
                  </Card>
                </div>

            {/* SVG Gradients for the circular progress bars */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#db2777" />
                </linearGradient>
              </defs>
            </svg>
              </div>
              <hr className="my-6 border-[#e9e2ce]" />

              {/* Activity & Top Users Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#fac638]" /> Activity & Top Users
                </h2>
            <p className="text-[#9e8747] mb-4 text-sm">See who's leading and how active the community is.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Assignments uploaded per day (Line Chart) */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 chart-fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <BarChart2 className="h-5 w-5 text-[#fac638]" /> Assignments Uploaded (Last 14 Days)
                      </CardTitle>
                      <div className="text-xs text-[#9e8747] mt-1">Track assignment upload activity over time.</div>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.uploadsPerDay.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                      <div className="w-16 h-16 bg-[#f4f0e6] rounded-full flex items-center justify-center mb-3">
                        <BarChart2 className="w-8 h-8 text-[#e9e2ce]" />
                      </div>
                      No uploads yet
                    </div>
                      ) : (
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#e9e2ce] scrollbar-track-transparent">
                          <div style={{ minWidth: 400, width: '100%', height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={data.uploadsPerDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fac638" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#fac638" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9e2ce" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={12} stroke="#9e8747" />
                            <YAxis allowDecimals={false} fontSize={12} stroke="#9e8747" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e9e2ce',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke="#fac638" 
                              strokeWidth={3} 
                              dot={{ r: 6, fill: '#fac638', stroke: '#fff', strokeWidth: 2 }} 
                              isAnimationActive={true} 
                              fillOpacity={1} 
                              fill="url(#colorUpload)" 
                            />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

              {/* Top Users (Enhanced Animated Bars) */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 chart-fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <Users className="h-5 w-5 text-blue-500" /> Top Users
                      </CardTitle>
                      <div className="text-xs text-[#9e8747] mt-1">Highest scoring users this week.</div>
                    </CardHeader>
                    <CardContent>
                      {data.topUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                      <div className="w-16 h-16 bg-[#f4f0e6] rounded-full flex items-center justify-center mb-3">
                        <Users className="w-8 h-8 text-[#e9e2ce]" />
                      </div>
                      No users yet
                    </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {data.topUsers.map((user: any, idx: number) => {
                            const initials = user.username ? user.username.slice(0, 2).toUpperCase() : "U";
                            const avatarUrl = user.avatarUrl || "/placeholder-user.jpg";
                        const maxPoints = data.topUsers[0]?.points || 1;
                        const percentage = (user.points / maxPoints) * 100;
                        
                        // Special styling for top 3 positions
                        const getRankStyle = (position: number) => {
                          switch (position) {
                            case 0: return "from-yellow-400 to-yellow-600 text-yellow-900";
                            case 1: return "from-gray-300 to-gray-500 text-gray-700";
                            case 2: return "from-amber-600 to-amber-800 text-amber-900";
                            default: return "from-[#fac638] to-[#e6b332] text-[#1c180d]";
                          }
                        };
                        
                            return (
                              <div
                                key={user.username}
                            className="group relative p-6 rounded-2xl bg-gradient-to-br from-white to-[#faf7ee] hover:from-[#f4eedd] hover:to-[#e9e2ce] transition-all duration-500 border-2 border-[#e9e2ce]/30 hover:border-[#fac638]/50 hover:shadow-xl hover:-translate-y-1"
                            style={{
                              animationDelay: `${idx * 100}ms`
                            }}
                          >
                            {/* Enhanced Rank Badge */}
                            <div className={`absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br ${getRankStyle(idx)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xl border-4 border-white transform rotate-12 group-hover:rotate-0 transition-all duration-300`}>
                              #{idx + 1}
                            </div>
                            
                            {/* Achievement Icon for top 3 */}
                            {idx < 3 && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#fac638] to-[#e6b332] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                {idx === 0 && <span className="text-yellow-600 text-lg">👑</span>}
                                {idx === 1 && <span className="text-gray-600 text-lg">🥈</span>}
                                {idx === 2 && <span className="text-amber-600 text-lg">🥉</span>}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-6">
                              {/* Enhanced Avatar or Initials */}
                              <div className="relative">
                                {user.avatarUrl ? (
                                  <div className="relative">
                                  <img
                                    src={avatarUrl}
                                    alt={user.username}
                                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {/* Status indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <div
                                      className="w-16 h-16 flex items-center justify-center rounded-full text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-white"
                                      style={{ 
                                        background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})`,
                                        boxShadow: `0 8px 25px ${COLORS[idx % COLORS.length]}40`
                                      }}
                                  >
                                    {initials}
                                    </div>
                                    {/* Status indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Enhanced User Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-[#1c180d] text-xl group-hover:text-[#fac638] transition-colors duration-300 mb-1">
                                  {user.username}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="text-lg font-semibold text-[#fac638]">
                                    {user.points} points
                                  </div>
                                  {idx < 3 && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#fac638] to-[#e6b332] text-white">
                                      Top {idx + 1}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-[#9e8747]">
                                  Rank #{idx + 1} in leaderboard
                                </div>
                              </div>
                              
                              {/* Enhanced Animated Progress Bar */}
                              <div className="flex-1 max-w-40">
                                <div className="relative h-4 bg-[#e9e2ce] rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className="h-4 rounded-full transition-all duration-1000 ease-out group-hover:opacity-90 relative overflow-hidden"
                                    style={{
                                      width: `${Math.max(10, percentage)}%`,
                                      background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]} 50%, #fac638)`,
                                      boxShadow: `0 0 10px ${COLORS[idx % COLORS.length]}60`
                                    }}
                                  >
                                    {/* Enhanced shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-xs text-[#9e8747]">Progress</div>
                                  <div className="text-sm font-semibold text-[#1c180d]">
                                    {percentage.toFixed(0)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#fac638]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <hr className="my-6 border-[#e9e2ce]" />

              {/* Ratings Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-pink-500" /> Ratings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Ratings Distribution (Pie Chart) */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 chart-fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <PieChart className="h-5 w-5 text-pink-500" /> Ratings Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.ratingsDist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                      <div className="w-16 h-16 bg-[#f4f0e6] rounded-full flex items-center justify-center mb-3">
                        <PieChart className="w-8 h-8 text-[#e9e2ce]" />
                      </div>
                      No ratings yet
                    </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RPieChart>
                            <Pie
                              data={data.ratingsDist}
                              dataKey="count"
                              nameKey="rating"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ rating, percent }) => `${rating}★ (${(percent * 100).toFixed(0)}%)`}
                            >
                              {data.ratingsDist.map((entry: any, idx: number) => (
                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e9e2ce',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }}
                        />
                          </RPieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

              {/* Enhanced Ratings Summary */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 chart-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                    <Star className="h-5 w-5 text-yellow-500" /> Rating Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.ratingsDist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                      <div className="w-16 h-16 bg-[#f4f0e6] rounded-full flex items-center justify-center mb-3">
                        <Star className="w-8 h-8 text-[#e9e2ce]" />
                      </div>
                      No ratings yet
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Average Rating Display */}
                      <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="text-4xl font-bold text-yellow-600 mb-2">
                          {data.averageRating.toFixed(1)}
                        </div>
                        <div className="flex justify-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 ${
                                i < Math.floor(data.averageRating)
                                  ? 'text-yellow-500 fill-current'
                                  : i < data.averageRating
                                  ? 'text-yellow-500 fill-current opacity-50'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-yellow-700 font-medium">Average Rating</div>
                      </div>

                      {/* Rating Breakdown */}
                      <div className="space-y-3">
                        {data.ratingsDist.map((rating: any, idx: number) => (
                          <div key={rating.rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 min-w-[60px]">
                              <span className="text-sm font-medium text-[#1c180d]">{rating.rating}★</span>
                            </div>
                            <div className="flex-1 bg-[#f4f0e6] rounded-full h-3 overflow-hidden">
                              <div
                                className="h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(rating.count / Math.max(...data.ratingsDist.map((r: any) => r.count))) * 100}%`,
                                  background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}, ${COLORS[(idx + 1) % COLORS.length]})`,
                                }}
                              />
                            </div>
                            <div className="text-sm font-medium text-[#9e8747] min-w-[40px] text-right">
                              {rating.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <hr className="my-6 border-[#e9e2ce]" />

              {/* Advanced Analytics Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-[#fac638]" /> Advanced Analytics
                </h2>
                <p className="text-[#9e8747] mb-4 text-sm">Deeper insights into user growth and leaderboard performance.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* User Growth Over Time (Line Chart) */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 chart-fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <TrendingUp className="h-5 w-5 text-[#fac638]" /> User Growth Over Time
                      </CardTitle>
                      <div className="text-xs text-[#9e8747] mt-1">Cumulative user signups over time.</div>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.userGrowth.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                      <div className="w-16 h-16 bg-[#f4f0e6] rounded-full flex items-center justify-center mb-3">
                        <TrendingUp className="w-8 h-8 text-[#e9e2ce]" />
                      </div>
                          No user signups yet
                        </div>
                      ) : (
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#e9e2ce] scrollbar-track-transparent">
                          <div style={{ minWidth: 400, width: '100%', height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={data.userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorUserGrowth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fac638" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#fac638" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9e2ce" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={12} stroke="#9e8747" />
                            <YAxis allowDecimals={false} fontSize={12} stroke="#9e8747" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e9e2ce',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#fac638" strokeWidth={3} dot={{ r: 6, fill: '#fac638', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={true} fillOpacity={1} fill="url(#colorUserGrowth)" />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Assignment Categories (Pie Chart) */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 chart-fade-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <PieChart className="h-5 w-5 text-green-500" /> Assignment Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.assignmentCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                      <div className="w-16 h-16 bg-[#f4f0e6] rounded-full flex items-center justify-center mb-3">
                        <BookOpen className="w-8 h-8 text-[#e9e2ce]" />
                      </div>
                          No assignment categories yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RPieChart>
                            <Pie
                              data={data.assignmentCategories}
                              dataKey="count"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {data.assignmentCategories.map((entry: any, idx: number) => (
                                <Cell key={`cat-cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e9e2ce',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                          }}
                        />
                          </RPieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

          {/* Performance Metrics Section */}
              <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-[#fac638]" /> Performance Metrics
            </h2>
            <p className="text-[#9e8747] mb-4 text-sm">Key performance indicators and user engagement metrics.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Average Submission Speed */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                    <BarChart2 className="h-4 w-4 text-purple-500" /> Avg. Submission Speed
                      </CardTitle>
                    </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="#e9e2ce"
                          strokeWidth="6"
                          fill="transparent"
                          className="opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="url(#purpleGradient)"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${animateProgress ? Math.min((data.avgSubmissionSpeed / 24) * 219.8, 219.8) : 0} 219.8`}
                          strokeDashoffset="0"
                          className="transition-all duration-1500 ease-out"
                          style={{
                            transitionDelay: '800ms'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold text-[#1c180d] group-hover:text-purple-600 transition-colors">
                            {data.avgSubmissionSpeed > 0 ? `${data.avgSubmissionSpeed.toFixed(1)}` : '--'}
                          </div>
                          <div className="text-xs text-[#9e8747]">hrs</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[#9e8747] text-sm">Avg. time to first solution</div>
                    {data.avgSubmissionSpeed === 0 && (
                      <div className="text-xs text-[#e57373] mt-2">No submissions yet</div>
                    )}
                  </div>
                    </CardContent>
                  </Card>

                  {/* Active Users 7d */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                    <Users className="h-4 w-4 text-blue-500" /> Active (7d)
                      </CardTitle>
                    </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="#e9e2ce"
                          strokeWidth="6"
                          fill="transparent"
                          className="opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="url(#blueGradient)"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${animateProgress ? Math.min((data.activeUsers7d / Math.max(data.totalUsers, 1)) * 219.8, 219.8) : 0} 219.8`}
                          strokeDashoffset="0"
                          className="transition-all duration-1500 ease-out"
                          style={{
                            transitionDelay: '1000ms'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold text-[#1c180d] group-hover:text-blue-600 transition-colors">
                            {data.activeUsers7d}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[#9e8747] text-sm">Users active in last 7 days</div>
                    {data.activeUsers7d === 0 && (
                      <div className="text-xs text-[#e57373] mt-2">No active users</div>
                    )}
                  </div>
                    </CardContent>
                  </Card>

                  {/* Active Users 30d */}
              <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 group hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1c180d] text-sm">
                    <Users className="h-4 w-4 text-blue-500" /> Active (30d)
                      </CardTitle>
                    </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="#e9e2ce"
                          strokeWidth="6"
                          fill="transparent"
                          className="opacity-30"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="url(#blueGradient)"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={`${animateProgress ? Math.min((data.activeUsers30d / Math.max(data.totalUsers, 1)) * 219.8, 219.8) : 0} 219.8`}
                          strokeDashoffset="0"
                          className="transition-all duration-1500 ease-out"
                          style={{
                            transitionDelay: '1200ms'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold text-[#1c180d] group-hover:text-blue-600 transition-colors">
                            {data.activeUsers30d}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-[#9e8747]">Users active in last 30 days</div>
                    {data.activeUsers30d === 0 && (
                      <div className="text-xs text-[#e57373] mt-2">No active users</div>
                    )}
                  </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <hr className="my-6 border-[#e9e2ce]" />

              {/* Leaderboard Trends (Multi-Line Chart) */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#fac638]" /> Leaderboard Trends
                </h2>
            <p className="text-[#9e8747] mb-4 text-sm">How top users' points have changed over time.</p>
                <div>
                  {data.leaderboardTrends.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm py-16">
                  <div className="w-16 h-16 bg-[#f4f0e6] rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-[#e9e2ce]" />
                  </div>
                      No leaderboard trends yet
                    </div>
                  ) : (
                <Card className="bg-white/90 border-[#e9e2ce] hover:shadow-lg transition-all duration-300 chart-fade-in">
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#e9e2ce] scrollbar-track-transparent">
                      <div style={{ minWidth: 400, width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={mergeLeaderboardTrends(data.leaderboardTrends)}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9e2ce" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={12} stroke="#9e8747" />
                            <YAxis allowDecimals={false} fontSize={12} stroke="#9e8747" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e9e2ce',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                            />
                            {data.leaderboardTrends.map((user: any, idx: number) => (
                              <Line
                                key={user.username}
                                type="monotone"
                                dataKey={user.username}
                                stroke={COLORS[idx % COLORS.length]}
                                strokeWidth={3}
                                dot={{ r: 6, fill: COLORS[idx % COLORS.length], stroke: '#fff', strokeWidth: 2 }}
                                isAnimationActive={true}
                                animationDuration={1500}
                                animationBegin={idx * 200}
                              />
                            ))}
                            <Legend
                              verticalAlign="top"
                              align="right"
                              iconType="circle"
                              payload={data.leaderboardTrends.map((user: any, idx: number) => ({
                                value: (
                                  <span className="flex items-center gap-2">
                                    <span style={{
                                      display: 'inline-block',
                                      width: 18,
                                      height: 18,
                                      borderRadius: '50%',
                                      background: COLORS[idx % COLORS.length],
                                      color: '#fff',
                                      fontWeight: 'bold',
                                      fontSize: 12,
                                      textAlign: 'center',
                                      lineHeight: '18px',
                                    }}>{user.username.slice(0,2).toUpperCase()}</span>
                                    <span className="ml-1">{user.username}</span>
                                  </span>
                                ),
                                type: 'circle',
                                id: user.username,
                                color: COLORS[idx % COLORS.length],
                              }))}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  )}
                </div>
              </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to merge leaderboard trends for recharts
function mergeLeaderboardTrends(trends: any[]) {
  // trends: [{ username, data: [{date, points}] }]
  // Output: [{ date, [username1]: points, [username2]: points, ... }]
  const dateSet = new Set<string>();
  trends.forEach((user: any) => {
    user.data.forEach((d: any) => dateSet.add(d.date));
  });
  const dates = Array.from(dateSet).sort();
  return dates.map(date => {
    const entry: any = { date };
    trends.forEach((user: any) => {
      const found = user.data.find((d: any) => d.date === date);
      entry[user.username] = found ? found.points : null;
    });
    return entry;
  });
} 
