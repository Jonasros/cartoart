# 3D Sculpture System Developer Guide

> Complete reference for the 3D printed route sculpture feature.
> Use this guide to understand, modify, and optimize the sculpture system.

**Last Updated**: 2026-01-05

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Core Types](#core-types)
4. [Terrain Mesh System](#terrain-mesh-system)
5. [Route Rendering](#route-rendering)
6. [Configuration Settings](#configuration-settings)
7. [Style Presets](#style-presets)
8. [Optimization Tips](#optimization-tips)
9. [Common Modifications](#common-modifications)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The 3D sculpture system renders GPS routes as 3D printable models using Three.js and React Three Fiber (R3F). The main components are:

```
┌─────────────────────────────────────────────────────────────┐
│                    SculpturePreview                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   R3F Canvas                         │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              SculptureScene                  │    │   │
│  │  │  ┌─────────────┐  ┌─────────────┐           │    │   │
│  │  │  │ TerrainMesh │  │  RouteMesh  │           │    │   │
│  │  │  │ (elevation) │  │ (tube/line) │           │    │   │
│  │  │  └─────────────┘  └─────────────┘           │    │   │
│  │  │  ┌─────────────┐  ┌─────────────┐           │    │   │
│  │  │  │  BaseMesh   │  │   Rim Mesh  │           │    │   │
│  │  │  │ (platform)  │  │  (border)   │           │    │   │
│  │  │  └─────────────┘  └─────────────┘           │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow**:
```
RouteData (GPX) → SculptureConfig → TerrainMesh + RouteMesh → 3D Preview
                                  ↓
                          Elevation Grid (optional)
                          from useElevationGrid hook
```

---

## File Structure

```
frontend/
├── types/
│   └── sculpture.ts              # Core types, defaults, presets
│
├── components/
│   ├── sculpture/
│   │   ├── SculpturePreview.tsx  # Main R3F canvas wrapper
│   │   ├── SculptureScene.tsx    # Scene composition & rotation
│   │   ├── TerrainMesh.tsx       # Terrain with height displacement
│   │   ├── RouteMesh.tsx         # Route tube geometry
│   │   ├── BaseMesh.tsx          # Platform/pedestal
│   │   ├── RimMesh.tsx           # Decorative border
│   │   ├── EngravedText.tsx      # 3D text on base
│   │   ├── materials.ts          # Material properties
│   │   └── index.ts              # Barrel exports
│   │
│   └── controls/
│       ├── SculptureControls.tsx       # Main controls panel
│       └── SculptureStylePresets.tsx   # Visual style presets (nav)
│
├── hooks/
│   ├── useSculptureConfig.ts     # Config state management
│   └── useElevationGrid.ts       # Terrain data fetching
│
└── lib/
    └── sculpture/
        └── (future: STL export, mesh optimization)
```

---

## Core Types

### SculptureConfig

The main configuration interface in `types/sculpture.ts`:

```typescript
interface SculptureConfig {
  // Shape & Dimensions
  shape: 'rectangular' | 'circular';
  size: number;              // Physical size in cm (10, 15, 20)

  // Route Appearance
  routeStyle: 'raised' | 'engraved';
  routeThickness: number;    // Route width in mm (1-5)
  routeColor: string;        // Hex color

  // Terrain Settings (CRITICAL for 3D print quality)
  elevationScale: number;       // Height multiplier (0.5-3.0)
  terrainHeightLimit: number;   // Max height as fraction (0.3-1.0)
  routeClearance: number;       // Depression around route (0-0.15)
  terrainSmoothing: number;     // Smoothing passes (0-3)
  terrainResolution: number;    // Grid segments (64-192)
  terrainMode: 'route' | 'terrain';
  terrainColor: string;         // Hex color

  // Platform
  showBase: boolean;
  baseHeight: number;        // Platform thickness in mm
  rimHeight: number;         // Border height in mm

  // Text
  text: SculptureTextConfig;

  // Material
  material: 'pla' | 'wood' | 'resin';

  // Orientation
  terrainRotation: number;   // -1 = auto-orient start to front
}
```

### Key Settings Explained

| Setting | Range | Effect | Print Impact |
|---------|-------|--------|--------------|
| `elevationScale` | 0.5-3.0 | Height multiplier for terrain | Higher = more dramatic but may have overhangs |
| `terrainHeightLimit` | 0.3-1.0 | Caps max terrain height | Lower = flatter, more printable |
| `routeClearance` | 0-0.15 | Depression around route | Higher = route more visible, terrain dips more |
| `terrainSmoothing` | 0-3 | Smoothing passes | Higher = gentler slopes, better print quality |
| `terrainResolution` | 64-192 | Grid detail | Higher = more detail, larger file size |

---

## Terrain Mesh System

The terrain mesh (`TerrainMesh.tsx`) creates a height-displaced surface:

### Height Calculation Pipeline

```
1. Create PlaneGeometry with segments = terrainResolution
2. For each vertex:
   a. Get base elevation (from elevation grid or nearest route point)
   b. Apply smoothing (box blur, N passes)
   c. Apply height limit cap
   d. Apply route clearance (lower terrain near route)
   e. Carve groove if engraved style
3. Update normals for proper lighting
```

### Key Functions

**`getDistanceToRoute(x, z, routePoints)`**
- Calculates minimum distance from any terrain vertex to the route path
- Returns distance and interpolated elevation at nearest point
- Used for route clearance and groove carving

**`applySmoothing(heights, width, height, passes)`**
- Box blur filter over height array
- Each pass averages each cell with its 3x3 neighborhood
- More passes = smoother terrain

### Terrain Modes

| Mode | Data Source | Speed | Detail |
|------|-------------|-------|--------|
| `'route'` | Route point elevations | Fast | Lower (route-based) |
| `'terrain'` | MapTiler terrain-rgb tiles | Slower | High (full terrain) |

---

## Route Rendering

Two styles available in `RouteMesh.tsx`:

### Raised Route
- Creates `TubeGeometry` along route path
- Tube floats slightly above terrain surface
- `routeClearance` creates depression to ensure visibility

### Engraved Route
- Route carved into terrain surface
- `grooveWidth` and `grooveDepth` control carving
- Smooth edges with cosine falloff

**Visibility Algorithm**:
```typescript
// Near route, terrain is lowered to ensure route visibility
if (distance < clearanceRadius) {
  const t = distance / clearanceRadius;
  const falloff = Math.pow(t, 0.5); // Square root for gentle curve

  if (routeStyle === 'raised') {
    // Stay below route tube
    y = Math.min(y, maxTerrainNearRoute);
  } else {
    // Blend toward route elevation
    y = falloff * y + (1 - falloff) * routeElev;
  }
}
```

---

## Configuration Settings

### Elevation Scale (`elevationScale`)

Controls vertical exaggeration of terrain:

| Value | Effect | Best For |
|-------|--------|----------|
| 0.5-1.0 | Subtle, realistic | Flat routes (coastal, urban) |
| 1.0-1.5 | Balanced | Most routes |
| 1.5-2.5 | Dramatic | Mountain routes |
| 2.5-3.0 | Extreme | Maximum impact |

### Terrain Height Limit (`terrainHeightLimit`)

Caps maximum terrain height as fraction of `elevationScale`:

```
actualMaxHeight = terrainHeightLimit * elevationScale * (size / 100)
```

| Value | Effect | Print Consideration |
|-------|--------|---------------------|
| 0.3-0.5 | Very flat | Best printability |
| 0.6-0.8 | Moderate relief | Good balance |
| 0.9-1.0 | Full height | May need supports |

### Route Clearance (`routeClearance`)

Creates depression around route for visibility:

| Value | Effect |
|-------|--------|
| 0 | No depression |
| 0.03-0.05 | Subtle depression |
| 0.06-0.10 | Noticeable valley |
| 0.10-0.15 | Deep channel |

### Terrain Smoothing (`terrainSmoothing`)

Number of box blur passes:

| Value | Effect | Use Case |
|-------|--------|----------|
| 0 | Raw, sharp terrain | Dramatic mountain detail |
| 1 | Gentle smoothing | Most routes |
| 2 | Smooth flowing | Gentle terrain, better printing |
| 3 | Very smooth | Flat routes, polished look |

---

## Style Presets

### Behavior Presets (in sculpture controls)

Located in `types/sculpture.ts` as `SCULPTURE_STYLE_PRESETS`:

| Preset | elevationScale | heightLimit | clearance | smoothing | mode |
|--------|---------------|-------------|-----------|-----------|------|
| Balanced | 1.5 | 0.8 | 0.05 | 1 | route |
| Dramatic | 2.5 | 1.0 | 0.08 | 0 | terrain |
| Subtle | 1.0 | 0.6 | 0.03 | 2 | route |
| Detailed | 1.8 | 0.9 | 0.06 | 1 | terrain |
| Smooth | 1.2 | 0.7 | 0.05 | 2 | route |

### Visual Style Presets (in navigation)

Located in `components/controls/SculptureStylePresets.tsx`:

| Preset | Colors | Route Style | Character |
|--------|--------|-------------|-----------|
| Classic Earth | Brown/Green | Raised | Natural |
| Midnight Gold | Dark/Gold | Raised | Elegant |
| Ocean Blue | Slate/Cyan | Engraved | Coastal |
| Forest Trail | Green/Lime | Engraved | Wilderness |
| Snow Peak | White/Red | Raised | Alpine (dramatic) |
| Desert Sand | Sand/Red | Raised | Flat terrain |
| Monochrome | White/Black | Raised | Clean |
| Volcanic | Stone/Orange | Engraved | Dramatic |

---

## Optimization Tips

### For Better 3D Printability

1. **Use higher smoothing** (2-3) for gentler slopes
2. **Lower height limit** (0.6-0.7) to reduce overhangs
3. **Increase route clearance** (0.06-0.08) if route gets buried
4. **Use 'route' terrain mode** for simpler geometry

### For Visual Quality

1. **Increase terrain resolution** (128-192) for finer detail
2. **Use 'terrain' mode** for real elevation data
3. **Lower smoothing** (0-1) for sharper terrain features
4. **Higher elevation scale** (2.0+) for dramatic routes

### For Performance

1. **Lower terrain resolution** (64-96) for faster preview
2. **Use 'route' mode** to avoid terrain data fetching
3. **Reduce smoothing passes** for faster computation

---

## Common Modifications

### Adding a New Visual Preset

In `SculptureStylePresets.tsx`:

```typescript
{
  id: 'my-preset',
  name: 'My Preset',
  description: 'Description here',
  preview: {
    gradient: 'from-color-500 to-color-700', // Tailwind gradient
    accent: 'bg-accent-500',                  // Route preview color
  },
  config: {
    terrainColor: '#hexcolor',
    routeColor: '#hexcolor',
    routeStyle: 'raised' | 'engraved',
    elevationScale: 1.5,
    terrainHeightLimit: 0.8,
    routeClearance: 0.05,
    terrainSmoothing: 1,
    terrainMode: 'route',
    terrainResolution: 128,
  },
}
```

### Adding a New Behavior Preset

In `types/sculpture.ts`:

```typescript
// 1. Add to type
export type SculptureStylePreset = 'balanced' | ... | 'mypreset';

// 2. Add to SCULPTURE_STYLE_PRESETS
mypreset: {
  label: 'My Preset',
  description: 'What it does',
  config: {
    elevationScale: 1.5,
    terrainHeightLimit: 0.8,
    routeClearance: 0.05,
    terrainSmoothing: 1,
    terrainMode: 'route',
    terrainResolution: 128,
  },
},
```

### Changing Default Config

In `types/sculpture.ts`, modify `DEFAULT_SCULPTURE_CONFIG`.

### Adjusting Route Visibility

In `TerrainMesh.tsx`, modify:
- `grooveWidth` (line ~145): Controls engraved route width
- `grooveDepth` (line ~146): Controls engraved route depth
- `tubeOffset` in `RouteMesh.tsx`: Controls raised route height above terrain

---

## Troubleshooting

### Route Not Visible

**Symptoms**: Route hidden by terrain or barely visible

**Solutions**:
1. Increase `routeClearance` (try 0.08-0.10)
2. For raised routes: Check `tubeOffset` in RouteMesh
3. For engraved: Increase `grooveWidth` and `grooveDepth`
4. Lower `terrainHeightLimit`

### Terrain Too Flat

**Symptoms**: No elevation variation visible

**Solutions**:
1. Increase `elevationScale` (try 2.0+)
2. Increase `terrainHeightLimit` toward 1.0
3. Reduce `terrainSmoothing` to 0 or 1
4. Verify route has elevation data (`routeData.stats.elevationGain`)

### Terrain Too Spiky

**Symptoms**: Sharp peaks, harsh transitions

**Solutions**:
1. Increase `terrainSmoothing` to 2-3
2. Lower `terrainHeightLimit`
3. Reduce `elevationScale`

### Performance Issues

**Symptoms**: Slow preview, stuttering rotation

**Solutions**:
1. Lower `terrainResolution` to 64-96
2. Use 'route' terrain mode
3. Simplify route data (fewer points)

### API Rate Limiting

**Symptoms**: Terrain mode fails, errors in console

**Solutions**:
1. Use 'route' mode for development
2. Check MapTiler API quota
3. Verify API key in environment

---

## API & Tile Logging

All terrain-rgb tile requests are tracked via the tile proxy:

```
/api/tiles/maptiler/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp
```

Logging happens in `/frontend/app/api/tiles/[...path]/route.ts`:
```typescript
trackApiRequest(sourceKey, { isTileJson, isError: !response.ok });
```

---

## Future Enhancements

- [ ] STL export functionality
- [ ] Mesh optimization for 3D printing
- [ ] Multi-material export (route + terrain separate)
- [ ] Print preview with slicer estimates
- [ ] Direct fulfillment API integration

---

**See Also**:
- [PHASE4-3D-PRINTING.md](./PHASE4-3D-PRINTING.md) - Full feature specification
- [CLAUDE.md](../CLAUDE.md) - Main development context
- [types/sculpture.ts](../frontend/types/sculpture.ts) - Type definitions
