"use client"

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchProfileData, isValidProfileUrl, toLeaderboardEntry } from '../lib/profileParser';
import { canAddParticipant } from '../lib/leaderboardManager';

export function ProfileSubmission({ onParticipantAdded, existingParticipants = [] }) {
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
      const profileData = await fetchProfileData(url);
      const participant = toLeaderboardEntry(profileData);
      participant.profileUrl = url;
      
      onParticipantAdded(participant);
      
      setStatus('success');
      setMessage(`Welcome ${profileData.name}! You've been added to the leaderboard.`);
      setUrl('');
      
      setTimeout(() => {
        setStatus(null);
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting profile:', error);
      setStatus('error');
      setMessage('Failed to fetch your profile. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#4285F4] to-[#0F9D58] flex items-center justify-center">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Join the Leaderboard</h2>
          <p className="text-sm text-gray-600">Submit your Google Cloud Skills Boost profile to participate</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Your Google Cloud Skills Boost Profile URL
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="url"
                placeholder="https://www.cloudskillsboost.google/public_profiles/your-profile-id"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#4285F4] focus:border-transparent text-sm"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !url.trim()}
              className="h-12 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-lg px-8 shadow-md font-semibold min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Submit'
              )}
            </Button>
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
    </div>
  );
}
