// Radial Gauge Component
// Circular progress gauge / speedometer-style visualization

'use client';

import { useEffect, useState } from 'react';

interface RadialGaugeProps {
  value: number; // 0-100
  label?: string;
  subtitle?: string;
  size?: number; // diameter in pixels
  strokeWidth?: number;
  min?: number;
  max?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  animated?: boolean;
  zones?: Array<{
    min: number;
    max: number;
    color: string;
  }>;
}

export default function RadialGauge({
  value,
  label,
  subtitle,
  size = 200,
  strokeWidth = 16,
  min = 0,
  max = 100,
  color = '#4f46e5',
  backgroundColor = '#e5e7eb',
  showValue = true,
  animated = true,
  zones = [],
}: RadialGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate value change
  useEffect(() => {
    if (!animated) {
      setAnimatedValue(value);
      return;
    }

    const duration = 1000; // 1 second
    const steps = 60;
    const increment = (value - animatedValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedValue(prev => prev + increment);
      } else {
        setAnimatedValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animated]);

  // Calculate angle for value (0-100 maps to 0-270 degrees, speedometer style)
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const startAngle = -135; // Start at bottom-left
  const endAngle = 135; // End at bottom-right
  const totalAngle = endAngle - startAngle; // 270 degrees

  // Clamp value to min/max range
  const clampedValue = Math.max(min, Math.min(max, animatedValue));
  const normalizedValue = ((clampedValue - min) / (max - min)) * 100;
  const currentAngle = startAngle + (normalizedValue / 100) * totalAngle;

  // Convert angle to radians
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Calculate arc path
  const getArcPath = (start: number, end: number) => {
    const startRad = toRadians(start);
    const endRad = toRadians(end);
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const largeArcFlag = end - start > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Get color for current value based on zones
  const getCurrentColor = () => {
    if (zones.length > 0) {
      for (const zone of zones) {
        if (clampedValue >= zone.min && clampedValue <= zone.max) {
          return zone.color;
        }
      }
    }
    return color;
  };

  // Calculate needle position
  const needleAngle = toRadians(currentAngle);
  const needleLength = radius * 0.85;
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background arc */}
          <path
            d={getArcPath(startAngle, endAngle)}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="opacity-30 dark:opacity-20"
          />

          {/* Zone arcs */}
          {zones.map((zone, index) => {
            const zoneStart = startAngle + ((zone.min - min) / (max - min)) * totalAngle;
            const zoneEnd = startAngle + ((zone.max - min) / (max - min)) * totalAngle;
            return (
              <path
                key={index}
                d={getArcPath(zoneStart, zoneEnd)}
                fill="none"
                stroke={zone.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="opacity-40"
              />
            );
          })}

          {/* Value arc */}
          <path
            d={getArcPath(startAngle, currentAngle)}
            fill="none"
            stroke={getCurrentColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(79, 70, 229, 0.3))',
            }}
          />

          {/* Needle */}
          <g>
            <line
              x1={centerX}
              y1={centerY}
              x2={needleX}
              y2={needleY}
              stroke={getCurrentColor()}
              strokeWidth={3}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.2))',
              }}
            />
            {/* Needle center dot */}
            <circle
              cx={centerX}
              cy={centerY}
              r={6}
              fill={getCurrentColor()}
              className="transition-all duration-300"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={3}
              fill="white"
            />
          </g>
        </svg>

        {/* Center value display */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-3xl font-bold text-[#1a1f2e]">
              {Math.round(clampedValue)}
            </div>
            {max !== 100 && (
              <div className="text-xs text-[#6b7280] mt-1">
                / {max}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Label and subtitle */}
      {(label || subtitle) && (
        <div className="mt-4 text-center">
          {label && (
            <div className="text-base font-medium text-[#1a1f2e] leading-tight">
              {label}
            </div>
          )}
          {subtitle && (
            <div className="text-sm text-[#6b7280] mt-1.5 leading-relaxed">
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
