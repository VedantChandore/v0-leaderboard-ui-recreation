"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useAuth } from "../contexts/AuthContext"
import { ProfileModal } from "./ProfileModal"
import { rankParticipants, getTierColor, getTierBgColor, getTierIcon } from "../lib/leaderboardManager"
import { subscribeToLeaderboard, getExistingParticipant, addParticipant, updateParticipantProgress } from "../lib/leaderboardDB"
import {
  Search,
  Users,
  LogOut,
  Trophy,
  Cloud,
  Award,
  Timer,
  Sparkles,
  TrendingUp,
  Medal,
  Target,
  Menu,
  X
} from "lucide-react"

export function Leaderboard() {
  const { user, logOut } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [rankedParticipants, setRankedParticipants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real-time leaderboard subscription
  useEffect(() => {
    console.log('🚀 Initializing real-time leaderboard...');
    setIsLoading(true);
    
    const unsubscribe = subscribeToLeaderboard((updatedParticipants) => {
      console.log('⚡ Real-time update received:', updatedParticipants.length, 'participants');
      
      // Update connection status
      setConnectionStatus('connected');
      
      // Set participants (already ranked from database)
      setParticipants(updatedParticipants);
      setRankedParticipants(updatedParticipants); // Already ranked
      setIsLoading(false);
      
      // Log leaderboard changes
      if (updatedParticipants.length > 0) {
        console.log('🏆 Current Top 3:');
        updatedParticipants.slice(0, 3).forEach((p, i) => {
          console.log(`${i + 1}. ${p.name} - ${p.badgesEarned} badges (${p.tier})`);
        });
      } else {
        console.log('📭 No participants in leaderboard yet');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Disconnecting real-time leaderboard');
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddParticipant = async (newParticipant) => {
    try {
      console.log('Attempting to add/update participant:', newParticipant);
      
      // Check if participant already exists
      const existingParticipant = await getExistingParticipant(newParticipant.profileUrl);
      console.log('Existing participant check:', existingParticipant);
      
      if (existingParticipant) {
        // Update existing participant with new progress
        console.log('Updating existing participant progress...');
        const updatedParticipant = await updateParticipantProgress(existingParticipant, newParticipant);
        console.log('Participant progress updated successfully:', updatedParticipant.progressInfo);
        
        // Return progress info for UI feedback
        return {
          isUpdate: true,
          progressInfo: updatedParticipant.progressInfo,
          participant: updatedParticipant
        };
      } else {
        // Add new participant to Firestore
        console.log('Adding new participant to database...');
        const docId = await addParticipant(newParticipant);
        console.log('New participant added successfully with ID:', docId);
        
        return {
          isUpdate: false,
          docId: docId,
          participant: newParticipant
        };
      }
    } catch (error) {
      console.error('Error adding/updating participant:', error);
      throw error; // Re-throw to be handled by modal
    }
  };

  // Filter participants based on search term
  const filteredParticipants = rankedParticipants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredParticipants.slice(0, 3);
  const remaining = filteredParticipants.slice(3);

  const handleTrackProgress = () => {
    setIsModalOpen(true);
  };

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
              <Sparkles className="h-4 w-4" />
              <span>Google Cloud Learning Platform</span>
            </div>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100">
              <AvatarImage src={user?.photoURL || "/user-profile-illustration.png"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </div>
              {user?.email && (
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              )}
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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5" />
              <span className="font-semibold">Leaderboard</span>
            </div>
            <p className="text-blue-100 text-sm">Track your progress and compete!</p>
          </div>
      
        </nav>
        {/* Quick Stats */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{participants.length}</div>
              <div className="text-xs text-blue-600 font-medium">Total Learners</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {participants.reduce((sum, p) => sum + (p.badgesEarned || 0), 0)}
              </div>
              <div className="text-xs text-green-600 font-medium">Total Badges</div>
            </div>
          </div>
        </div>


        {/* Bottom Actions */}
        <div className="p-4 space-y-2 border-t border-gray-100">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 h-11 rounded-xl"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
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
                    Master Google Cloud Platform through hands-on labs and earn industry-recognized badges
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Indicator */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border shadow-sm ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : connectionStatus === 'connecting'
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' 
                      ? 'bg-green-500 animate-pulse'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-500 animate-spin'
                      : 'bg-red-500'
                  }`} />
                  {connectionStatus === 'connected' ? 'Live Updates' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full shadow-sm">
                  <Timer className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    Event ends: <span className="font-semibold text-amber-700">31st Oct</span>
                  </span>
                  <span className="text-sm text-gray-700 sm:hidden font-semibold text-amber-700">31st Oct</span>
                </div>
                
                <Button 
                  onClick={handleTrackProgress}
                  className="h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-4 lg:px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Track Progress
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Content */}
        <div className="p-4 lg:p-8">
          {/* Top 3 Podium - Enhanced */}
          {topThree.length > 0 && (
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                  🏆 Hall of Fame
                </h2>
                <p className="text-gray-600">Our top performing cloud champions</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
                {topThree.map((participant, index) => {
                  const podiumStyles = [
                    { 
                      bg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500', 
                      ring: 'ring-amber-200',
                      crown: '👑',
                      height: 'lg:h-90'
                    },
                    { 
                      bg: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600', 
                      ring: 'ring-slate-200',
                      crown: '🥈',
                      height: 'lg:h-90'
                    },
                    { 
                      bg: 'bg-gradient-to-br from-amber-600 via-orange-700 to-red-600', 
                      ring: 'ring-orange-200',
                      crown: '🥉',
                      height: 'lg:h-90'
                    }
                  ];
                  const style = podiumStyles[index];
                  
                  return (
                    <div key={index} className={`relative ${style.height} transform hover:scale-105 transition-all duration-300`}>
                      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 opacity-60"></div>
                        
                        {/* Rank Badge */}
                        <div className={`absolute -top-2 -right-2 w-16 h-16 ${style.bg} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${style.ring} ring-4`}>
                          {participant.place}
                        </div>
                        
                        {/* Crown */}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-3xl">
                          {style.crown}
                        </div>
                        
                        <div className="relative z-10 text-center pt-4">
                          <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-white shadow-lg">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-2xl">
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{participant.name}</h3>
                          
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getTierBgColor(participant.tier)} mb-4 shadow-sm`}>
                            <span className="text-lg">{getTierIcon(participant.tier)}</span>
                            <span className={`text-sm font-semibold ${getTierColor(participant.tier)}`}>
                              {participant.tier}
                            </span>
                          </div>
                        </div>
                        
                        <div className="relative z-10 grid grid-cols-2 gap-4 text-center">
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <div className="text-2xl font-bold text-blue-700">{participant.badgesEarned}</div>
                            <div className="text-xs text-blue-600 font-medium">Badges</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                            <div className="text-2xl font-bold text-green-700">{participant.points}</div>
                            <div className="text-xs text-green-600 font-medium">Points</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Participants Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    {topThree.length > 0 ? 'Rising Stars' : 'Leaderboard Rankings'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Compete and climb the ranks!</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Medal className="h-4 w-4" />
                  <span>Ranked by badges and labs</span>
                </div>
              </div>
            </div>
            
            {remaining.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 w-20">Rank</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Participant</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 w-48">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remaining.map((participant, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-blue-50/30 transition-all duration-200 group">
                        <td className="py-6 px-6">
                          <div className="flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700 transition-all duration-200">
                              {participant.place}
                            </div>
                          </div>
                        </td>

                        <td className="py-6 px-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 shadow-sm ring-2 ring-white">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                {participant.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-base font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                                {participant.name}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  {participant.badgesEarned} badges
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {participant.points} points
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-6 px-6">
                          <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-full shadow-sm ${getTierBgColor(participant.tier)}`}>
                            <span className="text-lg">{getTierIcon(participant.tier)}</span>
                            <span className={`text-sm font-semibold ${getTierColor(participant.tier)}`}>
                              {participant.tier}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !topThree.length ? (
              <div className="p-12 text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start Your Journey?</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Be the first to join our StudyJams leaderboard and showcase your Google Cloud skills!
                </p>
                <Button 
                  onClick={handleTrackProgress}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Profile Modal */}
        <ProfileModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onParticipantAdded={handleAddParticipant}
          existingParticipants={participants}
        />
      </main>
    </div>
  )
}