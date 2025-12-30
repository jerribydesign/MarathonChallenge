// Progress card showing miles completed and remaining toward 26.2 goal

'use client';

import { useState, useEffect } from 'react';
import { calculateProgress } from '@/lib/miles';
import RadialGauge from './RadialGauge';

interface ProgressCardProps {
  milesTotal: number;
  goal: number;
  displayName?: string | null;
}

export default function ProgressCard({ milesTotal, goal, displayName }: ProgressCardProps) {
  const [animatedMiles, setAnimatedMiles] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progress = calculateProgress(milesTotal, goal);
  const remaining = Math.max(0, goal - milesTotal);

  // Animate number counting
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = milesTotal / steps;
    const progressIncrement = progress / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedMiles(increment * currentStep);
        setAnimatedProgress(progressIncrement * currentStep);
      } else {
        setAnimatedMiles(milesTotal);
        setAnimatedProgress(progress);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [milesTotal, progress]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
        {displayName ? `${displayName}'s Progress` : 'Your Progress'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left side: Stats */}
        <div className="mb-4 md:mb-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Miles Completed
            </span>
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-all duration-300">
              {animatedMiles.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Miles Remaining
            </span>
            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300">
              {(goal - animatedMiles).toFixed(2)}
            </span>
          </div>

          {/* Animated Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out relative"
              style={{ 
                width: `${Math.min(100, animatedProgress)}%`,
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="text-right text-sm text-gray-600 dark:text-gray-400 transition-all duration-300">
            {animatedProgress.toFixed(1)}% to goal ({goal} miles)
          </div>
        </div>

        {/* Right side: Circular Gauge */}
        <div className="flex justify-center md:justify-end">
          <RadialGauge
            value={animatedProgress}
            label="Progress"
            subtitle={`${animatedMiles.toFixed(1)} / ${goal} mi`}
            size={160}
            strokeWidth={12}
            color="#4f46e5"
            zones={[
              { min: 0, max: 50, color: '#ef4444' }, // Red
              { min: 50, max: 75, color: '#f59e0b' }, // Amber
              { min: 75, max: 100, color: '#10b981' }, // Green
            ]}
            animated={false} // Already animated via animatedProgress
          />
        </div>
      </div>

      {milesTotal >= goal && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded animate-bounce-in">
          🎉 Congratulations! You've reached your monthly goal!
        </div>
      )}
    </div>
  );
}
