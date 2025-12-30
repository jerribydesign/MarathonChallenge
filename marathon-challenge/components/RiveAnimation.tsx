// Animation Component with emoji placeholder

'use client';

interface RiveAnimationProps {
  src: string;
  className?: string;
  stateMachines?: string;
}

export default function RiveAnimation({ 
  className = 'w-full h-full'
}: RiveAnimationProps) {
  return (
    <div className={`${className} flex items-center justify-center bg-[#1a1f2e]/50 border border-white/10 rounded-full`}>
      <span className="text-6xl opacity-50 animate-bounce">🏃</span>
    </div>
  );
}
