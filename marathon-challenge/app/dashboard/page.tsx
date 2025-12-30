// Dashboard page with progress and leaderboard

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseServer';
import { getCurrentMonthYear } from '@/lib/dates';
import Leaderboard from '@/components/Leaderboard';
import Navigation from '@/components/Navigation';
import HeroCard from '@/components/HeroCard';
import MetricCard from '@/components/MetricCard';
import WeatherCard from '@/components/WeatherCard';
import BestTimesCard from '@/components/BestTimesCard';
import ActivityHeatmap from '@/components/ActivityHeatmap';

async function getUserData(stravaAthleteId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('strava_athlete_id', stravaAthleteId)
    .single();

  if (error || !user) {
    return null;
  }

  return user;
}

async function getParticipantData(userId: string) {
  const { month, year } = getCurrentMonthYear();
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;

  const { data: participant, error } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('user_id', userId)
    .eq('month_start', monthStart)
    .single();

  if (error || !participant) {
    return { miles_total: 0, last_synced_at: null };
  }

  return participant;
}

async function getLeaderboard() {
  const { month, year } = getCurrentMonthYear();
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;

  const { data: participants, error } = await supabase
    .from('challenge_participants')
    .select(`
      miles_total,
      user_id,
      users(display_name)
    `)
    .eq('month_start', monthStart)
    .order('miles_total', { ascending: false })
    .limit(100);

  if (error || !participants) {
    return [];
  }

  // Transform to match Leaderboard component interface
  return participants.map((p: any) => ({
    display_name: (p.users as any)?.display_name || null,
    miles_total: Number(p.miles_total) || 0,
    user_id: p.user_id,
  }));
}

export default async function DashboardPage() {
  // Get strava_athlete_id from cookie
  const cookieStore = cookies();
  const stravaAthleteId = cookieStore.get('strava_athlete_id')?.value;

  if (!stravaAthleteId) {
    redirect('/');
  }

  const user = await getUserData(stravaAthleteId);
  if (!user) {
    redirect('/?error=user_not_found');
  }

  const participant = await getParticipantData(user.id);
  const leaderboard = await getLeaderboard();

  // Fetch activities for dashboard - using internal API call
  let activities: any[] = [];
  let currentMonthActivities: any[] = [];
  try {
    // Create a request object for the internal API call
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
    const url = new URL('/api/activities', baseUrl);
    
    // For server-side, we can call the function directly or use fetch with proper headers
    // Since we're in a server component, let's fetch from Strava directly
    const { refreshStravaToken, fetchStravaActivities } = await import('@/lib/strava');
    const { getCurrentMonthRange } = await import('@/lib/dates');
    const { metersToMilesRounded } = await import('@/lib/miles');
    
    // Check token
    let accessToken = user.access_token;
    const now = Math.floor(Date.now() / 1000);
    if (now >= user.expires_at) {
      const refreshed = await refreshStravaToken(user.refresh_token);
      accessToken = refreshed.access_token;
    }
    
    // Fetch activities for current month (for dashboard display)
    const { start: after, end: before } = getCurrentMonthRange();
    const stravaActivities = await fetchStravaActivities(accessToken, after, before);
    
    // Fetch all 2025 activities for fastest times and heatmap
    const year2025Start = Math.floor(new Date('2025-01-01T00:00:00-08:00').getTime() / 1000);
    const year2025End = Math.floor(new Date('2025-12-31T23:59:59-08:00').getTime() / 1000);
    const all2025Activities = await fetchStravaActivities(accessToken, year2025Start, year2025End);
    
    // Combine and map activities
    const allActivities = [...stravaActivities, ...all2025Activities];
    // Remove duplicates by ID
    const uniqueActivities = Array.from(
      new Map(allActivities.map(a => [a.id, a])).values()
    );
    
    // Separate current month activities from all activities
    currentMonthActivities = stravaActivities.map(activity => ({
      name: activity.name,
      date: activity.start_date,
      distance_miles: metersToMilesRounded(activity.distance || 0),
      moving_time: activity.moving_time || 0,
      type: activity.type,
      location: activity.location_city || activity.location_state || activity.location_country || null,
    }));

    // All activities for fastest times and best times card
    activities = uniqueActivities.map(activity => ({
      name: activity.name,
      date: activity.start_date,
      distance_miles: metersToMilesRounded(activity.distance || 0),
      moving_time: activity.moving_time || 0,
      type: activity.type,
      location: activity.location_city || activity.location_state || activity.location_country || null,
      start_latlng: activity.start_latlng || null,
    }));
  } catch (error) {
    console.error('Failed to fetch activities:', error);
  }

  // Check if sync is needed
  const needsSync =
    !participant.last_synced_at ||
    (participant.last_synced_at &&
      (Date.now() - new Date(participant.last_synced_at).getTime()) / (1000 * 60) >= 15);

  // Calculate stats for dashboard
  const milesTotal = Number(participant.miles_total) || 0;
  const progress = (milesTotal / 26.2) * 100;
  const runsThisMonth = currentMonthActivities.length;
  
  // Calculate total time this month
  const totalTimeThisMonth = currentMonthActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0);
  const hours = Math.floor(totalTimeThisMonth / 3600);
  const minutes = Math.floor((totalTimeThisMonth % 3600) / 60);
  
  // Get current time for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const timeString = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="min-h-screen bg-[#f5f7fa] relative">
      <Navigation
        stravaAthleteId={stravaAthleteId}
        needsSync={needsSync}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Modular Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hero Card - Progress */}
            <div className="md:col-span-2 lg:row-span-2">
              <HeroCard
                greeting={greeting}
                primaryMetric={{
                  label: 'MILES THIS MONTH',
                  value: milesTotal.toFixed(1),
                  unit: 'mi',
                }}
                context={`LAST UPDATED ${timeString}`}
                accentColor="green"
              />
            </div>

            {/* Progress to Goal */}
            <MetricCard
              headline="PROGRESS TO GOAL"
              value={`${Math.round(progress)}`}
              subtitle={`${milesTotal.toFixed(1)} / 26.2 miles`}
              accentColor="green"
              secondaryMetrics={[
                { label: 'Remaining', value: `${(26.2 - milesTotal).toFixed(1)} mi` },
                { label: 'Completion', value: `${progress.toFixed(1)}%` },
              ]}
            />

            {/* Runs This Month */}
            <MetricCard
              headline="RUNS THIS MONTH"
              value={runsThisMonth}
              subtitle="Total activities"
              accentColor="blue"
              secondaryMetrics={[
                { label: 'Total time', value: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m` },
                { label: 'Avg per run', value: runsThisMonth > 0 ? `${(milesTotal / runsThisMonth).toFixed(1)} mi` : '0 mi' },
              ]}
            />

            {/* Average Pace */}
            <MetricCard
              headline="AVERAGE PACE"
              value={(() => {
                const totalTime = currentMonthActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0);
                const totalMiles = currentMonthActivities.reduce((sum, a) => sum + a.distance_miles, 0);
                if (totalMiles === 0) return '0:00';
                const avgPaceSeconds = totalTime / totalMiles;
                const paceMinutes = Math.floor(avgPaceSeconds / 60);
                const paceSeconds = Math.floor(avgPaceSeconds % 60);
                return `${paceMinutes}:${String(paceSeconds).padStart(2, '0')}`;
              })()}
              subtitle={currentMonthActivities.length > 0 ? "Per mile this month" : "No runs this month"}
              accentColor="neutral"
            />

            {/* Weather */}
            <WeatherCard />

            {/* Best Times This Month */}
            <BestTimesCard activities={activities} />

          </div>

          {/* Activity Heatmap */}
          <div className="mt-6">
            <ActivityHeatmap activities={activities} year={2025} />
          </div>
        </div>
      </div>
    </div>
  );
}
