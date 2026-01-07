import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { StravaConnectionStatus, StravaAthlete } from '@/types/strava';
import type { Database } from '@/types/database';

type ConnectedAccountRow = Database['public']['Tables']['connected_accounts']['Row'];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check for existing Strava connection
  const { data: connection, error } = await supabase
    .from('connected_accounts')
    .select('provider_user_id, athlete_data')
    .eq('user_id', user.id)
    .eq('provider', 'strava')
    .single() as { data: Pick<ConnectedAccountRow, 'provider_user_id' | 'athlete_data'> | null; error: unknown };

  if (error || !connection) {
    const status: StravaConnectionStatus = { connected: false };
    return NextResponse.json(status);
  }

  const athleteData = connection.athlete_data as StravaAthlete | null;

  const status: StravaConnectionStatus = {
    connected: true,
    athlete: athleteData
      ? {
          id: athleteData.id,
          name: `${athleteData.firstname} ${athleteData.lastname}`,
          avatar: athleteData.profile,
        }
      : undefined,
  };

  return NextResponse.json(status);
}
