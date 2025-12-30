// Get historical activities for Zoom Out dashboard (last 4 months)

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseServer';
import { refreshStravaToken, fetchStravaActivities } from '@/lib/strava';
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

    // Fetch last 4 months of activities
    const today = new Date();
    const fourMonthsAgo = new Date(today);
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    
    // Convert to Unix seconds (America/Los_Angeles timezone)
    const after = Math.floor(fourMonthsAgo.getTime() / 1000);
    const before = Math.floor(today.getTime() / 1000);

    // Fetch activities from Strava
    const activities = await fetchStravaActivities(accessToken, after, before);

    // Transform activities for dashboard
    const formattedActivities = activities.map(activity => ({
      date: activity.start_date,
      distance_miles: metersToMilesRounded(activity.distance || 0),
      moving_time: activity.moving_time || 0,
    }));

    return NextResponse.json({
      activities: formattedActivities,
      total: formattedActivities.length,
      dateRange: {
        start: new Date(after * 1000).toISOString(),
        end: new Date(before * 1000).toISOString(),
      },
    });
  } catch (err) {
    console.error('History fetch error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
