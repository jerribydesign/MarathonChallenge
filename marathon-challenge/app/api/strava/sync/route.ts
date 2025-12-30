// Sync Strava activities for a user and update monthly mileage

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabaseServer';
import { refreshStravaToken, fetchStravaActivities } from '@/lib/strava';
import { getCurrentMonthRange, getCurrentMonthYear } from '@/lib/dates';
import { metersToMilesRounded } from '@/lib/miles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stravaAthleteId, force = false } = body;

    if (!stravaAthleteId) {
      return NextResponse.json(
        { error: 'Missing stravaAthleteId' },
        { status: 400 }
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

    // Check if sync is needed (unless forced)
    if (!force) {
      const { data: participant } = await supabase
        .from('challenge_participants')
        .select('last_synced_at')
        .eq('user_id', user.id)
        .single();

      if (participant?.last_synced_at) {
        const lastSync = new Date(participant.last_synced_at);
        const now = new Date();
        const minutesSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);

        if (minutesSinceSync < 15) {
          return NextResponse.json({
            message: 'Sync skipped - last sync was less than 15 minutes ago',
            synced: false,
          });
        }
      }
    }

    // Check if token needs refresh
    let accessToken = user.access_token;
    let refreshToken = user.refresh_token;
    let expiresAt = user.expires_at;

    const now = Math.floor(Date.now() / 1000);
    if (now >= expiresAt) {
      // Token expired, refresh it
      const refreshed = await refreshStravaToken(refreshToken);

      // Update user with new tokens
      const { error: updateError } = await supabase
        .from('users')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: refreshed.expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update tokens:', updateError);
        return NextResponse.json(
          { error: 'Failed to refresh token' },
          { status: 500 }
        );
      }

      accessToken = refreshed.access_token;
      refreshToken = refreshed.refresh_token;
      expiresAt = refreshed.expires_at;
    }

    // Get current month range
    const { month, year } = getCurrentMonthYear();
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const { start: after, end: before } = getCurrentMonthRange();

    // Fetch activities from Strava
    const activities = await fetchStravaActivities(accessToken, after, before);

    // Log activities for debugging
    console.log(`Fetched ${activities.length} Run activities for month ${month}/${year}`);
    console.log(`Date range: ${new Date(after * 1000).toISOString()} to ${new Date(before * 1000).toISOString()}`);
    if (activities.length > 0) {
      console.log('Sample activities:', activities.slice(0, 3).map(a => ({
        name: a.name,
        date: a.start_date,
        distance: a.distance,
        type: a.type
      })));
    }

    // Calculate total miles (only Run activities)
    const totalMeters = activities.reduce((sum, activity) => {
      return sum + (activity.distance || 0);
    }, 0);

    const totalMiles = metersToMilesRounded(totalMeters);
    console.log(`Total miles calculated: ${totalMiles}`);

    // Upsert challenge participant
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .upsert(
        {
          user_id: user.id,
          month_start: monthStart,
          miles_total: totalMiles,
          last_synced_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,month_start',
        }
      )
      .select()
      .single();

    if (participantError) {
      console.error('Failed to update participant:', participantError);
      return NextResponse.json(
        { error: 'Failed to update participant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Sync completed successfully',
      synced: true,
      miles_total: totalMiles,
      activities_count: activities.length,
      date_range: {
        start: new Date(after * 1000).toISOString(),
        end: new Date(before * 1000).toISOString(),
      },
      activities: activities.map(a => ({
        name: a.name,
        date: a.start_date,
        distance_miles: metersToMilesRounded(a.distance || 0),
        type: a.type,
      })),
    });
  } catch (err) {
    console.error('Sync error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
