# Waymarker - Feature Roadmap & Strategy

> Future plans and business strategy. For completed features see [STATUS.md](STATUS.md).

**Last Updated**: 2026-01-23

---

## Strategic Summary

Waymarker transforms GPS activity data into gallery-worthy wall art for outdoor adventurers. Custom poster art for hikers, cyclists, trail runners, and travelers.

### Ideal Customer Profile (ICP)

**Primary**: Active outdoor enthusiasts who want to commemorate their adventures

- **Hikers & Trail Runners**: Long-distance trails, summit attempts, national park visits
- **Cyclists**: Road cycling routes, mountain biking trails, bikepacking adventures
- **Travelers & Adventurers**: Road trips, backpacking journeys, expedition routes
- **Race Finishers**: Marathon runners, triathlon athletes, ultra-distance competitors

**Emotional Hook**: "I conquered this route — now it's art on my wall"

### Competitive Advantage

| Feature | Waymarker | Competitors |
| ------- | --------- | ----------- |
| Map styles | 11 | 3-5 typically |
| Color palettes | 15+ | Limited |
| 3D buildings | ✅ 4 presets | ❌ |
| 3D terrain | ✅ | ❌ |
| 3D sculptures | ✅ STL export | ❌ |
| Scale bar | ✅ | Some |
| Privacy zones | ✅ | Some |
| High-res export | 7200x10800px | Varies |
| Social features | ✅ | ❌ |
| Strava integration | ✅ | Some |

**Positioning**: "Adventure route art that looks like a design studio made it"

---

## Next: Programmatic SEO Expansion (Growth Initiative)

> **Comprehensive specification**: [docs/PROGRAMMATIC-SEO.md](docs/PROGRAMMATIC-SEO.md)

Scale organic traffic through thousands of targeted landing pages capturing long-tail search queries.

### Phase 1 Complete ✅

**Implemented route landing pages:**

- `/race/[slug]` - Marathon and running routes
- `/trail/[slug]` - Hiking trail routes
- `/cycling/[slug]` - Cycling routes
- Sitemap integration, JSON-LD structured data, trademark-safe naming

### Remaining Phases

| Category | Pages | Target Keywords | Status |
|----------|-------|-----------------|--------|
| City Maps | ~10,000 | "[City] map poster" | Planned |
| Marathons & Races | ~500 | "[Race] route poster 2026" | ✅ Phase 1 |
| Trails & Hikes | ~200 | "[Trail] map print" | ✅ Phase 1 |
| Cycling Routes | ~300 | "[Route] cycling poster" | ✅ Phase 1 |
| Triathlons | ~100 | "Ironman [Location] map" | Planned |
| Bikepacking | ~150 | "[Route] bikepacking map" | Planned |
| Ultra Trails | ~100 | "[Race] ultra trail poster" | Planned |

### Next Steps

1. **Phase 2**: City map pages (~10,000 pages for major cities)
2. **Phase 3**: SEO optimization, A/B testing CTAs
3. **Phase 4**: Niche expansion (bikepacking, ultra trails, ski touring)

See [docs/PROGRAMMATIC-SEO.md](docs/PROGRAMMATIC-SEO.md) for complete PRD.

---

## Recently Completed

### Feature Voting System ✅

User feedback system for prioritizing upcoming features in export modals.

- ✅ "Coming Soon" cards in poster and sculpture export modals
- ✅ Vote/unvote toggle with PostHog event tracking
- ✅ Anonymous voting via localStorage (no account required)
- ✅ Voteable features: Print fulfillment, framing, canvas, metal prints, 3D printing service

### Brevo Email Automation ✅

> **Specification**: [docs/PRD-BREVO-EMAIL-AUTOMATION.md](docs/PRD-BREVO-EMAIL-AUTOMATION.md)

User lifecycle email automation for retention and conversion.

- ✅ Contact management (create/update on signup)
- ✅ Event tracking (signup, Strava connect, purchase)
- ✅ Marketing consent checkbox
- ✅ Email template documentation

### Programmatic SEO Pages (Phase 1) ✅

- ✅ Race landing pages (`/race/[slug]`)
- ✅ Trail landing pages (`/trail/[slug]`)
- ✅ Cycling landing pages (`/cycling/[slug]`)
- ✅ Sitemap integration
- ✅ RouteDisclaimer for trademark safety

### 3D Journey Sculptures ✅

> **Specification**: [docs/PHASE4-3D-PRINTING.md](docs/PHASE4-3D-PRINTING.md)

Transform GPS routes into physical 3D sculptures — tangible keepsakes of adventures.

**Completed Features**:

- ✅ React Three Fiber rendering engine with OrbitControls
- ✅ GPS route extrusion as 3D ribbon geometry
- ✅ 4 base shapes (Rectangular, Circular, Organic, Terrain)
- ✅ Material presets (Matte, Glossy, Metallic, Wood, Stone)
- ✅ Studio lighting with environment presets
- ✅ Post-processing pipeline (bloom, AO, tone mapping)
- ✅ Turntable animation for showcase views
- ✅ STL export for 3D printing
- ✅ Printability indicators with "Print Ready" badge

### Stripe Payment Integration ✅

- ✅ Stripe Checkout for poster exports
- ✅ Stripe Checkout for sculpture exports
- ✅ Order tracking in Supabase
- ✅ Secure download flow after payment

### 3D Terrain ✅

- ✅ MapLibre raster-dem terrain rendering
- ✅ Vertical exaggeration controls (0.5-3.0)
- ✅ Applied to map posters and route visualization

---

## In Progress: Cartographic Enhancements

Adopting high-value features from the upstream carto-art repository to enhance poster design capabilities.

### Scale Bar ✅

Dynamic distance scale for professional cartographic output.

- ✅ Haversine formula for accurate ground distance
- ✅ Auto-switches from meters to kilometers at 1000m
- ✅ Position options (top-left, top-right, bottom-left, bottom-right)
- ✅ Color picker matching poster palette
- ✅ Renders correctly in PNG export

### Compass Rose (Next Up)

SVG compass for circular poster formats — adds a nautical/expedition feel.

- [ ] 8 cardinal/intercardinal directions (N, NE, E, SE, S, SW, W, NW)
- [ ] 24 intermediate tick marks at 15° intervals
- [ ] Uses palette accent color
- [ ] Only renders on circular mask posters
- [ ] Renders in PNG export

**Config exists**: `format.compassRose?: boolean` — just needs component implementation.

### Custom Markers System (Planned)

Enable users to annotate posters with multiple custom location markers.

- [ ] Multiple markers per poster (not just center)
- [ ] 6 marker types: pin, crosshair, dot, ring, heart, home
- [ ] Color and size customization per marker
- [ ] Optional labels with 4 styles (standard, elevated, glass, vintage)
- [ ] Marker path lines connecting points
- [ ] Fill polygon option for marked areas

**Use case**: Mark trail highlights, summit points, rest stops, photo spots.

---

## Future Phases

### Phase 2: Sailing & Voyage Maps

- Nautical mile display
- Port markers for stops
- Nautical chart styling
- Ocean-themed palettes

**Why this niche**: Less crowded, higher price tolerance, already supports routes.

### Phase 3: Advanced Terrain (Deferred)

- Ray-marched terrain shadows with deck.gl
- Configurable light direction (azimuth/altitude)
- Shadow darkness and tint controls

**Why deferred**: Complex implementation, deck.gl dependency, focus on print features first.

---

## Feature Backlog

### Route Enhancements

- [ ] Elevation gradient coloring (show climb difficulty)
- [ ] Glow/shadow effects on route line
- [ ] Mile/KM markers along route
- [ ] Segment highlighting (e.g., steepest climb)
- [x] Strava OAuth integration ✅
- [ ] Garmin Connect integration
- [ ] Komoot integration

### Cartographic Features

- [ ] Topographic contour lines overlay
- [ ] Trail difficulty indicators
- [ ] Elevation profile mini-chart
- [ ] Distance annotations on route

### Export & Print

- [ ] PDF export (vector output)
- [ ] SVG export for certain styles
- [ ] Print partnership (Printful, Gelato)
- [ ] Multiple print sizes (A4, A3, A2, A1)
- [ ] Physical 3D print fulfillment service

### Editor Enhancements

- [ ] Undo/redo
- [ ] Keyboard shortcuts
- [ ] Famous routes library (pre-loaded popular trails)
- [ ] URL-based state for sharing configs
- [ ] Route simplification slider (reduce detail)

### Social & Community

- [ ] Collections/folders for organizing maps
- [ ] Search within feed
- [ ] User profiles with bio/avatar
- [ ] Follow users
- [ ] Challenge/event groups

### Polish

- [ ] Onboarding tutorial for first-time users
- [ ] Accessibility improvements
- [x] Mobile editor optimization ✅

---

## Critical: 3D Sculpture Export Quality Fix

**Priority**: 🔴 HIGH — Users pay €29-49 for STL exports; current quality is unacceptable.

The STL export pipeline prioritizes browser performance over print quality. This causes visible defects in 3D printed sculptures.

### Issues Identified

| Issue | Severity | Root Cause | Fix |
|-------|----------|------------|-----|
| **Route tube faceted** | 🔴 Critical | Only 8 radial segments — creates octagonal tubes | Increase to 24-32 segments |
| **Terrain mesh blocky** | ⚠️ High | 128-192 segment grid — visible stair-stepping | Add "High Quality" export preset with 256+ segments |
| **Route decimation** | ⚠️ Medium | Capped at 500 GPS points — long routes lose detail | Adaptive decimation (preserve curves, simplify straights) |
| **No mesh validation** | 🔴 Critical | Can export non-manifold geometry — prints may fail | Add watertight/manifold checks before export |
| **Text under-sampled** | ⚠️ Medium | Geometry capped at 256 segments despite 1024px canvas | Match geometry resolution to canvas |
| **Terrain smoothing weak** | ⚠️ Medium | Only 1-2 blur passes — rough surface transitions | Implement multi-pass Gaussian smoothing |

### Industry Context

Modern 3D printers handle millions of triangles. Current Waymarker output (~50K triangles) is ~1% of what printers support:

| Printer Type | Max File Size | Max Triangles | Current Output |
|--------------|---------------|---------------|----------------|
| Desktop FDM | <100MB | 2-5 million | ~50K ❌ |
| Resin SLA | <500MB | 10-50 million | ~50K ❌ |
| Industrial | <1GB | 50+ million | ~50K ❌ |

**Conclusion**: We have massive headroom for quality improvements without printability issues.

### Proposed Solution

Add **Export Quality Presets** (default to High Quality for paid exports):

| Preset | Route Segments | Terrain Grid | Est. Triangles | File Size |
|--------|----------------|--------------|----------------|-----------|
| Draft | 8 radial | 128×128 | ~50K | ~2MB |
| Standard | 16 radial | 192×192 | ~200K | ~10MB |
| High Quality | 24 radial | 256×256 | ~500K | ~25MB |
| Ultra | 32 radial | 384×384 | ~1M | ~50MB |

### Implementation Tasks

- [ ] Increase route tube `radialSegments` from 8 → configurable (16-32)
- [ ] Add export quality preset selector to sculpture export modal
- [ ] Implement adaptive route decimation (Douglas-Peucker algorithm)
- [ ] Add mesh validation (manifold check, self-intersection detection)
- [ ] Increase terrain smoothing passes for high-quality presets
- [ ] Display estimated file size and polygon count before export
- [ ] Add "Optimize for printing" post-processing step (vertex welding)

**Files to modify**: `lib/sculpture/meshGenerator.ts`, `lib/sculpture/stlExporter.ts`, `components/sculpture/RouteMesh.tsx`, `components/sculpture/TerrainMesh.tsx`

---

## Technical Debt

| Issue | Priority |
| ----- | -------- |
| **3D export quality** | 🔴 High |
| ESLint warnings (143, mostly `any`) | Medium |
| No test coverage | Medium |
| Console.log in production | Low |

### Recommended

1. Fix 3D sculpture export quality (see section above)
2. Add TypeScript strict mode
3. Add unit tests for GPX parser
4. Add E2E tests for route upload
5. Add Sentry for error monitoring

---

## Monetization

### Current Model: One-Time Purchase Per Export (Stripe)

| Product | Price | Margin | Status |
| ------- | ----- | ------ | ------ |
| Adventure Print (Digital) | €19-29 | High | ✅ Live |
| Journey Sculpture (STL) | €29-49 | High | ✅ Live |
| Print Delivered | €49-89 | Medium | Planned |

### Future Options

- Premium tier (multiple exports, saved designs)
- Print partnerships (Printful, Gelato)
- Subscription for power users
- Physical 3D print fulfillment

---

## Success Metrics

| Metric | Target |
| ------ | ------ |
| Route uploads/week | Track growth |
| Upload → export conversion | >20% |
| 3D print orders/month | TBD |
| Poster → 3D upsell rate | >5% |

---

**Brand**: Waymarker (waymarker.eu)

**ICP**: Hikers, cyclists, trail runners, travelers, race finishers

**Focus**: Cartographic enhancements + Programmatic SEO + Print fulfillment partnerships
