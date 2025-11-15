"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { FAQ } from "./FAQ"
import { HowToGuide } from "./HowToGuide"
import {
  Search,
  Trophy,
  Cloud,
  Sparkles,
  TrendingUp,
  Medal,
  Menu,
  X,
  HelpCircle,
  Play,
  CheckCircle,
  Award,
  Star
} from "lucide-react"

export function Leaderboard() {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('leaderboard');

  // Load leaderboard from CSV
  useEffect(() => {
    console.log('📊 Loading leaderboard from CSV...');
    setIsLoading(true);
    
    fetch('/leaderboard.csv')
      .then(response => response.text())
      .then(csvText => {
        console.log('✅ CSV loaded successfully');
        
        // Parse CSV
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        const participants = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const participant = {};
          
          headers.forEach((header, index) => {
            participant[header.trim()] = values[index]?.trim() || '';
          });
          
          return {
            rank: parseInt(participant['Rank']) || 0,
            name: participant['User Name'] || 'Unknown',
            email: participant['User Email'] || '',
            badges: parseInt(participant['Total Skill Badges']) || 0,
            games: parseInt(participant['Total Arcade Games']) || 0,
            dateAchieved: participant['Date Achieved'] || '',
            status: participant['Status'] || '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(participant['User Name'] || 'Unknown')}`
          };
        });
        
        console.log(`📋 Loaded ${participants.length} participants`);
        setParticipants(participants);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('❌ Error loading CSV:', error);
        setIsLoading(false);
      });
  }, []);

  // Parse CSV line handling quoted fields
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // Filter participants based on search term
  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg"
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200/60 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Gradient Header */}
        <div className="relative p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
          <div className="absolute inset-0 bg-white/5 opacity-30"></div>
          <div className="relative text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl">StudyJams</h2>
                <p className="text-blue-100 text-sm">GDGoC VIT Pune</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Event Completed</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search participants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 text-sm h-11 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm" 
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          <button
            onClick={() => setCurrentView('leaderboard')}
            className={`w-full p-4 rounded-xl shadow-lg transition-all duration-200 ${
              currentView === 'leaderboard' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5" />
              <span className="font-semibold">Leaderboard</span>
            </div>
            <p className={`text-sm ${currentView === 'leaderboard' ? 'text-blue-100' : 'text-gray-500'}`}>
              Final rankings and winners
            </p>
          </button>

          <button
            onClick={() => setCurrentView('howto')}
            className={`w-full p-4 rounded-xl shadow-lg transition-all duration-200 ${
              currentView === 'howto' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Play className="h-5 w-5" />
              <span className="font-semibold">How to Join</span>
            </div>
            <p className={`text-sm ${currentView === 'howto' ? 'text-blue-100' : 'text-gray-500'}`}>
              Step-by-step guide to join leaderboard
            </p>
          </button>

          <button
            onClick={() => setCurrentView('faq')}
            className={`w-full p-4 rounded-xl shadow-lg transition-all duration-200 ${
              currentView === 'faq' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="h-5 w-5" />
              <span className="font-semibold">FAQs</span>
            </div>
            <p className={`text-sm ${currentView === 'faq' ? 'text-blue-100' : 'text-gray-500'}`}>
              Get answers to common questions
            </p>
          </button>
        </nav>

        {/* Quick Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{participants.length}</div>
              <div className="text-xs text-blue-600 font-medium">Total Participants</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {/* {participants.filter(p => p.status === 'Achieved').length} */}
                103
              </div>
              <div className="text-xs text-green-600 font-medium">Completed</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-80">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="px-4 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Cloud className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 lg:gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      <div className="relative text-xl lg:text-3xl font-black overflow-hidden">
                        <span className="text-blue-600">&lt;</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                          <span className="text-red-500 text-xl lg:text-3xl font-black">&lt;</span>
                        </div>
                      </div>
                      <div className="relative text-xl lg:text-3xl font-black overflow-hidden">
                        <span className="text-amber-500">&gt;</span>
                        <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                          <span className="text-green-600 text-xl lg:text-3xl font-black">&gt;</span>
                        </div>
                      </div>
                    </div>
                    <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                      GDGoC VIT Pune StudyJams
                    </h1>
                  </div>
                  <p className="text-sm text-gray-600 hidden lg:block">
                    Final Rankings - Event Completed Successfully! 🎉
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full shadow-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    Event Ended: <span className="font-semibold text-green-700">31st Oct</span>
                  </span>
                  <span className="text-sm text-gray-700 sm:hidden font-semibold text-green-700">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {currentView === 'leaderboard' ? (
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {/* Disclaimer Notice */}
            <div className="mb-6">
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-4 shadow-sm">
                <ol className="list-decimal pl-5 space-y-1 text-sm leading-relaxed">
                  <li>The leaderboard is based on a first come, first serve basis, not on points</li>
                  <li>20 badges were mandatory and any badges or courses beyond the required 20 will not be considered, as no such provision was announced</li>
                  <li>Only new profiles created this month will be considered</li>
                </ol>
              </div>
            </div>

            {/* Event Summary */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-3">
                  <Trophy className="h-7 w-7 text-blue-600" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    🎉 StudyJams Event Completed 🎉
                  </h2>
                  <Trophy className="h-7 w-7 text-blue-600" />
                </div>
                <p className="text-gray-700 text-base">
                  Thank you to all participants who completed the challenge!
                </p>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {/* {participants.filter(p => p.badges >= 19 && p.games >= 1).length} */} 103
                      </div>
                      <div className="text-sm text-gray-600">Completed 19+1</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {participants.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Participants</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Final Leaderboard
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Ranked by submission order</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Medal className="h-4 w-4" />
                    <span>{filteredParticipants.length} Participants</span>
                  </div>
                </div>
              </div>
              
              {filteredParticipants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-20">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Participant</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-32">Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParticipants.map((participant, index) => {
                        const isWinner = participant.rank <= 25;
                        const isTop3 = participant.rank <= 3;
                        const isCompleted = participant.badges >= 19 && participant.games >= 1;
                        
                        return (
                          <tr 
                            key={index} 
                            className={`border-b border-gray-50 transition-all duration-200 group ${
                              isWinner 
                                ? 'bg-gradient-to-r from-amber-50/50 via-yellow-50/30 to-orange-50/50 hover:from-amber-50 hover:via-yellow-50 hover:to-orange-50' 
                                : 'hover:bg-blue-50/30'
                            }`}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                                  isTop3
                                    ? participant.rank === 1
                                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg ring-4 ring-amber-200'
                                      : participant.rank === 2
                                      ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-lg ring-4 ring-slate-200'
                                      : 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg ring-4 ring-orange-200'
                                    : isWinner
                                    ? 'bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-800 shadow-md ring-2 ring-amber-300'
                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700'
                                }`}>
                                  {isTop3 && (
                                    <span className="mr-0.5 text-base">
                                      {participant.rank === 1 ? '👑' : participant.rank === 2 ? '🥈' : '🥉'}
                                    </span>
                                  )}
                                  <span className="text-sm">{participant.rank}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className={`h-10 w-10 shadow-sm ${
                                  isWinner ? 'ring-4 ring-amber-200' : 'ring-2 ring-white'
                                }`}>
                                  <AvatarImage src={participant.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                                    {participant.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-semibold transition-colors ${
                                    isWinner ? 'text-amber-900' : 'text-gray-900 group-hover:text-blue-900'
                                  }`}>
                                    <span className="truncate">{participant.name}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                {isCompleted ? (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>{participant.badges} + {participant.games}</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                    <Award className="h-3.5 w-3.5" />
                                    <span>{participant.badges} + {participant.games}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-sm text-gray-600">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        ) : currentView === 'faq' ? (
          <FAQ />
        ) : (
          <HowToGuide />
        )}
      </main>
    </div>
  )
}