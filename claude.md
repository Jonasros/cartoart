# Waymarker - Development Context

> **Single source of truth** for AI development context.
> - See [STATUS.md](STATUS.md) for completed features & history
> - See [FEATURES.md](FEATURES.md) for roadmap & strategy
> - See [docs/PHASE4-3D-PRINTING.md](docs/PHASE4-3D-PRINTING.md) for Phase 4 specification
> - See [docs/PROGRAMMATIC-SEO.md](docs/PROGRAMMATIC-SEO.md) for SEO growth strategy
> - See [docs/PRD-FAMOUS-ROUTES-SEEDING.md](docs/PRD-FAMOUS-ROUTES-SEEDING.md) for famous routes database seeding

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

---

## Tech Stack

- **Framework**: Next.js 14+ App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: MapLibre GL JS + React Map GL
- **3D**: React Three Fiber + Three.js (sculptures)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe Checkout
- **Analytics**: PostHog
- **Tiles**: OpenFreeMap / MapTiler

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
│   ├── actions/          # Server actions (maps, votes, comments)
│   ├── route/            # GPX parsing
│   ├── strava/           # Strava API helpers
│   ├── stripe/           # Stripe checkout helpers
│   ├── styles/           # 11 map style definitions
│   └── validation/       # Zod schemas
└── types/
    ├── poster.ts         # Core type definitions
    ├── strava.ts         # Strava API types
    ├── sculpture.ts      # Sculpture config types
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

- `/api/orders` - Create Stripe checkout session for export
- `/api/orders/complete` - Complete order after successful payment
- `/api/orders/[id]` - Get order status and download link

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
