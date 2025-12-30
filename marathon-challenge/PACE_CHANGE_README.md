# Monthly Pace Change (Rate of Change)

## Overview

A visualization that shows month-over-month pace changes, similar to an economic rate of change indicator. This helps users understand whether their running pace is improving, plateauing, or regressing over time — without focusing on individual runs.

**Philosophy**: "Single runs fluctuate. Trends matter."

## Core Concept

Instead of showing raw pace values, this chart displays the **month-over-month change** in average pace. This answers: "How is my pace trending compared to last month?"

### Key Points

- **Negative change** = Faster than last month (improvement) ✅
- **Positive change** = Slower than last month
- **Zero line** = No change from previous month

## Calculation Method

### Monthly Aggregation

1. **Group activities by month** (YYYY-MM format)
2. **Calculate monthly totals**:
   - `totalDistance` = sum of all distances in the month
   - `totalTimeSeconds` = sum of all moving times in the month
3. **Calculate average pace correctly**:
   ```
   avgPaceSecondsPerUnit = totalTimeSeconds / totalDistance
   ```
   **Important**: Do NOT average per-run pace values. Always sum time and distance, then divide.

### Month-over-Month Change

For each month (starting from the second month):

```typescript
paceChangeSeconds = currentMonthPace - previousMonthPace
paceChangePercent = (paceChangeSeconds / previousMonthPace) * 100
```

**Interpretation**:
- If `paceChangeSeconds < 0`: You got faster (improvement)
- If `paceChangeSeconds > 0`: You got slower
- If `paceChangeSeconds = 0`: No change

## Visualization

### Chart Type
- **Line chart** with month on X-axis and pace change (seconds) on Y-axis
- **Zero line** (baseline) shown as dashed horizontal line
- **Neutral colors**: Indigo for the line, no red/green judgment colors
- **Smooth line**: Monotone interpolation (no sharp spikes)

### Data Points
- Each point represents one month
- Points below zero = faster than last month
- Points above zero = slower than last month
- Months with <2 runs shown as muted/gray points

### Tooltip Information
On hover, shows:
- Month name
- Average pace this month
- Average pace last month
- Pace change (formatted as "+0:15" or "-0:10")
- Percentage change
- Run count (with note if insufficient data)

## Edge Cases

1. **Insufficient data** (<2 runs in a month):
   - Still shown on chart but with muted styling
   - Tooltip indicates "Limited data"

2. **Zero distance**:
   - Month is skipped entirely

3. **First month**:
   - Not shown (no previous month to compare)

4. **Missing months**:
   - Gaps in the line (connectNulls=false)

## Files

### Utilities
- `/lib/paceChange.ts`:
  - `calculateMonthlyPaceChanges()` - Main calculation function
  - `formatPaceChange()` - Format change as "+0:15" or "-0:10"
  - `formatPercentChange()` - Format as percentage

### Components
- `/components/MonthlyPaceChangeChart.tsx` - Chart visualization component

### Integration
- `/components/ZoomOutDashboard.tsx` - Includes the chart in the Zoom Out view

## Usage

The chart is automatically displayed on the `/zoom-out` page when:
- User has at least 2 months of running data
- Each month has at least 1 run with distance > 0

## Design Intent

This chart should feel like an **economic indicator**, not a performance grade. It helps users:
- Emotionally detach from bad individual runs
- Understand long-term progress trends
- See pace changes in context (month-to-month, not day-to-day)

## Example Interpretation

**Scenario**: Chart shows a point at -0:15 (15 seconds faster)
- **Meaning**: This month's average pace was 15 seconds per mile faster than last month
- **Interpretation**: Improvement in pace (negative = faster)

**Scenario**: Chart shows a point at +0:10 (10 seconds slower)
- **Meaning**: This month's average pace was 10 seconds per mile slower than last month
- **Interpretation**: Could be due to increased volume, recovery, or other factors (not necessarily "bad")

## Testing

1. **Access**: Navigate to `/zoom-out` page
2. **Verify**: Chart appears if you have 2+ months of data
3. **Check tooltip**: Hover over points to see detailed information
4. **Test edge cases**: Months with 1 run should show as muted points

## Notes

- Pace is always calculated from monthly totals (not averaged averages)
- Units follow existing site settings (miles)
- Chart uses Recharts library (already installed)
- Styling matches existing design system (calm, minimal, neutral)
