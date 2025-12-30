// Best Times Card Component
// Shows fastest runs for this month

'use client';

import DashboardCard from './DashboardCard';

interface Activity {
  name: string;
  date: string;
  distance_miles: number;
  moving_time: number; // seconds
  location?: string | null;
}

interface BestTimesCardProps {
  activities: Activity[];
}

export default function BestTimesCard({ activities }: BestTimesCardProps) {
  // Filter to current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthActivities = activities.filter(a => {
    const date = new Date(a.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Calculate fastest times for this month
  const calculateBestTimes = () => {
    // Fastest 5K (3.0 - 3.2 miles)
    const fiveKActivities = monthActivities.filter(a => {
      const distance = a.distance_miles;
      return distance >= 3.0 && distance <= 3.2;
    });
    const fastest5K = fiveKActivities.reduce((fastest, a) => {
      if (!fastest || a.moving_time < fastest.moving_time) return a;
      return fastest;
    }, null as Activity | null);

    // Fastest 10K (6.0 - 6.3 miles)
    const tenKActivities = monthActivities.filter(a => {
      const distance = a.distance_miles;
      return distance >= 6.0 && distance <= 6.3;
    });
    const fastest10K = tenKActivities.reduce((fastest, a) => {
      if (!fastest || a.moving_time < fastest.moving_time) return a;
      return fastest;
    }, null as Activity | null);

    // Fastest Mile (0.9 - 1.1 miles)
    const mileActivities = monthActivities.filter(a => {
      const distance = a.distance_miles;
      return distance >= 0.9 && distance <= 1.1;
    });
    const fastestMile = mileActivities.reduce((fastest, a) => {
      if (!fastest || a.moving_time < fastest.moving_time) return a;
      return fastest;
    }, null as Activity | null);

    // Longest run this month
    const longestRun = monthActivities.reduce((longest, a) => {
      if (!longest || a.distance_miles > longest.distance_miles) return a;
      return longest;
    }, null as Activity | null);

    return { fastest5K, fastest10K, fastestMile, longestRun };
  };

  const bestTimes = calculateBestTimes();

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const hasAnyBestTime = bestTimes.fastest5K || bestTimes.fastest10K || bestTimes.fastestMile || bestTimes.longestRun;

  return (
    <DashboardCard>
      <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-4">
        BEST TIMES THIS MONTH
      </div>

      {!hasAnyBestTime ? (
        <div className="text-sm text-[#6b7280]">
          No qualifying runs this month
        </div>
      ) : (
        <div className="space-y-3">
          {bestTimes.fastest5K && (
            <div className="pb-3 border-b border-gray-200 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-sm font-medium text-[#1a1f2e]">5K</div>
                  <div className="text-xs text-[#6b7280] font-light">
                    {formatDate(bestTimes.fastest5K.date)}
                    {bestTimes.fastest5K.location && ` • ${bestTimes.fastest5K.location}`}
                  </div>
                </div>
                <div className="text-lg font-bold text-[#3b82f6]">
                  {formatTime(bestTimes.fastest5K.moving_time)}
                </div>
              </div>
            </div>
          )}

          {bestTimes.fastest10K && (
            <div className="pb-3 border-b border-white/5 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-sm font-medium text-[#1a1f2e]">10K</div>
                  <div className="text-xs text-[#6b7280] font-light">
                    {formatDate(bestTimes.fastest10K.date)}
                    {bestTimes.fastest10K.location && ` • ${bestTimes.fastest10K.location}`}
                  </div>
                </div>
                <div className="text-lg font-bold text-[#3b82f6]">
                  {formatTime(bestTimes.fastest10K.moving_time)}
                </div>
              </div>
            </div>
          )}

          {bestTimes.fastestMile && (
            <div className="pb-3 border-b border-white/5 last:border-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-sm font-medium text-[#1a1f2e]">1 Mile</div>
                  <div className="text-xs text-[#6b7280] font-light">
                    {formatDate(bestTimes.fastestMile.date)}
                    {bestTimes.fastestMile.location && ` • ${bestTimes.fastestMile.location}`}
                  </div>
                </div>
                <div className="text-lg font-bold text-[#3b82f6]">
                  {formatTime(bestTimes.fastestMile.moving_time)}
                </div>
              </div>
            </div>
          )}

          {bestTimes.longestRun && (
            <div>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="text-sm font-medium text-[#1a1f2e]">Longest Run</div>
                  <div className="text-xs text-[#6b7280] font-light">
                    {formatDate(bestTimes.longestRun.date)}
                    {bestTimes.longestRun.location && ` • ${bestTimes.longestRun.location}`}
                  </div>
                </div>
                <div className="text-lg font-bold text-[#10b981]">
                  {bestTimes.longestRun.distance_miles.toFixed(1)} mi
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
