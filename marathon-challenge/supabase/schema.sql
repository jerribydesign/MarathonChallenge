-- Marathon-a-Month Challenge Database Schema

-- Table: users
-- Stores Strava OAuth tokens and user information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strava_athlete_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL, -- unix seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: challenge_participants
-- Tracks monthly mileage totals per user
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL, -- first day of month
  miles_total NUMERIC DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_start)
);

-- Table: activities_cache (optional, for debugging/performance)
CREATE TABLE IF NOT EXISTS activities_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  strava_activity_id TEXT UNIQUE NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  type TEXT,
  distance_meters NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_strava_athlete_id ON users(strava_athlete_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_month_start ON challenge_participants(month_start);
CREATE INDEX IF NOT EXISTS idx_activities_cache_user_id ON activities_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_cache_start_date ON activities_cache(start_date);
