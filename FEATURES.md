# Waymarker - Feature Roadmap & Strategy

**Last Updated**: 2026-01-02

---

## Strategic Summary

Waymarker is expanding from location-based map posters to **journey-based map art** — turning GPS activity data into gallery-worthy wall art. This is an **incremental enhancement** to our existing 11 styles, 15 palettes, and high-res export capabilities.

### 🎯 Primary Launch Niche: Hiking / Outdoor Adventure

Based on market research, **hiking route posters** is the best starting niche because:

| Factor | Why Hiking Wins |
|--------|-----------------|
| **Buy Readiness** | People actively search for and buy "custom hike route print" — multiple dedicated sites exist |
| **Market Size** | Naturally expands into trail runners, cyclists, skiers, climbers, national park visitors |
| **Emotional Hook** | "I did this trail / summit / thru-hike" — strong achievement + memory trigger |
| **Differentiation** | We can win with features (11+ styles, privacy zones, gradient, stats), not just aesthetics |
| **Support Load** | Lower than weddings — outdoor buyers accept "upload GPX → tweak → buy" workflow |

### 📊 Phased Market Expansion

```
Phase 1: Hiking Route Posters (GPX upload) ✅ COMPLETE
    ↓
Phase 4: 3D Printed Route Sculptures ← NEXT (zero competition, premium pricing)
    ↓
Phase 2: Gift Modes (weddings, "our story" maps)
    ↓
Phase 3: Sailing / Voyage Maps (nautical features)
```

---

## Competitive Landscape

### Route Poster Competitors (Hiking/Outdoor Focus)

| Competitor | Price | GPX Support | Strengths | Weaknesses |
|------------|-------|-------------|-----------|------------|
| **OutdoorArtPrint** | $40+ | GPX + Strava | High quality prints, "hikes, bike rides, adventures" | Expensive, less customization |
| **Mappy Moments** | €25+ | GPX/KML + AllTrails/Strava/Komoot | Multi-format, stats | Generic styling |
| **TrailMaps** | $30+ | Strava + GPX | Many sports support | Less stylistic variety |
| **MixPlaces** | €25+ | Limited | Feature-rich broadly | Not niche-focused |
| **PathPosters** | $7 | GPX | Privacy-first, simple | Limited styles (5), single size |

### Wedding/Gift Map Competitors

| Competitor | Price | Focus | Notes |
|------------|-------|-------|-------|
| **Positive Prints** | €30+ | "Met Engaged Married" | Heavy Etsy presence |
| **Mark Your Moment** | €35+ | Wedding gifts | Template-based |
| **Etsy sellers** | €15-50 | Various | Crowded, price competition |

### Similar Open Source

| Project | Notes |
|---------|-------|
| [kkingsbe/carto-art](https://github.com/kkingsbe/carto-art) | 32 stars. Same tech stack (Next.js, MapLibre). City-focused, no route support. Validates concept. |

### Our Competitive Advantage

✅ **11 beautiful map styles** (most competitors have 3-5)
✅ **15 color palettes** with real-time preview
✅ **Typography controls** (fonts, sizes, positioning)
✅ **GPX route upload** with drag-and-drop
✅ **Route styling** (color, width, opacity, solid/dashed/dotted)
✅ **Start/end markers** with customizable colors
✅ **Privacy zones** for route protection (hide start/end)
✅ **Route statistics** (distance, elevation gain/loss calculated)
✅ **High-res export** (up to 7200x10800px) including routes
✅ **Social features** (feed, likes, comments, sharing)
✅ **Route persistence** (save, share, duplicate maps with routes)

**Positioning**: "Adventure route art that looks like a design studio made it" — more opinionated, more premium, simpler workflow.

---

## Monetization Strategy

### Recommended Model: One-Time Purchase Per Export

Best for solo founder — simple, no subscription friction, works with impulse gift buyers.

| Product | Price Range | Margin |
|---------|-------------|--------|
| **Digital Download** | €19–€29 | High (instant delivery) |
| **Print Delivered** | €49–€89 | Medium (fulfillment costs) |

### Future Options
- Premium tier for multiple exports, saved designs, collections
- Print partnerships (Printful, Gelato, etc.)

---

## Phase 1: Hiking Route Posters (MVP) ✅ COMPLETE

### Target Use Cases

| Use Case | Audience | Emotional Hook |
|----------|----------|----------------|
| **Trail Completion Art** | Thru-hikers, day hikers | "I conquered this trail" |
| **National Park Memories** | Park visitors | "Our adventure at Yosemite" |
| **Race Commemoration** | Trail runners, ultras | "My first 50K" |
| **Cycling Routes** | Road cyclists, gravel riders | "My century ride" |

### MVP Feature Set

- [x] **GPX file upload** with drag-and-drop
- [x] **Auto-parse** coordinates, bounds, distance, elevation
- [x] **Auto-fit map** to route bounds
- [x] **Route rendering** as styled GeoJSON line
- [x] **Basic styling** (color, width, opacity, line style)
- [x] **Start/end markers** (configurable colors)
- [x] **Privacy zone** (hide first/last portion of route)
- [x] **Route statistics** (distance, elevation gain/loss calculated)
- [x] **Works with all 11 existing styles**
- [x] **High-res export** includes route layer
- [x] **Route persistence** in saved maps
- [x] **Routes on published maps** display correctly
- [x] **Duplication** preserves route data
- [x] **Mode toggle** between single location and route mode

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EXISTING WAYMARKER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Map Styles  │  │  Palettes   │  │  Typography/Export  │  │
│  │  (11 total) │  │  (15 total) │  │   (High-res PNG)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEW: ROUTE LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ GPX Parser  │  │  GeoJSON    │  │  Route Styling      │  │
│  │ (@we-gold/  │  │  LineString │  │  (color, width,     │  │
│  │  gpxjs)     │  │             │  │   gradient, glow)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Core Types (Implemented)

```typescript
// lib/route/index.ts - Actual implementation
interface RoutePoint {
  lat: number;
  lng: number;
  elevation?: number;
  time?: string;
}

interface RouteStats {
  distance: number;        // meters
  elevationGain: number;   // meters
  elevationLoss: number;   // meters
  minElevation?: number;
  maxElevation?: number;
  duration?: number;       // seconds
}

interface RouteData {
  name?: string;
  points: RoutePoint[];
  stats: RouteStats;
}

interface RouteStyle {
  color: string;
  width: number;           // 2-8px
  opacity: number;         // 0-1
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

interface RouteConfig {
  enabled: boolean;
  data?: RouteData;
  style: RouteStyle;
  showStartMarker: boolean;
  showEndMarker: boolean;
  startMarkerColor: string;
  endMarkerColor: string;
  privacyZone: {
    enabled: boolean;
    distance: number;      // meters
  };
}
```

### MapLibre Route Layer

```typescript
// Route rendering with MapLibre GL JS
map.addSource('route', {
  type: 'geojson',
  lineMetrics: true, // Required for gradients
  data: {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates
    }
  }
});

map.addLayer({
  id: 'route-line',
  type: 'line',
  source: 'route',
  paint: {
    'line-color': routeColor,
    'line-width': routeWidth,
    'line-gradient': elevationGradient, // Optional
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
});
```

---

## Phase 2: Wedding / Gift Modes

Add templates and features for gift-oriented use cases **after** core route system is solid.

### Features
- [ ] "Met / Engaged / Married" templates (dual/triple locations)
- [ ] Heart-shaped route connector option
- [ ] Romantic font presets
- [ ] Coordinates display (40.7128°N, 74.0060°W style)
- [ ] Custom date formatting
- [ ] Gift wrapping option for prints

### Why Wait?
- Wedding customers expect heavy customization + handholding
- Higher support burden per sale
- Need smoother design experience first
- Brand credibility helps in gift market

---

## Phase 3: Sailing / Voyage Maps

Expand into nautical niche with specialized features.

### Features
- [ ] Nautical mile display
- [ ] Compass rose overlay (already have!)
- [ ] Port markers for stops
- [ ] Nautical chart styling
- [ ] Wind direction indicators (if in GPX)
- [ ] Ocean-themed color palettes

### Why This Niche?
- Less crowded than hiking/running
- Higher price tolerance (yacht owners)
- Core product already supports routes
- Differentiation through specialized features

---

## Phase 4: 3D Printed Route Sculptures

Transform GPS routes into physical 3D sculptures — a tangible keepsake of adventures.

### 🎯 Concept

Instead of just 2D posters, users can order a **3D printed sculpture** of their route. The GPS track becomes a physical ribbon/line that captures the journey's path and elevation profile.

### Target Customers

| Customer | Use Case | Emotional Hook |
|----------|----------|----------------|
| **Hikers** | Personal achievement | "My summit in physical form" |
| **Gift-givers** | Meaningful present | "I 3D printed our honeymoon hike" |
| **Runners** | Race commemoration | "My marathon route as art" |
| **Cyclists** | Epic ride memory | "My first century ride sculpture" |

### Product Concepts

**MVP: Route Sculpture (Recommended)**
- GPS track extruded as a 3D ribbon/line
- Z-axis represents actual elevation profile
- Mounted on a stylized base (rectangular, circular, or custom)
- Simpler to generate, unique visual, lower compute requirements

**Future: Terrain Relief + Route**
- Full topographical model of the surrounding area
- Route etched or raised on terrain surface
- More impressive but significantly more complex
- Requires DEM (Digital Elevation Model) data integration

### Product Specifications (MVP)

| Attribute | Specification |
|-----------|---------------|
| **Size** | 10-15cm (desktop/shelf display) |
| **Materials** | PLA plastic, wood-fill PLA, resin (user choice) |
| **Base styles** | 2-3 options (rectangular, circular, organic) |
| **Fulfillment** | Partner print service (not self-print STL) |
| **Lead time** | 1-3 weeks (standard 3D print fulfillment) |

### Pricing Strategy

| Product | Price Range | Margin Notes |
|---------|-------------|--------------|
| **Small (10cm)** | €79-99 | Entry point, gift-friendly |
| **Medium (15cm)** | €119-149 | Premium display piece |
| **Large (20cm+)** | €179-249 | Statement piece, future option |

Higher margins than posters — 3D prints command premium pricing for personalization.

### Why This Stands Out

| Factor | Advantage |
|--------|-----------|
| **Zero competition** | Nobody does route-specific 3D sculptures |
| **Premium positioning** | €100+ price point vs €20-40 posters |
| **Tactile value** | Physical object > flat print for many buyers |
| **Gift appeal** | Exceptional for meaningful occasions |
| **Upsell path** | Poster customers → 3D sculpture upgrade |

### Data We Already Have

From existing GPX upload:
- ✅ Route coordinates (lat/lng for each point)
- ✅ Elevation data at each point
- ✅ Route statistics (distance, elevation gain/loss)
- ✅ Bounding box for the area

What we'd need to add:
- ⚠️ Terrain DEM data (only if doing terrain relief, not needed for route-only)
- 🔧 3D mesh generation (Three.js / server-side processing)
- 🔧 STL export for print fulfillment
- 🔧 3D preview in browser

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED DATA LAYER                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Location / Route Selection (same for both modes)   │    │
│  │  • GPX upload with elevation                         │    │
│  │  • Coordinates, bounds, stats                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     POSTER MODE         │     │     3D PRINT MODE       │
│  ┌───────────────────┐  │     │  ┌───────────────────┐  │
│  │ Map Styles (11)   │  │     │  │ 3D Preview        │  │
│  │ Color Palettes    │  │     │  │ (Three.js/R3F)    │  │
│  │ Typography        │  │     │  │ Rotate/Zoom       │  │
│  │ Export PNG        │  │     │  └───────────────────┘  │
│  └───────────────────┘  │     │  ┌───────────────────┐  │
│                         │     │  │ Model Style       │  │
│                         │     │  │ • Base shape      │  │
│                         │     │  │ • Size selection  │  │
│                         │     │  │ • Material choice │  │
│                         │     │  └───────────────────┘  │
│                         │     │  ┌───────────────────┐  │
│                         │     │  │ Order Flow        │  │
│                         │     │  │ • Generate STL    │  │
│                         │     │  │ • Send to partner │  │
│                         │     │  │ • Checkout        │  │
│                         │     │  └───────────────────┘  │
└─────────────────────────┘     └─────────────────────────┘
```

### App Integration

**Tab-Based Mode Switching:**
```
[ 🖼️ Poster ]    [ 🏔️ 3D Print ]
```

Both modes share the same location/route selection — user just switches output format.

### Technical Approach

**MVP: Pure Algorithmic (No AI Required)**

Route sculptures are geometry, not AI-generated:

```
GPS coordinates (lat, lng, elevation)
         ↓
    Convert to 3D points (x, y, z)
         ↓
    Extrude as tube/ribbon (Three.js TubeGeometry)
         ↓
    Add base plate
         ↓
    Export as STL file
```

Three.js has built-in functions for this — no external APIs, no compute costs, predictable results.

**Route Required for MVP:**

| Mode | 3D Print Available? | Reason |
|------|---------------------|--------|
| **GPX Route** | ✅ Yes | Path + elevation → ribbon sculpture |
| **Single Address** | ❌ No (MVP) | No path to extrude; terrain relief is Phase 2 |

The 3D tab only enables when a route is uploaded. Keeps MVP simple.

**Future: AI Enhancements (Not MVP)**

| AI Feature | What It Does | Complexity |
|------------|--------------|------------|
| **Stylized terrain** | AI-generated terrain texture around route | Medium |
| **Single location relief** | Terrain model from DEM data (not really AI) | Medium |
| **Decorative elements** | AI-suggested trees, landmarks, etc. | High |
| **Text-to-3D styling** | "Make it look like a mountain range" | Experimental |

AI can be Phase 2 if customers want more artistic/stylized versions.

### Technical Requirements

**Frontend:**

- Three.js or React Three Fiber for 3D preview
- Mesh generation from route coordinates + elevation
- Interactive preview (rotate, zoom, pan)

**Backend/Processing:**

- STL file generation (may need server-side for complex meshes)
- Integration with print fulfillment API
- Order management and tracking

**Data & Supabase Logging:**

| Data Point | Table | Purpose |
|------------|-------|---------|
| **3D print requests** | `print_orders` | Track orders, fulfillment status, customer info |
| **Model configurations** | `print_orders.config` | Base style, size, material selections (JSONB) |
| **Route reference** | `print_orders.map_id` | Link to saved map with route data |
| **STL file URL** | `print_orders.stl_url` | Supabase Storage reference for generated mesh |
| **Fulfillment status** | `print_orders.status` | pending → processing → shipped → delivered |
| **Analytics events** | `analytics` | 3D tab views, preview interactions, cart abandonment |

**Fulfillment Partners (Options):**

- Shapeways (API available)
- i.materialise (API available)
- Craftcloud (aggregator)
- Local/regional 3D print services

### MVP Feature Set

- [ ] Tab to switch between Poster and 3D Print modes
- [ ] 3D preview of route sculpture (rotatable)
- [ ] 2-3 base style options
- [ ] Size selection (10cm, 15cm)
- [ ] Material selection (PLA, wood-fill, resin)
- [ ] Generate printable mesh from route data
- [ ] Integration with fulfillment partner API
- [ ] Order checkout and payment
- [ ] Order tracking/status

### Challenges & Mitigations

| Challenge | Mitigation |
|-----------|------------|
| **Processing power** | Start with route-only (no terrain), server-side generation for complex routes |
| **Preview performance** | Level-of-detail (LOD) for smooth browser rendering |
| **Print quality** | Validate mesh is "watertight" (manifold) before sending to printer |
| **Lead times** | Set clear expectations (1-3 weeks), provide tracking |
| **Returns/quality** | Partner with reliable fulfillment, quality samples first |

### Success Metrics

- 3D print orders per month
- Conversion rate (route upload → 3D order)
- Average order value
- Customer satisfaction / repeat orders
- Poster → 3D upsell rate

---

## Implementation Roadmap

### Phase 1.1: Core Route MVP ✅ COMPLETE
- [x] GPX parser utility (`lib/route/parseGPX.ts`)
- [x] Add `RouteConfig` to poster types with Zod validation
- [x] Create route layer rendering in MapPreview
- [x] Create `RouteControls` panel in editor
- [x] Implement privacy zone trimming
- [x] Calculate route statistics (distance, elevation)
- [x] Update export to include route layer
- [x] Route persistence in database (saved maps)
- [x] Route display on published/shared maps
- [x] Route duplication support

### Phase 1.2: Enhanced Route Styling (Partially Complete)
- [x] Solid/dashed/dotted line styles
- [x] Route opacity control
- [x] Start/end marker colors
- [ ] Elevation gradient coloring
- [ ] Glow/shadow effects on route
- [ ] Multiple route colors for segments
- [ ] Mile/KM markers along route

### Phase 1.3: Integrations (Future)
- [ ] Strava OAuth integration
- [ ] AllTrails integration
- [ ] Garmin Connect integration
- [ ] Route sharing via URL

---

## Future Features (Backlog)

### Export & Formats
| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| PDF export | High | Medium | Vector output for print shops |
| Multiple sizes | Medium | Low | A4, A3, A2, A1, custom |
| Print partnership | Medium | Medium | Printful, Gelato integration |

### Editor Enhancements
| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Undo/redo | High | Medium | State history stack |
| Keyboard shortcuts | Medium | Low | Zoom, pan, style switching |
| Preset location library | Medium | Low | Famous trails/cities dropdown |

### Social & Sharing
| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Collections/folders | Medium | Low | Organize saved maps |
| Search in feed | Medium | Low | By location, style, route type |

---

## Technical Debt

### Current Issues
- ESLint: 143 warnings (mostly `any` types)
- No test coverage
- Some console.log statements in production

### Recommended Improvements
1. Add TypeScript strict mode
2. Add unit tests for GPX parser
3. Add E2E tests for route upload flow
4. Add Sentry for error monitoring

---

## Dependencies

### New NPM Packages for Phase 1
```json
{
  "@we-gold/gpxjs": "^1.0.0"
}
```

### Optional for Later
```json
{
  "@turf/turf": "^7.0.0",  // Geospatial utilities
  "@turf/length": "^7.0.0" // Distance calculations
}
```

---

## Success Metrics

### Phase 1 KPIs
- Route uploads per week
- Conversion rate (upload → export)
- Average session duration
- Privacy zone usage rate

---

## Branding Notes

### Name Considerations

| Name | Fit | Notes |
|------|-----|-------|
| **Waymark** | Hiking-first | Literal trail connection, works for navigation themes |
| **Meridian** | Premium/global | Less literal, good for multi-vertical expansion |
| **Waymarker** | ✅ Selected | Trail-focused, European market, premium positioning |

**Domain**: waymarker.eu (European market focus)

---

## Next Steps

### Completed ✅
1. ~~Create branch: `feature/route-support`~~
2. ~~Build GPX parser with TypeScript types~~
3. ~~Add RouteLayer component to MapPreview~~
4. ~~Create RouteControls panel~~
5. ~~Implement privacy zone~~
6. ~~Update export to include route layer~~
7. ~~Test across all 11 map styles~~
8. ~~Route persistence in saved maps~~
9. ~~Route display on published maps~~

### Next Priority: Phase 4 — 3D Printed Route Sculptures

**Why this is next:**
- Zero competition in route-specific 3D sculptures
- Premium pricing (€79-249 vs €20-40 posters)
- Leverages existing GPX + elevation data
- Clear differentiation from crowded poster market

**First implementation steps:**
1. Install Three.js / React Three Fiber
2. Create 3D preview component with route mesh
3. Build route-to-mesh conversion (coordinates + elevation → 3D ribbon)
4. Add tab-based mode switching (Poster / 3D Print)
5. Research fulfillment partner APIs (Shapeways, i.materialise)

**Deferred (Phase 1.2 enhancements):**
- Elevation gradient coloring
- Glow/shadow effects on route
- Strava OAuth integration

---

**Status**: Phase 1 MVP Complete ✅ — Now prioritizing Phase 4 (3D Print)
**Focus**: 3D Printed Route Sculptures as next major feature
**Implemented**: GPX upload, route styling, privacy zones, persistence, sharing
