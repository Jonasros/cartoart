# Waymarker - Feature Roadmap & Strategy

> Future plans and business strategy. For completed features see [STATUS.md](STATUS.md).

**Last Updated**: 2026-01-06

---

## Strategic Summary

Waymarker transforms GPS activity data into gallery-worthy wall art. Starting with hiking route posters, expanding to 3D printed sculptures.

### Market Position

**Primary niche**: Hiking / Outdoor Adventure

- Strong buy readiness ("custom hike route print" is searched actively)
- Expands naturally to trail runners, cyclists, skiers
- Emotional hook: "I conquered this trail"

### Competitive Advantage

| Feature | Waymarker | Competitors |
| ------- | --------- | ----------- |
| Map styles | 11 | 3-5 typically |
| Color palettes | 15+ | Limited |
| 3D buildings | ✅ 4 presets | ❌ |
| 3D terrain | ✅ (coming) | ❌ |
| Privacy zones | ✅ | Some |
| High-res export | 7200x10800px | Varies |
| Social features | ✅ | ❌ |

**Positioning**: "Adventure route art that looks like a design studio made it"

---

## Immediate: 3D Terrain Support

Add 3D terrain rendering to poster editor. Enables dramatic mountain/valley visualization for both posters and future 3D printing.

### Implementation (MapLibre Native)

```javascript
// Add terrain source
map.addSource('terrain', {
  type: 'raster-dem',
  url: 'https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=API_KEY',
  tileSize: 256
});

// Enable 3D terrain
map.setTerrain({
  source: 'terrain',
  exaggeration: 1.5  // 1.0 = realistic, 2-3 = dramatic
});

// Query elevation at point
const elevation = map.queryTerrainElevation([lng, lat]);
```

### MapTiler Elevation API (for 3D Print Mesh)

```typescript
// Single point elevation
const point = await maptilersdk.elevation.at([lng, lat]);
// Returns: { lng, lat, elevation }

// Batch elevation for route
const lineWithElevation = await maptilersdk.elevation.fromLineString(routeGeoJSON);
// Returns: LineString with Z coordinates
```

### Layer Controls Addition

| Control | Type | Default | Description |
| ------- | ---- | ------- | ----------- |
| `terrain3d` | boolean | false | Enable 3D terrain rendering |
| `terrain3dExaggeration` | number | 1.5 | Vertical exaggeration (0.5-3.0) |

### Applies To

- Single point locations (city/landmark posters)
- Multiple points (coming soon)
- GPX routes (especially mountain trails)

---

## Next Priority: Phase 4 — 3D Printed Route Sculptures

> **Comprehensive specification**: [docs/PHASE4-3D-PRINTING.md](docs/PHASE4-3D-PRINTING.md)

Transform GPS routes into physical 3D sculptures — tangible keepsakes of adventures.

### Why This Is Next

| Factor | Advantage |
| ------ | --------- |
| Zero competition | Nobody does route-specific 3D sculptures |
| Premium pricing | €79-249 vs €20-40 posters |
| Tactile value | Physical object > flat print |
| Data ready | Already have GPX + elevation |
| Existing 3D infra | 3D terrain & buildings already implemented |

### Product Concept

- GPS track extruded as 3D ribbon/line using Three.js TubeGeometry
- Z-axis = actual elevation profile from route data
- Mounted on stylized base (rectangular, circular, organic, or terrain)
- Sizes: 10cm (€79-99), 15cm (€119-149), 20cm+ (€179-249)
- Materials: PLA, wood-fill PLA, resin

### UX Strategy

Mode toggle below logo in left navigation:

- **Adventure Print Mode**: Current functionality (map styles, typography, export PNG)
- **Journey Sculpture Mode**: Sculpture preview (R3F), base/material selection, export STL

Tabs adapt per mode:

- Shared: Library, Location, Style
- Print only: Text, Frame
- Sculpture only: Base, Size, Material

### Technical Stack

- **React Three Fiber** (@react-three/fiber) - React renderer for Three.js
- **Drei** (@react-three/drei) - R3F helpers (OrbitControls, Stage, Line)
- **Three.js** - TubeGeometry, PlaneGeometry, STLExporter
- **MapTiler Elevation API** - Already integrated for 3D terrain

### Leveraging Existing Code

| Existing Feature | Location | Reuse |
| ---------------- | -------- | ----- |
| 3D Terrain | `applyPalette.ts` | Elevation source |
| 3D Buildings | `buildings3d.ts` | Style/camera presets |
| Route Elevation | `RoutePoint.elevation` | Direct mesh input |
| Route Stats | min/max elevation | Normalization |

### Implementation Phases

1. **Phase 4.1**: Mode switching + basic R3F preview
2. **Phase 4.2**: Sculpture controls (base, size, material)
3. **Phase 4.3**: STL export + mesh optimization
4. **Phase 4.4**: Terrain-based sculptures (premium)
5. **Phase 4.5**: Fulfillment integration + checkout

See [docs/PHASE4-3D-PRINTING.md](docs/PHASE4-3D-PRINTING.md) for complete component architecture, state management, Three.js/R3F reference, and implementation details.

---

## Future Phases

### Phase 2: Wedding / Gift Modes

- "Met / Engaged / Married" templates (dual/triple locations)
- Heart-shaped route connector
- Romantic font presets
- Custom date formatting
- Gift wrapping for prints

**Why wait**: Higher support burden, need brand credibility first.

### Phase 3: Sailing / Voyage Maps

- Nautical mile display
- Port markers for stops
- Nautical chart styling
- Ocean-themed palettes

**Why this niche**: Less crowded, higher price tolerance, already supports routes.

---

## Feature Backlog

### Route Enhancements

- [ ] Elevation gradient coloring
- [ ] Glow/shadow effects on route
- [ ] Mile/KM markers along route
- [ ] Strava OAuth integration
- [ ] AllTrails integration
- [ ] Garmin Connect integration

### Export & Formats

- [ ] PDF export (vector output)
- [ ] SVG export for certain styles
- [ ] Print partnership (Printful, Gelato)
- [ ] Multiple print sizes (A4, A3, A2, A1)

### Editor Enhancements

- [ ] Undo/redo
- [ ] Keyboard shortcuts
- [ ] Preset location library (famous trails/cities)
- [ ] URL-based state for sharing configs

### Social & Sharing

- [ ] Collections/folders for organizing maps
- [ ] Search within feed
- [ ] User profiles with bio/avatar
- [ ] Follow users

### Polish

- [ ] Onboarding tutorial
- [ ] Accessibility improvements
- [ ] Mobile editor optimization

---

## Technical Debt

| Issue | Priority |
| ----- | -------- |
| ESLint warnings (143, mostly `any`) | Medium |
| No test coverage | Medium |
| Console.log in production | Low |

### Recommended

1. Add TypeScript strict mode
2. Add unit tests for GPX parser
3. Add E2E tests for route upload
4. Add Sentry for error monitoring

---

## Monetization

### Current Model: One-Time Purchase Per Export

| Product | Price | Margin |
| ------- | ----- | ------ |
| Digital Download | €19-29 | High |
| Print Delivered | €49-89 | Medium |
| 3D Sculpture (future) | €79-249 | High |

### Future Options

- Premium tier (multiple exports, saved designs)
- Print partnerships
- Subscription for power users

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

**Focus**: 3D Printed Route Sculptures as next major feature
