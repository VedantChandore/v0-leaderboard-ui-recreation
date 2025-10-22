"use client"

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Link, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchProfileData, isValidProfileUrl, toLeaderboardEntry } from '../lib/profileParser';

export function ProfileImporter({ onProfileAdded, existingProfiles = [] }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) {
      setStatus('error');
      setMessage('Please enter a profile URL');
      return;
    }

    if (!isValidProfileUrl(url)) {
      setStatus('error');
      setMessage('Please enter a valid Google Cloud Skills Boost profile URL');
      return;
    }

    // Check if profile already exists
    const isDuplicate = existingProfiles.some(profile => 
      profile.profileUrl === url || 
      profile.profileUrl?.includes(url.split('/public_profiles/')[1]?.split('?')[0])
    );

    if (isDuplicate) {
      setStatus('error');
      setMessage('This profile has already been added to the leaderboard');
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const profileData = await fetchProfileData(url);
      const leaderboardEntry = toLeaderboardEntry(profileData, existingProfiles.length + 1);
      
      onProfileAdded(leaderboardEntry);
      
      setStatus('success');
      setMessage(`Successfully added ${profileData.name} to the leaderboard!`);
      setUrl('');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setStatus(null);
        setMessage('');
        setShowImporter(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error importing profile:', error);
      setStatus('error');
      setMessage('Failed to fetch profile data. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleImport();
    }
  };

  if (!showImporter) {
    return (
      <Button
        onClick={() => setShowImporter(true)}
        className="h-10 bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white rounded-lg px-4 shadow-md flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Participant
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-[#0F9D58]/10 flex items-center justify-center">
          <Link className="h-5 w-5 text-[#0F9D58]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Add New Participant</h3>
          <p className="text-sm text-gray-600">Import from Google Cloud Skills Boost profile</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile URL
          </label>
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://www.skills.google/public_profiles/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-10 rounded-lg border-gray-300 focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={handleImport}
              disabled={isLoading || !url.trim()}
              className="h-10 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-lg px-6 shadow-md min-w-[100px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Import'
              )}
            </Button>
          </div>
        </div>

        {status && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status === 'success' 
              ? 'bg-[#0F9D58]/10 border border-[#0F9D58]/20 text-[#0F9D58]' 
              : 'bg-[#DB4437]/10 border border-[#DB4437]/20 text-[#DB4437]'
          }`}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            Example: https://www.skills.google/public_profiles/c341f338-94be-42d8-9fc8-460695c15e34
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setShowImporter(false);
              setUrl('');
              setStatus(null);
              setMessage('');
            }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
