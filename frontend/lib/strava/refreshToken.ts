import { createClient } from '@/lib/supabase/server';
import type { StravaRefreshResponse } from '@/types/strava';
import type { Database } from '@/types/database';

type ConnectedAccountRow = Database['public']['Tables']['connected_accounts']['Row'];
type ConnectedAccountUpdate = Database['public']['Tables']['connected_accounts']['Update'];

/**
 * Gets a valid access token for Strava API calls.
 * Automatically refreshes the token if it's expired or about to expire.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient();

  // Fetch the connected account
  const { data: account, error } = await supabase
    .from('connected_accounts')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('provider', 'strava')
    .single() as { data: Pick<ConnectedAccountRow, 'access_token' | 'refresh_token' | 'expires_at'> | null; error: unknown };

  if (error || !account) {
    console.error('No Strava connection found:', error);
    return null;
  }

  const expiresAt = new Date(account.expires_at);
  const now = new Date();
  const bufferMinutes = 5; // Refresh 5 minutes before expiry
  const bufferTime = bufferMinutes * 60 * 1000;

  // Check if token is still valid (with buffer)
  if (expiresAt.getTime() - bufferTime > now.getTime()) {
    return account.access_token;
  }

  // Token expired or about to expire - refresh it
  console.log('Strava token expired, refreshing...');

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Strava credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: account.refresh_token,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strava token refresh failed:', errorText);
      return null;
    }

    const tokenData: StravaRefreshResponse = await response.json();

    // Update tokens in database
    const updateData: ConnectedAccountUpdate = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
    };

    const { error: updateError } = await supabase
      .from('connected_accounts')
      .update(updateData as never)
      .eq('user_id', userId)
      .eq('provider', 'strava');

    if (updateError) {
      console.error('Failed to update Strava tokens:', updateError);
      // Still return the new token even if we failed to save it
    }

    return tokenData.access_token;
  } catch (err) {
    console.error('Strava token refresh error:', err);
    return null;
  }
}
