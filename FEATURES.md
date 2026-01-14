# Waymarker - Feature Roadmap & Strategy

> Future plans and business strategy. For completed features see [STATUS.md](STATUS.md).

**Last Updated**: 2026-01-14

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
| 3D terrain | ✅ | ❌ |
| 3D sculptures | ✅ STL export | ❌ |
| Privacy zones | ✅ | Some |
| High-res export | 7200x10800px | Varies |
| Social features | ✅ | ❌ |
| Stripe payments | ✅ | Varies |

**Positioning**: "Adventure route art that looks like a design studio made it"

---

## Immediate: Programmatic SEO (Growth Initiative)

> **Comprehensive specification**: [docs/PROGRAMMATIC-SEO.md](docs/PROGRAMMATIC-SEO.md)

Scale organic traffic through thousands of targeted landing pages capturing long-tail search queries.

### Why This Is Priority

| Factor | Opportunity |
|--------|-------------|
| Total pages | ~11,000+ at scale |
| Traffic potential | 50-100K visits/month |
| Conversion focus | High-intent keywords |
| Competitive moat | Strava + GPX + 3D = unique |

### Page Categories

| Category | Pages | Target Keywords |
|----------|-------|-----------------|
| City Maps | ~10,000 | "[City] map poster" |
| Marathons & Races | ~500 | "[Race] route poster 2026" |
| Trails & Hikes | ~200 | "[Trail] map print" |
| Cycling Routes | ~300 | "[Route] cycling poster" |
| Triathlons | ~100 | "Ironman [Location] map" |
| Gift Guides | ~50 | "gift for marathon runner" |

### Implementation Phases

1. **Phase 1 (Weeks 1-2)**: Foundation — 170 high-value pages (top cities, races, trails)
2. **Phase 2 (Weeks 3-6)**: Scale — Expand to ~1,500 pages
3. **Phase 3 (Weeks 7-10)**: Optimization — SEO refinement, A/B testing
4. **Phase 4 (Weeks 11+)**: Full scale — ~11,000+ pages

### Technical Approach

- Next.js `generateStaticParams` for pre-rendering
- Dynamic sitemap with priority scoring
- JSON-LD structured data (FAQ schema)
- Pre-loaded GPX routes for major events
- Community content integration for unique value

See [docs/PROGRAMMATIC-SEO.md](docs/PROGRAMMATIC-SEO.md) for complete PRD including URL structures, data requirements, page templates, and keyword targeting.

---

## Recently Completed

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
- [x] Strava OAuth integration ✅
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

**Focus**: Programmatic SEO for organic growth + Print fulfillment partnerships
