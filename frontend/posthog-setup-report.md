# PostHog post-wizard report

The wizard has completed a deep integration of your Next.js 16.1.1 project with PostHog analytics. The integration includes:

- **Client-side initialization** via `instrumentation-client.ts` using the Next.js 15.3+ recommended approach
- **Server-side tracking** with `posthog-node` for API route events
- **Reverse proxy configuration** in `next.config.ts` to route analytics through `/ingest` for better reliability
- **User identification** on login to link anonymous and authenticated sessions
- **Error tracking** with `posthog.captureException()` for critical error handling
- **14 custom events** tracking key user actions across the conversion funnel

## Environment Variables

The following environment variables have been configured in `.env`:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_ECuaN1ulAan1eny68JNZeozZgP4SUKjb08wjKD07yli` |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` |

## Events Tracked

| Event Name | Description | File |
|------------|-------------|------|
| `user_signed_up` | User successfully created a new account via email | `components/auth/EmailAuthForm.tsx` |
| `user_logged_in` | User successfully signed in via email | `components/auth/EmailAuthForm.tsx` |
| `route_uploaded` | User uploaded a GPX file to create an adventure map | `components/controls/RouteUpload.tsx` |
| `strava_activity_imported` | User imported a route from their Strava activities | `components/controls/RouteUpload.tsx` |
| `project_saved` | User saved a new map project or updated an existing one | `components/controls/SaveButton.tsx` |
| `map_published` | User published their map to the community feed | `components/profile/PublishModal.tsx` |
| `poster_downloaded` | User downloaded their adventure print as an image | `components/controls/ExportButton.tsx` |
| `sculpture_exported` | User exported their journey sculpture for 3D printing | `components/controls/SculptureExportModal.tsx` |
| `map_liked` | User liked a map in the community feed | `components/voting/VoteButtons.tsx` |
| `comment_added` | User posted a comment on a published map | `components/comments/CommentForm.tsx` |
| `map_shared` | User shared a map via social platforms or copied the link | `components/social/ShareModal.tsx` |
| `strava_connected` | User connected their Strava account | `components/account/ConnectedServices.tsx` |
| `strava_disconnected` | User disconnected their Strava account | `components/account/ConnectedServices.tsx` |
| `cookie_consent_given` | User accepted or configured cookie preferences | `components/CookieConsent.tsx` |

## Files Created/Modified

### New Files
- `instrumentation-client.ts` - Client-side PostHog initialization
- `lib/posthog-server.ts` - Server-side PostHog client
- `.env` - Environment variables for PostHog

### Modified Files
- `next.config.ts` - Added reverse proxy rewrites for PostHog
- `components/auth/EmailAuthForm.tsx` - Added signup/login events and user identification
- `components/controls/RouteUpload.tsx` - Added route upload and Strava import events
- `components/controls/SaveButton.tsx` - Added project save events
- `components/profile/PublishModal.tsx` - Added map publish event
- `components/controls/ExportButton.tsx` - Added poster download event
- `components/controls/SculptureExportModal.tsx` - Added sculpture export event
- `components/voting/VoteButtons.tsx` - Added map like event
- `components/comments/CommentForm.tsx` - Added comment event
- `components/social/ShareModal.tsx` - Added share events
- `components/account/ConnectedServices.tsx` - Added Strava connection events
- `components/CookieConsent.tsx` - Added cookie consent events

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/114640/dashboard/482491) - Core analytics dashboard with all key metrics

### Insights
- [Signups & Logins Trend](https://eu.posthog.com/project/114640/insights/fmqNjZDa) - Track user signups and logins over time
- [Signup to Map Creation Funnel](https://eu.posthog.com/project/114640/insights/OIQ7QY9g) - Track conversion from signup to creating and publishing maps
- [Export Funnel](https://eu.posthog.com/project/114640/insights/bQEfrr5b) - Track users who download posters vs 3D sculptures
- [Engagement Metrics](https://eu.posthog.com/project/114640/insights/GWTTaYF4) - Track likes, comments, and shares on published maps
- [Strava Integration](https://eu.posthog.com/project/114640/insights/4tHq13aw) - Track Strava connections, disconnections, and imports
