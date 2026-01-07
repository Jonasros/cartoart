// Strava API Types

export interface StravaAthlete {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  profile: string; // avatar URL
  profile_medium: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string; // Run, Ride, Hike, Walk, etc.
  sport_type: string;
  start_date: string; // ISO timestamp
  start_date_local: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  map: {
    id: string;
    summary_polyline: string;
    polyline?: string;
  };
  average_speed: number; // meters/second
  max_speed: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  kudos_count: number;
  photo_count: number;
  private: boolean;
}

export interface StravaStream {
  latlng?: { data: [number, number][]; series_type: string; resolution: string };
  altitude?: { data: number[]; series_type: string; resolution: string };
  time?: { data: number[]; series_type: string; resolution: string };
  distance?: { data: number[]; series_type: string; resolution: string };
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number; // Unix timestamp
  expires_in: number; // seconds
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaRefreshResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
}

// Database types
export interface ConnectedAccount {
  id: string;
  user_id: string;
  provider: 'strava';
  provider_user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO timestamp
  athlete_data: StravaAthlete | null;
  created_at: string;
  updated_at: string;
}

// API response types
export interface StravaConnectionStatus {
  connected: boolean;
  athlete?: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface StravaActivitySummary {
  id: number;
  name: string;
  type: string;
  date: string;
  distance: number; // meters
  duration: number; // seconds
  elevation: number; // meters
  polyline: string; // encoded polyline for preview
}
