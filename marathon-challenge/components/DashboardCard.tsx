// Premium Dashboard Card Component
// Base card with modern finance/health app aesthetic

'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  hero?: boolean; // Hero card gets larger size
  backgroundImage?: string; // Optional background image URL
}

export default function DashboardCard({ 
  children, 
  className = '', 
  hero = false,
  backgroundImage 
}: DashboardCardProps) {
  const baseClasses = [
    'rounded-3xl',
    'backdrop-blur-sm',
    'transition-all',
    'duration-300',
    'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
    hero ? 'md:col-span-2 md:row-span-2' : '',
    backgroundImage 
      ? 'relative overflow-hidden' 
      : 'bg-white border border-gray-200',
    className,
  ].filter(Boolean).join(' ');

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
      <div className={`relative z-10 ${hero ? 'p-8' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
}
