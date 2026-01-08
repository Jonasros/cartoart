import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/strava/refreshToken';
import { convertStravaToRouteData } from '@/lib/strava/convertToRouteData';
import { trackApiRequest } from '@/lib/api-usage/tracker';
import type { StravaActivity, StravaStream } from '@/types/strava';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get valid access token
  const accessToken = await getValidAccessToken(user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Strava not connected or token refresh failed' },
      { status: 401 }
    );
  }

  try {
    // Fetch activity details and streams in parallel
    const [activityResponse, streamsResponse] = await Promise.all([
      fetch(`https://www.strava.com/api/v3/activities/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(
        `https://www.strava.com/api/v3/activities/${id}/streams?keys=latlng,altitude,time,distance&key_by_type=true`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ),
    ]);

    if (!activityResponse.ok) {
      console.error('Strava activity fetch failed:', await activityResponse.text());
      trackApiRequest('strava-activity', { isError: true });
      return NextResponse.json(
        { error: 'Failed to fetch activity' },
        { status: activityResponse.status }
      );
    }

    if (!streamsResponse.ok) {
      console.error('Strava streams fetch failed:', await streamsResponse.text());
      trackApiRequest('strava-streams', { isError: true });
      return NextResponse.json(
        { error: 'Failed to fetch activity streams' },
        { status: streamsResponse.status }
      );
    }

    // Track successful API calls
    trackApiRequest('strava-activity');
    trackApiRequest('strava-streams');

    const activity: StravaActivity = await activityResponse.json();
    const streams: StravaStream = await streamsResponse.json();

    // Check if activity has GPS data
    if (!streams.latlng || streams.latlng.data.length === 0) {
      return NextResponse.json(
        { error: 'Activity has no GPS data' },
        { status: 400 }
      );
    }

    // Convert to RouteData format
    const routeData = convertStravaToRouteData(activity, streams);

    return NextResponse.json({
      activity: {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        date: activity.start_date_local,
        private: activity.private,
      },
      routeData,
    });
  } catch (err) {
    console.error('Strava activity error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
