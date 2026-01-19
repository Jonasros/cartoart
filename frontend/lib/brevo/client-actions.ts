'use server';

/**
 * Server actions for Brevo that can be called from client components
 */

import { createBrevoContact } from './contacts';

/**
 * Ensure a user has a Brevo contact (create if doesn't exist)
 * Called from client after successful login to catch users who:
 * - Signed up before Brevo was integrated
 * - Had callback failures during signup
 * - Are logging in for the first time after email verification
 */
export async function ensureBrevoContact(
  email: string,
  signupSource: 'email' | 'google' = 'email',
  marketingConsent?: boolean
): Promise<boolean> {
  try {
    // createBrevoContact has updateEnabled: true, so it's idempotent
    // If contact exists, it just updates last_activity
    await createBrevoContact({
      email,
      firstName: '',
      lastName: '',
      signupSource,
      marketingConsent,
    });
    return true;
  } catch (error) {
    console.error('Failed to ensure Brevo contact:', error);
    return false;
  }
}
