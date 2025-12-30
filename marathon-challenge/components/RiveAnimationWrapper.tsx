// Rive Animation Wrapper Component
// This component must be client-side only and uses useRive hook at top level

'use client';

import { useRive, useStateMachineInput } from 'rive-react';
import { useEffect } from 'react';

interface RiveAnimationWrapperProps {
  src: string;
  className?: string;
  stateMachines?: string | null; // null means try without state machine
}

export default function RiveAnimationWrapper({ 
  src, 
  className = 'w-full h-full',
  stateMachines = 'State Machine 1'
}: RiveAnimationWrapperProps) {
  // useRive must be called at component top level (React hooks rule)
  // Try with state machine first, fallback to no state machine
  const { RiveComponent, rive } = useRive({
    src,
    autoplay: true,
    ...(stateMachines ? { stateMachines } : {}), // Only include if stateMachines is provided
  });

  // Try to get inputs and ensure animation is playing
  useEffect(() => {
    if (rive) {
      console.log('Rive instance loaded:', rive);
      console.log('Rive isPlaying:', rive.isPlaying);
      
      // Try to find and set any speed/play inputs if state machine exists
      if (stateMachines) {
        try {
          const stateMachine = rive.stateMachineInputs(stateMachines);
          console.log('State machine inputs:', stateMachine);
          
          // Look for common input names
          const speedInput = stateMachine?.find((input: any) => 
            input.name.toLowerCase().includes('speed') || 
            input.name.toLowerCase().includes('play')
          );
          
          if (speedInput) {
            console.log('Found speed input:', speedInput);
            speedInput.value = 1; // Set speed to 1 (normal speed)
          }
        } catch (error) {
          console.log('Could not access state machine inputs:', error);
        }
      }
      
      // Ensure animation is playing - try multiple methods
      try {
        if (rive.isPlaying === false) {
          rive.play();
        }
        // Also try play() directly
        rive.play();
        console.log('Called rive.play()');
      } catch (error) {
        console.log('Could not call play():', error);
      }
    }
  }, [rive, stateMachines]);

  if (!RiveComponent) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border border-gray-200 rounded-full`}>
        <span className="text-6xl opacity-50">🏃</span>
      </div>
    );
  }

  return <RiveComponent className={className} />;
}
