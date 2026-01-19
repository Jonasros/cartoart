import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { StravaTokenResponse } from '@/types/strava';
import type { Database, Json } from '@/types/database';
import { updateBrevoContact } from '@/lib/brevo';
import { checkRateLimit } from '@/lib/middleware/rateLimit';

type ConnectedAccountInsert = Database['public']['Tables']['connected_accounts']['Insert'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle user denial
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=error&message=missing_params`
    );
  }

  // Validate state from cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get('strava_oauth_state')?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=error&message=invalid_state`
    );
  }

  // Clear the state cookie
  cookieStore.delete('strava_oauth_state');

  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?redirect=/profile`
    );
  }

  // Rate limit: 5 OAuth attempts per 5 minutes per user
  const { allowed, retryAfter } = await checkRateLimit(
    user.id,
    'strava_oauth',
    5,
    5 * 60 * 1000
  );

  if (!allowed) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=error&message=rate_limited&retry=${retryAfter}`
    );
  }

  // Exchange code for tokens
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=error&message=config_error`
    );
  }

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Strava token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=error&message=token_exchange_failed`
      );
    }

    const tokenData: StravaTokenResponse = await tokenResponse.json();

    // Upsert connected account
    const accountData: ConnectedAccountInsert = {
      user_id: user.id,
      provider: 'strava',
      provider_user_id: tokenData.athlete.id.toString(),
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      athlete_data: tokenData.athlete as unknown as Json,
    };

    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert(accountData as never, { onConflict: 'user_id,provider' });

    if (upsertError) {
      console.error('Failed to save Strava connection:', upsertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=error&message=save_failed`
      );
    }

    // Update Brevo contact with STRAVA_CONNECTED (non-blocking)
    if (user.email) {
      updateBrevoContact(user.email, {
        STRAVA_CONNECTED: true,
      }).catch((err) => {
        console.error('Failed to update Brevo STRAVA_CONNECTED:', err);
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=connected`
    );
  } catch (err) {
    console.error('Strava OAuth error:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/profile?strava=error&message=unknown`
    );
  }
}
