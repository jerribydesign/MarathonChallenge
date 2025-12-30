// Metric Card Component
// Displays one dominant number with supporting text

'use client';

import DashboardCard from './DashboardCard';

interface MetricCardProps {
  headline: string; // ALL CAPS headline
  value: string | number; // Dominant number
  subtitle?: string; // Small supporting text
  accentColor?: 'green' | 'orange' | 'blue' | 'neutral';
  icon?: React.ReactNode;
  secondaryMetrics?: Array<{
    label: string;
    value: string | number;
  }>;
}

export default function MetricCard({
  headline,
  value,
  subtitle,
  accentColor = 'neutral',
  icon,
  secondaryMetrics,
}: MetricCardProps) {
  const accentColors = {
    green: 'text-[#10b981]',
    orange: 'text-[#f59e0b]',
    blue: 'text-[#3b82f6]',
    neutral: 'text-[#1a1f2e]',
  };

  return (
    <DashboardCard>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">
            {headline}
          </div>
          {icon && (
            <div className="text-[#9ca3af] opacity-60">
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Dominant Number - 60-80% of visual weight */}
      <div className="mb-4">
        <div className={`text-6xl md:text-7xl font-bold ${accentColors[accentColor]} leading-none tracking-tight`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <div className="text-xs text-[#6b7280] mt-2 font-light">
            {subtitle}
          </div>
        )}
      </div>

      {/* Secondary Metrics */}
      {secondaryMetrics && secondaryMetrics.length > 0 && (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          {secondaryMetrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center text-xs">
              <span className="text-[#6b7280] font-light">{metric.label}</span>
              <span className="text-[#1a1f2e] font-medium">
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString() 
                  : metric.value
                }
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
