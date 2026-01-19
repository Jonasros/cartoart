/**
 * Brevo integration types
 * @see docs/PRD-BREVO-EMAIL-AUTOMATION.md
 */

// Contact attributes stored in Brevo
export interface BrevoContactAttributes {
  FIRSTNAME?: string;
  LASTNAME?: string;
  SIGNUP_DATE?: string;
  SIGNUP_SOURCE?: 'email' | 'google';
  HAS_PURCHASED?: boolean;
  PURCHASE_COUNT?: number;
  LAST_PURCHASE_DATE?: string;
  TOTAL_SPENT?: number;
  STRAVA_CONNECTED?: boolean;
  MAPS_CREATED?: number;
  LAST_ACTIVITY?: string;
  ROUTES_UPLOADED?: number;
  MARKETING_CONSENT?: boolean;
  MARKETING_CONSENT_DATE?: string;
}

// Data needed to create a new contact
export interface CreateContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  signupSource?: 'email' | 'google';
  marketingConsent?: boolean;
}

// Data for purchase completed event
export interface PurchaseEventData {
  product: string;
  amount: number;
  productName: string;
  productType: 'poster' | 'sculpture';
  downloadLink: string;
  firstName: string;
}

// Event tracking response
export interface TrackEventResult {
  success: boolean;
  error?: string;
}
