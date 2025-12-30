// Center Rive Animation Component
// Displays Rive animation in the center of the dashboard

'use client';

import { useState, useEffect } from 'react';

export default function CenterRiveAnimation() {
  const [RiveComponent, setRiveComponent] = useState<any>(null);

  // Load Rive animation
  useEffect(() => {
    const loadRive = async () => {
      try {
        const riveModule = await import('rive-react');
        const { useRive } = riveModule;
        
        // Load from public/assets folder (Next.js serves files from public/)
        const riveResult = useRive({
          src: '/assets/cute_boy_running.riv',
          autoplay: true,
          stateMachines: 'State Machine 1', // Update if your state machine has a different name
        });
        
        setRiveComponent(() => riveResult.RiveComponent);
        console.log('✓ Center Rive animation loaded successfully!');
      } catch (error: any) {
        console.log('⚠️ Rive animation not available:', error.message || error);
      }
    };
    
    loadRive();
  }, []);

  return (
    <div className="flex items-center justify-center py-8 my-8">
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        {RiveComponent ? (
          <div className="w-full h-full transform scale-110">
            <RiveComponent className="w-full h-full" />
          </div>
        ) : (
          // Fallback placeholder
          <div className="w-32 h-32 bg-[#1a1f2e] border border-white/10 rounded-full flex items-center justify-center">
            <span className="text-6xl opacity-50">🏃</span>
          </div>
        )}
      </div>
    </div>
  );
}
