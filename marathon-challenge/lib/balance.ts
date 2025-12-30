// Balance scoring utilities for Pace Balance Chart
// Calculates Consistency Load (X) and Pace Stress (Y) for weekly aggregates

import { metersToMilesRounded } from './miles';

export interface Activity {
  date: string; // ISO 8601
  distance_miles: number;
  moving_time: number; // seconds
}

export interface WeekData {
  weekStart: string; // ISO date (Monday)
  weekEnd: string; // ISO date (Sunday)
  activities: Activity[];
  totalDistance: number;
  totalTime: number; // seconds
  runCount: number;
  avgPaceSeconds: number; // seconds per mile
}

export interface WeeklyBalance {
  weekStart: string;
  weekEnd: string;
  consistencyLoad: number; // 0-100 (X axis)
  paceStress: number; // 0-100 (Y axis)
  totalDistance: number;
  totalTime: number;
  runCount: number;
  avgPace: string; // "mm:ss"
  zone: 'hold' | 'likely' | 'stretch';
}

/**
 * Group activities by week (Monday to Sunday)
 */
export function groupActivitiesByWeek(
  activities: Activity[],
  timezone: string = 'America/Los_Angeles'
): WeekData[] {
  const weekMap = new Map<string, Activity[]>();

  activities.forEach(activity => {
    const date = new Date(activity.date);
    // Get Monday of the week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const weekKey = monday.toISOString().split('T')[0];
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(activity);
  });

  return Array.from(weekMap.entries())
    .map(([weekStart, weekActivities]) => {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // Sunday
      
      const totalDistance = weekActivities.reduce((sum, a) => sum + a.distance_miles, 0);
      const totalTime = weekActivities.reduce((sum, a) => sum + a.moving_time, 0);
      const runCount = weekActivities.length;
      
      // Calculate average pace correctly: totalTime / totalDistance
      const avgPaceSeconds = totalDistance > 0 ? totalTime / totalDistance : 0;

      return {
        weekStart,
        weekEnd: endDate.toISOString().split('T')[0],
        activities: weekActivities,
        totalDistance: roundMiles(totalDistance),
        totalTime,
        runCount,
        avgPaceSeconds,
      };
    })
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/**
 * Calculate rolling 30-day baseline pace
 * Returns average pace in seconds per mile over the last 30 days
 */
export function rollingBaseline(
  activities: Activity[],
  windowDays: number = 30
): number {
  if (activities.length === 0) return 0;

  const sorted = [...activities].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - windowDays);

  // Filter activities within the window
  const windowActivities = sorted.filter(a => {
    const activityDate = new Date(a.date);
    return activityDate >= windowStart && activityDate <= today;
  });

  if (windowActivities.length === 0) return 0;

  const totalDistance = windowActivities.reduce((sum, a) => sum + a.distance_miles, 0);
  const totalTime = windowActivities.reduce((sum, a) => sum + a.moving_time, 0);

  if (totalDistance === 0) return 0;

  // Baseline pace = totalTime / totalDistance
  return totalTime / totalDistance;
}

/**
 * Calculate weekly stats including stress and consistency scores
 */
export function weeklyStats(
  weekData: WeekData,
  baselinePaceSeconds: number,
  previousWeeks: WeekData[] // Last 4 weeks for stability comparison
): WeeklyBalance {
  // Calculate Consistency Load (X axis, 0-100)
  let consistencyLoad = 50; // Start at neutral

  // Add points for run frequency (up to 5 runs = +50 points)
  const runFrequencyScore = Math.min(weekData.runCount * 10, 50);
  consistencyLoad += runFrequencyScore - 25; // Adjust from baseline

  // Subtract points for long gaps (>=3 days between runs)
  const sortedDates = weekData.activities
    .map(a => new Date(a.date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  for (let i = 1; i < sortedDates.length; i++) {
    const daysDiff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff >= 3) {
      consistencyLoad -= 15; // Penalty for gaps
    }
  }

  // Add/subtract for week-to-week stability
  if (previousWeeks.length >= 2) {
    const avgRunCount = previousWeeks.reduce((sum, w) => sum + w.runCount, 0) / previousWeeks.length;
    const runCountDiff = weekData.runCount - avgRunCount;
    
    // Penalize large spikes or drops (>2 runs difference)
    if (Math.abs(runCountDiff) > 2) {
      consistencyLoad -= Math.abs(runCountDiff) * 5;
    } else if (Math.abs(runCountDiff) <= 1) {
      consistencyLoad += 5; // Bonus for stability
    }
  }

  // Clamp to [0, 100]
  consistencyLoad = Math.max(0, Math.min(100, consistencyLoad));

  // Calculate Pace Stress (Y axis, 0-100)
  let paceStress = 50; // Start at neutral

  if (baselinePaceSeconds > 0 && weekData.avgPaceSeconds > 0) {
    // Compare week pace to baseline
    const paceDifference = ((baselinePaceSeconds - weekData.avgPaceSeconds) / baselinePaceSeconds) * 100;
    
    // Faster pace (negative difference) = higher stress
    if (paceDifference < -5) {
      // Week was >5% faster than baseline = intensity
      paceStress += Math.abs(paceDifference) * 2; // Scale up stress
    } else if (paceDifference > 5) {
      // Week was >5% slower = recovery
      paceStress -= Math.abs(paceDifference) * 1.5; // Reduce stress
    }

    // Volume stress component (very long week raises stress even if slow)
    const volumeStress = Math.min(weekData.totalDistance / 30, 1) * 20; // Max +20 for 30+ miles
    paceStress += volumeStress;
  }

  // Clamp to [0, 100]
  paceStress = Math.max(0, Math.min(100, paceStress));

  // Determine zone based on consistency load
  let zone: 'hold' | 'likely' | 'stretch';
  if (consistencyLoad < 40) {
    zone = 'hold';
  } else if (consistencyLoad < 70) {
    zone = 'likely';
  } else {
    zone = 'stretch';
  }

  // Format average pace
  const minutes = Math.floor(weekData.avgPaceSeconds / 60);
  const seconds = Math.floor(weekData.avgPaceSeconds % 60);
  const avgPace = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return {
    weekStart: weekData.weekStart,
    weekEnd: weekData.weekEnd,
    consistencyLoad: roundMiles(consistencyLoad),
    paceStress: roundMiles(paceStress),
    totalDistance: weekData.totalDistance,
    totalTime: weekData.totalTime,
    runCount: weekData.runCount,
    avgPace,
    zone,
  };
}

/**
 * Generate insight text based on balance position and trends
 */
export function generateBalanceInsight(
  currentWeek: WeeklyBalance,
  previousWeeks: WeeklyBalance[]
): string {
  const trend = previousWeeks.length >= 2
    ? currentWeek.consistencyLoad - previousWeeks[previousWeeks.length - 1].consistencyLoad
    : 0;

  // High stress + low consistency
  if (currentWeek.paceStress > 70 && currentWeek.consistencyLoad < 40) {
    return "Big effort week, but repeatability dipped. Consider one easier day.";
  }

  // Low stress + high consistency
  if (currentWeek.paceStress < 40 && currentWeek.consistencyLoad > 60) {
    return "Great consistency at sustainable effort — this builds fitness.";
  }

  // Consistency improving
  if (trend > 10) {
    return "You're showing up more often. That's the strongest predictor of long-term progress.";
  }

  // High stress + high consistency
  if (currentWeek.paceStress > 70 && currentWeek.consistencyLoad > 60) {
    return "High volume and intensity — monitor recovery. A lighter week may help.";
  }

  // Low stress + low consistency
  if (currentWeek.paceStress < 40 && currentWeek.consistencyLoad < 40) {
    return "Easy weeks are valuable, but consistency matters. Aim for 3-4 runs per week.";
  }

  // Balanced zone
  if (currentWeek.consistencyLoad >= 40 && currentWeek.consistencyLoad <= 70 && 
      currentWeek.paceStress >= 40 && currentWeek.paceStress <= 70) {
    return "You're in the sustainable zone — balanced effort with good consistency.";
  }

  return "Your training is evolving. Trust the process and stay consistent.";
}

/**
 * Round to 2 decimal places
 */
function roundMiles(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format total time for display
 */
export function formatTotalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
