"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ProfileSubmission } from './ProfileSubmission';
import { rankParticipants, getTierColor, getTierBgColor, getTierIcon } from '../lib/leaderboardManager';
import { Trophy, Users, Award, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#4285F4] via-[#DB4437] to-[#F4B400] flex items-center justify-center shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <div className="relative text-3xl font-black overflow-hidden">
                    <span className="text-[#4285F4]">&lt;</span>
                    <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                      <span className="text-[#DB4437] text-3xl font-black">&lt;</span>
                    </div>
                  </div>
                  <div className="relative text-3xl font-black overflow-hidden">
                    <span className="text-[#F4B400]">&gt;</span>
                    <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                      <span className="text-[#0F9D58] text-3xl font-black">&gt;</span>
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">GDGoC VIT Pune StudyJams Leaderboard</h1>
              </div>
              <p className="text-gray-600">
                Compete with fellow learners and showcase your Google Cloud expertise
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Submission */}
        <ProfileSubmission 
          onParticipantAdded={handleParticipantAdded}
          existingParticipants={participants}
        />

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#4285F4]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#0F9D58]/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-[#0F9D58]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {participants.reduce((sum, p) => sum + (p.badgesEarned || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Badges</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#F4B400]/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-[#F4B400]" />
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

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Top Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((participant, index) => {
                const colors = {
                  0: { bg: 'bg-gradient-to-br from-[#F4B400] to-[#FF8F00]', text: 'text-[#F4B400]', trophy: '🥇' },
                  1: { bg: 'bg-gradient-to-br from-gray-400 to-gray-600', text: 'text-gray-600', trophy: '🥈' },
                  2: { bg: 'bg-gradient-to-br from-[#DB4437] to-[#C62828]', text: 'text-[#DB4437]', trophy: '🥉' }
                };
                const color = colors[index];
                
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                    {/* Trophy Badge */}
                    <div className={`absolute top-4 right-4 w-12 h-12 ${color.bg} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {participant.place}
                    </div>
                    
                    {/* Profile */}
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-4 ring-4 ring-white shadow-lg">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#4285F4] to-[#0F9D58] text-white font-semibold text-xl">
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
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="text-center">
                          <div className="font-bold text-lg text-gray-900">{participant.badgesEarned}</div>
                          <div>Badges</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-gray-900">{participant.labsCompleted}</div>
                          <div>Labs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Remaining Participants Table */}
        {remaining.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {topThree.length > 0 ? 'Other Participants' : 'Leaderboard Rankings'}
              </h2>
              <p className="text-sm text-gray-600">Ranked by badges earned and labs completed</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 w-20">Place</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Participant</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 w-48">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {remaining.map((participant, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Place */}
                      <td className="py-6 px-6">
                        <div className="text-lg font-bold text-gray-600">
                          {participant.place}
                        </div>
                      </td>

                      {/* Participant */}
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 shadow-sm">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-[#4285F4] to-[#0F9D58] text-white font-semibold text-lg">
                              {participant.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-base font-semibold text-gray-900">{participant.name}</div>
                            <div className="text-sm text-gray-500">
                              {participant.badgesEarned} badges • {participant.labsCompleted} labs
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
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

        {/* Empty State */}
        {rankedParticipants.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No participants yet</h3>
            <p className="text-gray-600">Be the first to submit your Google Cloud Skills Boost profile!</p>
          </div>
        )}
      </div>
    </div>
  );
}
