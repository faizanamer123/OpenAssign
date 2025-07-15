"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart2, PieChart, Users, BookOpen, Info } from "lucide-react";
import dynamic from "next/dynamic";
import { getAnalytics } from "@/utils/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RPieChart, Pie, Cell, Legend
} from "recharts";

const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });

const COLORS = ["#fac638", "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const d = await getAnalytics();
      setData(d);
      setError("");
      setLastUpdated(new Date());
    } catch (e: any) {
      setError("Failed to load analytics");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    if (refreshTimer) clearInterval(refreshTimer);
    const timer = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds
    setRefreshTimer(timer);
    return () => clearInterval(timer);
  }, []);

  function timeAgo(date: Date | null) {
    if (!date) return "-";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
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
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#fac638]"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <>
              {/* Overview Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-[#fac638]" /> Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <Users className="h-5 w-5 text-blue-500" /> Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#1c180d]">{data.totalUsers}</div>
                      <div className="text-[#9e8747]">Active users</div>
                      {data.totalUsers === 0 && <div className="text-xs text-[#e57373] mt-2">No users yet</div>}
                    </CardContent>
                  </Card>
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <BookOpen className="h-5 w-5 text-green-500" /> Assignments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#1c180d]">{data.totalAssignments}</div>
                      <div className="text-[#9e8747]">Assignments uploaded</div>
                      {data.totalAssignments === 0 && <div className="text-xs text-[#e57373] mt-2">No assignments yet</div>}
                    </CardContent>
                  </Card>
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <BarChart2 className="h-5 w-5 text-purple-500" /> Success Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#1c180d]">
                        {data.totalAssignments > 0 ? Math.round((data.solvedAssignments / data.totalAssignments) * 100) : 0}%
                      </div>
                      <div className="text-[#9e8747]">Assignments solved</div>
                      {data.totalAssignments === 0 && <div className="text-xs text-[#e57373] mt-2">No submissions yet</div>}
                    </CardContent>
                  </Card>
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <PieChart className="h-5 w-5 text-pink-500" /> Ratings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#1c180d]">{data.averageRating}★</div>
                      <div className="text-[#9e8747]">Average rating</div>
                      {(!data.ratingsDist || data.ratingsDist.length === 0) && <div className="text-xs text-[#e57373] mt-2">No ratings yet</div>}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <hr className="my-6 border-[#e9e2ce]" />

              {/* Activity & Top Users Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1c180d] mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#fac638]" /> Activity & Top Users
                </h2>
                <p className="text-[#9e8747] mb-4 text-sm">See who’s leading and how active the community is.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Assignments uploaded per day (Line Chart) */}
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <BarChart2 className="h-5 w-5 text-[#fac638]" /> Assignments Uploaded (Last 14 Days)
                      </CardTitle>
                      <div className="text-xs text-[#9e8747] mt-1">Track assignment upload activity over time.</div>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.uploadsPerDay.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">No uploads yet</div>
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
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis allowDecimals={false} fontSize={12} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#fac638" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={true} fillOpacity={1} fill="url(#colorUpload)" />
                                {/* No area fill for this chart, just line */}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Top Users (Bar Chart) */}
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <Users className="h-5 w-5 text-blue-500" /> Top Users
                      </CardTitle>
                      <div className="text-xs text-[#9e8747] mt-1">Highest scoring users this week.</div>
                    </CardHeader>
                    <CardContent>
                      {data.topUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">No users yet</div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {data.topUsers.map((user: any, idx: number) => {
                            const initials = user.username ? user.username.slice(0, 2).toUpperCase() : "U";
                            const avatarUrl = user.avatarUrl || "/placeholder-user.jpg";
                            return (
                              <div
                                key={user.username}
                                className="flex items-center gap-3 p-2 rounded-lg bg-[#faf7ee] hover:bg-[#f4eedd] transition group"
                              >
                                {/* Avatar or Initials */}
                                {user.avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-cover border border-[#e9e2ce]"
                                  />
                                ) : (
                                  <span
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg"
                                    style={{ background: COLORS[idx % COLORS.length] }}
                                  >
                                    {initials}
                                  </span>
                                )}
                                {/* Username */}
                                <span className="font-medium text-[#1c180d] w-28 truncate">{user.username}</span>
                                {/* Bar */}
                                <div className="flex-1 mx-2 relative h-5 bg-[#e9e2ce] rounded-full overflow-hidden">
                                  <div
                                    className="h-5 rounded-full transition-all duration-300 group-hover:opacity-90"
                                    style={{
                                      width: `${Math.max(10, (user.points / (data.topUsers[0]?.points || 1)) * 100)}%`,
                                      background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}, #fac638 80%)`,
                                    }}
                                  ></div>
                                </div>
                                {/* Points badge */}
                                <span className="ml-2 px-3 py-1 rounded-full bg-[#fac638] text-[#1c180d] font-semibold text-sm shadow-sm border border-[#e9e2ce] group-hover:bg-[#ffe9a7] transition">
                                  {user.points} pts
                                </span>
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
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <PieChart className="h-5 w-5 text-pink-500" /> Ratings Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.ratingsDist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">No ratings yet</div>
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
                            <Tooltip />
                          </RPieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                  {/* Placeholder for future charts/visuals */}
                  <Card className="bg-white/90 border-[#e9e2ce] flex items-center justify-center">
                    <CardContent className="flex flex-col items-center justify-center h-full text-[#9e8747]">
                      <p>More analytics and charts coming soon!</p>
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
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <TrendingUp className="h-5 w-5 text-[#fac638]" /> User Growth Over Time
                      </CardTitle>
                      <div className="text-xs text-[#9e8747] mt-1">Cumulative user signups over time.</div>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.userGrowth.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                          <img src="/placeholder.svg" alt="No data" className="w-20 h-20 mb-2" />
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
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} />
                                <YAxis allowDecimals={false} fontSize={12} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#fac638" strokeWidth={3} dot={{ r: 6 }} isAnimationActive={true} fillOpacity={1} fill="url(#colorUserGrowth)" />
                                {/* Area fill for user growth */}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Assignment Categories (Pie Chart) */}
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <PieChart className="h-5 w-5 text-green-500" /> Assignment Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ height: 260 }}>
                      {data.assignmentCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                          <img src="/placeholder.svg" alt="No data" className="w-20 h-20 mb-2" />
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
                            <Tooltip />
                          </RPieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Average Submission Speed */}
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <BarChart2 className="h-5 w-5 text-purple-500" /> Avg. Submission Speed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#1c180d]">
                        {data.avgSubmissionSpeed > 0 ? `${data.avgSubmissionSpeed.toFixed(1)} hrs` : '--'}
                      </div>
                      <div className="text-[#9e8747]">Avg. time to first solution</div>
                      {data.avgSubmissionSpeed === 0 && <div className="text-xs text-[#e57373] mt-2">No submissions yet</div>}
                    </CardContent>
                  </Card>
                  {/* Active Users 7d */}
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <Users className="h-5 w-5 text-blue-500" /> Active (7d)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#1c180d]">{data.activeUsers7d}</div>
                      <div className="text-[#9e8747]">Users active in last 7 days</div>
                      {data.activeUsers7d === 0 && <div className="text-xs text-[#e57373] mt-2">No active users</div>}
                    </CardContent>
                  </Card>
                  {/* Active Users 30d */}
                  <Card className="bg-white/90 border-[#e9e2ce]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1c180d]">
                        <Users className="h-5 w-5 text-blue-500" /> Active (30d)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#1c180d]">{data.activeUsers30d}</div>
                      <div className="text-[#9e8747]">Users active in last 30 days</div>
                      {data.activeUsers30d === 0 && <div className="text-xs text-[#e57373] mt-2">No active users</div>}
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
                <p className="text-[#9e8747] mb-4 text-sm">How top users’ points have changed over time.</p>
                <div>
                  {data.leaderboardTrends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#e57373] text-sm">
                      <img src="/placeholder.svg" alt="No data" className="w-20 h-20 mb-2" />
                      No leaderboard trends yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#e9e2ce] scrollbar-track-transparent">
                      <div style={{ minWidth: 400, width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={mergeLeaderboardTrends(data.leaderboardTrends)}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis allowDecimals={false} fontSize={12} />
                            <Tooltip />
                            {data.leaderboardTrends.map((user: any, idx: number) => (
                              <Line
                                key={user.username}
                                type="monotone"
                                dataKey={user.username}
                                stroke={COLORS[idx % COLORS.length]}
                                strokeWidth={3}
                                dot={{ r: 6 }}
                                isAnimationActive={true}
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
                  )}
                </div>
              </div>
            </>
          )}
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