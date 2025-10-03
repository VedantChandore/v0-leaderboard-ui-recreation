"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  LayoutDashboard,
  Users,
  ChevronDown,
  Settings,
  HelpCircle,
  Bug,
  MessageCircle,
  Bookmark,
  RefreshCw,
  Trophy,
  Cloud,
  Award,
  Star,
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

const getRankIcon = (rank: string) => {
  if (rank === "Cloud Pro") return <Award className="h-4 w-4" />
  if (rank === "Cloud Explorer") return <Cloud className="h-4 w-4" />
  return <Star className="h-4 w-4" />
}

const getRankColor = (rank: string) => {
  const colors: Record<string, string> = {
    "Cloud Pro": "text-[#4285F4]", // Google Blue
    "Cloud Explorer": "text-[#34A853]", // Google Green
    "Cloud Beginner": "text-[#FBBC04]", // Google Yellow
  }
  return colors[rank] || "text-[#FBBC04]"
}

const getRankBgColor = (rank: string) => {
  const colors: Record<string, string> = {
    "Cloud Pro": "bg-[#4285F4]/10",
    "Cloud Explorer": "bg-[#34A853]/10",
    "Cloud Beginner": "bg-[#FBBC04]/10",
  }
  return colors[rank] || "bg-[#FBBC04]/10"
}

export function Leaderboard() {
  return (
    <div className="flex h-screen bg-[#0a0e14] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1117] border-r border-gray-800 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/user-profile-illustration.png" />
              <AvatarFallback>PS</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Priya S.</div>
              <div className="text-xs text-gray-400 truncate">@CloudLearner</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search" className="pl-9 bg-[#161b22] border-gray-700 text-sm h-9" />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">⌘K</kbd>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
            <LayoutDashboard className="mr-3 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
            <Users className="mr-3 h-4 w-4" />
            Study Groups
          </Button>

          <div className="pt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs text-gray-500 uppercase font-medium">Favorite groups</span>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </div>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-[#4285F4] hover:bg-[#161b22] h-9">
                <div className="mr-3 h-5 w-5 rounded-full bg-[#4285F4]/20 flex items-center justify-center">
                  <Cloud className="h-3 w-3" />
                </div>
                Top Learners
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
                <Avatar className="mr-3 h-5 w-5">
                  <AvatarImage src="/generic-club-logo.png" />
                  <AvatarFallback>GDG</AvatarFallback>
                </Avatar>
                GDG VIT Pune
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
                <Avatar className="mr-3 h-5 w-5">
                  <AvatarImage src="/rampage-logo.jpg" />
                  <AvatarFallback>GC</AvatarFallback>
                </Avatar>
                Cloud Community
              </Button>
            </div>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 space-y-1 border-t border-gray-800">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
          <Button className="w-full bg-[#4285F4] hover:bg-[#3367D6] h-9">Share Progress</Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
            <MessageCircle className="mr-3 h-4 w-4" />
            Request feature
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
            <HelpCircle className="mr-3 h-4 w-4" />
            Get help
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-[#161b22] h-9">
            <Bug className="mr-3 h-4 w-4" />
            Report bug
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#0d1117]/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC04] flex items-center justify-center">
                  <Cloud className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Google Cloud Study Jams</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    GDG VIT Pune's cloud learning initiative. Complete labs, earn badges, and master Google Cloud
                    Platform
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  Event ends in: <span className="text-white font-medium">2</span> days{" "}
                  <span className="text-white font-medium">5</span> hours
                </span>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-9 border-gray-700 bg-transparent">
                  View My Progress
                </Button>
                <Button variant="outline" className="h-9 border-gray-700 bg-transparent">
                  Edit Profile
                </Button>
                <Button className="h-9 bg-[#EA4335] hover:bg-[#D33426]">Invite Friends</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-gray-800">
            <button className="pb-3 text-sm font-medium border-b-2 border-[#4285F4] text-white">Rank</button>
            <button className="pb-3 text-sm font-medium text-gray-400 hover:text-white">Labs Completed</button>
            <button className="pb-3 text-sm font-medium text-gray-400 hover:text-white">Badges Earned</button>
            <div className="flex-1" />
            <div className="flex items-center gap-2 pb-3">
              <button className="px-3 py-1 text-sm rounded bg-[#4285F4] text-white">24h</button>
              <button className="px-3 py-1 text-sm rounded text-gray-400 hover:bg-[#161b22]">7D</button>
              <button className="px-3 py-1 text-sm rounded text-gray-400 hover:bg-[#161b22]">30D</button>
              <button className="px-3 py-1 text-sm rounded text-gray-400 hover:bg-[#161b22]">All Time</button>
              <button className="px-3 py-1 text-sm rounded text-gray-400 hover:bg-[#161b22] flex items-center gap-1">
                Track
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="px-3 py-1 text-sm rounded text-gray-400 hover:bg-[#161b22]">Show my place</button>
            </div>
          </div>

          {/* Top 3 Players */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {topPlayers.map((player, index) => (
              <div key={index} className="bg-[#161b22] rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-[#161b22] ring-[#4285F4]">
                    <AvatarImage src={player.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`text-4xl ${
                      player.trophy === "gold"
                        ? "text-[#FBBC04]"
                        : player.trophy === "silver"
                          ? "text-gray-300"
                          : "text-[#EA4335]"
                    }`}
                  >
                    <Trophy className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">{player.name}</h3>
                <div className={`flex items-center gap-2 mb-4 px-2 py-1 rounded-md ${getRankBgColor(player.rank)}`}>
                  <span className={getRankColor(player.rank)}>{getRankIcon(player.rank)}</span>
                  <span className={`text-sm font-medium ${getRankColor(player.rank)}`}>{player.rank}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Labs</div>
                    <div className="font-medium text-[#4285F4]">{player.labsCompleted}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Badges</div>
                    <div className="font-medium text-[#34A853]">{player.badgesEarned}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Rate</div>
                    <div className="font-medium text-[#FBBC04]">{player.completionRate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-[#161b22] rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Place</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Participant</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Labs Completed</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Badges Earned</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Completion Rate</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Tier</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-[#1c2128] transition-colors">
                    <td className="py-4 px-6 text-sm font-medium">{player.place}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{player.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{player.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-[#4285F4]">{player.labsCompleted}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-[#34A853]">{player.badgesEarned}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-sm font-medium ${Number.parseInt(player.completionRate) >= 70 ? "text-[#34A853]" : "text-[#FBBC04]"}`}
                      >
                        {player.completionRate}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded-md w-fit ${getRankBgColor(player.rank)}`}
                      >
                        <span className={getRankColor(player.rank)}>{getRankIcon(player.rank)}</span>
                        <span className={`text-sm font-medium ${getRankColor(player.rank)}`}>{player.rank}</span>
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
