# Brevo Email Automation - Product Requirements Document

> **Transactional + marketing email automation for user lifecycle management**
> Personal, down-to-earth communication from "Jonas from Waymarker"

**Created**: 2026-01-16
**Status**: In Progress
**Priority**: P1 - Critical for user retention and conversion
**SDK**: `@getbrevo/brevo` (Node.js)

---

## Executive Summary

This PRD defines the email automation strategy for Waymarker using Brevo. The goal is to create a personal, non-corporate email experience that:

1. **Welcomes new users** with a warm, personal onboarding sequence
2. **Delivers purchases** instantly with download links and gratitude
3. **Re-engages dormant users** with gentle, value-focused nudges
4. **Encourages referrals** through authentic community building
5. **Maximizes open/click rates** through personal tone and value-first content

### Design Philosophy

- **Personal, not corporate** - Emails read like they're from a friend who built something cool
- **Value-first** - Every email provides genuine value, not just promotional content
- **Transparent** - Openly discuss what we're building and invite feedback
- **Respectful** - Never spammy, always easy to unsubscribe, low email frequency

### Success Metrics

| Metric | Target | Industry Avg |
|--------|--------|--------------|
| Welcome email open rate | >60% | 50-60% |
| Onboarding sequence completion | >40% | 20-30% |
| Purchase email open rate | >80% | 70-80% |
| Retention email open rate | >35% | 15-25% |
| Unsubscribe rate | <0.5% | 0.5-1% |
| Referral conversion rate | >5% | 2-5% |

---

## Technical Architecture

### Brevo SDK Setup

**Package**: `@getbrevo/brevo`

```bash
npm install @getbrevo/brevo
```

**Environment Variables** (already configured in `.env.local`):
```bash
# Brevo (Email)
BREVO_API_KEY=xkeysib-...        # Your single API key - used for everything
BREVO_SENDER_EMAIL=hello@waymarker.eu
BREVO_SENDER_NAME=Jonas from Waymarker
```

**Note**: Brevo uses ONE API key for all operations (transactional emails, contact management, AND event tracking). The event tracking endpoint uses an `ma-key` header, but you pass your regular API key there too.

### Integration Pattern

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  App Event  │────▶│ Brevo Track  │────▶│  Automation │
│  (signup)   │     │    Event     │     │   Trigger   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Contact    │
                    │   Created/   │
                    │   Updated    │
                    └──────────────┘
```

### File Structure

```
frontend/
├── lib/
│   └── brevo/
│       ├── client.ts          # Brevo API client singleton
│       ├── contacts.ts        # Contact management (create, update)
│       ├── events.ts          # Event tracking for automation triggers
│       ├── transactional.ts   # Direct transactional email sending
│       └── types.ts           # TypeScript interfaces
```

---

## Brevo API Reference

This section documents the key Brevo APIs used, extracted from official documentation for quick reference.

### Important: Two Different Event APIs

Brevo has **two different event tracking APIs**:

| API | Endpoint | Auth Header | Notes |
|-----|----------|-------------|-------|
| **Old Tracker API** | `in-automate.brevo.com/api/v2/trackEvent` | `ma-key` | Requires special tracker key (NOT API key) |
| **Core Events API** ✅ | `api.brevo.com/v3/events` | `api-key` | Uses standard API key - **USE THIS ONE** |

The old tracker API requires a separate "Marketing Automation key" from Brevo's tracker settings. The Core Events API uses your standard API key and is recommended.

### 1. Send Transactional Email

```typescript
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

const emailAPI = new TransactionalEmailsApi();
emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY!;

const message = new SendSmtpEmail();
message.subject = "Welcome to Waymarker!";
message.htmlContent = "<html>...</html>";
message.sender = {
  name: process.env.BREVO_SENDER_NAME,
  email: process.env.BREVO_SENDER_EMAIL
};
message.to = [{ email: "user@example.com", name: "User Name" }];

// Optional: Use template instead of inline HTML
message.templateId = 1; // Template ID from Brevo dashboard
message.params = { firstName: "John", downloadLink: "https://..." };

await emailAPI.sendTransacEmail(message);
```

### 2. Create/Update Contact

```typescript
import { ContactsApi, CreateContact, ContactsApiApiKeys } from '@getbrevo/brevo';

const contactsApi = new ContactsApi();
contactsApi.setApiKey(ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

const contact = new CreateContact();
contact.email = "user@example.com";
contact.attributes = {
  FIRSTNAME: "John",
  LASTNAME: "Doe",
  SIGNUP_DATE: new Date().toISOString(),
  HAS_PURCHASED: false,
  STRAVA_CONNECTED: false,
  MAPS_CREATED: 0,
  LAST_ACTIVITY: new Date().toISOString(),
};
contact.listIds = [5]; // "All Users" list (ID #5)
contact.updateEnabled = true; // Update if contact already exists

await contactsApi.createContact(contact);
```

### 3. Track Custom Event (for Automation Triggers)

**Use the Core Events API** (`api.brevo.com/v3/events`) - this uses your standard API key.

```typescript
// Track event for automation trigger
async function trackBrevoEvent(
  email: string,
  eventName: string,
  contactProperties?: Record<string, unknown>,
  eventProperties?: Record<string, unknown>
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn('BREVO_API_KEY not configured');
    return false;
  }

  const response = await fetch('https://api.brevo.com/v3/events', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      event_name: eventName,
      identifiers: {
        email_id: email,
      },
      contact_properties: contactProperties || {},
      event_properties: eventProperties || {},
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Brevo event tracking failed:', error);
    return false;
  }

  return true;
}

// Example: Track a purchase
await trackBrevoEvent(
  "user@example.com",
  "purchase_completed",
  // Contact properties (updates the contact record)
  {
    FIRSTNAME: "Jonas",
    HAS_PURCHASED: true,
  },
  // Event properties (available in automation as {{event.propertyName}})
  {
    product: "poster_medium",
    amount: 999,
    productName: "Medium Poster (18x24\")",
    productType: "poster",
    downloadLink: "https://waymarker.eu/download/abc123",
    firstName: "Jonas",
  }
);
```

**Test with curl:**
```bash
curl --request POST \
  --url https://api.brevo.com/v3/events \
  --header "accept: application/json" \
  --header "content-type: application/json" \
  --header "api-key: YOUR_API_KEY" \
  --data '{"event_name":"purchase_completed","identifiers":{"email_id":"user@example.com"},"contact_properties":{"FIRSTNAME":"Jonas","HAS_PURCHASED":true},"event_properties":{"product":"poster_medium","amount":999,"productName":"Medium Poster","productType":"poster","downloadLink":"https://waymarker.eu/test","firstName":"Jonas"}}'
```

### 4. Update Contact Attributes

```typescript
import { ContactsApi, UpdateContact, ContactsApiApiKeys } from '@getbrevo/brevo';

const contactsApi = new ContactsApi();
contactsApi.setApiKey(ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

const update = new UpdateContact();
update.attributes = {
  STRAVA_CONNECTED: true,
  LAST_ACTIVITY: new Date().toISOString(),
};

await contactsApi.updateContact("user@example.com", update);
```

---

## Email Flows & Automation

### Flow 1: Welcome Sequence (3 emails)

**Trigger**: `user_signed_up` event
**Goal**: Help users create their first map and understand the value

#### Email 1: Welcome (Immediate)

**Subject**: Welcome to Waymarker - let's turn your adventures into art

**Content**:
```
Hey!

Jonas here, founder of Waymarker.

I'm stoked you signed up! I built Waymarker because I wanted a way to turn
my running and cycling routes into something I could actually hang on my wall -
not just another forgotten GPX file on Strava.

Here's what you can do:

• Upload any GPX file and see it come alive on a beautiful map
• Connect Strava to import your activities directly
• Choose from 11 map styles and 15+ color palettes
• Export as a high-res poster or even a 3D-printable sculpture

→ Create your first map: [Start Creating]

If you have questions or just want to say hi, hit reply - I read every email.

Happy trails,
Jonas

P.S. - The editor saves your work automatically, so feel free to experiment!
```

#### Email 2: First Map Guide (Day 2)

**Subject**: Quick tip: 3 ways to make your map pop

**Content**:
```
Hey again!

Wanted to share a few tips that make a big difference:

1. **Try 3D terrain** - If your route has elevation changes, turn on 3D terrain
   for that mountain feel. Works especially well with hikes and mountain rides.

2. **Use the privacy zone** - Planning to print and hang it? The privacy zone
   hides where your route starts/ends so your address isn't on display.

3. **Experiment with styles** - "Positron" is great for clean, minimal looks.
   "Outdoor" shows trails and contours. "Satellite" for that Google Earth vibe.

[See these in action →]

Haven't uploaded a route yet? No worries - you can also search for any location
and create a map of your favorite place. New York, Paris, your hometown...
anywhere.

Cheers,
Jonas
```

#### Email 3: Strava Connect (Day 5)

**Condition**: Only send if `STRAVA_CONNECTED = false`

**Subject**: Your Strava activities are waiting

**Content**:
```
Hey!

Quick one: Did you know you can connect Strava and import any of your
activities directly? No need to export/import GPX files.

Takes about 10 seconds:
1. Go to your profile
2. Click "Connect Strava"
3. Authorize (read-only - we just need your routes)
4. Pick any activity and it shows up in the editor

[Connect Strava →]

Already have a GPX file? That works too - just drag and drop it onto the editor.

Later,
Jonas
```

---

### Flow 2: Purchase & Delivery

**Trigger**: `purchase_completed` event (from Stripe webhook)
**Goal**: Deliver the purchase, express gratitude, encourage sharing

#### Email 1: Order Confirmation & Download (Immediate)

**Subject**: Your Waymarker download is ready

**Content**:
```
Hey {{params.firstName}}!

Your {{params.productName}} is ready to download. Thank you so much for
supporting Waymarker - it means a lot.

→ [Download Your File]({{params.downloadLink}})

This link expires in 7 days and works for up to 3 downloads, so make sure
to save your file somewhere safe.

**What's next?**

For Posters:
• Head to a local print shop (I use Vistaprint or a local framer)
• Recommended: matte or satin finish looks best
• Frame it and enjoy your adventure on the wall!

For 3D Sculptures:
• Upload the STL to your slicer (Cura, PrusaSlicer, etc.)
• Recommended: 0.2mm layer height, 20% infill
• Or use a service like Shapeways or Craftcloud

If you post it on Instagram or share it anywhere, tag @waymarker.eu - I'd
love to see it!

Thanks again,
Jonas

P.S. - If anything looks off with your download, just reply to this email
and I'll sort it out.
```

#### Email 2: Share & Refer (Day 3 after purchase)

**Subject**: How did your print turn out?

**Content**:
```
Hey {{params.firstName}}!

Just checking in - how did your {{params.productType}} turn out?

If you're happy with it, I'd love if you could:

• **Share it** - Tag @waymarker.eu on Instagram or share in your running/
  cycling group. Helps other adventurers find us!

• **Leave a review** - Reply to this email with a quick thought. I feature
  the best ones on the site (with your permission).

• **Tell a friend** - Know someone who'd love this? Send them to waymarker.eu

And if something didn't work out, let me know - I want to make it right.

Cheers,
Jonas
```

---

### Flow 3: Onboarding Nudges

**Trigger**: Inactivity conditions
**Goal**: Re-engage users who haven't completed key actions

#### Email: First Route Nudge (Day 7, no maps created)

**Condition**: `MAPS_CREATED = 0` AND signed up 7+ days ago

**Subject**: Your first map is waiting

**Content**:
```
Hey!

I noticed you signed up for Waymarker but haven't created a map yet.
No pressure at all - just wanted to make sure everything's working okay.

If you're not sure where to start:

• **Have a GPX file?** Drag and drop it into the editor
• **Use Strava?** Connect your account and import any activity
• **Just exploring?** Search for any city and create a poster of that

[Start creating →]

If you have any questions or feedback, I'm all ears - just hit reply.

Cheers,
Jonas
```

---

### Flow 4: Retention & Win-back

**Trigger**: Inactivity periods
**Goal**: Bring back dormant users with value-focused content

#### Email: 30-Day Win-back

**Condition**: No activity in 30 days (check `LAST_ACTIVITY` attribute)

**Subject**: We've added some new stuff

**Content**:
```
Hey!

It's been a while since you visited Waymarker. Wanted to share a few
things we've added recently:

• **3D Journey Sculptures** - Turn your routes into 3D-printable art
• **New map styles** - Including "Dark Matter" and "Vintage"
• **Better terrain rendering** - Mountains look way more dramatic now

[Check it out →]

If Waymarker isn't what you're looking for, no worries at all - you can
unsubscribe below and I won't bother you again.

But if you're still into the idea of turning adventures into wall art,
we'd love to have you back.

Cheers,
Jonas
```

#### Email: 90-Day Win-back (Final)

**Condition**: No activity in 90 days

**Subject**: Last one from me

**Content**:
```
Hey,

I'll keep this short - you signed up for Waymarker a while back but
haven't been around lately.

If you're not interested anymore, totally cool. You can unsubscribe
below and that's that.

But if you ever want to turn a hike, run, or ride into something you
can hang on your wall, we'll be here.

[Visit Waymarker →]

Take care,
Jonas

P.S. - If you have feedback on why Waymarker wasn't for you, I'd
genuinely love to hear it. Just hit reply.
```

---

## Contact Attributes

Set up these attributes in Brevo (Settings → Contacts → Contact Attributes):

| Attribute | Type | Description |
|-----------|------|-------------|
| `FIRSTNAME` | Text | User's first name |
| `LASTNAME` | Text | User's last name |
| `SIGNUP_DATE` | Date | When they signed up |
| `SIGNUP_SOURCE` | Category | "email", "google" |
| `HAS_PURCHASED` | Boolean | Made at least one purchase |
| `PURCHASE_COUNT` | Number | Total purchases |
| `LAST_PURCHASE_DATE` | Date | Most recent purchase |
| `TOTAL_SPENT` | Number | Lifetime value in cents |
| `STRAVA_CONNECTED` | Boolean | Strava account connected |
| `MAPS_CREATED` | Number | Total maps saved |
| `LAST_ACTIVITY` | Date | Last app interaction |
| `ROUTES_UPLOADED` | Number | GPX files uploaded |

---

## Events to Track

These events trigger automations in Brevo. Track them using the `/api/v2/trackEvent` endpoint.

| Event Name | Trigger Point | Properties |
|------------|---------------|------------|
| `user_signed_up` | After successful signup | `signupSource` |
| `strava_connected` | After Strava OAuth success | - |
| `route_uploaded` | After GPX upload | `distance`, `elevation` |
| `map_saved` | After saving a map | `mapStyle` |
| `purchase_completed` | After Stripe webhook | `product`, `amount`, `downloadLink`, `productName` |

---

## Implementation Checklist

### Phase 1: SDK & Contact Management
- [x] Install `@getbrevo/brevo` package
- [x] Create `lib/brevo/client.ts` with API client
- [x] Create `lib/brevo/contacts.ts` for contact creation/update
- [x] Add contact creation on signup:
  - [x] `app/auth/callback/route.ts` (OAuth callback - handles both email and Google)
- [x] Add contact attribute updates on key actions:
  - [x] `MAPS_CREATED` - updated on map save (`lib/actions/maps.ts`)
  - [x] `STRAVA_CONNECTED` - updated on Strava connect (`app/api/strava/callback/route.ts`)
  - [x] `HAS_PURCHASED`, `PURCHASE_COUNT`, `TOTAL_SPENT`, `LAST_PURCHASE_DATE` - updated on purchase (`app/api/stripe/webhook/route.ts`)

### Phase 2: Event Tracking
- [x] Create `lib/brevo/events.ts` for event tracking
- [x] Add `purchase_completed` event in Stripe webhook
- [ ] Add `user_signed_up` event on signup (optional - contact creation suffices for welcome sequence)
- [ ] Add `strava_connected` event on Strava OAuth (optional - attribute update suffices)
- [ ] Add `route_uploaded` event on GPX upload (optional - for future automation)
- [ ] Add `map_saved` event on save (optional - for future automation)

### Phase 3: Brevo Dashboard Configuration (Jonas does this in Brevo UI)
- [x] Create contact attributes (HAS_PURCHASED, PURCHASE_COUNT, TOTAL_SPENT, LAST_PURCHASE_DATE, STRAVA_CONNECTED, MAPS_CREATED)
- [x] Create contact list: "All Users" (ID: #5)
- [ ] Create email templates with the copy above
- [ ] Set up automation workflows:
  - [ ] Welcome sequence (trigger: contact creation or `user_signed_up`)
  - [x] Purchase delivery (trigger: `purchase_completed`)
  - [ ] Post-purchase follow-up (3 days after purchase)
  - [ ] First route nudge (7 days, condition: MAPS_CREATED = 0)
  - [ ] 30-day win-back
  - [ ] 90-day win-back

### Phase 4: Testing & Launch
- [x] Test all events fire correctly (verified with test endpoint)
- [ ] Test automations with test account
- [ ] Verify unsubscribe works correctly
- [ ] Check email rendering on mobile/desktop
- [ ] Monitor deliverability in Brevo dashboard

---

## Purchase Flow Integration

The purchase confirmation email is triggered via event tracking, not direct sending:

```
1. User completes Stripe checkout
2. Stripe webhook fires (checkout.session.completed)
3. Webhook handler:
   a. Creates/updates order in database
   b. Tracks `purchase_completed` event to Brevo with downloadLink
4. Brevo automation sends purchase confirmation email
```

This approach means:
- Brevo handles email sending, retries, and deliverability
- The automation can include delays, follow-ups, etc.
- All purchase emails are consistent with your templates
- You get analytics on open/click rates

---

## GDPR Compliance

- All contacts have explicit consent (signup = consent to service emails)
- Marketing emails require separate opt-in (not implemented yet)
- Unsubscribe link in every email (Brevo handles automatically)
- Contact deletion on request (use Brevo dashboard or API)
- No sensitive data stored in Brevo (only email, name, purchase info)

---

## Setting Up Automations in Brevo

### Available Trigger Types

| Trigger | Use Case |
|---------|----------|
| **Contact added to list** | Welcome sequence, onboarding nudges |
| **Custom event** | Purchase delivery (needs event data like download link) |
| **Contact matches custom filters** | Win-back emails (based on LAST_ACTIVITY) |

### Creating an Automation Workflow

1. Go to **Automation** in the Brevo sidebar
2. Click **Create a workflow**
3. Choose **Custom workflow**
4. Select trigger type (see table above)
5. Add actions:
   - **Send an email** → Select your template
   - **Time delay** → Add delays between emails
   - **Conditional split** → Check attributes like `STRAVA_CONNECTED`
6. **Activate** the workflow

### Email Template Variables

When creating templates in Brevo, use these placeholders:

- `{{contact.FIRSTNAME}}` - Contact's first name attribute
- `{{contact.EMAIL}}` - Contact's email
- `{{event.downloadLink}}` - From event's `event_properties`
- `{{event.productName}}` - From event's `event_properties`
- `{{event.productType}}` - From event's `event_properties`
- `{{event.firstName}}` - From event's `event_properties`

### Workflow 1: Welcome Sequence

**Trigger**: Contact added to list → "All Users"

```
[Trigger: Contact added to list "All Users"]
    ↓
[Action: Send an email] → welcome-email
    ↓
[Rule: Time delay] → 2 days
    ↓
[Action: Send an email] → tips-email
    ↓
[Rule: Time delay] → 3 days
    ↓
[Rule: Conditional split] → STRAVA_CONNECTED = false
    ↓ Yes                    ↓ No
[Send: strava-connect]    [End]
    ↓
  [End]
```

### Workflow 2: First Route Nudge

**Trigger**: Contact added to list → "All Users"

```
[Trigger: Contact added to list "All Users"]
    ↓
[Rule: Time delay] → 7 days
    ↓
[Rule: Conditional split] → MAPS_CREATED = 0
    ↓ Yes                    ↓ No
[Send: first-route-nudge]  [End]
    ↓
  [End]
```

### Workflow 3: Purchase Delivery

**Trigger**: Custom event → `purchase_completed`

```
[Trigger: Custom event "purchase_completed"]
    ↓
[Action: Send an email] → purchase-confirmation
   (uses {{event.downloadLink}}, {{event.productName}})
    ↓
  [End]
```

### Workflow 4: Post-Purchase Follow-up

**Trigger**: Custom event → `purchase_completed`

```
[Trigger: Custom event "purchase_completed"]
    ↓
[Rule: Time delay] → 3 days
    ↓
[Action: Send an email] → post-purchase-followup
   (uses {{event.firstName}}, {{event.productType}})
    ↓
  [End]
```

### Workflow 5: 30-Day Win-back

**Trigger**: Contact matches custom filters → LAST_ACTIVITY between 30-31 days ago

```
[Trigger: Contact matches filters]
   Filter: LAST_ACTIVITY between 30 and 31 days before today
    ↓
[Action: Send an email] → winback-30-day
    ↓
  [End]
```

### Workflow 6: 90-Day Win-back

**Trigger**: Contact matches custom filters → LAST_ACTIVITY between 90-91 days ago

```
[Trigger: Contact matches filters]
   Filter: LAST_ACTIVITY between 90 and 91 days before today
    ↓
[Action: Send an email] → winback-90-day
    ↓
  [End]
```

---

## Appendix: Code Implementation Examples

### lib/brevo/client.ts

```typescript
import { ContactsApi, TransactionalEmailsApi, ContactsApiApiKeys } from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;

if (!apiKey) {
  console.warn('BREVO_API_KEY not configured');
}

// Contacts API client
export const contactsApi = new ContactsApi();
contactsApi.setApiKey(ContactsApiApiKeys.apiKey, apiKey || '');

// Transactional Emails API client
export const transactionalApi = new TransactionalEmailsApi();
transactionalApi.authentications.apiKey.apiKey = apiKey || '';

// Sender config
export const brevoSender = {
  name: process.env.BREVO_SENDER_NAME || 'Jonas from Waymarker',
  email: process.env.BREVO_SENDER_EMAIL || 'hello@waymarker.eu',
};
```

### lib/brevo/events.ts

```typescript
import { logger } from '@/lib/logger';

// Use the Core Events API (not the old tracker API)
const BREVO_EVENTS_URL = 'https://api.brevo.com/v3/events';

export interface PurchaseEventData {
  product: string;
  amount: number;
  productName: string;
  productType: 'poster' | 'sculpture';
  downloadLink: string;
  firstName: string;
}

export async function trackBrevoEvent(
  email: string,
  eventName: string,
  contactProperties?: Record<string, unknown>,
  eventProperties?: Record<string, unknown>
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    logger.warn('BREVO_API_KEY not configured, skipping event tracking');
    return false;
  }

  try {
    const response = await fetch(BREVO_EVENTS_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        event_name: eventName,
        identifiers: {
          email_id: email,
        },
        contact_properties: contactProperties || {},
        event_properties: eventProperties || {},
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Brevo event tracking failed:', { eventName, error });
      return false;
    }

    logger.info('Brevo event tracked:', { email, eventName });
    return true;
  } catch (error) {
    logger.error('Brevo event tracking error:', error);
    return false;
  }
}

// Convenience function for purchase events
export async function trackPurchaseCompleted(
  email: string,
  data: PurchaseEventData
): Promise<boolean> {
  return trackBrevoEvent(
    email,
    'purchase_completed',
    {
      FIRSTNAME: data.firstName,
      HAS_PURCHASED: true,
    },
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
```

### lib/brevo/contacts.ts

```typescript
import { CreateContact, UpdateContact } from '@getbrevo/brevo';
import { contactsApi } from './client';
import { logger } from '@/lib/logger';

export interface BrevoContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  signupSource?: 'email' | 'google';
}

export async function createBrevoContact(data: BrevoContactData): Promise<boolean> {
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
    };
    contact.listIds = [5]; // "All Users" list (ID #5)
    contact.updateEnabled = true;

    await contactsApi.createContact(contact);
    logger.info('Brevo contact created:', data.email);
    return true;
  } catch (error) {
    logger.error('Failed to create Brevo contact:', error);
    return false;
  }
}

export async function updateBrevoContact(
  email: string,
  attributes: Record<string, unknown>
): Promise<boolean> {
  try {
    const update = new UpdateContact();
    update.attributes = {
      ...attributes,
      LAST_ACTIVITY: new Date().toISOString(),
    };

    await contactsApi.updateContact(email, update);
    logger.info('Brevo contact updated:', email);
    return true;
  } catch (error) {
    logger.error('Failed to update Brevo contact:', error);
    return false;
  }
}
```
