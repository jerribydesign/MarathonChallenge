// Supabase server-side client (uses service role key)

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types
export interface User {
  id: string;
  strava_athlete_id: string;
  display_name: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  month_start: string; // YYYY-MM-DD
  miles_total: number;
  last_synced_at: string | null;
  created_at: string;
}

export interface ActivityCache {
  id: string;
  user_id: string;
  strava_activity_id: string;
  start_date: string;
  type: string | null;
  distance_meters: number | null;
  created_at: string;
}
