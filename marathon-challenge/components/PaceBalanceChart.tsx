// Pace Balance Chart Component
// 2D scatter plot: Consistency Load (X) vs Pace Stress (Y)

'use client';

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
} from 'recharts';
import type { WeeklyBalance } from '@/lib/balance';

interface PaceBalanceChartProps {
  weeklyBalances: WeeklyBalance[];
}

export default function PaceBalanceChart({ weeklyBalances }: PaceBalanceChartProps) {
  // Prepare data for scatter plot
  const chartData = useMemo(() => {
    return weeklyBalances.map(week => ({
      x: week.consistencyLoad,
      y: week.paceStress,
      ...week, // Include all week data for tooltip
    }));
  }, [weeklyBalances]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const weekStart = new Date(data.weekStart);
      const weekEnd = new Date(data.weekEnd);
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-sm font-semibold text-[#1a1f2e] mb-2">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#6b7280]">Distance:</span>
              <span className="text-[#1a1f2e] font-medium">{data.totalDistance.toFixed(1)} mi</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#6b7280]">Runs:</span>
              <span className="text-[#1a1f2e] font-medium">{data.runCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#6b7280]">Time:</span>
              <span className="text-[#1a1f2e] font-medium">
                {Math.floor(data.totalTime / 3600)}h {Math.floor((data.totalTime % 3600) / 60)}m
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#6b7280]">Avg Pace:</span>
              <span className="text-[#1a1f2e] font-medium">{data.avgPace}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="text-[#4b5563] text-xs">
                Balance: <span className="font-semibold capitalize text-[#1a1f2e]">{data.zone}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Zone colors
  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'hold':
        return '#f59e0b'; // amber
      case 'likely':
        return '#10b981'; // green
      case 'stretch':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-[#6b7280] font-medium mb-2">
          Pace Balance Chart
        </div>
        <p className="text-sm text-[#4b5563] leading-relaxed">
          Weekly aggregates: Consistency (X) vs Pace Stress (Y)
        </p>
      </div>

      {/* Confidence Bands Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-[#4b5563]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 opacity-30" />
          <span>Hold (0-40)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-30" />
          <span>Likely (40-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 opacity-30" />
          <span>Stretch (70-100)</span>
        </div>
      </div>

      <div className="h-96 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            
            {/* Confidence Bands - Vertical zones using ReferenceArea */}
            {/* Hold zone (0-40) */}
            <ReferenceArea
              x1={0}
              x2={40}
              y1={0}
              y2={100}
              fill="#f59e0b"
              fillOpacity={0.08}
              stroke="none"
            />
            {/* Likely zone (40-70) */}
            <ReferenceArea
              x1={40}
              x2={70}
              y1={0}
              y2={100}
              fill="#10b981"
              fillOpacity={0.12}
              stroke="none"
            />
            {/* Stretch zone (70-100) */}
            <ReferenceArea
              x1={70}
              x2={100}
              y1={0}
              y2={100}
              fill="#3b82f6"
              fillOpacity={0.08}
              stroke="none"
            />

            <XAxis
              type="number"
              dataKey="x"
              name="Consistency Load"
              domain={[0, 100]}
              label={{ value: 'Consistency Load', position: 'insideBottom', offset: -5 }}
              stroke="#4b5563"
              style={{ fontSize: '13px', fill: '#4b5563', fontWeight: 500 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Pace Stress"
              domain={[0, 100]}
              label={{ value: 'Pace Stress', angle: -90, position: 'insideLeft' }}
              stroke="#4b5563"
              style={{ fontSize: '13px', fill: '#4b5563', fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Weeks" data={chartData} fill="#4f46e5" shape="circle">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getZoneColor(entry.zone)} r={6} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Sustainable Zone Label - Overlay (centered in likely zone) */}
        <div className="absolute top-1/2 left-[55%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-green-500/10 border border-green-500/30 rounded-full w-28 h-36 flex items-center justify-center">
            <div className="text-center px-2">
              <div className="text-xs text-green-700 font-medium leading-tight">
                Progress lives here
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Labels */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-semibold text-[#1a1f2e] mb-1">Hold</div>
          <div className="text-[#6b7280] text-xs">Lower consistency</div>
        </div>
        <div>
          <div className="font-semibold text-[#1a1f2e] mb-1">Likely</div>
          <div className="text-[#6b7280] text-xs">Balanced zone</div>
        </div>
        <div>
          <div className="font-semibold text-[#1a1f2e] mb-1">Stretch</div>
          <div className="text-[#6b7280] text-xs">High consistency</div>
        </div>
      </div>
    </div>
  );
}
