// Miles conversion utilities

const METERS_TO_MILES = 1609.344;

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return meters / METERS_TO_MILES;
}

/**
 * Round to 2 decimal places
 */
export function roundMiles(miles: number): number {
  return Math.round(miles * 100) / 100;
}

/**
 * Convert meters to miles and round to 2 decimal places
 */
export function metersToMilesRounded(meters: number): number {
  return roundMiles(metersToMiles(meters));
}

/**
 * Calculate percentage progress toward goal (26.2 miles)
 */
export function calculateProgress(miles: number, goal: number = 26.2): number {
  const percentage = (miles / goal) * 100;
  return Math.min(100, Math.max(0, roundMiles(percentage)));
}
