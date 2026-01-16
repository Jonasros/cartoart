# Waymarker - Development Context

> **Single source of truth** for AI development context.
> - See [STATUS.md](STATUS.md) for completed features & history
> - See [FEATURES.md](FEATURES.md) for roadmap & strategy
> - See [docs/PHASE4-3D-PRINTING.md](docs/PHASE4-3D-PRINTING.md) for Phase 4 specification
> - See [docs/PROGRAMMATIC-SEO.md](docs/PROGRAMMATIC-SEO.md) for SEO growth strategy
> - See [docs/PRD-FAMOUS-ROUTES-SEEDING.md](docs/PRD-FAMOUS-ROUTES-SEEDING.md) for famous routes database seeding
> - See [docs/PRD-BREVO-EMAIL-AUTOMATION.md](docs/PRD-BREVO-EMAIL-AUTOMATION.md) for email automation strategy

## Quick Reference

**Brand**: Waymarker (waymarker.eu)
**Phase**: Core Features ✅ Complete — Next: Programmatic SEO
**Dev Server**: http://localhost:3000

### What's Working
- 11 map styles with 15+ palettes
- GPX route upload with styling (color, width, opacity, dash patterns)
- Strava Connect: import activities directly from your Strava account
- 3D terrain elevation with MapTiler terrain-rgb tiles
- 3D buildings with style presets & perspective controls
- 3D Journey Sculptures with STL export for 3D printing
- High-res PNG export (up to 7200x10800px)
- Stripe payment integration for poster and sculpture exports
- Social features (feed, likes, comments, sharing)
- User auth (email/password + Google OAuth) via Supabase
- Marketing landing page with scroll animations
- PostHog analytics (14 custom events)
- GDPR-compliant cookie consent
- Famous routes seeding (41 pre-seeded routes with thumbnails)
- API usage monitoring dashboard
- Programmatic SEO pages (/race, /trail, /cycling)

---

## Trademark Policy

**IMPORTANT**: When working with famous routes and events:

1. **Use geographic/descriptive names** for products, not trademarked event names
   - ✅ "Boston 42K Running Route" (geographic)
   - ❌ "Boston Marathon Poster" (trademark)
   - ✅ "Mont Ventoux Cycling Route" (geographic)
   - ❌ "Tour de France Stage 16" (trademark)

2. **Body text for SEO context** - Can mention events in descriptions for SEO
3. **Disclaimers required** - All route landing pages include `RouteDisclaimer` component
4. **Route data is factual** - GPS coordinates themselves are not copyrightable

See `lib/seo/routes.ts` for the trademark-safe naming convention in the route catalog.

---

## Tech Stack

- **Framework**: Next.js 14+ App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: MapLibre GL JS + React Map GL
- **3D**: React Three Fiber + Three.js (sculptures)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe Checkout
- **Email**: Brevo (transactional + marketing)
- **Analytics**: PostHog
- **Tiles**: OpenFreeMap / MapTiler
- **Hosting**: Netlify

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/           # Login, signup
│   ├── (main)/           # Feed, profile, map detail
│   ├── api/              # geocode, tiles, publish, strava/*, orders/*
│   └── page.tsx          # Landing page
├── components/
│   ├── account/          # ConnectedServices (Strava)
│   ├── controls/         # Editor control panels
│   ├── landing/          # Marketing landing page sections
│   ├── map/              # MapPreview, TextOverlay
│   ├── sculpture/        # 3D sculpture viewer (R3F components)
│   ├── strava/           # StravaActivityPicker
│   └── ui/               # Shared components
├── lib/
│   ├── actions/          # Server actions (maps, votes, comments, orders)
│   ├── api-usage/        # API usage tracking system
│   ├── brevo/            # Brevo email (contacts, events, transactional)
│   ├── errors/           # Custom error classes
│   ├── middleware/       # Rate limiting, CSRF protection
│   ├── route/            # GPX parsing
│   ├── strava/           # Strava API helpers
│   ├── stripe/           # Stripe client, products, checkout
│   ├── styles/           # 11 map style definitions
│   └── validation/       # Zod schemas
├── scripts/
│   └── seed-famous-routes/  # Famous routes seeding (41 routes)
└── types/
    ├── poster.ts         # Core type definitions
    ├── strava.ts         # Strava API types
    ├── sculpture.ts      # Sculpture config types
    ├── stripe.ts         # Order, checkout, download types
    └── database.ts       # Supabase types (includes orders)
```

---

## Site Map

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/create` | Map editor |
| `/login`, `/signup` | Auth pages |
| `/feed` | Published maps gallery |
| `/map/[id]` | Single map detail view |
| `/profile` | User's saved maps |
| `/faq` | Frequently asked questions |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/cookies` | Cookie Policy |
| `/admin/api-usage` | Admin API usage dashboard (password protected) |
| `/export/success` | Post-payment success page |

### SEO Route Pages (Programmatic)

| Route Pattern | Purpose |
|---------------|---------|
| `/race/[slug]` | Marathon/running route landing pages (e.g., `/race/boston-marathon`) |
| `/trail/[slug]` | Hiking trail landing pages (e.g., `/trail/camino-de-santiago`) |
| `/cycling/[slug]` | Cycling route landing pages (e.g., `/cycling/mont-ventoux-cycling-route`) |

See `lib/seo/routes.ts` for all available slugs and `app/sitemap.ts` for sitemap generation.

### API Routes

- `/api/geocode` - Location search (Nominatim)
- `/api/tiles/[...path]` - Tile proxy
- `/api/publish` - Map publishing

### Strava API Routes

- `/api/strava/authorize` - Initiate Strava OAuth flow
- `/api/strava/callback` - Handle OAuth callback, store tokens
- `/api/strava/status` - Check connection status
- `/api/strava/disconnect` - Remove Strava connection
- `/api/strava/activities` - List user's Strava activities
- `/api/strava/activities/[id]` - Get activity detail with GPS streams

### Stripe/Orders API Routes

- `/api/stripe/create-checkout` - Create Stripe checkout session
- `/api/stripe/webhook` - Handle Stripe webhooks (payment completed, refunds)
- `/api/orders` - Create Stripe checkout session for export
- `/api/orders/complete` - Complete order after successful payment
- `/api/orders/[id]` - Get order status and download link

### Export API Routes

- `/api/export/download` - Secure download with token validation and limits

### Admin API Routes

- `/api/admin/usage` - API usage statistics dashboard (password protected)

### Specialty API Routes

- `/api/spaceports` - Rocket launch pad GeoJSON (Launch Library 2 API)

---

## Core Types

### PosterConfig
```typescript
interface PosterConfig {
  location: PosterLocation;
  style: PosterStyle;
  palette: ColorPalette;
  typography: TypographyConfig;
  format: FormatConfig;
  layers: LayerConfig;
  route?: RouteConfig;
}
```

### Key Layer Options
```typescript
layers: {
  streets: boolean;
  buildings: boolean;
  water: boolean;
  parks: boolean;
  terrain: boolean;
  labels: boolean;
  // 3D Terrain (MapLibre raster-dem)
  terrain3d?: boolean;
  terrain3dExaggeration?: number; // 0.5-3.0, default 1.5
  // 3D Buildings
  buildings3d?: boolean;
  buildings3dPitch?: number;      // 0-60°
  buildings3dBearing?: number;    // -180° to 360°
  buildings3dHeightScale?: number; // 0.5-3.0
  buildings3dStyle?: 'solid' | 'glass' | 'wireframe' | 'gradient';
  buildings3dOpacity?: number;    // 0-1
}
```

### RouteConfig
```typescript
interface RouteConfig {
  enabled: boolean;
  data?: RouteData;         // Points, stats, bounds
  style: RouteStyle;        // Color, width, opacity, lineStyle
  showStartMarker: boolean;
  showEndMarker: boolean;
  privacyZone: { enabled: boolean; distance: number; };
}
```

### SculptureConfig

```typescript
interface SculptureConfig {
  baseShape: 'rectangular' | 'circular' | 'organic' | 'terrain';
  baseColor: string;
  size: '10cm' | '15cm' | '20cm';
  material: 'matte' | 'glossy' | 'metallic' | 'wood' | 'stone';
  texture: 'smooth' | 'brushed' | 'rough';
  routeColor: string;
  elevationExaggeration: number;  // 1.0-3.0
  turntableEnabled: boolean;
}
```

---

## Coding Conventions

- TypeScript strict - no `any` without justification
- Next.js App Router patterns
- Tailwind CSS utilities over custom CSS
- PascalCase components, camelCase utilities
- Server components by default, client only when needed
- Keep components focused and composable

---

## Key Technical Notes

### Map Rendering
- MapLibre style spec with dynamic color swapping via `applyPalette()`
- `preserveDrawingBuffer: true` for canvas export
- GPX parsing with `@we-gold/gpxjs`

### Export
- Client-side canvas composition
- Target: up to 24x36" at 300 DPI (7200x10800px)
- Composite map + text overlays + route layers

### Data Persistence
- Map configs stored as JSONB in Supabase `maps` table
- Zod validation on save/load (`lib/validation/posterConfig.ts`)
- Route data included in config (no separate table needed)

---

## Common Tasks

### Adding a New Style
1. Create style in `lib/styles/[stylename].ts`
2. Define palettes and layer toggles
3. Register in `lib/styles/index.ts`

### Modifying Layer Options
1. Update type in `types/poster.ts`
2. Add Zod validation in `lib/validation/posterConfig.ts`
3. Add UI controls in `components/controls/LayerControls.tsx`
4. Handle in `lib/styles/applyPalette.ts` if affects rendering

---

## Resources

- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/)
- [Nominatim API](https://nominatim.org/release-docs/develop/api/Search/)
