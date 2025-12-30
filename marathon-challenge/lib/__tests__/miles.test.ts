// Simple unit tests for miles conversion utilities

import { metersToMiles, metersToMilesRounded, calculateProgress } from '../miles';

describe('miles utilities', () => {
  describe('metersToMiles', () => {
    it('converts meters to miles correctly', () => {
      // 1 mile = 1609.344 meters
      expect(metersToMiles(1609.344)).toBeCloseTo(1, 5);
      expect(metersToMiles(3218.688)).toBeCloseTo(2, 5);
      expect(metersToMiles(0)).toBe(0);
    });
  });

  describe('metersToMilesRounded', () => {
    it('rounds to 2 decimal places', () => {
      expect(metersToMilesRounded(1609.344)).toBe(1);
      expect(metersToMilesRounded(1609.344 * 1.5)).toBe(1.5);
      expect(metersToMilesRounded(1609.344 * 2.123)).toBe(2.12);
    });
  });

  describe('calculateProgress', () => {
    it('calculates percentage correctly', () => {
      expect(calculateProgress(13.1, 26.2)).toBe(50);
      expect(calculateProgress(26.2, 26.2)).toBe(100);
      expect(calculateProgress(0, 26.2)).toBe(0);
      expect(calculateProgress(30, 26.2)).toBe(100); // caps at 100%
      expect(calculateProgress(-5, 26.2)).toBe(0); // minimum 0%
    });
  });
});
