/**
 * Brevo event tracking for automation triggers
 * Uses the Core Events API (api.brevo.com/v3/events)
 * @see docs/PRD-BREVO-EMAIL-AUTOMATION.md
 */

import { logger } from '@/lib/logger';
import type { PurchaseEventData, TrackEventResult } from './types';

// Core Events API endpoint (NOT the old tracker API)
const BREVO_EVENTS_URL = 'https://api.brevo.com/v3/events';

/**
 * Track a custom event in Brevo for automation triggers
 *
 * @param email - Contact's email address
 * @param eventName - Event name (e.g., "purchase_completed")
 * @param contactProperties - Updates to contact attributes (stored on contact)
 * @param eventProperties - Event-specific data (available as {{event.propertyName}} in templates)
 */
export async function trackBrevoEvent(
  email: string,
  eventName: string,
  contactProperties?: Record<string, unknown>,
  eventProperties?: Record<string, unknown>
): Promise<TrackEventResult> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    logger.warn('BREVO_API_KEY not configured, skipping event tracking');
    return { success: false, error: 'Brevo not configured' };
  }

  const payload = {
    event_name: eventName,
    identifiers: {
      email_id: email,
    },
    contact_properties: contactProperties || {},
    event_properties: eventProperties || {},
  };

  logger.info('Brevo event API request:', {
    email,
    eventName,
    contactProperties: Object.keys(contactProperties || {}),
    eventProperties: Object.keys(eventProperties || {}),
  });

  try {
    const response = await fetch(BREVO_EVENTS_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      logger.error('Brevo event tracking failed:', {
        eventName,
        email,
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        payload: JSON.stringify(payload),
      });
      return { success: false, error: responseText };
    }

    logger.info('Brevo event tracked successfully:', {
      email,
      eventName,
      status: response.status,
      response: responseText || '(empty response)',
    });
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Brevo event tracking exception:', {
      email,
      eventName,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Track purchase completed event
 * Triggers: Purchase delivery email, Post-purchase follow-up
 */
export async function trackPurchaseCompleted(
  email: string,
  data: PurchaseEventData
): Promise<TrackEventResult> {
  return trackBrevoEvent(
    email,
    'purchase_completed',
    // Contact properties (stored on the contact record)
    {
      FIRSTNAME: data.firstName,
      HAS_PURCHASED: true,
    },
    // Event properties (available in email templates as {{event.propertyName}})
    {
      product: data.product,
      amount: data.amount,
      productName: data.productName,
      productType: data.productType,
      downloadLink: data.downloadLink,
      firstName: data.firstName,
    }
  );
}

/**
 * Track user signup event
 * Triggers: Welcome sequence
 */
export async function trackUserSignedUp(
  email: string,
  signupSource: 'email' | 'google'
): Promise<TrackEventResult> {
  return trackBrevoEvent(
    email,
    'user_signed_up',
    {
      SIGNUP_SOURCE: signupSource,
      SIGNUP_DATE: new Date().toISOString(),
    },
    {
      signupSource,
    }
  );
}

/**
 * Track Strava connected event
 */
export async function trackStravaConnected(
  email: string
): Promise<TrackEventResult> {
  return trackBrevoEvent(
    email,
    'strava_connected',
    {
      STRAVA_CONNECTED: true,
    },
    {}
  );
}

/**
 * Track route uploaded event
 */
export async function trackRouteUploaded(
  email: string,
  data: { distance?: number; elevation?: number }
): Promise<TrackEventResult> {
  return trackBrevoEvent(
    email,
    'route_uploaded',
    {},
    {
      distance: data.distance,
      elevation: data.elevation,
    }
  );
}

/**
 * Track map saved event
 */
export async function trackMapSaved(
  email: string,
  mapStyle: string
): Promise<TrackEventResult> {
  return trackBrevoEvent(
    email,
    'map_saved',
    {},
    {
      mapStyle,
    }
  );
}
