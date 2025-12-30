// Date utility functions for month boundaries

/**
 * Get the start of a month in Unix seconds (start of day in America/Los_Angeles timezone)
 */
export function getMonthStartUnix(month: number, year: number): number {
  // Create date in America/Los_Angeles timezone
  const date = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00-08:00`);
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get the end of a month in Unix seconds (end of day in America/Los_Angeles timezone)
 */
export function getMonthEndUnix(month: number, year: number): number {
  // Get first day of next month, then subtract 1 second
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const date = new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00-08:00`);
  return Math.floor(date.getTime() / 1000) - 1;
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  // Convert to America/Los_Angeles timezone
  const laDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return {
    month: laDate.getMonth() + 1,
    year: laDate.getFullYear(),
  };
}

/**
 * Get month start and end Unix timestamps for current month
 */
export function getCurrentMonthRange(): { start: number; end: number } {
  const { month, year } = getCurrentMonthYear();
  return {
    start: getMonthStartUnix(month, year),
    end: getMonthEndUnix(month, year),
  };
}
