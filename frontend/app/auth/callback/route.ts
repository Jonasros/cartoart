import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createBrevoContact } from '@/lib/brevo';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const user = data.user;
      const provider = user.app_metadata?.provider;
      const signupSource = provider === 'google' ? 'google' : 'email';
      const isOAuth = provider === 'google';
      const marketingConsentCollected = user.user_metadata?.marketing_consent_collected;

      // Extract name from user metadata (available for OAuth signups)
      const fullName = user.user_metadata?.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create/update contact in Brevo (non-blocking)
      // For OAuth users, consent will be collected on the consent page
      // For email users, consent was already collected in the signup form
      createBrevoContact({
        email: user.email!,
        firstName,
        lastName,
        signupSource,
        // Only pass marketing consent for email signups (OAuth will be updated later)
        marketingConsent: isOAuth ? undefined : user.user_metadata?.marketing_consent,
      }).catch((err) => {
        console.error('Failed to create Brevo contact:', err);
      });

      // Determine redirect URL
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const baseUrl = isLocalEnv
        ? origin
        : forwardedHost
          ? `https://${forwardedHost}`
          : origin;

      // For new OAuth users who haven't collected consent, redirect to consent page
      if (isOAuth && !marketingConsentCollected) {
        const consentUrl = new URL('/auth/consent', baseUrl);
        consentUrl.searchParams.set('next', next);
        return NextResponse.redirect(consentUrl.toString());
      }

      // Otherwise, redirect to intended destination
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}

