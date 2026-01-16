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
      // Add user to Brevo (creates new contact or updates existing)
      // This triggers the welcome sequence for new signups
      const user = data.user;
      const provider = user.app_metadata?.provider;
      const signupSource = provider === 'google' ? 'google' : 'email';

      // Extract name from user metadata (available for OAuth signups)
      const fullName = user.user_metadata?.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create/update contact in Brevo (non-blocking)
      createBrevoContact({
        email: user.email!,
        firstName,
        lastName,
        signupSource,
      }).catch((err) => {
        console.error('Failed to create Brevo contact:', err);
      });

      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}

