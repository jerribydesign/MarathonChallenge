// Hero Card Component
// Large card with atmospheric background image and Rive animation

'use client';

import dynamic from 'next/dynamic';

// Dynamically import Rive animation wrapper to avoid SSR issues
// This ensures useRive hook is only called on client side
const RiveAnimationWrapper = dynamic(
  () => import('@/components/RiveAnimationWrapper'),
  { 
    ssr: false,
      loading: () => (
        <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          <div className="w-32 h-32 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
            <span className="text-6xl opacity-50">🏃</span>
          </div>
        </div>
      )
  }
);

interface HeroCardProps {
  greeting: string; // e.g., "GOOD MORNING"
  primaryMetric: {
    label: string; // ALL CAPS
    value: string | number;
    unit?: string;
  };
  context?: string; // e.g., "LAST UPDATED 08:30 GMT"
  backgroundImage?: string;
  accentColor?: 'green' | 'orange' | 'blue';
}

export default function HeroCard({
  greeting,
  primaryMetric,
  context,
  backgroundImage,
  accentColor = 'blue',
}: HeroCardProps) {
  const accentColors = {
    green: 'text-[#10b981]',
    orange: 'text-[#f59e0b]',
    blue: 'text-[#3b82f6]',
  };

  const baseClasses = `
    rounded-3xl
    md:col-span-2 lg:row-span-2
    backdrop-blur-sm
    transition-all duration-300
    ${backgroundImage 
      ? 'relative overflow-hidden' 
      : 'bg-white border border-gray-200'
    }
    shadow-[0_8px_32px_rgba(0,0,0,0.08)]
  `;

  return (
    <div className={baseClasses}>
      {backgroundImage && (
        <>
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Gradient Overlay - light at bottom for text legibility */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-white/95 via-white/60 to-white/40" />
        </>
      )}
      <div className="relative z-10 p-8 flex flex-col h-full min-h-[400px]">
        {/* Greeting */}
        <div className="mb-8">
          <div className="text-sm uppercase tracking-widest text-[#1a1f2e] font-medium mb-1">
            {greeting}
          </div>
          {context && (
            <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-light">
              {context}
            </div>
          )}
        </div>

        {/* Rive Animation - Center of card */}
        <div className="flex-1 flex items-center justify-center my-4">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            <RiveAnimationWrapper 
              src="/assets/cute_boy_running.riv"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Primary Metric */}
        <div className="mt-auto">
          <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-3">
            {primaryMetric.label}
          </div>
          <div className={`text-7xl md:text-8xl font-bold ${accentColors[accentColor]} leading-none tracking-tight`}>
            {typeof primaryMetric.value === 'number' 
              ? primaryMetric.value.toLocaleString() 
              : primaryMetric.value
            }
            {primaryMetric.unit && (
              <span className="text-4xl md:text-5xl ml-2 opacity-80">
                {primaryMetric.unit}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
