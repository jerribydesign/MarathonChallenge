// Supabase server-side client (uses service role key)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
// During build, env vars might not be available, so we delay initialization
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Only check env vars when actually initializing (at runtime, not build time)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }

    if (!supabaseKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

// Export a Proxy that lazily initializes the client on first access
// This allows the module to be imported during build without errors
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // Bind functions to maintain 'this' context
    return typeof value === 'function' ? value.bind(client) : value;
  },
}) as SupabaseClient;

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
