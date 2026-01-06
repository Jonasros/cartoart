import { EmailAuthForm } from '@/components/auth/EmailAuthForm';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Mountain } from 'lucide-react';

export const metadata = {
  title: 'Sign Up | Waymarker',
  description: 'Create an account to save and share your adventure keepsakes',
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;

  if (user) {
    redirect(params.redirect || '/profile');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-trail-light to-background dark:from-background dark:to-card relative overflow-hidden">
      <AuthBackground />
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-card/95 dark:bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-border">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-forest to-forest-dark flex items-center justify-center shadow-lg">
              <Mountain className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Start Your Journey
            </h1>
            <p className="text-muted-foreground">
              Join Waymarker to save and share your adventure keepsakes
            </p>
          </div>

          <EmailAuthForm mode="signup" redirectTo={params.redirect} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href={params.redirect ? `/login?redirect=${encodeURIComponent(params.redirect)}` : '/login'}
                className="text-primary hover:text-forest-light hover:underline font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
