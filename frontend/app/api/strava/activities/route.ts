import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/strava/refreshToken';
import type { StravaActivity, StravaActivitySummary } from '@/types/strava';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('per_page') || '30', 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get valid access token (auto-refreshes if needed)
  const accessToken = await getValidAccessToken(user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Strava not connected or token refresh failed' },
      { status: 401 }
    );
  }

  try {
    // Fetch activities from Strava API
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strava activities fetch failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: response.status }
      );
    }

    const activities: StravaActivity[] = await response.json();

    // Filter to activities with GPS data and transform to summary format
    const summaries: StravaActivitySummary[] = activities
      .filter((activity) => activity.map?.summary_polyline) // Only activities with GPS
      .map((activity) => ({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        date: activity.start_date_local,
        distance: activity.distance,
        duration: activity.moving_time,
        elevation: activity.total_elevation_gain,
        polyline: activity.map.summary_polyline,
      }));

    return NextResponse.json({
      activities: summaries,
      page,
      perPage,
      hasMore: activities.length === perPage,
    });
  } catch (err) {
    console.error('Strava activities error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
