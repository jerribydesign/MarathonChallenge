// Background animation component with emoji placeholders

'use client';

export default function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Multiple animated instances for background effect */}
      <div className="absolute top-20 left-10 w-32 h-32 opacity-20">
        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30 animate-bounce">
          🏃
        </div>
      </div>
      
      <div className="absolute top-40 right-20 w-40 h-40 opacity-15">
        <div className="w-full h-full flex items-center justify-center text-7xl opacity-20 animate-pulse">
          🏃
        </div>
      </div>
      
      <div className="absolute bottom-32 left-1/4 w-28 h-28 opacity-25">
        <div className="w-full h-full flex items-center justify-center text-5xl opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}>
          🏃
        </div>
      </div>
      
      <div className="absolute bottom-20 right-1/3 w-36 h-36 opacity-18">
        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>
          🏃
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-10">
        <div className="w-full h-full flex items-center justify-center text-8xl opacity-15 animate-bounce" style={{ animationDelay: '1.5s' }}>
          🏃
        </div>
      </div>
    </div>
  );
}
