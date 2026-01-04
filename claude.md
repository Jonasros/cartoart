# Waymarker - Development Context

> **Single source of truth** for AI development context.
> - See [STATUS.md](STATUS.md) for completed features & history
> - See [FEATURES.md](FEATURES.md) for roadmap & strategy
> - See [docs/PHASE4-3D-PRINTING.md](docs/PHASE4-3D-PRINTING.md) for Phase 4 specification

## Quick Reference

**Brand**: Waymarker (waymarker.eu)
**Phase**: Core MVP ✅ Complete — Next: Phase 4 (3D Print)
**Dev Server**: http://localhost:3000

### What's Working
- 11 map styles with 15+ palettes
- GPX route upload with styling (color, width, opacity, dash patterns)
- 3D terrain elevation with MapTiler terrain-rgb tiles
- 3D buildings with style presets & perspective controls
- High-res PNG export (up to 7200x10800px)
- Social features (feed, likes, comments, sharing)
- User auth & map persistence via Supabase

---

## Tech Stack

- **Framework**: Next.js 14+ App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: MapLibre GL JS + React Map GL
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Tiles**: OpenFreeMap / MapTiler

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/           # Login, signup
│   ├── (main)/           # Feed, profile, map detail
│   ├── api/              # geocode, tiles, publish
│   └── page.tsx          # Main editor
├── components/
│   ├── controls/         # Editor control panels
│   ├── map/              # MapPreview, TextOverlay
│   └── ui/               # Shared components
├── lib/
│   ├── actions/          # Server actions (maps, votes, comments)
│   ├── route/            # GPX parsing
│   ├── styles/           # 11 map style definitions
│   └── validation/       # Zod schemas
└── types/
    └── poster.ts         # Core type definitions
```

---

## Site Map

| Route | Purpose |
|-------|---------|
| `/` | Main editor |
| `/login`, `/signup` | Auth pages |
| `/feed` | Published maps gallery |
| `/map/[id]` | Single map detail view |
| `/profile` | User's saved maps |

### API Routes
- `/api/geocode` - Location search (Nominatim)
- `/api/tiles/[...path]` - Tile proxy
- `/api/publish` - Map publishing

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
