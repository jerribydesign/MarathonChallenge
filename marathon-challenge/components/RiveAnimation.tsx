// Rive Animation Component
// Uses useRive hook properly at top level

'use client';

import { useRive } from 'rive-react';

interface RiveAnimationProps {
  src: string;
  className?: string;
  stateMachines?: string;
}

export default function RiveAnimation({ 
  src, 
  className = 'w-full h-full',
  stateMachines = 'State Machine 1'
}: RiveAnimationProps) {
  // Call hook at top level - no try-catch around hook
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    stateMachines,
  });

  if (!RiveComponent) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#1a1f2e]/50 border border-white/10 rounded-full`}>
        <span className="text-6xl opacity-50">🏃</span>
      </div>
    );
  }

  return <RiveComponent className={className} />;
}
