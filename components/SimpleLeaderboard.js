"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ProfileSubmission } from './ProfileSubmission';
import { rankParticipants, getTierColor, getTierBgColor, getTierIcon } from '../lib/leaderboardManager';
import { Trophy, Users, Award, Search, Sparkles, TrendingUp, Target, Medal } from 'lucide-react';
import { Input } from './ui/input';

export function SimpleLeaderboard() {
  const [participants, setParticipants] = useState([]);
  const [rankedParticipants, setRankedParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Update rankings whenever participants change
  useEffect(() => {
    const ranked = rankParticipants(participants);
    setRankedParticipants(ranked);
  }, [participants]);

  const handleParticipantAdded = (newParticipant) => {
    setParticipants(prev => [...prev, newParticipant]);
    // Refresh page after adding participant
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // Filter participants based on search term
  const filteredParticipants = rankedParticipants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredParticipants.slice(0, 3);
  const remaining = filteredParticipants.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <div className="relative text-2xl lg:text-3xl font-black overflow-hidden">
                    <span className="text-blue-600">&lt;</span>
                    <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                      <span className="text-red-500 text-2xl lg:text-3xl font-black">&lt;</span>
                    </div>
                  </div>
                  <div className="relative text-2xl lg:text-3xl font-black overflow-hidden">
                    <span className="text-amber-500">&gt;</span>
                    <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                      <span className="text-green-600 text-2xl lg:text-3xl font-black">&gt;</span>
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                  GDGoC VIT Pune StudyJams
                </h1>
              </div>
              <p className="text-gray-600 text-sm lg:text-base">
                Compete with fellow learners and showcase your Google Cloud expertise
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Enhanced Profile Submission */}
        <div className="mb-8">
          <ProfileSubmission 
            onParticipantAdded={handleParticipantAdded}
            existingParticipants={participants}
          />
        </div>

        {/* Search and Stats Row */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Enhanced Search */}
          <div className="lg:w-96">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                  <div className="text-sm text-gray-600">Participants</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {participants.reduce((sum, p) => sum + (p.badgesEarned || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Badges</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {rankedParticipants.filter(p => p.tier === 'Cloud Pro').length}
                  </div>
                  <div className="text-sm text-gray-600">Cloud Pros</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                🏆 Top Performers
              </h2>
              <p className="text-gray-600">Our leading cloud champions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {topThree.map((participant, index) => {
                const podiumStyles = [
                  { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', crown: '👑' },
                  { bg: 'bg-gradient-to-br from-slate-400 to-gray-600', crown: '🥈' },
                  { bg: 'bg-gradient-to-br from-amber-600 to-red-600', crown: '🥉' }
                ];
                const style = podiumStyles[index];
                
                return (
                  <div key={index} className="transform hover:scale-105 transition-all duration-300">
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 relative overflow-hidden">
                      {/* Rank Badge */}
                      <div className={`absolute -top-2 -right-2 w-12 h-12 ${style.bg} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                        {participant.place}
                      </div>
                      
                      {/* Crown */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-2xl">
                        {style.crown}
                      </div>
                      
                      <div className="text-center pt-4">
                        <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-white shadow-lg">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xl">
                            {participant.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{participant.name}</h3>
                        
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getTierBgColor(participant.tier)} mb-4`}>
                          <span className="text-lg">{getTierIcon(participant.tier)}</span>
                          <span className={`text-sm font-semibold ${getTierColor(participant.tier)}`}>
                            {participant.tier}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-blue-50 p-3 rounded-xl">
                            <div className="text-2xl font-bold text-blue-700">{participant.badgesEarned}</div>
                            <div className="text-xs text-blue-600">Badges</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-xl">
                            <div className="text-2xl font-bold text-green-700">{participant.labsCompleted}</div>
                            <div className="text-xs text-green-600">Labs</div>
                          </div>
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
        {remaining.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                {topThree.length > 0 ? 'Rising Stars' : 'Leaderboard Rankings'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Keep climbing the ranks!</p>
            </div>
            
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
                    <tr key={index} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                      <td className="py-6 px-6">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700 transition-all mx-auto">
                          {participant.place}
                        </div>
                      </td>

                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 shadow-sm">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-base font-semibold text-gray-900">{participant.name}</div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {participant.badgesEarned} badges
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {participant.labsCompleted} labs
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-6 px-6">
                        <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-full ${getTierBgColor(participant.tier)}`}>
                          <span className="text-xl">{getTierIcon(participant.tier)}</span>
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
          </div>
        )}

        {/* Enhanced Empty State */}
        {rankedParticipants.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xl">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Begin?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Be the first to join our StudyJams leaderboard and start your Google Cloud journey!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
