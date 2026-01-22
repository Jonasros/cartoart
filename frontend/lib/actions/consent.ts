'use server';

import { createClient } from '@/lib/supabase/server';
import { updateBrevoContact } from '@/lib/brevo';
import { logger } from '@/lib/logger';

interface ConsentResult {
  success: boolean;
  error?: string;
}

/**
 * Submit marketing consent for OAuth users
 * Updates Brevo contact and marks consent as collected in user metadata
 */
export async function submitMarketingConsent(
  email: string,
  marketingConsent: boolean
): Promise<ConsentResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.error('Auth error in submitMarketingConsent:', authError);
    return { success: false, error: 'You must be signed in' };
  }

  // Verify the email matches the authenticated user
  if (user.email !== email) {
    logger.warn('Email mismatch in submitMarketingConsent', {
      provided: email,
      actual: user.email,
    });
    return { success: false, error: 'Email mismatch' };
  }

  try {
    // Update Brevo contact with marketing consent
    await updateBrevoContact(email, {
      MARKETING_CONSENT: marketingConsent,
      MARKETING_CONSENT_DATE: marketingConsent
        ? new Date().toISOString()
        : undefined,
    });

    // Mark consent as collected in user metadata
    // This prevents showing the consent modal again
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        marketing_consent_collected: true,
        marketing_consent: marketingConsent,
      },
    });

    if (updateError) {
      logger.error('Failed to update user metadata:', updateError);
      // Don't fail the whole operation - Brevo is already updated
    }

    logger.info('Marketing consent submitted', {
      email,
      marketingConsent,
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to submit marketing consent:', error);
    return {
      success: false,
      error: 'Failed to save preference. Please try again.',
    };
  }
}
