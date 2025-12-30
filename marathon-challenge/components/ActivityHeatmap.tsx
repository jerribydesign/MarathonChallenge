// Activity Heatmap Component
// GitHub-style contribution calendar showing daily running activity

'use client';

import { useMemo } from 'react';

interface Activity {
  date: string; // ISO 8601
  distance_miles: number;
  moving_time: number;
}

interface ActivityHeatmapProps {
  activities: Activity[];
  year?: number; // Default to current year
}

interface DayData {
  date: Date;
  count: number; // Number of runs on this day
  distance: number; // Total distance for the day
}

export default function ActivityHeatmap({ activities, year }: ActivityHeatmapProps) {
  const currentYear = year || new Date().getFullYear();
  
  // Group activities by date
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      if (date.getFullYear() === currentYear) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(activity);
      }
    });
    
    return map;
  }, [activities, currentYear]);

  // Generate all days of the year
  const yearDays = useMemo(() => {
    const days: DayData[] = [];
    const startDate = new Date(currentYear, 0, 1); // January 1
    const endDate = new Date(currentYear, 11, 31); // December 31
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayActivities = activitiesByDate.get(dateKey) || [];
      
      days.push({
        date: new Date(d),
        count: dayActivities.length,
        distance: dayActivities.reduce((sum, a) => sum + a.distance_miles, 0),
      });
    }
    
    return days;
  }, [currentYear, activitiesByDate]);

  // Get intensity level for color (0-4)
  const getIntensityLevel = (count: number, distance: number): number => {
    if (count === 0) return 0;
    if (count === 1 && distance < 3) return 1;
    if (count === 1 && distance >= 3) return 2;
    if (count === 2) return 3;
    if (count >= 3) return 4;
    return 0;
  };

  // Get color based on intensity (GitHub-style green gradient)
  const getColor = (level: number): string => {
    const colors = [
      '#ebedf0', // No activity - light gray
      '#9be9a8', // 1 run, <3mi - light green
      '#40c463', // 1 run, >=3mi - medium green
      '#30a14e', // 2 runs - darker green
      '#216e39', // 3+ runs - darkest green
    ];
    return colors[level] || colors[0];
  };

  // Organize days into weeks (Sunday to Saturday)
  const weeks = useMemo(() => {
    const weekArray: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    // Find the first day of the year
    const firstDay = new Date(currentYear, 0, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Add empty days at the start if year doesn't start on Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(0), // Placeholder
        count: -1, // -1 indicates empty day
        distance: 0,
      });
    }
    
    yearDays.forEach(day => {
      currentWeek.push(day);
      
      // If we've reached Saturday (day 6), start a new week
      if (day.date.getDay() === 6) {
        weekArray.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Add remaining days to last week
    if (currentWeek.length > 0) {
      // Pad to end of week if needed
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          count: -1,
          distance: 0,
        });
      }
      weekArray.push(currentWeek);
    }
    
    return weekArray;
  }, [yearDays]);

  // Get month labels for the top
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; startWeek: number }> = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstRealDay = week.find(day => day.count >= 0);
      if (firstRealDay) {
        const month = firstRealDay.date.getMonth();
        if (month !== currentMonth) {
          labels.push({
            month: firstRealDay.date.toLocaleDateString('en-US', { month: 'short' }),
            startWeek: weekIndex,
          });
          currentMonth = month;
        }
      }
    });
    
    return labels;
  }, [weeks]);

  // Format date for tooltip
  const formatDate = (date: Date): string => {
    if (date.getTime() === 0) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium mb-2">
          ACTIVITY HEATMAP
        </div>
        <div className="text-sm text-[#6b7280] font-light">
          {currentYear} running activity
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2 relative" style={{ paddingLeft: '24px' }}>
            {monthLabels.map((label, index) => {
              const nextLabel = monthLabels[index + 1];
              const width = nextLabel 
                ? (nextLabel.startWeek - label.startWeek) * 14 
                : (weeks.length - label.startWeek) * 14;
              
              return (
                <div
                  key={index}
                  className="text-[10px] text-[#6b7280] font-light"
                  style={{ width: `${width}px`, minWidth: `${width}px` }}
                >
                  {label.month}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1 mr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div
                  key={day}
                  className="text-[10px] text-[#6b7280] font-light h-[14px] flex items-center"
                  style={{ display: index % 2 === 0 ? 'flex' : 'none' }} // Show only Sun, Tue, Thu, Sat
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    if (day.count === -1) {
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className="w-[14px] h-[14px] rounded-sm"
                        />
                      );
                    }
                    
                    const level = getIntensityLevel(day.count, day.distance);
                    const color = getColor(level);
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="w-[14px] h-[14px] rounded-sm relative group cursor-pointer"
                        style={{
                          backgroundColor: color,
                          border: isToday ? '2px solid #ef4444' : 'none',
                        }}
                        title={`${formatDate(day.date)}: ${day.count} run${day.count !== 1 ? 's' : ''}, ${day.distance.toFixed(1)} mi`}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                            <div className="font-medium">{formatDate(day.date)}</div>
                            <div className="text-gray-300">
                              {day.count} run{day.count !== 1 ? 's' : ''} • {day.distance.toFixed(1)} mi
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between text-xs text-[#6b7280]">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(level) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        <div className="text-[10px]">
          {activitiesByDate.size} days with activity
        </div>
      </div>
    </div>
  );
}
