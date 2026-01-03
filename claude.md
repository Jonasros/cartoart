# Waymarker - Development Context

## Project Summary

A web application that transforms real geographic data and GPS routes into beautifully stylized map posters. Users search locations or upload GPX files, choose from 11 artistic styles, customize colors and typography, then export high-resolution images suitable for large-format printing. **Brand name: Waymarker** (waymarker.eu)

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map Rendering**: MapLibre GL JS with React Map GL
- **Data Sources**: OpenStreetMap vector tiles, terrain/elevation data

## Project Structure

```
waymarker/
├── frontend/            # ✅ IMPLEMENTED
│   ├── app/
│   │   ├── api/tiles/[...path]/  # Tile proxy endpoint
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Main page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── controls/    # ✅ All control components
│   │   │   ├── ColorControls.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   ├── FormatControls.tsx
│   │   │   ├── LayerControls.tsx
│   │   │   ├── LocationSearch.tsx
│   │   │   ├── RouteStyleControls.tsx  # GPX route styling
│   │   │   ├── RouteUpload.tsx         # GPX file upload
│   │   │   ├── StyleSelector.tsx
│   │   │   └── TypographyControls.tsx
│   │   ├── layout/
│   │   │   └── PosterEditor.tsx  # Main editor
│   │   └── map/
│   │       ├── MapPreview.tsx
│   │       └── TextOverlay.tsx
│   ├── hooks/
│   │   ├── useMapExport.ts
│   │   └── usePosterConfig.ts
│   ├── lib/
│   │   ├── export/      # ✅ Canvas export logic
│   │   ├── geocoding/   # ✅ Nominatim integration
│   │   ├── route/       # ✅ GPX parsing and route utilities
│   │   │   ├── index.ts
│   │   │   └── parseGPX.ts
│   │   └── styles/      # ✅ 11 complete styles
│   │       ├── minimal.ts
│   │       ├── dark-mode.ts
│   │       ├── blueprint.ts
│   │       ├── applyPalette.ts
│   │       └── index.ts
│   ├── types/
│   │   └── poster.ts    # ✅ Complete type definitions
│   ├── components.json   # shadcn/ui config
│   └── package.json
├── .mcp.json            # MCP server config
├── README.md            # Project specification
├── claude.md            # This file
└── STATUS.md            # ✅ Implementation status
```

## Site Map & User Journeys

### Public Pages

| Route | Purpose | Layout | Design Notes |
|-------|---------|--------|--------------|
| `/` | Main editor - create/edit map posters | Standalone | Full-screen editor with side panels |
| `/login` | Sign in page | Auth layout | Minimal, focused on auth form |
| `/signup` | Create account | Auth layout | Matches login styling |
| `/feed` | Explore published maps | Main layout | Grid of map cards, filters |
| `/map/[id]` | View single published map | Main layout | Full preview, comments, sharing |
| `/profile` | User's saved maps | Main layout | Grid of user's maps, publish controls |

### Layout Groups

- **`(auth)`**: Login/signup pages - minimal header, centered content
- **`(main)`**: Feed, profile, map detail - full header with navigation

### User Journeys

```text
New Visitor Flow:
Landing → Editor (browse) → Sign up → Save map → Profile

Returning User Flow:
Login → Profile (my maps) → Edit existing OR Create new → Export/Publish

Discovery Flow:
Feed (explore) → Map detail → Duplicate to library → Edit → Export

Social Flow:
Feed → Map detail → Like/Comment → Follow creator (future)
```

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/geocode` | Location search via Nominatim |
| `/api/tiles/[...path]` | Tile proxy for map rendering |
| `/api/publish` | Map publishing endpoint |
| `/api/spaceports` | Spaceport data for markers |
| `/auth/callback` | OAuth callback handler |

### Design Consistency Checklist

When doing frontend optimization, ensure consistency across:

- [ ] **Navigation**: Header appears on feed, profile, map detail (not editor)
- [ ] **Card styling**: Map cards in feed and profile use same component
- [ ] **Typography**: Headings, body text, labels consistent
- [ ] **Spacing**: Consistent padding/margins across pages
- [ ] **Colors**: Dark mode works on all pages
- [ ] **Loading states**: Skeleton loaders match across pages
- [ ] **Empty states**: Consistent messaging when no content
- [ ] **Error states**: Consistent error display
- [ ] **Mobile responsiveness**: All pages work on mobile

## Core Types

### PosterLocation
```typescript
interface PosterLocation {
  name: string;
  subtitle?: string;
  center: [number, number]; // [lng, lat]
  bounds: [[number, number], [number, number]]; // SW, NE corners
  zoom: number;
}
```

### PosterStyle
```typescript
interface PosterStyle {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  mapStyle: MapLibreStyle; // Full MapLibre style spec
  defaultPalette: ColorPalette;
  palettes: ColorPalette[];
  recommendedFonts: string[];
  layerToggles: LayerToggle[];
}
```

### ColorPalette
```typescript
interface ColorPalette {
  id: string;
  name: string;
  background: string;
  primary: string;
  secondary: string;
  water: string;
  greenSpace: string;
  text: string;
}
```

### PosterConfig
```typescript
interface PosterConfig {
  location: PosterLocation;
  style: PosterStyle;
  palette: ColorPalette;
  typography: {
    titleFont: string;
    titleSize: number;
    titleWeight: number;
    subtitleFont: string;
    subtitleSize: number;
    position: 'top' | 'bottom' | 'center';
  };
  format: {
    aspectRatio: string;
    orientation: 'portrait' | 'landscape';
    margin: number;
  };
  layers: {
    streets: boolean;
    buildings: boolean;
    // 3D Buildings
    buildings3d?: boolean;
    buildings3dPitch?: number;      // Camera tilt 0-60°
    buildings3dBearing?: number;    // Camera rotation -180° to 360°
    buildings3dHeightScale?: number; // Height multiplier 0.5-3.0
    buildings3dDefaultHeight?: number; // Fallback height 0-30m
    buildings3dStyle?: 'solid' | 'glass' | 'wireframe' | 'gradient';
    buildings3dOpacity?: number;    // 0-1
    water: boolean;
    parks: boolean;
    terrain: boolean;
    labels: boolean;
  };
  route?: RouteConfig; // GPX route support
}
```

### RouteConfig (GPX Route Support)
```typescript
interface RoutePoint {
  lat: number;
  lng: number;
  elevation?: number;
  time?: Date;
}

interface RouteStats {
  distance: number;        // in meters
  elevationGain: number;   // in meters
  elevationLoss: number;   // in meters
  minElevation: number;    // in meters
  maxElevation: number;    // in meters
  duration?: number;       // in seconds (if time data available)
  startTime?: Date;
  endTime?: Date;
}

interface RouteData {
  name?: string;
  description?: string;
  points: RoutePoint[];
  stats: RouteStats;
  bounds: [[number, number], [number, number]]; // SW, NE corners [lng, lat]
}

interface RouteStyle {
  color: string;
  width: number;           // in pixels
  opacity: number;         // 0-1
  lineStyle: 'solid' | 'dashed' | 'dotted';
  showStartEnd: boolean;   // Show start/end markers
  startColor?: string;
  endColor?: string;
}

interface PrivacyZone {
  center: [number, number]; // [lng, lat]
  radiusMeters: number;
}

interface RouteConfig {
  data: RouteData | null;
  style: RouteStyle;
  privacyZones: PrivacyZone[];
  showStats: boolean;
  statsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

## Development Phases

### Phase 1: Hiking Route Posters (MVP) ✅ COMPLETE
- [x] Set up Next.js project with TypeScript and Tailwind
- [x] Integrate MapLibre GL JS with React
- [x] Implement location search with Nominatim API
- [x] Create 11 map styles with 15+ color palettes
- [x] Build complete UI with all control panels
- [x] Implement text overlay system with full customization
- [x] Add PNG export functionality with high-res support
- [x] Typography customization (fonts, sizes, spacing, all-caps)
- [x] Layer toggles (streets, buildings, water, parks, labels, terrain, marker)
- [x] Format/aspect ratio options (5 ratios, portrait/landscape)
- [x] GPX route support (upload, parse, display, style customization)
- [x] Route persistence in saved/published maps
- [x] Social features (feed, likes, comments, sharing)

### Phase 4: 3D Printed Route Sculptures ← NEXT PRIORITY
- [ ] Tab-based mode switching (Poster / 3D Print)
- [ ] Three.js / React Three Fiber 3D preview
- [ ] Route-to-mesh conversion (GPS → 3D ribbon)
- [ ] Base style options (rectangular, circular, organic)
- [ ] Size/material selection
- [ ] Fulfillment partner API integration
- [ ] Order checkout and tracking

**Why 3D Print is next**: Zero competition, premium pricing (€79-249), leverages existing GPX data.

### Phase 2: Wedding / Gift Modes (Future)
- [ ] "Met / Engaged / Married" templates
- [ ] Heart-shaped route connector option
- [ ] Romantic font presets
- [ ] Custom date formatting

### Phase 3: Sailing / Voyage Maps (Future)
- [ ] Nautical mile display
- [ ] Port markers for stops
- [ ] Nautical chart styling
- [ ] Ocean-themed color palettes

## Style Library (11 Implemented)

1. **Minimal** - Clean lines, monochromatic, elegant simplicity
2. **Dark Mode** - Dark backgrounds, luminous streets
3. **Midnight** - Deep dark theme with subtle detail
4. **Blueprint** - Technical cyan on blue, architectural feel
5. **Vintage** - Parchment, sepia tones, hand-drawn aesthetic
6. **Topographic** - Elevation contours, terrain-focused
7. **Watercolor** - Soft edges, painted appearance, organic
8. **Abstract** - Stylized, artistic interpretation
9. **Atmospheric** - Moody, atmospheric rendering
10. **Organic** - Natural, flowing aesthetic
11. **Retro** - Classic vintage styling

## Key Technical Considerations

### Map Rendering
- Use MapLibre GL JS (open-source, no API key for basic usage)
- Style definitions follow MapLibre style spec
- Use style expressions for dynamic color swapping
- Enable `preserveDrawingBuffer: true` for canvas export

### Tile Sources
- **OpenFreeMap**: Free, no API key, OpenMapTiles schema
- **MapTiler**: Free tier with API key
- **Protomaps**: PMTiles format, can self-host

### Export Strategy
- Render map at higher resolution than screen display
- Composite map canvas with text overlays using Canvas API
- Target sizes: up to 24x36 inches at 300 DPI (7200x10800 pixels)
- Consider Web Workers for large export processing

### State Management
- Consider URL-based state for shareability
- Local storage for persistence
- React Context or Zustand for app state

### Performance
- Debounce style updates during customization
- Show loading states for large exports
- Warn users about export time for very large sizes

## Coding Conventions

- Use TypeScript strictly - no `any` types without justification
- Follow Next.js App Router conventions
- Use Tailwind CSS utilities over custom CSS
- Component files: PascalCase (e.g., `MapPreview.tsx`)
- Utility files: camelCase (e.g., `exportCanvas.ts`)
- Keep components focused and composable
- Extract complex logic to custom hooks
- Use server components by default, client components only when needed

## Common Tasks

### Adding a New Style
1. Create MapLibre style JSON in `src/lib/styles/`
2. Define default color palettes
3. Add style metadata (name, description, thumbnail)
4. Register in style library index

### Adding a New Color Palette
1. Define ColorPalette object
2. Add to appropriate style's palettes array
3. Ensure all required colors are specified

### Modifying Export Resolution
1. Update export constants in `src/lib/export/constants.ts`
2. Adjust canvas rendering logic
3. Update UI to reflect new options

## Important Notes

- **No API keys required for MVP** - Use OpenFreeMap for tiles
- **Export is client-side** - All rendering happens in browser
- **Font embedding** - Ensure fonts are loaded before export
- **Color values** - Use hex format for consistency
- **Coordinates** - Always [longitude, latitude] order

## External Resources

- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/)
- [OpenFreeMap](https://openfreemap.org/)
- [Nominatim Geocoding API](https://nominatim.org/release-docs/develop/api/Search/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)

## Current Status

**Phase**: Phase 1 ✅ COMPLETE — Next: Phase 4 (3D Print)
**Location**: All implementation in `frontend/` directory
**Dev Server**: http://localhost:3000
**Brand**: Waymarker (waymarker.eu)

### What's Working
- ✅ Complete UI with all control panels
- ✅ 11 map styles with 15+ color palettes
- ✅ Real-time preview with pan/zoom
- ✅ Location search with Nominatim
- ✅ Full typography controls
- ✅ Layer visibility toggles
- ✅ Aspect ratio and format options
- ✅ PNG export at multiple resolutions (up to 7200x10800px)
- ✅ GPX route upload and display
- ✅ Route styling (color, width, opacity, solid/dashed/dotted)
- ✅ Start/end markers with configurable colors
- ✅ Route stats calculation (distance, elevation gain/loss)
- ✅ Privacy zones for route protection
- ✅ Route persistence in saved/published maps
- ✅ Social features (feed, likes, comments, sharing)
- ✅ User authentication with Supabase
- ✅ 3D building extrusion with style presets (solid, glass, wireframe, gradient)
- ✅ Camera perspective controls (presets, pitch, bearing)

### Next Priority: Phase 4 — 3D Printed Route Sculptures
1. Install Three.js / React Three Fiber
2. Create 3D preview component with route mesh
3. Build route-to-mesh conversion (coordinates + elevation → 3D ribbon)
4. Add tab-based mode switching (Poster / 3D Print)
5. Research fulfillment partner APIs (Shapeways, i.materialise)

See **FEATURES.md** for complete Phase 4 specifications.

### Technical Implementation Notes
- MapLibre styles with dynamic color swapping via `applyPalette()`
- Canvas-based high-resolution export
- GPX parsing with `@we-gold/gpxjs`
- Zod schema validation for route persistence
- Supabase for auth, storage, and database

---

**For detailed status**, see STATUS.md
**For full project context**, see README.md
