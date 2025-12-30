// Sync button component that triggers Strava sync

'use client';

import { useState } from 'react';

interface SyncButtonProps {
  stravaAthleteId: string;
  needsSync: boolean;
}

export default function SyncButton({ stravaAthleteId, needsSync }: SyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stravaAthleteId,
          force: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Sync failed');
      } else {
        const message = data.synced 
          ? `Sync completed! Found ${data.activities_count} runs, ${data.miles_total} miles total`
          : data.message;
        setMessage(message);
        // Log details for debugging
        if (data.synced && data.activities) {
          console.log('Synced activities:', data.activities);
          console.log('Date range:', data.date_range);
        }
        // Refresh page after successful sync
        if (data.synced) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`
          px-3 py-1.5
          rounded
          text-xs
          uppercase
          tracking-wider
          font-medium
          transition-all
          duration-200
          ${isSyncing
            ? 'bg-gray-100 cursor-not-allowed text-[#9ca3af]'
            : needsSync
            ? 'bg-[#1a1f2e] hover:bg-[#2d3441] text-white'
            : 'bg-transparent border border-gray-200 hover:border-gray-300 text-[#6b7280] hover:text-[#1a1f2e]'
          }
        `}
      >
        {isSyncing ? 'Syncing...' : 'Sync'}
      </button>
      {message && (
        <p className={`text-[10px] mt-1.5 uppercase tracking-wider ${
          message.includes('error') || message.includes('failed') 
            ? 'text-[#ef4444]' 
            : 'text-[#10b981]'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
