// Get user's activities for dashboard display

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseServer';
import { refreshStravaToken, fetchStravaActivities } from '@/lib/strava';
import { getCurrentMonthRange } from '@/lib/dates';
import { metersToMilesRounded } from '@/lib/miles';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const stravaAthleteId = cookieStore.get('strava_athlete_id')?.value;

    if (!stravaAthleteId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('strava_athlete_id', stravaAthleteId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if token needs refresh
    let accessToken = user.access_token;
    const now = Math.floor(Date.now() / 1000);
    
    if (now >= user.expires_at) {
      const refreshed = await refreshStravaToken(user.refresh_token);
      accessToken = refreshed.access_token;
      
      // Update tokens in DB
      await supabase
        .from('users')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at,
        })
        .eq('id', user.id);
    }

    // Get current month range
    const { start: after, end: before } = getCurrentMonthRange();

    // Fetch activities from Strava
    const activities = await fetchStravaActivities(accessToken, after, before);

    // Transform activities for dashboard
    const formattedActivities = activities.map(activity => ({
      name: activity.name,
      date: activity.start_date,
      distance_miles: metersToMilesRounded(activity.distance || 0),
      moving_time: activity.moving_time || 0,
      type: activity.type,
    }));

    return NextResponse.json({
      activities: formattedActivities,
      total: formattedActivities.length,
    });
  } catch (err) {
    console.error('Activities fetch error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
