# Pace Balance Chart

## Overview

The Pace Balance Chart visualizes training balance using weekly aggregates. It helps users see whether their training is sustainable and repeatable, rather than focusing on individual run performance.

**Philosophy**: "One run is noise. Weeks are signal."

## Core Concept

A 2D scatter plot where:
- **X-axis (Consistency Load)**: How repeatable the week was (0-100)
- **Y-axis (Pace Stress)**: How hard the week was relative to baseline (0-100)

The "best" zone is the center ("Sustainable Zone" / "Likely" zone). Users drift left if inconsistent (missed days, gaps). Users drift up if too much intensity.

## Scoring Rules

### Consistency Load (X-axis, 0-100)

**Base**: Starts at 50 (neutral)

**Components**:
1. **Run Frequency**: +10 points per run (up to 5 runs = +50 max)
   - Adjusted from baseline: `runFrequencyScore - 25`
   
2. **Gap Penalty**: -15 points for any gap >= 3 days between runs in that week
   - Checks consecutive run dates within the week
   
3. **Week-to-Week Stability**: Compares to last 4 weeks
   - If run count differs by >2 from average: -5 points per run difference
   - If run count differs by <=1: +5 points (stability bonus)

**Clamp**: Final score clamped to [0, 100]

### Pace Stress (Y-axis, 0-100)

**Base**: Starts at 50 (neutral)

**Components**:
1. **Pace Comparison**: Compare weekly avg pace to 30-day rolling baseline
   - Baseline pace = `totalTimeSeconds / totalDistanceMiles` over prior 30 days
   - If week pace is >5% faster than baseline: stress increases
     - Formula: `paceStress += abs(paceDifference) * 2`
   - If week pace is >5% slower: stress decreases
     - Formula: `paceStress -= abs(paceDifference) * 1.5`

2. **Volume Stress**: Very long weeks raise stress even if slow
   - Formula: `min(totalDistance / 30, 1) * 20`
   - Max +20 points for 30+ miles in a week

**Clamp**: Final score clamped to [0, 100]

### Important: Pace Calculation

**Correct method**: `avgPaceSecondsPerMile = totalTimeSeconds / totalDistanceMiles`

**Do NOT** average per-run pace values. Always sum time and distance, then divide.

Example:
- Run 1: 3 miles in 24 minutes (8:00/mile)
- Run 2: 2 miles in 20 minutes (10:00/mile)
- **Correct**: (24*60 + 20*60) / (3 + 2) = 528 seconds = 8:48/mile ✅
- **Wrong**: (8:00 + 10:00) / 2 = 9:00/mile ❌

## Confidence Bands (Zones)

Three vertical zones based on Consistency Load:

1. **Hold (0-40)**: Lower consistency
   - Color: Amber (#f59e0b)
   - Meaning: Missed days, gaps in training

2. **Likely (40-70)**: Balanced zone (Sustainable Zone)
   - Color: Green (#10b981)
   - Meaning: Good consistency, repeatable training
   - **"Progress lives here"** label in center

3. **Stretch (70-100)**: High consistency
   - Color: Blue (#3b82f6)
   - Meaning: Very consistent, but monitor intensity

## Weekly Insight Generation

Rules-based insights (no AI calls):

- **High stress + Low consistency**: "Big effort week, but repeatability dipped. Consider one easier day."
- **Low stress + High consistency**: "Great consistency at sustainable effort — this builds fitness."
- **Consistency improving** (trend >10): "You're showing up more often. That's the strongest predictor of long-term progress."
- **High stress + High consistency**: "High volume and intensity — monitor recovery. A lighter week may help."
- **Low stress + Low consistency**: "Easy weeks are valuable, but consistency matters. Aim for 3-4 runs per week."
- **Balanced zone**: "You're in the sustainable zone — balanced effort with good consistency."

## Data Flow

1. **Page**: `/app/balance/page.tsx`
   - Server component that fetches last 12 weeks of activities from Strava
   - Passes data to `BalanceDashboard` component

2. **Component**: `/components/BalanceDashboard.tsx`
   - Client component that calculates weekly balances
   - Uses `PaceBalanceChart` for visualization

3. **Chart**: `/components/PaceBalanceChart.tsx`
   - Renders 2D scatter plot using Recharts
   - Shows confidence bands and sustainable zone

4. **Utilities**: `/lib/balance.ts`
   - `groupActivitiesByWeek()` - Groups activities by week (Monday-Sunday)
   - `rollingBaseline()` - Calculates 30-day rolling baseline pace
   - `weeklyStats()` - Calculates consistency load and pace stress
   - `generateBalanceInsight()` - Generates insight sentence

## Files Created

- `/app/balance/page.tsx` - Balance page
- `/app/balance/error.tsx` - Error boundary
- `/components/BalanceDashboard.tsx` - Main dashboard component
- `/components/PaceBalanceChart.tsx` - Chart component
- `/lib/balance.ts` - Scoring and aggregation utilities

## Testing

1. **Access**: Navigate to `/balance` (or click "Balance →" from dashboard)

2. **Test with data**:
   - Ensure you have at least 4-5 weeks of running data
   - Sync Strava to fetch latest activities
   - View should show weekly dots on the scatter plot

3. **Verify calculations**:
   - Check that consistency load reflects run frequency and gaps
   - Verify pace stress compares correctly to baseline
   - Ensure zones are assigned correctly (hold/likely/stretch)

4. **Test empty state**:
   - If no activities, should show "No activities found" message

## Navigation

- **From Dashboard**: Click "Balance →" link in header
- **From Balance**: Click "← Back to Dashboard" link

## Chart Library

Uses **Recharts** (v2.15.4) - already installed in the project.

## Design Principles

- **Calm styling**: Soft typography, generous whitespace, minimal borders
- **No red indicators**: Avoid "bad run" messaging
- **Weekly focus**: Individual runs are hidden intentionally
- **No click-through**: Can't drill into individual run details from this view
- **Neutral language**: All insights use supportive, non-judgmental phrasing
