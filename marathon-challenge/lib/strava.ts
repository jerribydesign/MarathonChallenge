// Strava API wrapper functions

import type { StravaTokenResponse, StravaActivity } from '@/types/strava';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

/**
 * Refresh Strava access token
 */
export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Strava client credentials');
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

/**
 * Fetch activities from Strava API with pagination
 * Filters for Run activities within the specified date range
 */
export async function fetchStravaActivities(
  accessToken: string,
  after: number, // unix seconds
  before: number // unix seconds
): Promise<StravaActivity[]> {
  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200; // Strava max
  let hasMore = true;

  while (hasMore && page <= 10) {
    // Safety limit: max 10 pages
    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/activities?after=${after}&before=${before}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - token may be expired');
      }
      const error = await response.text();
      throw new Error(`Failed to fetch activities: ${error}`);
    }

    const activities: StravaActivity[] = await response.json();

    if (activities.length === 0) {
      hasMore = false;
    } else {
      // Filter for Run activities only
      const runActivities = activities.filter((activity) => activity.type === 'Run');
      allActivities.push(...runActivities);
      page++;

      // If we got fewer than perPage, we've reached the end
      if (activities.length < perPage) {
        hasMore = false;
      }
    }
  }

  return allActivities;
}

/**
 * Get athlete info from Strava
 */
export async function getStravaAthlete(accessToken: string) {
  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - token may be expired');
    }
    const error = await response.text();
    throw new Error(`Failed to fetch athlete: ${error}`);
  }

  return response.json();
}
