// Zoom Out Dashboard Component
// Shows long-term trends, intentionally hides single-run details

'use client';

import { useMemo } from 'react';
import {
  groupActivitiesByMonth,
  groupActivitiesByWeek,
  rollingWindowStats,
  calculateMonthOverMonthChange,
  generateMonthlyInsight,
  formatTotalTime,
  type Activity,
  type MonthSummary,
  type WeekSummary,
} from '@/lib/zoomOut';
import {
  calculateMonthlyPaceChanges,
  type MonthlyPaceChange,
} from '@/lib/paceChange';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import MonthlyPaceChangeChart from './MonthlyPaceChangeChart';
import DashboardCard from './DashboardCard';
import MetricCard from './MetricCard';

interface ZoomOutDashboardProps {
  activities: Activity[];
}

export default function ZoomOutDashboard({ activities }: ZoomOutDashboardProps) {
  // Calculate aggregations
  const monthlyData = useMemo(() => groupActivitiesByMonth(activities), [activities]);
  const weeklyData = useMemo(() => groupActivitiesByWeek(activities), [activities]);
  const rollingData = useMemo(() => rollingWindowStats(activities, 30), [activities]);
  const paceChanges = useMemo(() => calculateMonthlyPaceChanges(activities), [activities]);

  // Get current and last month
  const thisMonth = monthlyData[monthlyData.length - 1];
  const lastMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : null;

  // Get last 8 weeks
  const last8Weeks = weeklyData.slice(-8);

  // Find most consistent and highest volume weeks
  const mostConsistentWeek = last8Weeks.reduce((best, week) => {
    if (!best || week.runCount > best.runCount) return week;
    return best;
  }, null as WeekSummary | null);

  const highestVolumeWeek = last8Weeks.reduce((best, week) => {
    if (!best || week.totalDistance > best.totalDistance) return week;
    return best;
  }, null as WeekSummary | null);

  // Generate insight
  const insight = thisMonth && lastMonth
    ? generateMonthlyInsight(thisMonth, lastMonth)
    : "Starting your journey — every run builds your base.";

  // Format month name
  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format week label
  const formatWeekLabel = (weekStart: string) => {
    const date = new Date(weekStart);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-12 text-center">
        <h1 className="text-2xl uppercase tracking-wider text-[#1a1f2e] font-medium mb-4">
          Zoom Out
        </h1>
        <p className="text-[#6b7280] mb-6">
          No activities found for this period — sync Strava to see your long-term trends.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs uppercase tracking-wider font-medium py-2 px-4 rounded-xl transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl uppercase tracking-wider text-[#1a1f2e] font-medium mb-2">
          Zoom Out
        </h1>
        <p className="text-lg text-[#6b7280] italic font-light">
          One run is noise. Months are signal.
        </p>
      </div>

      {/* Monthly Insight */}
      {thisMonth && (
        <DashboardCard>
          <div className="border-l-4 border-[#3b82f6] pl-4">
            <p className="text-[#1a1f2e] text-lg leading-relaxed font-light">
              {insight}
            </p>
          </div>
        </DashboardCard>
      )}

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* This Month */}
        {thisMonth && (
          <MetricCard
            headline={`THIS MONTH - ${formatMonthName(thisMonth.month).toUpperCase()}`}
            value={thisMonth.totalDistance.toFixed(1)}
            subtitle="miles"
            accentColor="green"
            secondaryMetrics={[
              { label: 'Time', value: formatTotalTime(thisMonth.totalTime) },
              { label: 'Runs', value: thisMonth.runCount },
              { label: 'Avg Pace', value: thisMonth.avgPace },
            ]}
          />
        )}

        {/* Last Month */}
        {lastMonth && (
          <MetricCard
            headline={`LAST MONTH - ${formatMonthName(lastMonth.month).toUpperCase()}`}
            value={lastMonth.totalDistance.toFixed(1)}
            subtitle="miles"
            accentColor="blue"
            secondaryMetrics={[
              { label: 'Time', value: formatTotalTime(lastMonth.totalTime) },
              { label: 'Runs', value: lastMonth.runCount },
              { label: 'Avg Pace', value: lastMonth.avgPace },
              ...(thisMonth ? [
                { 
                  label: 'Distance change', 
                  value: `${calculateMonthOverMonthChange(thisMonth.totalDistance, lastMonth.totalDistance) >= 0 ? '+' : ''}${calculateMonthOverMonthChange(thisMonth.totalDistance, lastMonth.totalDistance).toFixed(0)}%` 
                },
                { 
                  label: 'Run count change', 
                  value: `${calculateMonthOverMonthChange(thisMonth.runCount, lastMonth.runCount) >= 0 ? '+' : ''}${calculateMonthOverMonthChange(thisMonth.runCount, lastMonth.runCount).toFixed(0)}%` 
                },
              ] : []),
            ]}
          />
        )}
      </div>

      {/* Rolling Trends (30-day) */}
      <DashboardCard>
        <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-6">
          30-DAY ROLLING TRENDS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">Distance</div>
            <div className="text-4xl font-bold text-[#10b981] leading-none">
              {rollingData.length > 0 ? rollingData[rollingData.length - 1].distance.toFixed(1) : '0.0'}
            </div>
            <div className="text-xs text-[#6b7280] mt-2 font-light">miles</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">Run Count</div>
            <div className="text-4xl font-bold text-[#3b82f6] leading-none">
              {rollingData.length > 0 ? rollingData[rollingData.length - 1].runCount : 0}
            </div>
            <div className="text-xs text-[#6b7280] mt-2 font-light">runs</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">Avg Pace</div>
            <div className="text-4xl font-bold text-[#1a1f2e] leading-none">
              {rollingData.length > 0 ? rollingData[rollingData.length - 1].avgPace : '0:00'}
            </div>
            <div className="text-xs text-[#6b7280] mt-2 font-light">per mile</div>
          </div>
        </div>
        <div className="space-y-6">
          {/* Distance Chart */}
          <div className="h-48">
            <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">Distance</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollingData.slice(-60)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value.toFixed(1)} mi`, 'Distance']}
                />
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Run Count Chart */}
          <div className="h-48">
            <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">Run Count</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rollingData.slice(-60)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value, 'Runs']}
                />
                <Line
                  type="monotone"
                  dataKey="runCount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashboardCard>

      {/* Monthly Pace Change Chart */}
      {paceChanges.length > 0 && (
        <MonthlyPaceChangeChart paceChanges={paceChanges} />
      )}

      {/* Weekly Consistency (Last 8 Weeks) */}
      <DashboardCard>
        <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-6">
          WEEKLY CONSISTENCY (LAST 8 WEEKS)
        </div>
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last8Weeks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="weekStart"
                tickFormatter={formatWeekLabel}
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
                labelFormatter={(value) => {
                  const week = last8Weeks.find(w => w.weekStart === value);
                  return week ? `${formatWeekLabel(week.weekStart)} - ${formatWeekLabel(week.weekEnd)}` : value;
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'distance') return [`${value.toFixed(1)} mi`, 'Distance'];
                  if (name === 'runCount') return [value, 'Runs'];
                  return [value, name];
                }}
              />
              <Bar
                dataKey="totalDistance"
                fill="#10b981"
                name="distance"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {mostConsistentWeek && (
            <div className="text-xs">
              <span className="text-[#6b7280] font-light">Most consistent week: </span>
              <span className="text-[#1a1f2e] font-medium">
                {mostConsistentWeek.runCount} runs
              </span>
            </div>
          )}
          {highestVolumeWeek && (
            <div className="text-xs">
              <span className="text-[#6b7280] font-light">Highest volume week: </span>
              <span className="text-[#1a1f2e] font-medium">
                {highestVolumeWeek.totalDistance.toFixed(1)} mi
              </span>
            </div>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
