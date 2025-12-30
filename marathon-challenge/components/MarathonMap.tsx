// Animated NYC Marathon map showing runner position

'use client';

import { useState, useEffect } from 'react';

interface MarathonMapProps {
  milesCompleted: number;
  totalMiles: number; // 26.2 for marathon
}

// Approximate path coordinates for NYC Marathon route (normalized 0-1)
// These represent key points along the route based on the actual NYC Marathon course
// Start: Verrazzano Bridge (Brooklyn) → Through Brooklyn → Manhattan → Harlem loop → Queens → Finish: Central Park
const marathonPath = [
  { x: 0.12, y: 0.88 }, // Start: Verrazzano Bridge (southern Brooklyn)
  { x: 0.20, y: 0.82 }, // Through Brooklyn (4th Ave)
  { x: 0.28, y: 0.75 }, // Continuing through Brooklyn
  { x: 0.35, y: 0.68 }, // Approaching Manhattan Bridge area
  { x: 0.42, y: 0.60 }, // Entering Manhattan (Lower East Side)
  { x: 0.48, y: 0.52 }, // Midtown Manhattan (1st Ave)
  { x: 0.55, y: 0.45 }, // Upper Manhattan
  { x: 0.62, y: 0.38 }, // Harlem area (north)
  { x: 0.68, y: 0.32 }, // Harlem loop (northernmost point)
  { x: 0.72, y: 0.36 }, // Heading back south through Harlem
  { x: 0.76, y: 0.42 }, // Through Upper Manhattan
  { x: 0.80, y: 0.48 }, // Approaching Queens Bridge
  { x: 0.85, y: 0.52 }, // Through Queens
  { x: 0.90, y: 0.55 }, // Continuing through Queens
  { x: 0.95, y: 0.58 }, // Final approach
  { x: 0.98, y: 0.60 }, // Finish line (Central Park)
];

// Interpolate position along the path based on progress
function getPositionOnPath(progress: number): { x: number; y: number } {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const pathIndex = clampedProgress * (marathonPath.length - 1);
  const lowerIndex = Math.floor(pathIndex);
  const upperIndex = Math.min(lowerIndex + 1, marathonPath.length - 1);
  const t = pathIndex - lowerIndex;

  const lower = marathonPath[lowerIndex];
  const upper = marathonPath[upperIndex];

  return {
    x: lower.x + (upper.x - lower.x) * t,
    y: lower.y + (upper.y - lower.y) * t,
  };
}

export default function MarathonMap({ milesCompleted, totalMiles }: MarathonMapProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progress = milesCompleted / totalMiles;
  const position = getPositionOnPath(animatedProgress);

  // Animate progress smoothly
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = progress / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedProgress(increment * currentStep);
      } else {
        setAnimatedProgress(progress);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [progress]);

  // Convert normalized coordinates (0-1) to percentage for positioning
  const leftPercent = position.x * 100;
  const topPercent = position.y * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 relative overflow-hidden">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Marathon Progress Map
      </h2>
      
      <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
        {/* Map background - using the NYC Marathon map image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/assets/marathon-map.png")',
            opacity: 0.8,
          }}
        />
        {/* Overlay for better visibility */}
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20" />
        
        {/* Marathon route path */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <path
            d={`M ${marathonPath.map(p => `${p.x * 100}% ${p.y * 100}%`).join(' L ')}`}
            fill="none"
            stroke="#1e40af"
            strokeWidth="4"
            strokeDasharray="5,5"
            opacity="0.6"
            className="animate-pulse"
          />
        </svg>

        {/* Start marker */}
        <div
          className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg z-10"
          style={{
            left: `${marathonPath[0].x * 100}%`,
            top: `${marathonPath[0].y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
        </div>

        {/* Finish marker */}
        <div
          className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg z-10"
          style={{
            left: `${marathonPath[marathonPath.length - 1].x * 100}%`,
            top: `${marathonPath[marathonPath.length - 1].y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
        </div>

        {/* Animated running figure with Rive */}
        <div
          className="absolute z-20 transition-all duration-1000 ease-out"
          style={{
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            {/* Emoji animation container */}
            <div className="w-20 h-20 relative flex items-center justify-center">
              <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-bounce relative">
                <span className="text-white text-xl">🏃</span>
              </div>
            </div>
            
            {/* Pulse effect ring */}
            <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-ping opacity-30" style={{ animationDuration: '2s', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '2.5rem', height: '2.5rem' }} />
            
            {/* Progress indicator tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap animate-fade-in">
              <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border-2 border-indigo-500">
                {milesCompleted.toFixed(1)} / {totalMiles} mi
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900 dark:border-t-gray-100 mx-auto" />
            </div>
          </div>
        </div>

        {/* Progress trail */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          <path
            d={`M ${marathonPath
              .slice(0, Math.floor(animatedProgress * (marathonPath.length - 1)) + 1)
              .map(p => `${p.x * 100}% ${p.y * 100}%`)
              .join(' L ')}`}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            opacity="0.8"
          />
        </svg>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Start (Brooklyn)</span>
        </div>
        <div className="text-center">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {((animatedProgress * totalMiles) / totalMiles * 100).toFixed(1)}% Complete
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>Finish (Central Park)</span>
        </div>
      </div>
    </div>
  );
}
