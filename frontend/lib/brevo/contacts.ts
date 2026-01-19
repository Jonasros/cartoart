/**
 * Brevo contact management
 * @see docs/PRD-BREVO-EMAIL-AUTOMATION.md
 */

import { CreateContact, UpdateContact } from '@getbrevo/brevo';
import { contactsApi, isBrevoConfigured } from './client';
import { logger } from '@/lib/logger';
import type { CreateContactData, BrevoContactAttributes } from './types';

// "All Users" list ID in Brevo
const ALL_USERS_LIST_ID = 5;

/**
 * Create a new contact in Brevo (or update if exists)
 * Called on user signup to add them to the "All Users" list
 */
export async function createBrevoContact(
  data: CreateContactData
): Promise<boolean> {
  if (!isBrevoConfigured()) {
    logger.warn('Brevo not configured, skipping contact creation');
    return false;
  }

  try {
    const contact = new CreateContact();
    contact.email = data.email;
    contact.attributes = {
      FIRSTNAME: data.firstName || '',
      LASTNAME: data.lastName || '',
      SIGNUP_DATE: new Date().toISOString(),
      SIGNUP_SOURCE: data.signupSource || 'email',
      HAS_PURCHASED: false,
      PURCHASE_COUNT: 0,
      STRAVA_CONNECTED: false,
      MAPS_CREATED: 0,
      LAST_ACTIVITY: new Date().toISOString(),
      MARKETING_CONSENT: data.marketingConsent ?? false,
      MARKETING_CONSENT_DATE: data.marketingConsent
        ? new Date().toISOString()
        : undefined,
    };
    contact.listIds = [ALL_USERS_LIST_ID];
    contact.updateEnabled = true; // Update if contact already exists

    await contactsApi.createContact(contact);
    logger.info('Brevo contact created:', data.email);
    return true;
  } catch (error) {
    // Check if it's a "contact already exists" error (which is fine)
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Contact already exist')) {
      logger.info('Brevo contact already exists:', data.email);
      return true;
    }

    logger.error('Failed to create Brevo contact:', error);
    return false;
  }
}

/**
 * Update contact attributes in Brevo
 * Used to track user activity (Strava connected, maps created, etc.)
 */
export async function updateBrevoContact(
  email: string,
  attributes: Partial<BrevoContactAttributes>
): Promise<boolean> {
  if (!isBrevoConfigured()) {
    logger.warn('Brevo not configured, skipping contact update');
    return false;
  }

  logger.info('Brevo contact update request:', {
    email,
    attributes: Object.keys(attributes),
  });

  try {
    const update = new UpdateContact();
    update.attributes = {
      ...attributes,
      LAST_ACTIVITY: new Date().toISOString(),
    };

    await contactsApi.updateContact(email, update);
    logger.info('Brevo contact updated successfully:', {
      email,
      updatedAttributes: Object.keys(update.attributes || {}),
    });
    return true;
  } catch (error) {
    // Extract more detailed error info
    const errorDetails = error instanceof Error
      ? {
          message: error.message,
          name: error.name,
          // @ts-expect-error - Brevo SDK errors may have body
          body: error.body || error.response?.body,
        }
      : error;

    logger.error('Failed to update Brevo contact:', {
      email,
      attributes,
      error: errorDetails,
    });
    return false;
  }
}
