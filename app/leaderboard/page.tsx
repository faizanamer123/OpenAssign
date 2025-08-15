"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Star, Award, TrendingUp } from "lucide-react"
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className='h-16' /> });
import { useAuth } from "@/context/AuthContext"
import { getLeaderboard } from "@/utils/api"

interface LeaderboardUser {
  id: string
  username: string
  points: number
  averageRating: number
  totalRatings: number
  assignmentsSolved: number
  rank: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"points" | "rating">("points")

  useEffect(() => {
    loadLeaderboard()
  }, [sortBy])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboard(sortBy)
      setLeaderboard(data)
    } catch (error) {
      setLeaderboard([])
      console.error("Failed to load leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Logo className="opacity-100" logoSize={60} showText={false} />
      case 2:
        return <Logo className="opacity-80" logoSize={60} showText={false} />
      case 3:
        return <Logo className="opacity-60" logoSize={60} showText={false} />
      default:
        return <span className="text-lg font-bold text-[#9e8747]">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800"
      case 2:
        return "bg-gray-100 text-gray-800"
      case 3:
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (!user) return null

  // Find the current user's stats from the leaderboard
  const currentUserStats = leaderboard.find((u) => u.id === user.id);

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1c180d] mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-[#fac638] inline-block align-middle" aria-label="Leaderboard" />
              Leaderboard
            </h1>
            <p className="text-[#9e8747]">Top contributors in our anonymous assignment solving community</p>
          </div>

          {/* Sort Options */}
          <div className="flex justify-center gap-2 mb-6 sticky top-0 z-20 bg-[#fcfbf8] py-2 shadow-sm rounded-b-xl">
            <button
              onClick={() => setSortBy("points")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-colors shadow-sm border border-[#e9e2ce] ${
                sortBy === "points"
                  ? "bg-[#fac638] text-[#1c180d] border-[#fac638]"
                  : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
              }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-1 sm:mr-2" />
              Most Points
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-colors shadow-sm border border-[#e9e2ce] ${
                sortBy === "rating"
                  ? "bg-[#fac638] text-[#1c180d] border-[#fac638]"
                  : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
              }`}
            >
              <Star className="inline h-4 w-4 mr-1 sm:mr-2" />
              Top Rated
            </button>
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#9e8747]">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9e8747]">
                No data available yet. Start solving assignments to appear on the leaderboard!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((leaderUser, index) => (
                <Card
                  key={leaderUser.id}
                  className={`border-[#e9e2ce] transition-all rounded-2xl shadow-md ${
                    leaderUser.id === user.id
                      ? "bg-[#fac638]/10 border-[#fac638] ring-2 ring-[#fac638]"
                      : "bg-[#fcfbf8] hover:shadow-lg"
                  }`}
                >
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">{getRankIcon(leaderUser.rank)}</div>
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-[#f4f0e6]">
                          <AvatarFallback className="bg-[#f4f0e6] text-[#1c180d] font-semibold">
                            {leaderUser.username?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                            <h3 className="font-semibold text-[#1c180d] text-base sm:text-lg">{leaderUser.username || "Anonymous User"}</h3>
                            {leaderUser.id === user.id && <Badge className="bg-[#fac638] text-[#1c180d] text-xs sm:text-sm">You</Badge>}
                            <Badge className={getRankBadgeColor(leaderUser.rank) + " text-xs sm:text-sm"}>Rank #{leaderUser.rank}</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-[#9e8747]">{leaderUser.assignmentsSolved || 0} assignments solved</p>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="text-center min-w-[70px]">
                          <p className="text-xl sm:text-2xl font-bold text-[#1c180d]">{Number.isFinite(Number(leaderUser.points)) ? Number(leaderUser.points) : 0}</p>
                          <p className="text-xs text-[#9e8747]">Points</p>
                        </div>
                        <div className="text-center min-w-[70px]">
                          <div className="flex items-center gap-1 justify-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-base sm:text-lg font-semibold text-[#1c180d]">{
                              Number.isFinite(Number(leaderUser.averageRating))
                                ? Number(leaderUser.averageRating).toFixed(1)
                                : "0.0"
                            }</span>
                          </div>
                          <p className="text-xs text-[#9e8747]">({Number.isFinite(Number(leaderUser.totalRatings)) ? Number(leaderUser.totalRatings) : 0} ratings)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {/* Your Stats */}
          {user && (
            <Card className="border-[#e9e2ce] bg-[#fcfbf8] mt-8">
              <CardHeader>
                <CardTitle className="text-[#1c180d]">Your Statistics</CardTitle>
                <CardDescription className="text-[#9e8747]">
                  Keep solving assignments to improve your ranking!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {/* Add a border and background for each stat on mobile for clarity */}
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">{currentUserStats?.points || 0}</p>
                    <p className="text-sm text-[#9e8747]">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">
                      {currentUserStats?.averageRating?.toFixed(1) || "0.0"}
                    </p>
                    <p className="text-sm text-[#9e8747]">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">{currentUserStats?.totalRatings || 0}</p>
                    <p className="text-sm text-[#9e8747]">Total Ratings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1c180d]">
                      {currentUserStats?.rank || "Unranked"}
                    </p>
                    <p className="text-sm text-[#9e8747]">Your Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Trophy, Star, Crown, Medal, Award, TrendingUp } from "lucide-react";
// import dynamic from "next/dynamic";
// const Header = dynamic(() => import("@/components/Header"), { ssr: false, loading: () => <div className="h-16" /> });
// import { useAuth } from "@/context/AuthContext";
// import { getLeaderboard } from "@/utils/api";

// interface LeaderboardUser {
//   id: string;
//   username: string;
//   points: number;
//   averageRating: number;
//   totalRatings: number;
//   assignmentsSolved: number;
//   rank: number;
// }

// export default function LeaderboardPage() {
//   const { user } = useAuth();
//   const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState<"points" | "rating">("points");

//   useEffect(() => {
//     loadLeaderboard();
//   }, [sortBy]);

//   const loadLeaderboard = async () => {
//     setLoading(true);
//     try {
//       const data = await getLeaderboard(sortBy);
//       setLeaderboard(data);
//     } catch (error) {
//       setLeaderboard([]);
//       console.error("Failed to load leaderboard:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getRankIcon = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return <Crown className="w-6 h-6 text-[#fac638] pulse-glow" aria-label="1st Place" />;
//       case 2:
//         return <Medal className="w-6 h-6 text-gray-400" aria-label="2nd Place" />;
//       case 3:
//         return <Award className="w-6 h-6 text-amber-700" aria-label="3rd Place" />;
//       default:
//         return <span className="text-lg font-bold text-[#9e8747]">#{rank}</span>;
//     }
//   };

//   const getRankBadgeColor = (rank: number) => {
//     switch (rank) {
//       case 1:
//         return "bg-yellow-100 text-yellow-800";
//       case 2:
//         return "bg-gray-100 text-gray-800";
//       case 3:
//         return "bg-amber-100 text-amber-800";
//       default:
//         return "bg-blue-100 text-blue-800";
//     }
//   };

//   if (!user) return null;

//   const currentUserStats = leaderboard.find((u) => u.id === user.id);

//   return (
//     <div className="min-h-screen bg-[#fcfbf8]">
//       <Header />

//       <div className="px-4 py-8 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-4xl">
//           {/* Page Header */}
//           <div className="mb-8 text-center">
//             <h1 className="text-3xl font-bold text-[#1c180d] mb-2 flex items-center justify-center gap-2">
//               <Trophy className="w-8 h-8 text-[#fac638]" aria-label="Leaderboard" />
//               Leaderboard
//             </h1>
//             <p className="text-[#9e8747]">
//               Top contributors in our anonymous assignment solving community
//             </p>
//           </div>

//           {/* Sort Options */}
//           <div className="flex justify-center gap-2 mb-6 sticky top-0 z-20 bg-[#fcfbf8] py-2 shadow-sm rounded-b-xl">
//             <button
//               onClick={() => setSortBy("points")}
//               className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-colors shadow-sm border border-[#e9e2ce] ${
//                 sortBy === "points"
//                   ? "bg-[#fac638] text-[#1c180d] border-[#fac638]"
//                   : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
//               }`}
//             >
//               <TrendingUp className="inline h-4 w-4 mr-1 sm:mr-2" />
//               Most Points
//             </button>
//             <button
//               onClick={() => setSortBy("rating")}
//               className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-colors shadow-sm border border-[#e9e2ce] ${
//                 sortBy === "rating"
//                   ? "bg-[#fac638] text-[#1c180d] border-[#fac638]"
//                   : "bg-[#f4f0e6] text-[#1c180d] hover:bg-[#fac638]/20"
//               }`}
//             >
//               <Star className="inline h-4 w-4 mr-1 sm:mr-2" />
//               Top Rated
//             </button>
//           </div>

//           {/* Leaderboard */}
//           {loading ? (
//             <div className="text-center py-12">
//               <p className="text-[#9e8747]">Loading leaderboard...</p>
//             </div>
//           ) : leaderboard.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-[#9e8747]">
//                 No data available yet. Start solving assignments to appear on the leaderboard!
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {leaderboard.map((leaderUser) => (
//                 <Card
//                   key={leaderUser.id}
//                   className={`border-[#e9e2ce] transition-all rounded-2xl shadow-md ${
//                     leaderUser.id === user.id
//                       ? "bg-[#fac638]/10 border-[#fac638] ring-2 ring-[#fac638]"
//                       : "bg-[#fcfbf8] hover:shadow-lg"
//                   }`}
//                 >
//                   <CardContent className="p-3 sm:p-6">
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
//                       <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
//                         <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
//                           {getRankIcon(leaderUser.rank)}
//                         </div>
//                         <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-[#f4f0e6]">
//                           <AvatarFallback className="bg-[#f4f0e6] text-[#1c180d] font-semibold">
//                             {leaderUser.username?.slice(0, 2).toUpperCase() || "??"}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="text-left">
//                           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
//                             <h3 className="font-semibold text-[#1c180d] text-base sm:text-lg">
//                               {leaderUser.username || "Anonymous User"}
//                             </h3>
//                             {leaderUser.id === user.id && (
//                               <Badge className="bg-[#fac638] text-[#1c180d] text-xs sm:text-sm">
//                                 You
//                               </Badge>
//                             )}
//                             <Badge
//                               className={`${getRankBadgeColor(leaderUser.rank)} text-xs sm:text-sm`}
//                             >
//                               Rank #{leaderUser.rank}
//                             </Badge>
//                           </div>
//                           <p className="text-xs sm:text-sm text-[#9e8747]">
//                             {leaderUser.assignmentsSolved || 0} assignments solved
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex flex-row justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
//                         <div className="text-center min-w-[70px]">
//                           <p className="text-xl sm:text-2xl font-bold text-[#1c180d]">
//                             {Number.isFinite(Number(leaderUser.points))
//                               ? Number(leaderUser.points)
//                               : 0}
//                           </p>
//                           <p className="text-xs text-[#9e8747]">Points</p>
//                         </div>
//                         <div className="text-center min-w-[70px]">
//                           <div className="flex items-center gap-1 justify-center">
//                             <Star className="h-4 w-4 text-yellow-500 fill-current" />
//                             <span className="text-base sm:text-lg font-semibold text-[#1c180d]">
//                               {Number.isFinite(Number(leaderUser.averageRating))
//                                 ? Number(leaderUser.averageRating).toFixed(1)
//                                 : "0.0"}
//                             </span>
//                           </div>
//                           <p className="text-xs text-[#9e8747]">
//                             ({Number.isFinite(Number(leaderUser.totalRatings))
//                               ? Number(leaderUser.totalRatings)
//                               : 0}{" "}
//                             ratings)
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}

//           {/* Your Stats */}
//           {user && (
//             <Card className="border-[#e9e2ce] bg-[#fcfbf8] mt-8">
//               <CardHeader>
//                 <CardTitle className="text-[#1c180d]">Your Statistics</CardTitle>
//                 <CardDescription className="text-[#9e8747]">
//                   Keep solving assignments to improve your ranking!
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
//                   <div>
//                     <p className="text-2xl font-bold text-[#1c180d]">
//                       {currentUserStats?.points || 0}
//                     </p>
//                     <p className="text-sm text-[#9e8747]">Points</p>
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold text-[#1c180d]">
//                       {currentUserStats?.averageRating?.toFixed(1) || "0.0"}
//                     </p>
//                     <p className="text-sm text-[#9e8747]">Avg Rating</p>
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold text-[#1c180d]">
//                       {currentUserStats?.totalRatings || 0}
//                     </p>
//                     <p className="text-sm text-[#9e8747]">Total Ratings</p>
//                   </div>
//                   <div>
//                     <p className="text-2xl font-bold text-[#1c180d]">
//                       {currentUserStats?.rank || "Unranked"}
//                     </p>
//                     <p className="text-sm text-[#9e8747]">Your Rank</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
