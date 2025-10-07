"use client"

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useAuth } from "../contexts/AuthContext"
import {
  Search,
  LayoutDashboard,
  Users,
  ChevronDown,
  Settings,
  LogOut,
  Trophy,
  Cloud,
  Award,
  Star,
  Timer,
  Calendar,
} from "lucide-react"

const topPlayers = [
  {
    name: "Priya Sharma",
    avatar: "/gaming-avatar-1.png",
    rank: "Cloud Pro",
    labsCompleted: "45",
    badgesEarned: "28",
    completionRate: "93%",
    trophy: "gold",
  },
  {
    name: "Rahul Verma",
    avatar: "/gaming-avatar-2.png",
    rank: "Cloud Pro",
    labsCompleted: "42",
    badgesEarned: "26",
    completionRate: "91%",
    trophy: "silver",
  },
  {
    name: "Ananya Desai",
    avatar: "/gaming-avatar-3.png",
    rank: "Cloud Explorer",
    labsCompleted: "38",
    badgesEarned: "24",
    completionRate: "88%",
    trophy: "bronze",
  },
]

const leaderboardData = [
  {
    place: 4,
    name: "Arjun Patel",
    avatar: "/gaming-avatar-four.png",
    labsCompleted: "35",
    badgesEarned: "22",
    completionRate: "85%",
    rank: "Cloud Explorer",
  },
  {
    place: 5,
    name: "Sneha Kulkarni",
    avatar: "/gaming-avatar-five.png",
    labsCompleted: "32",
    badgesEarned: "20",
    completionRate: "82%",
    rank: "Cloud Explorer",
  },
  {
    place: 6,
    name: "Vikram Singh",
    avatar: "/gaming-avatar-6.png",
    labsCompleted: "28",
    badgesEarned: "18",
    completionRate: "75%",
    rank: "Cloud Explorer",
  },
  {
    place: 7,
    name: "Meera Joshi",
    avatar: "/gaming-avatar-7.jpg",
    labsCompleted: "25",
    badgesEarned: "16",
    completionRate: "71%",
    rank: "Cloud Beginner",
  },
  {
    place: 8,
    name: "Aditya Reddy",
    avatar: "/gaming-avatar-8.jpg",
    labsCompleted: "22",
    badgesEarned: "14",
    completionRate: "68%",
    rank: "Cloud Beginner",
  },
  {
    place: 9,
    name: "Kavya Nair",
    avatar: "/gaming-avatar-9.jpg",
    labsCompleted: "20",
    badgesEarned: "12",
    completionRate: "65%",
    rank: "Cloud Beginner",
  },
  {
    place: 10,
    name: "Rohan Gupta",
    avatar: "/gaming-avatar-10.jpg",
    labsCompleted: "18",
    badgesEarned: "11",
    completionRate: "62%",
    rank: "Cloud Beginner",
  },
  {
    place: 11,
    name: "Ishita Mehta",
    avatar: "/gaming-avatar-11.jpg",
    labsCompleted: "15",
    badgesEarned: "9",
    completionRate: "58%",
    rank: "Cloud Beginner",
  },
  {
    place: 12,
    name: "Karan Malhotra",
    avatar: "/gaming-avatar-12.jpg",
    labsCompleted: "12",
    badgesEarned: "7",
    completionRate: "54%",
    rank: "Cloud Beginner",
  },
]

const getRankIcon = (rank) => {
  if (rank === "Cloud Pro") return "☁️"
  if (rank === "Cloud Explorer") return "🌥️"
  return "🌩️"
}

const getRankColor = (rank) => {
  const colors = {
    "Cloud Pro": "text-[#4285F4]", // Google Blue
    "Cloud Explorer": "text-[#0F9D58]", // Google Green
    "Cloud Beginner": "text-[#F4B400]", // Google Yellow
  }
  return colors[rank] || "text-[#F4B400]"
}

const getRankBgColor = (rank) => {
  const colors = {
    "Cloud Pro": "bg-[#4285F4]/10 border border-[#4285F4]/20",
    "Cloud Explorer": "bg-[#0F9D58]/10 border border-[#0F9D58]/20",
    "Cloud Beginner": "bg-[#F4B400]/10 border border-[#F4B400]/20",
  }
  return colors[rank] || "bg-[#F4B400]/10 border border-[#F4B400]/20"
}

export function Leaderboard() {
  const { user, logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Google Cloud Study Jams Banner */}
        <div className="p-6 bg-gradient-to-r from-[#4285F4] to-[#0F9D58]">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="h-6 w-6" />
              <span className="font-semibold text-lg">Study Jams</span>
            </div>
            <div className="text-sm opacity-90">GDGoC VIT Pune</div>
            <div className="text-xs opacity-75 mt-1">Google Cloud Learning</div>
          </div>
        </div>
        
        {/* User Profile - Now shows Firebase user */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || "/user-profile-illustration.png"} />
              <AvatarFallback className="bg-[#4285F4] text-white text-sm">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </div>
              {user?.email && (
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search participants..." className="pl-9 bg-gray-50 border-gray-200 text-sm h-10 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 h-10 rounded-lg">
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-[#4285F4] hover:bg-[#4285F4]/10 h-10 rounded-lg bg-[#4285F4]/5">
            <Trophy className="mr-3 h-5 w-5" />
            Top Learners
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 h-10 rounded-lg">
            <Avatar className="mr-3 h-5 w-5">
              <AvatarImage src="/generic-club-logo.png" />
              <AvatarFallback className="bg-[#0F9D58] text-white text-xs">GDG</AvatarFallback>
            </Avatar>
            GDG VIT Pune
          </Button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-gray-100">
          <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 h-10 rounded-lg">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 h-10 rounded-lg"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#4285F4] via-[#DB4437] to-[#F4B400] flex items-center justify-center shadow-lg">
                  <Cloud className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      {/* Left bracket < - Blue bottom, Red top */}
                      <div className="relative text-3xl font-black overflow-hidden">
                        <span className="text-[#4285F4]">&lt;</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                          <span className="text-[#DB4437] text-3xl font-black">&lt;</span>
                        </div>
                      </div>
                      {/* Right bracket > - Green top, Yellow bottom */}
                      <div className="relative text-3xl font-black overflow-hidden">
                        <span className="text-[#F4B400]">&gt;</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                          <span className="text-[#0F9D58] text-3xl font-black">&gt;</span>
                        </div>
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">GDGoC VIT Pune Google Cloud StudyJams</h1>
                  </div>
                  <p className="text-sm text-gray-600">
                    Master Google Cloud Platform through hands-on labs and earn industry-recognized badges
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F4B400]/10 border border-[#F4B400]/20 rounded-full">
                  <Timer className="h-4 w-4 text-[#F4B400]" />
                  <span className="text-sm text-gray-700">
                    Event ends in: <span className="font-semibold text-[#F4B400]">2d 5h</span>
                  </span>
                </div>
                <Button className="h-10 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-lg px-6 shadow-md">
                  View My Progress
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 bg-gray-50">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
              <button className="pb-3 text-sm font-semibold border-b-2 border-[#4285F4] text-[#4285F4]">Rank</button>
              <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">Labs Completed</button>
              <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">Badges Earned</button>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm rounded-full bg-[#4285F4] text-white font-medium shadow-sm">24h</button>
              <button className="px-4 py-2 text-sm rounded-full text-gray-600 hover:bg-gray-100">7D</button>
              <button className="px-4 py-2 text-sm rounded-full text-gray-600 hover:bg-gray-100">30D</button>
              <button className="px-4 py-2 text-sm rounded-full text-gray-600 hover:bg-gray-100">All Time</button>
            </div>
          </div>

          {/* Top 3 Players */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {topPlayers.map((player, index) => {
              const borderColors = {
                gold: "border-t-[#F4B400] shadow-[#F4B400]/20",
                silver: "border-t-gray-400 shadow-gray-400/20",
                bronze: "border-t-[#DB4437] shadow-[#DB4437]/20"
              }
              return (
                <div key={index} className={`bg-white rounded-2xl p-6 border-t-4 ${borderColors[player.trophy]} shadow-lg hover:shadow-xl transition-shadow`}>
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                      <AvatarImage src={player.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-[#4285F4] to-[#0F9D58] text-white text-lg font-semibold">{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`text-3xl ${
                        player.trophy === "gold"
                          ? "text-[#F4B400]"
                          : player.trophy === "silver"
                            ? "text-gray-400"
                            : "text-[#DB4437]"
                      }`}
                    >
                      <Trophy className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{player.name}</h3>
                  <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-full ${getRankBgColor(player.rank)}`}>
                    <span className="text-lg">{getRankIcon(player.rank)}</span>
                    <span className={`text-sm font-semibold ${getRankColor(player.rank)}`}>{player.rank}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1 font-medium">Labs</div>
                      <div className="font-bold text-lg text-[#4285F4]">{player.labsCompleted}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1 font-medium">Badges</div>
                      <div className="font-bold text-lg text-[#0F9D58]">{player.badgesEarned}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-1 font-medium">Rate</div>
                      <div className="font-bold text-lg text-[#F4B400]">{player.completionRate}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Place</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Participant</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Labs Completed</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Badges Earned</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Completion Rate</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tier</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">{player.place}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shadow-sm">
                          <AvatarImage src={player.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-[#4285F4] to-[#0F9D58] text-white font-semibold">{player.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold text-gray-900">{player.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-[#4285F4]">{player.labsCompleted}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-[#0F9D58]">{player.badgesEarned}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-sm font-bold ${Number.parseInt(player.completionRate) >= 70 ? "text-[#0F9D58]" : "text-[#F4B400]"}`}
                      >
                        {player.completionRate}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-full w-fit ${getRankBgColor(player.rank)}`}
                      >
                        <span className="text-base">{getRankIcon(player.rank)}</span>
                        <span className={`text-sm font-semibold ${getRankColor(player.rank)}`}>{player.rank}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}