"use client"

import { useState } from 'react';
import { Button } from './ui/button';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function UpdateTrigger() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(null);

  const triggerUpdate = async () => {
    setStatus('loading');
    setMessage('Starting background update...');
    setProgress(null);

    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        
        // Start polling for progress if update started
        if (data.status === 'starting') {
          pollProgress();
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Update failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Failed to start update: ${error.message}`);
    }
  };

  const pollProgress = async () => {
    const poll = async () => {
      try {
        const response = await fetch('/api/update');
        const data = await response.json();

        if (data.success && data.status.isRunning) {
          setProgress({
            total: data.status.totalParticipants,
            completed: data.status.completed,
            errors: data.status.errors
          });
          
          // Continue polling
          setTimeout(poll, 2000);
        } else {
          // Update completed
          setStatus('success');
          setMessage('Background update completed!');
          setProgress(null);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    // Start polling after a delay
    setTimeout(poll, 2000);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-[#F4B400]';
      case 'success': return 'text-[#0F9D58]';
      case 'error': return 'text-[#DB4437]';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Update Leaderboard Data</h3>
          <p className="text-sm text-gray-600">Refresh all participant profiles in background</p>
        </div>
        <Button
          onClick={triggerUpdate}
          disabled={status === 'loading'}
          className="bg-[#4285F4] hover:bg-[#3367D6] text-white px-6 shadow-md"
        >
          {status === 'loading' ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Update All
        </Button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg bg-gray-50 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {progress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {progress.completed}/{progress.total}</span>
            <span>Errors: {progress.errors}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#4285F4] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
