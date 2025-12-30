// Center Animation Component
// Displays emoji animation in the center of the dashboard

'use client';

export default function CenterRiveAnimation() {
  return (
    <div className="flex items-center justify-center py-8 my-8">
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        <div className="w-32 h-32 bg-[#1a1f2e] border border-white/10 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-6xl opacity-50">🏃</span>
        </div>
      </div>
    </div>
  );
}
