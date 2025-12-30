// Balance Dashboard Component
// Shows Pace Balance Chart with weekly aggregates

'use client';

import { useMemo } from 'react';
import {
  groupActivitiesByWeek,
  rollingBaseline,
  weeklyStats,
  generateBalanceInsight,
  type Activity,
  type WeeklyBalance,
} from '@/lib/balance';
import PaceBalanceChart from './PaceBalanceChart';
import RadialGauge from './RadialGauge';
import DashboardCard from './DashboardCard';

interface BalanceDashboardProps {
  activities: Activity[];
}

export default function BalanceDashboard({ activities }: BalanceDashboardProps) {
  // Calculate weekly balances
  const weeklyBalances = useMemo(() => {
    if (activities.length === 0) return [];

    // Group activities by week
    const weekData = groupActivitiesByWeek(activities);
    
    // Get last 12 weeks
    const last12Weeks = weekData.slice(-12);
    
    // Calculate baseline pace (30-day rolling)
    const baselinePace = rollingBaseline(activities, 30);
    
    // Calculate balance for each week
    const balances: WeeklyBalance[] = [];
    
    last12Weeks.forEach((week, index) => {
      // Get previous weeks for stability comparison
      const previousWeeks = index > 0 ? last12Weeks.slice(0, index) : [];
      
      const balance = weeklyStats(week, baselinePace, previousWeeks);
      balances.push(balance);
    });
    
    return balances;
  }, [activities]);

  // Get current week insight
  const insight = useMemo(() => {
    if (weeklyBalances.length === 0) return "Sync Strava to see your training balance.";
    
    const currentWeek = weeklyBalances[weeklyBalances.length - 1];
    const previousWeeks = weeklyBalances.slice(0, -1);
    
    return generateBalanceInsight(currentWeek, previousWeeks);
  }, [weeklyBalances]);

  if (activities.length === 0) {
    return (
      <DashboardCard>
        <div className="text-center py-12">
          <h1 className="text-3xl font-light text-[#1a1f2e] mb-4">
            Balance
          </h1>
          <p className="text-[#4b5563] text-base leading-relaxed mb-6 max-w-md mx-auto">
            No activities found for this period — sync Strava to see your training balance.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-[#1a1f2e] hover:bg-[#2d3441] text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insight Card */}
      {weeklyBalances.length > 0 && (
        <DashboardCard>
          <div className="text-xs uppercase tracking-wider text-[#6b7280] font-medium mb-3">
            Weekly Insight
          </div>
          <p className="text-[#1a1f2e] text-lg leading-relaxed font-light">
            {insight}
          </p>
        </DashboardCard>
      )}

      {/* Current Week Gauges */}
      {weeklyBalances.length > 0 && (() => {
        const currentWeek = weeklyBalances[weeklyBalances.length - 1];
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consistency Load Gauge */}
            <DashboardCard>
              <RadialGauge
                value={currentWeek.consistencyLoad}
                label="Consistency Load"
                subtitle="Repeatability score"
                size={180}
                strokeWidth={14}
                zones={[
                  { min: 0, max: 40, color: '#f59e0b' }, // Hold - amber
                  { min: 40, max: 70, color: '#10b981' }, // Likely - green
                  { min: 70, max: 100, color: '#3b82f6' }, // Stretch - blue
                ]}
                animated={true}
              />
            </DashboardCard>

            {/* Pace Stress Gauge */}
            <DashboardCard>
              <RadialGauge
                value={currentWeek.paceStress}
                label="Pace Stress"
                subtitle="Intensity relative to baseline"
                size={180}
                strokeWidth={14}
                color="#ef4444"
                zones={[
                  { min: 0, max: 40, color: '#10b981' }, // Low stress - green
                  { min: 40, max: 70, color: '#f59e0b' }, // Moderate - amber
                  { min: 70, max: 100, color: '#ef4444' }, // High stress - red
                ]}
                animated={true}
              />
            </DashboardCard>

            {/* Balance Score Gauge (average of consistency and inverse stress) */}
            <DashboardCard>
              <RadialGauge
                value={(currentWeek.consistencyLoad + (100 - currentWeek.paceStress)) / 2}
                label="Balance Score"
                subtitle="Overall training balance"
                size={180}
                strokeWidth={14}
                color="#4f46e5"
                zones={[
                  { min: 0, max: 50, color: '#f59e0b' }, // Needs work
                  { min: 50, max: 75, color: '#10b981' }, // Good
                  { min: 75, max: 100, color: '#3b82f6' }, // Excellent
                ]}
                animated={true}
              />
            </DashboardCard>
          </div>
        );
      })()}

      {/* Pace Balance Chart */}
      {weeklyBalances.length > 0 && (
        <PaceBalanceChart weeklyBalances={weeklyBalances} />
      )}

      {/* Weekly Summary Table */}
      {weeklyBalances.length > 0 && (
        <DashboardCard>
          <div className="text-xs uppercase tracking-wider text-[#6b7280] font-medium mb-4">
            Weekly Summary (Last 12 Weeks)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-[#6b7280] font-medium text-sm">Week</th>
                  <th className="text-right py-3 px-4 text-[#6b7280] font-medium text-sm">Distance</th>
                  <th className="text-right py-3 px-4 text-[#6b7280] font-medium text-sm">Runs</th>
                  <th className="text-right py-3 px-4 text-[#6b7280] font-medium text-sm">Pace</th>
                  <th className="text-right py-3 px-4 text-[#6b7280] font-medium text-sm">Consistency</th>
                  <th className="text-right py-3 px-4 text-[#6b7280] font-medium text-sm">Stress</th>
                  <th className="text-center py-3 px-4 text-[#6b7280] font-medium text-sm">Zone</th>
                </tr>
              </thead>
              <tbody>
                {weeklyBalances.slice().reverse().map((week, index) => {
                  const weekStart = new Date(week.weekStart);
                  const weekEnd = new Date(week.weekEnd);
                  
                  return (
                    <tr
                      key={week.weekStart}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-[#1a1f2e] font-medium">
                        {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                        {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right text-[#1a1f2e] font-medium">
                        {week.totalDistance.toFixed(1)} mi
                      </td>
                      <td className="py-3 px-4 text-right text-[#1a1f2e] font-medium">
                        {week.runCount}
                      </td>
                      <td className="py-3 px-4 text-right text-[#1a1f2e] font-medium">
                        {week.avgPace}
                      </td>
                      <td className="py-3 px-4 text-right text-[#4b5563]">
                        {week.consistencyLoad.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#4b5563]">
                        {week.paceStress.toFixed(0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          week.zone === 'hold' ? 'bg-amber-100 text-amber-800' :
                          week.zone === 'likely' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {week.zone}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
