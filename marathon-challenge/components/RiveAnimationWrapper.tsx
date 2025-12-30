// Animation Wrapper Component with emoji placeholder

'use client';

interface RiveAnimationWrapperProps {
  src: string;
  className?: string;
  stateMachines?: string | null;
}

export default function RiveAnimationWrapper({ 
  className = 'w-full h-full'
}: RiveAnimationWrapperProps) {
  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 border border-gray-200 rounded-full`}>
      <span className="text-6xl opacity-50 animate-bounce">🏃</span>
    </div>
  );
}
