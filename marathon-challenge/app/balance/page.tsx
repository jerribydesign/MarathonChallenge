// Balance Dashboard - Pace Balance Chart view

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseServer';
import BalanceDashboard from '@/components/BalanceDashboard';
import Navigation from '@/components/Navigation';

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

export default async function BalancePage() {
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

  // Fetch last 12 weeks of activities (for balance chart)
  let activities: any[] = [];
  try {
    const { refreshStravaToken, fetchStravaActivities } = await import('@/lib/strava');
    const { metersToMilesRounded } = await import('@/lib/miles');
    
    // Check token
    let accessToken = user.access_token;
    const now = Math.floor(Date.now() / 1000);
    if (now >= user.expires_at) {
      const refreshed = await refreshStravaToken(user.refresh_token);
      accessToken = refreshed.access_token;
    }
    
    // Fetch last 12 weeks of activities
    const today = new Date();
    const twelveWeeksAgo = new Date(today);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks
    
    const after = Math.floor(twelveWeeksAgo.getTime() / 1000);
    const before = Math.floor(today.getTime() / 1000);
    
    const stravaActivities = await fetchStravaActivities(accessToken, after, before);
    
    activities = stravaActivities.map(activity => ({
      date: activity.start_date,
      distance_miles: metersToMilesRounded(activity.distance || 0),
      moving_time: activity.moving_time || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch activities:', error);
  }

  // Check if sync is needed (simplified - you may want to add proper sync checking)
  const needsSync = false;

  return (
    <div className="min-h-screen bg-[#f5f7fa] relative">
      <Navigation
        stravaAthleteId={stravaAthleteId}
        needsSync={needsSync}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <BalanceDashboard activities={activities} />
        </div>
      </div>
    </div>
  );
}
