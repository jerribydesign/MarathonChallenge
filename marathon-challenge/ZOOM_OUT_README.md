# Zoom Out Dashboard

## Overview

The Zoom Out dashboard provides a long-term view of running trends, intentionally hiding single-run details to help users see progress over weeks and months rather than focusing on individual performance.

**Philosophy**: "One run is noise. Months are signal."

## Features

### A) Monthly Summary Cards
- **This Month vs Last Month** comparison
- Total distance, total time, number of runs
- Average pace (calculated correctly: `totalTime / totalDistance`)
- Month-over-month % change for distance and run count

### B) Rolling Trends (30-day)
- 30-day rolling distance
- 30-day rolling run count  
- 30-day rolling average pace
- Line charts showing trends over time

### C) Weekly Consistency (Last 8 Weeks)
- Bar chart showing weekly totals (distance + run count)
- Highlights "most consistent week" and "highest volume week"

### D) Monthly Insight
- Rules-based insight sentence generated from monthly trends
- Examples:
  - Distance ↑ + pace stable: "You ran more with steady effort — endurance is building."
  - Distance ↑ + pace slower: "You added volume — this is base-building, not regression."
  - Both down: "Lower volume month — recovery counts, zoom out."

## Data Flow

1. **Page**: `/app/zoom-out/page.tsx`
   - Server component that fetches last 4 months of activities from Strava
   - Passes data to `ZoomOutDashboard` component

2. **Component**: `/components/ZoomOutDashboard.tsx`
   - Client component that aggregates and visualizes data
   - Uses Recharts for visualization

3. **Utilities**: `/lib/zoomOut.ts`
   - `groupActivitiesByMonth()` - Groups activities by calendar month
   - `groupActivitiesByWeek()` - Groups activities by week (Monday-Sunday)
   - `rollingWindowStats()` - Calculates 30-day rolling statistics
   - `generateMonthlyInsight()` - Generates insight sentence from trends

## Calculations

### Average Pace
**Correct calculation**: `totalTimeSeconds / totalDistanceMiles`

This ensures we're not averaging averages (which would be incorrect). We sum all time and all distance, then divide.

Example:
- Run 1: 3 miles in 24 minutes (8:00/mile)
- Run 2: 2 miles in 20 minutes (10:00/mile)
- **Correct avg**: (24*60 + 20*60) / (3 + 2) = 2640 / 5 = 528 seconds = 8:48/mile
- **Wrong way**: (8:00 + 10:00) / 2 = 9:00/mile ❌

### Rolling Window
The 30-day rolling window calculates statistics for each day, looking back 30 days from that date. This creates a smooth trend line that shows how your fitness is building over time.

### Week Grouping
Weeks run Monday to Sunday. The week start date (Monday) is used as the key for grouping.

## Testing

1. **Access the view**: Navigate to `/zoom-out` (or click "Zoom Out →" from dashboard)

2. **Test with data**:
   - Ensure you have at least 2 months of running data
   - Sync Strava to fetch latest activities
   - View should show monthly comparisons and trends

3. **Test empty state**:
   - If no activities, should show "No activities found" message

4. **Test calculations**:
   - Verify average pace matches manual calculation
   - Check month-over-month percentages are correct
   - Ensure rolling trends update as you scroll through dates

## Navigation

- **From Dashboard**: Click "Zoom Out →" link in header
- **From Zoom Out**: Click "← Back to Dashboard" link

## Chart Library

Uses **Recharts** (v2.10.3) - a lightweight, composable charting library built on D3.

Installation: `npm install recharts`

## Files Created

- `/app/zoom-out/page.tsx` - Page component
- `/app/zoom-out/error.tsx` - Error boundary
- `/components/ZoomOutDashboard.tsx` - Main dashboard component
- `/lib/zoomOut.ts` - Aggregation utilities
- `/app/api/activities/history/route.ts` - API endpoint (optional, not used currently)

## Design Principles

- **Calm styling**: Soft typography, generous whitespace, minimal borders
- **No red indicators**: Avoid "bad run" messaging
- **Focus on trends**: Individual runs are hidden intentionally
- **No click-through**: Can't drill into individual run details from this view
