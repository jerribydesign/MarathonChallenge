// Aggregation utilities for Zoom Out dashboard
// Focuses on long-term trends, not individual runs

import { metersToMilesRounded } from './miles';

export interface Activity {
  date: string; // ISO 8601
  distance_miles: number;
  moving_time: number; // seconds
}

export interface MonthSummary {
  month: string; // "2025-01"
  totalDistance: number;
  totalTime: number; // seconds
  runCount: number;
  avgPace: string; // "mm:ss"
}

export interface WeekSummary {
  weekStart: string; // ISO date
  weekEnd: string;
  totalDistance: number;
  totalTime: number; // seconds
  runCount: number;
  avgPace: string;
}

export interface RollingStats {
  date: string; // ISO date
  distance: number;
  runCount: number;
  avgPace: string;
}

/**
 * Group activities by month
 */
export function groupActivitiesByMonth(activities: Activity[]): MonthSummary[] {
  const monthMap = new Map<string, Activity[]>();

  activities.forEach(activity => {
    const date = new Date(activity.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey)!.push(activity);
  });

  return Array.from(monthMap.entries())
    .map(([month, monthActivities]) => {
      const totalDistance = monthActivities.reduce((sum, a) => sum + a.distance_miles, 0);
      const totalTime = monthActivities.reduce((sum, a) => sum + a.moving_time, 0);
      const runCount = monthActivities.length;
      
      // Calculate average pace correctly: totalTime / totalDistance
      const avgPaceSeconds = totalDistance > 0 ? totalTime / totalDistance : 0;
      const minutes = Math.floor(avgPaceSeconds / 60);
      const seconds = Math.floor(avgPaceSeconds % 60);
      const avgPace = `${minutes}:${String(seconds).padStart(2, '0')}`;

      return {
        month,
        totalDistance: roundMiles(totalDistance),
        totalTime,
        runCount,
        avgPace,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Group activities by week (Monday to Sunday)
 */
export function groupActivitiesByWeek(activities: Activity[]): WeekSummary[] {
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
      
      // Calculate average pace correctly
      const avgPaceSeconds = totalDistance > 0 ? totalTime / totalDistance : 0;
      const minutes = Math.floor(avgPaceSeconds / 60);
      const seconds = Math.floor(avgPaceSeconds % 60);
      const avgPace = `${minutes}:${String(seconds).padStart(2, '0')}`;

      return {
        weekStart,
        weekEnd: endDate.toISOString().split('T')[0],
        totalDistance: roundMiles(totalDistance),
        totalTime,
        runCount,
        avgPace,
      };
    })
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/**
 * Calculate 30-day rolling window statistics
 */
export function rollingWindowStats(
  activities: Activity[],
  windowDays: number = 30
): RollingStats[] {
  if (activities.length === 0) return [];

  // Sort activities by date
  const sorted = [...activities].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const result: RollingStats[] = [];
  const dates: string[] = [];

  // Generate date range from first activity to today
  const firstDate = new Date(sorted[0].date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = new Date(firstDate); d <= today; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0]);
  }

  dates.forEach(date => {
    const dateObj = new Date(date);
    const windowStart = new Date(dateObj);
    windowStart.setDate(windowStart.getDate() - windowDays);

    // Filter activities within the rolling window
    const windowActivities = sorted.filter(a => {
      const activityDate = new Date(a.date);
      return activityDate >= windowStart && activityDate <= dateObj;
    });

    const totalDistance = windowActivities.reduce((sum, a) => sum + a.distance_miles, 0);
    const totalTime = windowActivities.reduce((sum, a) => sum + a.moving_time, 0);
    const runCount = windowActivities.length;

    // Calculate average pace correctly
    const avgPaceSeconds = totalDistance > 0 ? totalTime / totalDistance : 0;
    const minutes = Math.floor(avgPaceSeconds / 60);
    const seconds = Math.floor(avgPaceSeconds % 60);
    const avgPace = `${minutes}:${String(seconds).padStart(2, '0')}`;

    result.push({
      date,
      distance: roundMiles(totalDistance),
      runCount,
      avgPace,
    });
  });

  return result;
}

/**
 * Calculate month-over-month percentage change
 */
export function calculateMonthOverMonthChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return roundMiles(((current - previous) / previous) * 100);
}

/**
 * Generate insight sentence based on monthly trends
 */
export function generateMonthlyInsight(
  thisMonth: MonthSummary,
  lastMonth: MonthSummary | null
): string {
  if (!lastMonth) {
    return "Starting your journey — every run builds your base.";
  }

  const distanceChange = thisMonth.totalDistance - lastMonth.totalDistance;
  const paceThisMonth = parsePace(thisMonth.avgPace);
  const paceLastMonth = parsePace(lastMonth.avgPace);
  const paceChange = paceThisMonth - paceLastMonth; // positive = slower

  // Distance up, pace stable or faster
  if (distanceChange > 0 && paceChange <= 5) {
    return "You ran more with steady effort — endurance is building.";
  }

  // Distance up, pace slower
  if (distanceChange > 0 && paceChange > 5) {
    return "You added volume — this is base-building, not regression.";
  }

  // Both down
  if (distanceChange < 0 && thisMonth.runCount < lastMonth.runCount) {
    return "Lower volume month — recovery counts, zoom out.";
  }

  // Distance down but pace faster
  if (distanceChange < 0 && paceChange < -5) {
    return "Focused on quality over quantity — smart training.";
  }

  // Similar volume
  if (Math.abs(distanceChange) < 2) {
    return "Consistent month — consistency is the secret to progress.";
  }

  return "Your running is evolving — trust the process.";
}

/**
 * Parse pace string "mm:ss" to seconds
 */
function parsePace(pace: string): number {
  const [minutes, seconds] = pace.split(':').map(Number);
  return minutes * 60 + seconds;
}

/**
 * Round miles to 2 decimal places
 */
function roundMiles(miles: number): number {
  return Math.round(miles * 100) / 100;
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
