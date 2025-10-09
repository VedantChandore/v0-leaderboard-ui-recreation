"use client"

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchProfileData, isValidProfileUrl, toLeaderboardEntry } from '../lib/profileParser';
import { canAddParticipant } from '../lib/leaderboardManager';

export function ProfileModal({ isOpen, onClose, onParticipantAdded, existingParticipants = [] }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!url.trim()) {
      setStatus('error');
      setMessage('Please enter your Google Cloud Skills Boost profile URL');
      return;
    }

    if (!isValidProfileUrl(url)) {
      setStatus('error');
      setMessage('Please enter a valid Google Cloud Skills Boost profile URL');
      return;
    }

    if (!canAddParticipant(existingParticipants, url)) {
      setStatus('error');
      setMessage('This profile has already been submitted');
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setMessage('');

    try {
      console.log('🔍 Fetching profile data from URL:', url);
      const profileData = await fetchProfileData(url);
      console.log('📊 Raw profile data received:', profileData);
      
      const participant = toLeaderboardEntry(profileData);
      participant.profileUrl = url;
      
      console.log('🏆 Participant data for leaderboard:', {
        name: participant.name,
        badgesEarned: participant.badgesEarned,
        labsCompleted: participant.labsCompleted,
        tier: participant.tier,
        rankingScore: participant.rankingScore
      });
      
      await onParticipantAdded(participant);
      
      setIsLoading(false); // Stop loading immediately on success
      setStatus('success');
      setMessage(`Welcome ${profileData.name}! You've been added to the leaderboard with ${profileData.badgesEarned} badges.`);
      setUrl('');
      
      setTimeout(() => {
        setStatus(null);
        setMessage('');
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting profile:', error);
      setIsLoading(false); // Stop loading on error
      setStatus('error');
      
      if (error.message.includes('already been submitted')) {
        setMessage('This profile has already been submitted to the leaderboard.');
      } else if (error.message.includes('Failed to fetch')) {
        setMessage('Failed to fetch your profile. Please check the URL and try again.');
      } else {
        setMessage('An error occurred while adding your profile. Please try again.');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClose = () => {
    setUrl('');
    setStatus(null);
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Track Your Progress</h2>
            <p className="text-sm text-gray-600">Submit your Google Cloud Skills Boost profile</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Profile URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="url"
                placeholder="https://www.cloudskillsboost.google/public_profiles/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {status && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              status === 'success' 
                ? 'bg-[#0F9D58]/10 border border-[#0F9D58]/20 text-[#0F9D58]' 
                : 'bg-[#DB4437]/10 border border-[#DB4437]/20 text-[#DB4437]'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">How to find your profile URL:</h4>
            <ol className="text-xs text-gray-600 space-y-1">
              <li>1. Go to <span className="font-mono bg-white px-1 rounded">cloudskillsboost.google</span></li>
              <li>2. Sign in and go to your profile</li>
              <li>3. Make sure your profile is public</li>
              <li>4. Copy the URL from your browser</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !url.trim()}
            className="bg-[#4285F4] hover:bg-[#3367D6] text-white px-6 shadow-md"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Submit Profile'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
