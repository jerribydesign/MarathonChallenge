// Monthly Pace Change utilities
// Computes month-over-month pace changes (rate of change)

import { groupActivitiesByMonth, type Activity, type MonthSummary } from './zoomOut';

export interface MonthlyPaceChange {
  month: string; // "2025-01"
  monthName: string; // "Jan 2025"
  avgPaceSeconds: number; // seconds per mile/km
  avgPaceFormatted: string; // "mm:ss"
  paceChangeSeconds: number; // change from previous month (seconds)
  paceChangePercent: number; // percentage change
  totalDistance: number;
  totalTime: number; // seconds
  runCount: number;
  hasEnoughData: boolean; // true if >= 2 runs
}

/**
 * Calculate monthly stats with pace in seconds
 * Returns pace as seconds per unit (not formatted string)
 */
function monthlyStats(monthActivities: Activity[]): {
  totalDistance: number;
  totalTimeSeconds: number;
  avgPaceSecondsPerUnit: number;
} {
  if (monthActivities.length === 0) {
    return {
      totalDistance: 0,
      totalTimeSeconds: 0,
      avgPaceSecondsPerUnit: 0,
    };
  }

  const totalDistance = monthActivities.reduce((sum, a) => sum + a.distance_miles, 0);
  const totalTimeSeconds = monthActivities.reduce((sum, a) => sum + a.moving_time, 0);

  // IMPORTANT: Calculate pace correctly from totals
  // avgPace = totalTimeSeconds / totalDistance
  const avgPaceSecondsPerUnit = totalDistance > 0 ? totalTimeSeconds / totalDistance : 0;

  return {
    totalDistance: roundMiles(totalDistance),
    totalTimeSeconds,
    avgPaceSecondsPerUnit,
  };
}

/**
 * Format seconds to "mm:ss" pace string
 */
function formatPace(seconds: number): string {
  if (seconds === 0 || !isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format month key to display name
 */
function formatMonthName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Calculate month-over-month pace changes
 * Returns array of MonthlyPaceChange, starting from second month
 * (first month has no previous month to compare)
 */
export function calculateMonthlyPaceChanges(
  activities: Activity[],
  timezone: string = 'America/Los_Angeles'
): MonthlyPaceChange[] {
  if (activities.length === 0) return [];

  // Group activities by month
  const monthlySummaries = groupActivitiesByMonth(activities);

  if (monthlySummaries.length < 2) {
    // Need at least 2 months to show changes
    return [];
  }

  // Get raw activities grouped by month for stats calculation
  const monthMap = new Map<string, Activity[]>();
  activities.forEach(activity => {
    const date = new Date(activity.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey)!.push(activity);
  });

  const result: MonthlyPaceChange[] = [];

  // Process each month starting from the second one
  for (let i = 1; i < monthlySummaries.length; i++) {
    const currentMonth = monthlySummaries[i];
    const previousMonth = monthlySummaries[i - 1];

    // Get raw activities for stats
    const currentActivities = monthMap.get(currentMonth.month) || [];
    const previousActivities = monthMap.get(previousMonth.month) || [];

    // Calculate stats
    const currentStats = monthlyStats(currentActivities);
    const previousStats = monthlyStats(previousActivities);

    // Skip if either month has no data or zero distance
    if (currentStats.totalDistance === 0 || previousStats.totalDistance === 0) {
      continue;
    }

    // Calculate pace change
    // Negative change = faster (improvement)
    // Positive change = slower (regression)
    const paceChangeSeconds = currentStats.avgPaceSecondsPerUnit - previousStats.avgPaceSecondsPerUnit;

    // Calculate percentage change
    // If previous pace is 0, skip
    if (previousStats.avgPaceSecondsPerUnit === 0) {
      continue;
    }

    const paceChangePercent = (paceChangeSeconds / previousStats.avgPaceSecondsPerUnit) * 100;

    // Check if month has enough data (>= 2 runs)
    const hasEnoughData = currentActivities.length >= 2;

    result.push({
      month: currentMonth.month,
      monthName: formatMonthName(currentMonth.month),
      avgPaceSeconds: currentStats.avgPaceSecondsPerUnit,
      avgPaceFormatted: formatPace(currentStats.avgPaceSecondsPerUnit),
      paceChangeSeconds: roundMiles(paceChangeSeconds),
      paceChangePercent: roundMiles(paceChangePercent),
      totalDistance: currentStats.totalDistance,
      totalTime: currentStats.totalTimeSeconds,
      runCount: currentActivities.length,
      hasEnoughData,
    });
  }

  return result;
}

/**
 * Format pace change for display
 * Returns formatted string like "-0:15" (faster) or "+0:10" (slower)
 */
export function formatPaceChange(paceChangeSeconds: number): string {
  const absSeconds = Math.abs(paceChangeSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = Math.floor(absSeconds % 60);
  const sign = paceChangeSeconds < 0 ? '-' : '+';
  return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format percentage change for display
 */
export function formatPercentChange(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}

/**
 * Round to 2 decimal places
 */
function roundMiles(value: number): number {
  return Math.round(value * 100) / 100;
}
