// Strava API response types

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number; // unix seconds
  expires_in: number; // seconds
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  type: string; // "Run", "Ride", etc.
  start_date: string; // ISO 8601
  start_date_local: string; // ISO 8601
  timezone: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  pr_count: number;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  start_latlng?: [number, number] | null;
}

export interface StravaActivitiesResponse extends Array<StravaActivity> {}
