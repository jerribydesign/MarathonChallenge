// Exchange OAuth code for tokens and create/update user

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseServer';
import type { StravaTokenResponse } from '@/types/strava';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=missing_code', request.url)
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(
      new URL('/?error=server_config', request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.redirect(
        new URL('/?error=token_exchange_failed', request.url)
      );
    }

    const tokenData: StravaTokenResponse = await tokenResponse.json();

    // Upsert user in database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .upsert(
        {
          strava_athlete_id: String(tokenData.athlete.id),
          display_name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`.trim(),
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'strava_athlete_id',
        }
      )
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(
        new URL('/?error=database_error', request.url)
      );
    }

    // Set cookie with strava_athlete_id for session
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('strava_athlete_id', String(tokenData.athlete.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      new URL('/?error=unexpected_error', request.url)
    );
  }
}
