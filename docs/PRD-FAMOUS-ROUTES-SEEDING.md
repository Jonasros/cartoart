# Famous Routes Seeding - Product Requirements Document

> **Programmatic content generation for iconic hiking, cycling, and running routes worldwide**
> Integrates with [PROGRAMMATIC-SEO.md](./PROGRAMMATIC-SEO.md) as the content foundation

**Created**: 2026-01-14
**Status**: Phase 1 Complete ✅ (36 routes seeded)
**Priority**: P0 - Critical for SEO Launch
**Estimated Routes**: 100+ at launch, 500+ at scale

---

## Executive Summary

This PRD defines a system to programmatically seed the Waymarker database with famous, recognizable routes that:

1. **Provide instant value** - Users discover beautiful pre-made posters of routes they know
2. **Power SEO pages** - Each route becomes a landing page with real content
3. **Demonstrate capability** - Show GPX route styling before users upload their own
4. **Build social proof** - Professional-quality posters in the feed from day one

### Success Metrics

| Metric | Target |
|--------|--------|
| Routes seeded at launch | 100+ |
| SEO pages with route content | 500+ |
| Unique GPX sources integrated | 10+ |
| Design templates per category | 3-5 |
| Time to full seed | <2 hours |

---

## Route Catalog

### Category 1: Grand Tour Cycling (47 routes)

#### Tour de France 2025 (21 stages) ✅ GPX READY

| Stage | Route | Distance | Type | GPX Source |
|-------|-------|----------|------|------------|
| 1 | Lille → Lille | 185 km | Flat | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-1-route.gpx) |
| 2 | Lauwin-Planque → Boulogne-sur-Mer | 212 km | Hills | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-2-route.gpx) |
| 3 | Valenciennes → Dunkirk | 178 km | Flat | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-3-route.gpx) |
| 4 | Amiens → Rouen | 173 km | Hills | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-4-route.gpx) |
| 5 | Caen → Caen (ITT) | 33 km | ITT | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-5-route.gpx) |
| 6 | Bayeux → Vire | 201 km | Hills | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-6-route.gpx) |
| 7 | Saint-Malo → Mûr-de-Bretagne | 194 km | Hills | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-7-route.gpx) |
| 8 | Saint-Méen-le-Grand → Laval | 174 km | Flat | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-8-route.gpx) |
| 9 | Chinon → Châteauroux | 170 km | Flat | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-9-route.gpx) |
| 10 | Ennezat → Le Mont-Dore | 163 km | Mountains | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-10-route.gpx) |
| 11 | Toulouse → Toulouse | 154 km | Flat | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-11-route.gpx) |
| 12 | Auch → Hautacam | 181 km | Mountains | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-12-route.gpx) |
| 13 | Loudenvielle → Peyragudes (ITT) | 11 km | ITT | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-13-route.gpx) |
| 14 | Pau → Superbagnères | 183 km | Mountains | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-14-route.gpx) |
| 15 | Muret → Carcassonne | 169 km | Hills | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-15-route.gpx) |
| 16 | Montpellier → Mont Ventoux | 172 km | Mountains | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-16-route.gpx) |
| 17 | Bollène → Valence | 161 km | Flat | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-17-route.gpx) |
| 18 | Vif → Col de la Loze | 171 km | Mountains | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-18-route.gpx) |
| 19 | Albertville → La Plagne | 130 km | Mountains | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-19-route.gpx) |
| 20 | Nantua → Pontarlier | 185 km | Hills | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-20-route.gpx) |
| 21 | Mantes-la-Ville → Paris | 120 km | Flat | [cyclingstage.com](https://cdn.cyclingstage.com/images/tour-de-france/2025/stage-21-route.gpx) |

**Fetch Strategy**: Direct HTTP GET to CDN URLs - no auth required

#### Giro d'Italia 2025 (21 stages)

| Stage | Route | GPX Source |
|-------|-------|------------|
| All 21 | Various Italian stages | [cyclingstage.com/giro-2025-gpx](https://www.cyclingstage.com/giro-2025-gpx/) |

**Fetch Strategy**: Scrape cyclingstage.com Giro page for direct GPX links (same pattern as TdF)

#### Iconic Climbs (5 routes)

| Climb | Country | Distance | Elevation | GPX Source |
|-------|---------|----------|-----------|------------|
| Alpe d'Huez | France | 14 km | 1,122m | [climbfinder.com](https://climbfinder.com/en/climbs/alpe-d-huez) / Strava segment |
| Mont Ventoux | France | 21 km | 1,617m | [climbfinder.com](https://climbfinder.com/en/climbs/mont-ventoux-bedoin) |
| Stelvio Pass | Italy | 24.3 km | 1,808m | [ridewithgps.com](https://ridewithgps.com/regions/europe/it/75-stelvio-pass) |
| Col du Tourmalet | France | 17 km | 1,268m | climbfinder.com / Strava |
| Col du Galibier | France | 18 km | 1,245m | climbfinder.com / Strava |

**Fetch Strategy**:
- Primary: Scrape climbfinder.com for GPX downloads
- Fallback: Use Strava public segment data or manual GPX creation from OSM

---

### Category 2: Iconic Hiking Trails (12 routes)

#### European Long-Distance Trails

| Trail | Country | Distance | Days | GPX Source |
|-------|---------|----------|------|------------|
| Camino de Santiago (Francés) | Spain | 800 km | 30-35 | [stingynomads.com](https://stingynomads.com/gpx-phone-navigation-camino-de-santiago/) |
| Camino de Santiago (Portugués) | Portugal/Spain | 620 km | 25-30 | [portugalgreenwalks.com](https://www.portugalgreenwalks.com/camino-tracks/) |
| Tour du Mont Blanc | FR/IT/CH | 170 km | 11 | [tmbmap.com](https://tmbmap.com/) / [emigrantrailer.com](https://www.emigrantrailer.com/tour-du-mont-blanctmb-info-review-gpx/) |
| GR20 Corsica | France | 180 km | 14 | [Wikiloc](https://www.wikiloc.com/hiking-trails/gr20-2018-complete-northsouth-29133687) |
| West Highland Way | Scotland | 154 km | 7-8 | [westhighlandway.org](https://www.westhighlandway.org/the-route/) / [gps-routes.co.uk](https://www.gps-routes.co.uk/routes/home.nsf/RoutesLinksCycle/west-highland-way-walking-and-cycle-route) |
| Kungsleden | Sweden | 440 km | 20-25 | [topo-gps.com](https://www.topo-gps.com/en/route/204349) / [novo-monde.com](https://www.novo-monde.com/en/kungsleden-trail-guide/) |

**Fetch Strategy**:
- Camino: Direct GPX downloads from stingynomads.com (free, multiple routes)
- TMB: Generate from tmbmap.com or scrape emigrantrailer.com
- GR20: Wikiloc public trail (may need account)
- WHW: Official site GPX or gps-routes.co.uk direct download
- Kungsleden: topo-gps.com direct download

#### Worldwide Iconic Trails

| Trail | Country | Distance | Days | GPX Source |
|-------|---------|----------|------|------------|
| Inca Trail | Peru | 43 km | 4 | [AllTrails](https://www.alltrails.com/trail/peru/cusco/camino-inca) |
| Everest Base Camp | Nepal | 130 km | 12-14 | AllTrails / Wikiloc |
| Torres del Paine W | Chile | 80 km | 5 | AllTrails / Wikiloc |
| Overland Track | Australia | 65 km | 6 | AllTrails / Wikiloc |
| Haute Route Chamonix-Zermatt | FR/CH | 180 km | 12 | Wikiloc |
| Laugavegur Trail | Iceland | 55 km | 4 | Wikiloc / AllTrails |

**Fetch Strategy**:
- Primary: AllTrails public trails (note: GPX download may require premium)
- Fallback: Wikiloc public trails
- Alternative: FKT (Fastest Known Time) website has free GPX for many trails

---

### Category 3: Trail Running / Ultra (6 routes)

| Race | Country | Distance | Elevation | GPX Source |
|------|---------|----------|-----------|------------|
| UTMB | France | 171 km | 10,000m | [tracedetrail.fr](https://tracedetrail.fr/en/trace/310891) |
| Western States 100 | USA | 161 km | 5,500m | [wser.org](https://www.wser.org/course/maps/) / [CalTopo](https://caltopo.com/m/1BKH) |
| Hardrock 100 | USA | 165 km | 10,100m | [hardrock100.com](https://www.hardrock100.com/files/course/HR100-Course-Clockwise.gpx) ✅ Direct link! |
| Lavaredo Ultra Trail | Italy | 120 km | 5,850m | tracedetrail.fr |
| Transvulcania | Spain | 74 km | 4,350m | tracedetrail.fr |
| Ultra-Trail Australia | Australia | 100 km | 4,400m | tracedetrail.fr |

**Fetch Strategy**:
- UTMB: tracedetrail.fr provides GPX download
- Western States: Official maps page or CalTopo
- Hardrock: **Direct GPX link available** ✅
- Others: tracedetrail.fr (French trail running database with GPX)

---

### Category 4: World Marathon Majors (6 routes)

| Marathon | Country | Distance | GPX Source |
|----------|---------|----------|------------|
| Boston Marathon | USA | 42.2 km | [goandrace.com](https://www.goandrace.com/en/map/2025/boston-marathon-2025-boston-course-map-1.php) |
| London Marathon | UK | 42.2 km | [goandrace.com](https://www.goandrace.com/en/map/2025/tcs-london-marathon-2025-course-map-1.php) |
| Berlin Marathon | Germany | 42.2 km | [goandrace.com](https://www.goandrace.com/en/map/2025/bmw-berlin-marathon-2025-course-map-1.php) |
| Chicago Marathon | USA | 42.2 km | goandrace.com |
| NYC Marathon | USA | 42.2 km | goandrace.com |
| Tokyo Marathon | Japan | 42.2 km | goandrace.com |

**Fetch Strategy**: goandrace.com provides GPX for all major marathons

#### European Marathons (10 routes)

| Marathon | Country | GPX Source |
|----------|---------|------------|
| Copenhagen Marathon | Denmark | goandrace.com |
| Paris Marathon | France | goandrace.com |
| Amsterdam Marathon | Netherlands | goandrace.com |
| Stockholm Marathon | Sweden | goandrace.com |
| Vienna Marathon | Austria | goandrace.com |
| Barcelona Marathon | Spain | goandrace.com |
| Rome Marathon | Italy | goandrace.com |
| Athens Marathon | Greece | goandrace.com |
| Hamburg Marathon | Germany | goandrace.com |
| Munich Marathon | Germany | goandrace.com |

---

### Category 5: City Iconic Routes (10+ routes)

| Route | City | Type | GPX Source |
|-------|------|------|------------|
| Central Park Loop | New York | Running | Strava / AllTrails |
| Hyde Park Loop | London | Running | Strava / AllTrails |
| Tiergarten Loop | Berlin | Running | Strava / AllTrails |
| Bois de Boulogne | Paris | Running | Strava / AllTrails |
| Golden Gate Bridge | San Francisco | Running/Cycling | Strava |
| Brooklyn Bridge Loop | New York | Running | Strava |
| Thames Path | London | Running | AllTrails |
| Seine River Loop | Paris | Running | AllTrails |
| Øresund Bridge Crossing | Copenhagen | Cycling | Manual/Strava |
| Fælledparken Loop | Copenhagen | Running | Manual/Strava |

**Fetch Strategy**: Strava public segments or AllTrails popular routes

---

## Technical Architecture

### Seed Script Structure

```
frontend/
├── scripts/
│   └── seed-famous-routes/
│       ├── index.ts              # Main entry point
│       ├── config.ts             # Supabase service role config
│       ├── fetchers/
│       │   ├── cyclingstage.ts   # Tour de France, Giro fetcher
│       │   ├── goandrace.ts      # Marathon GPX fetcher
│       │   ├── tracedetrail.ts   # Ultra trail fetcher
│       │   ├── wikiloc.ts        # Hiking trail fetcher
│       │   ├── direct-gpx.ts     # Direct URL downloads
│       │   └── manual.ts         # Manually curated GPX files
│       ├── templates/
│       │   ├── cycling.ts        # Cycling route poster configs
│       │   ├── hiking.ts         # Hiking trail poster configs
│       │   ├── running.ts        # Marathon/ultra poster configs
│       │   └── city.ts           # City route poster configs
│       ├── data/
│       │   ├── routes.json       # Master route catalog
│       │   └── manual-gpx/       # Manually downloaded GPX files
│       └── utils/
│           ├── gpx-parser.ts     # GPX to RouteData conversion
│           ├── poster-builder.ts # PosterConfig generation
│           └── db-insert.ts      # Supabase insertion
```

### Data Flow

```
1. Route Catalog (routes.json)
   ↓
2. GPX Fetcher (per source type)
   ↓
3. GPX Parser → RouteData
   ↓
4. Template Selector (based on category)
   ↓
5. PosterConfig Generator
   ↓
6. Supabase Insert (with admin user_id)
   ↓
7. Optional: Thumbnail Generation
```

### Route Catalog Schema

```typescript
interface RouteEntry {
  id: string;                    // Unique slug: "tdf-2025-stage-16"
  category: 'cycling' | 'hiking' | 'running' | 'ultra' | 'city';
  subcategory?: string;          // "tour-de-france", "world-major-marathon"

  // Display info
  name: string;                  // "Tour de France 2025 - Stage 16"
  shortName: string;             // "TdF Stage 16 - Mont Ventoux"
  subtitle?: string;             // "Montpellier → Mont Ventoux"
  description?: string;

  // Location
  country: string;
  countries?: string[];          // For multi-country routes
  region?: string;

  // Route details
  distance: number;              // km
  elevationGain?: number;        // meters
  difficulty?: 'easy' | 'moderate' | 'hard' | 'expert';
  duration?: string;             // "5-7 hours" or "11 days"

  // GPX source
  gpxSource: {
    type: 'direct' | 'scrape' | 'api' | 'manual';
    url: string;
    fallbackUrl?: string;
    notes?: string;
  };

  // Poster design
  template: string;              // Template ID to use
  style: string;                 // Map style ID
  palette: string;               // Palette ID
  routeColor?: string;           // Override route color

  // SEO integration
  seoSlug: string;               // URL path: "/cycling/tour-de-france-2025-stage-16"
  seoCategory: string;           // "cycling" | "trail" | "race"
  tags: string[];                // ["tour-de-france", "mountains", "iconic-climb"]

  // Metadata
  year?: number;                 // For annual events
  eventDate?: string;            // ISO date for races
  website?: string;              // Official website
}
```

### Poster Templates

Each category gets 3-5 curated design templates:

#### Cycling Templates

```typescript
const cyclingTemplates = {
  'cycling-classic': {
    style: 'classic',
    palette: 'monochrome',
    typography: {
      titleFont: 'DM Sans',
      titleWeight: 700,
      position: 'bottom',
      showCoordinates: false,
    },
    layers: {
      terrain: true,
      terrain3d: true,
      terrain3dExaggeration: 1.5,
      contours: true,
    },
    route: {
      color: '#FFD700',  // Tour de France yellow
      width: 4,
      opacity: 1,
    },
  },
  'cycling-minimal': {
    style: 'minimalist',
    palette: 'midnight',
    // ... minimal clean look
  },
  'cycling-elevation': {
    style: 'topographic',
    palette: 'terrain',
    // ... emphasize elevation
  },
};
```

#### Hiking Templates

```typescript
const hikingTemplates = {
  'hiking-adventure': {
    style: 'topographic',
    palette: 'forest',
    layers: {
      terrain: true,
      terrain3d: true,
      terrain3dExaggeration: 2.0,
      contours: true,
    },
    route: {
      color: '#E74C3C',
      width: 3,
      lineStyle: 'solid',
    },
  },
  'hiking-vintage': {
    style: 'vintage',
    palette: 'sepia',
    // ... vintage explorer look
  },
};
```

#### Running Templates

```typescript
const runningTemplates = {
  'marathon-city': {
    style: 'minimalist',
    palette: 'clean',
    layers: {
      streets: true,
      buildings: false,
      labels: true,
    },
    route: {
      color: '#FF6B35',
      width: 4,
    },
  },
  'ultra-terrain': {
    style: 'topographic',
    palette: 'dark',
    layers: {
      terrain3d: true,
      terrain3dExaggeration: 1.8,
    },
  },
};
```

---

## Implementation Plan

### Phase 1: Infrastructure (Day 1)

1. **Create admin user** in Supabase for route ownership
2. **Set up script structure** with TypeScript + tsx runner
3. **Build GPX fetchers** for top 3 sources:
   - Direct URL fetcher (cyclingstage.com CDN)
   - goandrace.com marathon fetcher
   - Hardrock 100 direct link

4. **Test pipeline** with 5 routes end-to-end

### Phase 2: Core Routes (Day 2)

1. **Tour de France 2025** - All 21 stages (GPX ready)
2. **World Marathon Majors** - 6 routes
3. **Hardrock 100** - Direct GPX available
4. **Total**: ~28 routes

### Phase 3: Expansion (Day 3-4)

1. **Giro d'Italia 2025** - 21 stages (scrape cyclingstage.com)
2. **European Marathons** - 10 routes (goandrace.com)
3. **Iconic Hiking Trails** - 12 routes (mixed sources)
4. **Total**: ~43 additional routes

### Phase 4: Long Tail (Day 5+)

1. **Ultra Trails** - 6 routes (tracedetrail.fr)
2. **Iconic Climbs** - 5 routes (climbfinder.com)
3. **City Routes** - 10+ routes (Strava/AllTrails)
4. **Manual GPX** for gaps

### Phase 5: SEO Integration

1. **Update SEO data files** with route references
2. **Link route maps** to programmatic SEO pages
3. **Generate thumbnails** for OG images
4. **Build internal linking** between routes

---

## GPX Source Priority Matrix

| Source | Reliability | Auth Required | Routes Available | Priority |
|--------|-------------|---------------|------------------|----------|
| cyclingstage.com CDN | ✅ High | No | 42+ (TdF + Giro) | P0 |
| hardrock100.com | ✅ High | No | 1 (direct link) | P0 |
| goandrace.com | ✅ High | No | 50+ marathons | P0 |
| tracedetrail.fr | Medium | No | 100+ ultras | P1 |
| stingynomads.com | ✅ High | No | 5 Camino routes | P1 |
| gps-routes.co.uk | ✅ High | No | UK trails | P1 |
| westhighlandway.org | ✅ High | No | 1 (official) | P1 |
| topo-gps.com | ✅ High | No | Various | P2 |
| Wikiloc | Medium | Maybe | Thousands | P2 |
| AllTrails | Low | Yes (premium) | Thousands | P3 |
| climbfinder.com | Medium | Maybe | 100+ climbs | P2 |
| Strava segments | Low | API key | Unlimited | P3 |
| Manual/OSM | ✅ High | No | Fallback | P3 |

---

## SEO Integration Points

### Route → SEO Page Mapping

```typescript
// Each seeded route links to an SEO page
const routeToSeoMapping = {
  'tdf-2025-stage-16': '/cycling/tour-de-france-2025-stage-16',
  'boston-marathon-2025': '/race/boston-marathon',
  'camino-frances': '/trail/camino-de-santiago',
  'utmb-2025': '/trail/utmb',
};
```

### Community Content Integration

Seeded routes appear in:
1. **Feed** - Mixed with user-generated content
2. **SEO pages** - As "featured" or "official" route posters
3. **Recommendations** - "You might also like" sections
4. **Gift guides** - Curated route suggestions

### Schema.org Integration

Each route poster gets structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "Map",
  "name": "Tour de France 2025 Stage 16 - Mont Ventoux",
  "description": "Custom map poster of the iconic Mont Ventoux stage",
  "about": {
    "@type": "SportsEvent",
    "name": "Tour de France 2025",
    "location": {
      "@type": "Place",
      "name": "Mont Ventoux, France"
    }
  }
}
```

---

## Environment Setup

### Required Environment Variables

```bash
# Supabase service role (bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: for Strava API access
STRAVA_CLIENT_ID=your-client-id
STRAVA_CLIENT_SECRET=your-client-secret

# Admin user ID (created in Supabase)
SEED_ADMIN_USER_ID=uuid-of-admin-user
```

### Running the Seed Script

```bash
# Install dependencies
pnpm install

# Run full seed
pnpm seed:routes

# Run specific category
pnpm seed:routes --category=cycling

# Dry run (no DB writes)
pnpm seed:routes --dry-run

# With verbose logging
pnpm seed:routes --verbose
```

---

## Quality Checklist

Before marking a route as seeded:

- [ ] GPX parses correctly with valid coordinates
- [ ] Route renders on map without errors
- [ ] Stats (distance, elevation) are reasonable
- [ ] Poster design looks professional
- [ ] Title and subtitle are accurate
- [ ] Country/region metadata is correct
- [ ] SEO slug is properly formatted
- [ ] No duplicate routes in database

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GPX source goes offline | High | Multiple fallback sources per route |
| GPX accuracy issues | Medium | Validate bounds, distance against known values |
| Rate limiting on sources | Medium | Cache GPX files locally, respect rate limits |
| Legal concerns (route data) | Low | Use public/official sources only |
| Stale annual events | Medium | Year-tag routes, update annually |
| Duplicate user uploads | Low | Detect similar routes, offer to link |

---

## Future Enhancements

1. **Auto-update annual events** - Script to refresh TdF, Giro each year
2. **User suggestions** - Let users request famous routes
3. **Route verification** - Crowdsource accuracy improvements
4. **Localization** - Translate route names/descriptions
5. **API for routes** - Public API for route data (SEO benefit)
6. **Route comparison** - "Your route vs. official route"

---

## References

- [PROGRAMMATIC-SEO.md](./PROGRAMMATIC-SEO.md) - SEO page architecture
- [FEATURES.md](../FEATURES.md) - Product roadmap
- [STATUS.md](../STATUS.md) - Implementation status
- [lib/route/parseGPX.ts](../frontend/lib/route/parseGPX.ts) - GPX parsing logic

---

**Status**: Phase 1 Production Seeding Complete ✅
**Implementation Branch**: `feature/famous-routes-seeding`

---

## Implementation Progress

### Seed Script Infrastructure ✅

| Component | Status | Notes |
|-----------|--------|-------|
| Directory structure | ✅ Done | `frontend/scripts/seed-famous-routes/` |
| Types & interfaces | ✅ Done | `types.ts` |
| Supabase config | ✅ Done | `config.ts` - uses service role |
| Direct GPX fetcher | ✅ Done | `fetchers/direct-gpx.ts` |
| Goandrace.com fetcher | ✅ Done | `fetchers/goandrace.ts` - scrapes JSON, converts to GPX |
| GPX parser wrapper | ✅ Done | `utils/gpx-parser.ts` |
| Poster builder | ✅ Done | `utils/poster-builder.ts` |
| DB insertion | ✅ Done | `utils/db-insert.ts` |
| Randomization | ✅ Done | `utils/randomization.ts` - users, dates, templates |
| Route catalog | ✅ Done | `data/routes.ts` - 36 routes |
| Main entry point | ✅ Done | `index.ts` |
| Package.json scripts | ✅ Done | `pnpm seed:routes` |

### Templates Created ✅

| Category | Templates | Status |
|----------|-----------|--------|
| Cycling | 5 templates | ✅ Done |
| Hiking | 5 templates | ✅ Done |
| Running | 5 templates | ✅ Done |

### Route Seeding Progress

| Category | Routes in Catalog | Dry Run Tested | DB Seeded | Notes |
|----------|-------------------|----------------|-----------|-------|
| Tour de France 2025 | 21 | ✅ 21/21 | ✅ 21/21 | Direct GPX from cyclingstage.com CDN |
| Giro d'Italia 2025 | 0 | ⏳ | ⏳ | Need to add to catalog |
| Ultra Trails | 1 | ✅ 1/1 | ✅ 1/1 | Hardrock 100 - direct GPX working |
| Iconic Hiking | 4 | ✅ 4/4 | ✅ 4/4 | All 4 direct GPX sources found! |
| World Marathon Majors | 6 | ✅ 6/6 | ✅ 6/6 | Goandrace.com fetcher working! |
| European Marathons | 4 | ✅ 4/4 | ✅ 4/4 | Goandrace.com fetcher working! |
| City Routes | 0 | ⏳ | ⏳ | Not yet cataloged |

**Legend**: ✅ Complete | 🔄 In Progress | ⏳ Pending | ❌ Blocked

### Production Seeding Complete ✅ (Jan 15, 2025)

**Final Results**:
- **36 routes processed**
- **33 new routes inserted**
- **3 routes skipped** (already existed from earlier test)
- **0 failures**

**Database Stats After Seeding**:
- Total maps: 132
- Featured maps: 36
- Published maps: 48

**Critical Fix Applied**: Typography scale values in `addTemplateVariation()` were using pixel ranges (32-52) instead of scale ranges (0-15). Fixed to use correct scale values:
- Title size: ±0.5 within [8, 15] range
- Subtitle size: ±0.25 within [2, 8] range

### Dry Run Test Results (Jan 2025)

**Latest Test: 36/36 Routes Expected to Pass**

All direct GPX + marathon routes successfully tested:
- **21 Tour de France stages** ✅ - cyclingstage.com CDN
- **1 Hardrock 100** ✅ - Direct GPX from official site
- **10 Marathon routes** ✅ - Goandrace.com fetcher (6 World Majors + 4 European)
- **4 Hiking trails** ✅ - All direct GPX sources found!

### Hiking Trail GPX Sources Found

| Trail | Status | Direct GPX URL |
|-------|--------|----------------|
| Kungsleden | ✅ Found | `https://fastestknowntime.com/system/files/routes/gps_data/Kungleden-Forsberg.gpx` |
| Camino de Santiago | ✅ Found | `https://www.walkingclub.org.uk/camino-de-santiago/routes/Camino-de-Santiago-SWC-Camino-1.gpx` |
| West Highland Way | ✅ Found | `https://www.walkingenglishman.com/ldp/LDP/W/westhighlandway.gpx` (95 miles/154km complete) |
| Tour du Mont Blanc | ✅ Found | `https://hank.me/wp-content/uploads/gps/tour-du-mont-blanc-without-baggage.gpx` (170km circuit) |

**Sources Discovery**:
- fastestknowntime.com hosts GPX files for FKT routes
- walkingenglishman.com hosts complete UK long-distance trail GPX files
- walkingclub.org.uk hosts Camino stages as individual GPX files
- hank.me hosts travel GPX tracks including TMB complete circuit

**Marathon Routes Working**:
- Boston Marathon (42.4km, 1381 points)
- Berlin Marathon (42.7km, 606 points)
- London Marathon (42.3km, 909 points)
- NYC Marathon (42.6km, 455 points)
- Tokyo Marathon (42.3km, 2922 points)
- Chicago Marathon (42.8km, 163 points)
- Paris Marathon (42.9km, 1044 points)
- Amsterdam Marathon (42.8km, 1227 points)
- Stockholm Marathon (42.4km, 2022 points)
- Copenhagen Marathon (43.2km, 1350 points) - using 2024 course

**Technical Notes**:
- Installed `xmldom-qsa` for Node.js GPX parsing (browser DOMParser not available)
- Goandrace.com fetcher scrapes HTML for JSON path, fetches JSON, converts to GPX
- JSON structure: `AllPointsArray_SIMPLE` (coordinates) + `ElevationInterpolati` (elevation)
- Hiking trails need replacement with direct GPX sources

### Next Steps

1. ✅ Install dependencies: `npm install` (including `xmldom-qsa`)
2. ✅ Test dry run: `npm run seed:routes:dry` - **22 routes PASSED**
3. ✅ Build goandrace.com fetcher for marathons - **COMPLETE**
4. ✅ Test all marathon routes - **10/10 PASSED**
5. ✅ Find direct GPX sources for 4 hiking trails - **4/4 FOUND** (see table above)
6. ✅ Update routes.ts with new hiking trail GPX URLs - **COMPLETE**
7. ✅ Test dry run with all 36 routes - **36/36 PASSED**
8. ✅ Seed 36 working routes to production DB - **33 inserted, 3 skipped (existed)**
9. ⏳ Add Giro d'Italia to catalog

---

## Previous Next Steps (for reference)
