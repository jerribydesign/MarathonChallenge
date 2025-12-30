// Monthly Pace Change Chart Component
// Shows month-over-month pace change (rate of change) over time

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MonthlyPaceChange } from '@/lib/paceChange';
import { formatPaceChange, formatPercentChange } from '@/lib/paceChange';

interface MonthlyPaceChangeChartProps {
  paceChanges: MonthlyPaceChange[];
}

export default function MonthlyPaceChangeChart({ paceChanges }: MonthlyPaceChangeChartProps) {
  // Prepare data for chart with previous month pace
  const chartData = paceChanges.map((change, index) => {
    // Calculate previous month pace: currentPace - change = previousPace
    const currentPaceSeconds = change.avgPaceSeconds;
    const changeSeconds = change.paceChangeSeconds;
    const previousPaceSeconds = currentPaceSeconds - changeSeconds;
    const prevMinutes = Math.floor(previousPaceSeconds / 60);
    const prevSeconds = Math.floor(previousPaceSeconds % 60);
    const previousMonthPace = `${prevMinutes}:${String(prevSeconds).padStart(2, '0')}`;

    return {
      month: change.month,
      monthName: change.monthName,
      paceChange: change.paceChangeSeconds, // Y-axis: change in seconds
      avgPace: change.avgPaceFormatted,
      previousMonthPace,
      paceChangeFormatted: formatPaceChange(change.paceChangeSeconds),
      paceChangePercent: change.paceChangePercent,
      totalDistance: change.totalDistance,
      runCount: change.runCount,
      hasEnoughData: change.hasEnoughData,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.monthName}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Avg Pace:</span>
              <span className="text-gray-900 dark:text-white font-medium">{data.avgPace}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Previous Month:</span>
              <span className="text-gray-900 dark:text-white font-medium">{data.previousMonthPace}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Change:</span>
                <span className={`font-medium ${
                  data.paceChange < 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : data.paceChange > 0 
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {data.paceChangeFormatted} ({formatPercentChange(data.paceChangePercent)})
                </span>
              </div>
            </div>
            {!data.hasEnoughData && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                Limited data ({data.runCount} run{data.runCount !== 1 ? 's' : ''})
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (paceChanges.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
        <p className="text-[#6b7280] text-center">
          Need at least 2 months of data to show pace changes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">
          MONTHLY PACE CHANGE
        </div>
        <p className="text-sm text-[#6b7280] italic mb-1 font-light">
          This shows how your average pace changed month to month.
        </p>
        <p className="text-sm text-[#6b7280] italic font-light">
          Single runs fluctuate. Trends matter.
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            
            {/* Zero line (baseline) */}
            <ReferenceLine 
              y={0} 
              stroke="#6b7280" 
              strokeWidth={1.5}
              strokeDasharray="5 5"
              label={{ value: 'No change', position: 'right', fill: '#6b7280', fontSize: 12 }}
            />
            
            <XAxis
              dataKey="monthName"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              label={{ value: 'Pace Change (seconds)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => {
                // Format as "+0:15" or "-0:10"
                const absValue = Math.abs(value);
                const minutes = Math.floor(absValue / 60);
                const seconds = Math.floor(absValue % 60);
                const sign = value < 0 ? '-' : value > 0 ? '+' : '';
                return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Line for pace change */}
            <Line
              type="monotone"
              dataKey="paceChange"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={(props: any) => {
                const data = props.payload;
                // Muted style for months with insufficient data
                if (data && !data.hasEnoughData) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={3}
                      fill="#9ca3af"
                      stroke="#9ca3af"
                      strokeWidth={1}
                      opacity={0.5}
                    />
                  );
                }
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={4}
                    fill="#4f46e5"
                    stroke="#4f46e5"
                    strokeWidth={1}
                  />
                );
              }}
              activeDot={{ r: 6, fill: '#4f46e5' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend/Explanation */}
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600" />
          <span>Below zero line = faster than last month (improvement)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Above zero line = slower than last month</span>
        </div>
      </div>
    </div>
  );
}
