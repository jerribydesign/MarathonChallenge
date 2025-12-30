// Leaderboard component showing ranked participants

'use client';

import { calculateProgress } from '@/lib/miles';

interface LeaderboardEntry {
  display_name: string | null;
  miles_total: number;
  user_id: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  goal?: number;
  compact?: boolean; // Compact mode for dashboard cards
}

export default function Leaderboard({ entries, goal = 26.2, compact = false }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
        <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">
          LEADERBOARD
        </div>
        <p className="text-[#6b7280] text-sm">
          No participants yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
      <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-4">
        LEADERBOARD
      </div>
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-sm text-[#6b7280] py-4 text-center">
            No participants yet
          </div>
        ) : (
          entries.slice(0, compact ? 5 : entries.length).map((entry, index) => {
            const progress = calculateProgress(entry.miles_total, goal);
            const rank = index + 1;

            return (
              <div
                key={entry.user_id}
                className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-xs text-[#6b7280] font-medium w-6">
                    #{rank}
                  </div>
                  <div className="text-sm text-[#1a1f2e] font-light">
                    {entry.display_name || 'Anonymous'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#1a1f2e] font-medium">
                    {entry.miles_total.toFixed(1)} mi
                  </div>
                  <div className="text-[10px] text-[#6b7280]">
                    {progress.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
