/**
 * Brevo email integration
 * @see docs/PRD-BREVO-EMAIL-AUTOMATION.md
 */

// Client exports
export { isBrevoConfigured, brevoSender } from './client';

// Contact management
export { createBrevoContact, updateBrevoContact } from './contacts';

// Event tracking
export {
  trackBrevoEvent,
  trackPurchaseCompleted,
  trackUserSignedUp,
  trackStravaConnected,
  trackRouteUploaded,
  trackMapSaved,
} from './events';

// Types
export type {
  BrevoContactAttributes,
  CreateContactData,
  PurchaseEventData,
  TrackEventResult,
} from './types';
