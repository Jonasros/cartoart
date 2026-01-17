'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/control-components';
import posthog from 'posthog-js';
import { ensureBrevoContact } from '@/lib/brevo/client-actions';

interface EmailAuthFormProps {
  mode: 'login' | 'signup';
  redirectTo?: string;
}

export function EmailAuthForm({ mode, redirectTo }: EmailAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`,
          },
        });

        if (error) throw error;

        // Track signup event
        posthog.capture('user_signed_up', {
          auth_method: 'email',
        });

        // Add user to Brevo immediately on signup (before email verification)
        // This ensures they get welcome emails even if callback fails
        // The callback will also call this (idempotent - safe to call twice)
        ensureBrevoContact(email, 'email').catch((err) => {
          console.error('Failed to create Brevo contact on signup:', err);
        });

        setMessage('Check your email for the confirmation link!');
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Identify user and track login event
        if (data.user) {
          posthog.identify(data.user.id, {
            email: data.user.email,
          });
          posthog.capture('user_logged_in', {
            auth_method: 'email',
          });

          // Ensure user has a Brevo contact (catches users who signed up
          // before Brevo was integrated, or had callback failures)
          // This is non-blocking - don't wait for it
          ensureBrevoContact(data.user.email!, 'email').catch((err) => {
            console.error('Failed to ensure Brevo contact on login:', err);
          });
        }

        router.refresh();
        router.push(redirectTo || '/profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {message && (
        <div className="p-3 rounded-lg bg-forest/10 border border-forest/30">
          <p className="text-sm text-forest dark:text-forest-light">{message}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          placeholder="••••••••"
        />
      </div>

      {mode === 'signup' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="••••••••"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full btn-press"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
          </span>
        ) : (
          mode === 'signup' ? 'Start Your Journey' : 'Sign In'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-6">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  );
}
