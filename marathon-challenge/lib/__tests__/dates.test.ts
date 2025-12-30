// Simple unit tests for date utilities

import { getMonthStartUnix, getMonthEndUnix, getCurrentMonthYear } from '../dates';

describe('date utilities', () => {
  describe('getMonthStartUnix', () => {
    it('returns start of month in Unix seconds', () => {
      // January 2024, 00:00:00 PST = 2024-01-01T08:00:00Z
      const janStart = getMonthStartUnix(1, 2024);
      expect(janStart).toBeGreaterThan(0);
      
      // Should be start of day in America/Los_Angeles
      const date = new Date(janStart * 1000);
      expect(date.getUTCHours()).toBe(8); // PST is UTC-8
    });
  });

  describe('getMonthEndUnix', () => {
    it('returns end of month in Unix seconds', () => {
      const janEnd = getMonthEndUnix(1, 2024);
      expect(janEnd).toBeGreaterThan(getMonthStartUnix(1, 2024));
      
      // Should be last second of the month
      const date = new Date(janEnd * 1000);
      expect(date.getUTCHours()).toBe(7); // Last second before next month
    });
  });

  describe('getCurrentMonthYear', () => {
    it('returns current month and year', () => {
      const { month, year } = getCurrentMonthYear();
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(year).toBeGreaterThan(2020);
      expect(year).toBeLessThan(2100);
    });
  });
});
