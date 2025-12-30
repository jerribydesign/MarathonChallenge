// F1-Style Running Dashboard

'use client';

import { useState, useEffect } from 'react';

interface RunningDashboardProps {
  milesTotal: number;
  displayName: string | null;
  activities: Array<{
    name: string;
    date: string;
    distance_miles: number;
    moving_time: number; // seconds
    location?: string;
    start_latlng?: [number, number];
  }>;
  currentMonthActivities?: Array<{
    name: string;
    date: string;
    distance_miles: number;
    moving_time: number;
  }>;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  forecast: Array<{
    time: string;
    temp: number;
    chance: number;
    icon: string;
  }>;
}

export default function RunningDashboard({ milesTotal, displayName, activities, currentMonthActivities }: RunningDashboardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Use current month activities for stats, or fall back to all activities
  const monthActivities = currentMonthActivities || activities.filter(a => {
    const date = new Date(a.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  // Calculate average pace from current month activities only
  const calculateAveragePace = () => {
    if (monthActivities.length === 0) return { pace: '0:00', totalTime: 0 };
    
    const totalTime = monthActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0);
    const totalMiles = monthActivities.reduce((sum, a) => sum + a.distance_miles, 0);
    
    if (totalMiles === 0) return { pace: '0:00', totalTime };
    
    const avgSecondsPerMile = totalTime / totalMiles;
    const minutes = Math.floor(avgSecondsPerMile / 60);
    const seconds = Math.floor(avgSecondsPerMile % 60);
    
    return {
      pace: `${minutes}:${String(seconds).padStart(2, '0')}`,
      totalTime,
      totalMiles,
    };
  };

  const avgStats = calculateAveragePace();

  // Calculate fastest times for 2025
  const calculateFastestTimes = () => {
    const year2025 = activities.filter(a => {
      const date = new Date(a.date);
      return date.getFullYear() === 2025;
    });

    // Fastest 5K (3.10686 miles)
    const fiveKActivities = year2025.filter(a => {
      const distance = a.distance_miles;
      return distance >= 3.0 && distance <= 3.2; // ~5K range
    });
    const fastest5K = fiveKActivities.reduce((fastest, a) => {
      if (!fastest || a.moving_time < fastest.moving_time) {
        return a;
      }
      return fastest;
    }, null as typeof fiveKActivities[0] | null);

    // Fastest 10K (6.21371 miles)
    const tenKActivities = year2025.filter(a => {
      const distance = a.distance_miles;
      return distance >= 6.0 && distance <= 6.3; // ~10K range
    });
    const fastest10K = tenKActivities.reduce((fastest, a) => {
      if (!fastest || a.moving_time < fastest.moving_time) {
        return a;
      }
      return fastest;
    }, null as typeof tenKActivities[0] | null);

    // Fastest Mile (0.9 - 1.1 miles)
    const mileActivities = year2025.filter(a => {
      const distance = a.distance_miles;
      return distance >= 0.9 && distance <= 1.1; // ~1 mile range
    });
    const fastestMile = mileActivities.reduce((fastest, a) => {
      if (!fastest || a.moving_time < fastest.moving_time) {
        return a;
      }
      return fastest;
    }, null as typeof mileActivities[0] | null);

    return { fastest5K, fastest10K, fastestMile };
  };

  const fastestTimes = calculateFastestTimes();

  // Format time for display
  const formatRaceTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Fetch weather for Los Angeles
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using wttr.in - free weather API (no key needed)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(
          'https://wttr.in/Los%20Angeles?format=j1',
          { 
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const current = data.current_condition[0];
          const today = data.weather[0];
          
          setWeather({
            temp: parseInt(current.temp_F),
            condition: current.weatherDesc[0].value,
            icon: current.weatherCode,
            forecast: [
              { 
                time: '11am', 
                temp: parseInt(today.hourly[2]?.tempF || current.temp_F), 
                chance: parseInt(today.hourly[2]?.chanceofrain || '20'), 
                icon: 'sun' 
              },
              { 
                time: '12pm', 
                temp: parseInt(today.hourly[3]?.tempF || current.temp_F), 
                chance: parseInt(today.hourly[3]?.chanceofrain || '20'), 
                icon: 'sun' 
              },
              { 
                time: '1pm', 
                temp: parseInt(today.hourly[4]?.tempF || current.temp_F), 
                chance: parseInt(today.hourly[4]?.chanceofrain || '40'), 
                icon: 'cloud' 
              },
            ],
          });
        } else {
          throw new Error('Weather API failed');
        }
      } catch (error) {
        // Fallback weather data for Los Angeles
        const now = new Date();
        const hour = now.getHours();
        const baseTemp = 72 + Math.sin((hour - 6) * Math.PI / 12) * 10; // Simulate daily temp variation
        
        setWeather({
          temp: Math.round(baseTemp),
          condition: 'Clear',
          icon: '01d',
          forecast: [
            { time: '11am', temp: Math.round(baseTemp + 2), chance: 20, icon: 'sun' },
            { time: '12pm', temp: Math.round(baseTemp), chance: 20, icon: 'sun' },
            { time: '1pm', temp: Math.round(baseTemp - 2), chance: 40, icon: 'cloud' },
          ],
        });
      }
    };

    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  // Format total time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg font-mono">
      <div className="grid grid-cols-4 gap-4">
        {/* Main Dashboard Content */}
        <div className="col-span-3">
          {/* Top Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Runner Profile */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {displayName?.charAt(0) || 'R'}
            </div>
            <div>
              <div className="text-xl font-bold">{displayName || 'Runner'}</div>
              <div className="text-sm text-gray-400">Marathon Challenge</div>
            </div>
          </div>
        </div>

        {/* Weather Panel */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span>
              <span className="font-bold">Los Angeles</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold">{weather?.temp || 72}°</div>
            <div>
              <div className="text-sm text-gray-400">{weather?.condition || 'Clear'}</div>
              <div className="text-xs text-gray-500 mt-1">
                {weather?.forecast?.map((f, i) => (
                  <span key={i} className="mr-2">
                    {f.time} ({f.temp}° {f.chance}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-2">CURRENT MONTH</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-indigo-400">{milesTotal.toFixed(1)}</div>
              <div className="text-xs text-gray-500">MILES</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{monthActivities.length}</div>
              <div className="text-xs text-gray-500">RUNS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Average Pace */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">AVG PACE THIS YEAR</div>
          <div className="text-3xl font-bold text-yellow-400">{avgStats.pace}</div>
          <div className="text-xs text-gray-500 mt-1">per mile</div>
        </div>

        {/* Total Mileage */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">TOTAL MILEAGE</div>
          <div className="text-3xl font-bold text-blue-400">{milesTotal.toFixed(1)}</div>
          <div className="text-xs text-gray-500 mt-1">miles</div>
        </div>

        {/* Total Time */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">TOTAL TIME</div>
          <div className="text-3xl font-bold text-purple-400">{formatTime(avgStats.totalTime)}</div>
          <div className="text-xs text-gray-500 mt-1">this month</div>
        </div>

        {/* Progress to Goal */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">PROGRESS TO GOAL</div>
          <div className="text-3xl font-bold text-green-400">{((milesTotal / 26.2) * 100).toFixed(0)}%</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (milesTotal / 26.2) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performance Graph Area */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Activities */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-3">RECENT RUNS</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {monthActivities.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-gray-700 pb-2">
                <div>
                  <div className="font-semibold">{activity.name || 'Run'}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-indigo-400 font-bold">{activity.distance_miles.toFixed(1)} mi</div>
                  <div className="text-xs text-gray-500">{formatTime(activity.moving_time)}</div>
                </div>
              </div>
            ))}
            {monthActivities.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-4">No runs yet</div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-3">PERFORMANCE METRICS</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Best Pace</span>
                <span className="text-yellow-400">
                  {monthActivities.length > 0 
                    ? (() => {
                        const best = monthActivities.reduce((best, a) => {
                          const pace = a.moving_time / a.distance_miles;
                          return pace < best ? pace : best;
                        }, Infinity);
                        const min = Math.floor(best / 60);
                        const sec = Math.floor(best % 60);
                        return `${min}:${String(sec).padStart(2, '0')}`;
                      })()
                    : '0:00'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Longest Run</span>
                <span className="text-blue-400">
                  {monthActivities.length > 0 
                    ? `${Math.max(...monthActivities.map(a => a.distance_miles)).toFixed(1)} mi`
                    : '0.0 mi'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Runs This Month</span>
                <span className="text-green-400">{monthActivities.length}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, (monthActivities.length / 20) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>

        {/* Side Panel - Fastest Times 2025 */}
        <div className="col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 h-full">
            <div className="text-sm text-gray-400 mb-4 font-bold">FASTEST TIMES 2025</div>
            
            {/* Fastest 5K */}
            <div className="mb-6 pb-4 border-b border-gray-700">
              <div className="text-xs text-gray-500 mb-1">FASTEST 5K</div>
              {fastestTimes.fastest5K ? (
                <>
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {formatRaceTime(fastestTimes.fastest5K.moving_time)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {formatDate(fastestTimes.fastest5K.date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fastestTimes.fastest5K.location || fastestTimes.fastest5K.name || 'Location N/A'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No 5K recorded</div>
              )}
            </div>

            {/* Fastest 10K */}
            <div className="mb-6 pb-4 border-b border-gray-700">
              <div className="text-xs text-gray-500 mb-1">FASTEST 10K</div>
              {fastestTimes.fastest10K ? (
                <>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {formatRaceTime(fastestTimes.fastest10K.moving_time)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {formatDate(fastestTimes.fastest10K.date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fastestTimes.fastest10K.location || fastestTimes.fastest10K.name || 'Location N/A'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No 10K recorded</div>
              )}
            </div>

            {/* Fastest Mile */}
            <div>
              <div className="text-xs text-gray-500 mb-1">FASTEST MILE</div>
              {fastestTimes.fastestMile ? (
                <>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {formatRaceTime(fastestTimes.fastestMile.moving_time)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {formatDate(fastestTimes.fastestMile.date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fastestTimes.fastestMile.location || fastestTimes.fastestMile.name || 'Location N/A'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-600">No mile recorded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
