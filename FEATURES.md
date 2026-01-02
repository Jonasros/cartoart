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
Phase 1: Hiking Route Posters (GPX upload)
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
✅ **Privacy zones** for route protection
✅ **Elevation gradients** for trail visualization
✅ **Stats overlays** (distance, elevation, duration)
✅ **High-res export** (up to 7200x10800px)

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

## Phase 1: Hiking Route Posters (MVP)

### Target Use Cases

| Use Case | Audience | Emotional Hook |
|----------|----------|----------------|
| **Trail Completion Art** | Thru-hikers, day hikers | "I conquered this trail" |
| **National Park Memories** | Park visitors | "Our adventure at Yosemite" |
| **Race Commemoration** | Trail runners, ultras | "My first 50K" |
| **Cycling Routes** | Road cyclists, gravel riders | "My century ride" |

### MVP Feature Set

- [ ] **GPX file upload** with drag-and-drop
- [ ] **Auto-parse** coordinates, bounds, distance, elevation
- [ ] **Auto-fit map** to route bounds
- [ ] **Route rendering** as styled GeoJSON line
- [ ] **Basic styling** (color, width from palette)
- [ ] **Start/end markers** (customizable icons)
- [ ] **Privacy zone** (hide first/last 200m by default)
- [ ] **Stats overlay** (distance, elevation gain, optional date)
- [ ] **Works with all 11 existing styles**
- [ ] **High-res export** includes route layer

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

### Core Types

```typescript
// lib/gpx/types.ts
interface ParsedRoute {
  name?: string;
  coordinates: [number, number][]; // [lng, lat]
  bounds: [[number, number], [number, number]]; // SW, NE
  distance: number; // meters
  elevation?: {
    gain: number;
    loss: number;
    min: number;
    max: number;
    profile: number[]; // for elevation chart
  };
  duration?: number; // seconds
  startTime?: Date;
}

interface RouteConfig {
  gpxData?: ParsedRoute;

  // Styling
  routeColor: string;
  routeWidth: number; // 2-12px
  routeStyle: 'solid' | 'dashed' | 'dotted';

  // Gradients (Phase 2)
  useElevationGradient: boolean;
  gradientColors?: [string, string];

  // Markers
  showStartMarker: boolean;
  showEndMarker: boolean;
  markerStyle: 'pin' | 'flag' | 'circle' | 'dot';

  // Stats overlay
  showStats: boolean;
  statsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  statsToShow: ('distance' | 'elevation' | 'duration' | 'date')[];

  // Privacy
  privacyZoneMeters: number; // 0 = off, 200 = default
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

## Implementation Roadmap

### Phase 1.1: Core Route MVP (Current Priority)
- [ ] Install `@we-gold/gpxjs` dependency
- [ ] Create GPX parser utility (`lib/gpx/parser.ts`)
- [ ] Add `RouteConfig` to poster types
- [ ] Create `RouteLayer` component for MapPreview
- [ ] Create `RouteControls` panel in editor
- [ ] Implement privacy zone trimming
- [ ] Add stats overlay component
- [ ] Update export to include route layer
- [ ] Test with sample GPX files from various sources

### Phase 1.2: Enhanced Route Styling
- [ ] Elevation gradient coloring
- [ ] Dashed/dotted line styles
- [ ] Glow/shadow effects on route
- [ ] Multiple route colors for segments
- [ ] Mile/KM markers along route

### Phase 1.3: Integrations (Optional)
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

## Next Steps (Immediate)

1. Create branch: `feature/route-support`
2. Install `@we-gold/gpxjs`
3. Build GPX parser with TypeScript types
4. Add RouteLayer component to MapPreview
5. Create RouteControls panel
6. Test with sample GPX files (hiking, cycling, running)
7. Implement privacy zone
8. Add stats overlay
9. Update export to include route layer
10. Test across all 11 map styles

---

**Status**: Planning Complete - Ready for Implementation
**Focus**: Hiking/Outdoor Adventure route posters as primary launch niche
