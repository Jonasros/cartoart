# Phase 4: 3D Printed Route Sculptures

> **Comprehensive Feature Specification**
> Transform GPS routes into physical 3D sculptures — tangible keepsakes of adventures.

**Last Updated**: 2026-01-05

---

## Current Implementation Status

### Completed Features (Phase 4.1-4.5)

| Feature | Status | Location |
|---------|--------|----------|
| Mode toggle (Poster/Sculpture) | ✅ Complete | `ModeToggle.tsx` |
| R3F Canvas integration | ✅ Complete | `SculpturePreview.tsx` |
| Terrain mesh with height displacement | ✅ Complete | `TerrainMesh.tsx` |
| Route tube geometry | ✅ Complete | `RouteMesh.tsx` |
| Raised and engraved route styles | ✅ Complete | `TerrainMesh.tsx`, `RouteMesh.tsx` |
| Base platform mesh | ✅ Complete | `BaseMesh.tsx` |
| Rim/border mesh | ✅ Complete | `RimMesh.tsx` |
| Engraved text | ✅ Complete | `EngravedText.tsx` |
| Material presets (PLA, Wood, Resin) | ✅ Complete | `materials.ts` |
| Full sculpture controls panel | ✅ Complete | `SculptureControls.tsx` |
| Visual style presets | ✅ Complete | `SculptureStylePresets.tsx` |
| Terrain behavior presets | ✅ Complete | `types/sculpture.ts` |
| Terrain height limit | ✅ Complete | `TerrainMesh.tsx` |
| Route clearance (visibility) | ✅ Complete | `TerrainMesh.tsx` |
| Terrain smoothing | ✅ Complete | `TerrainMesh.tsx` |
| Terrain mode (route/terrain) | ✅ Complete | `useElevationGrid.ts` |
| Auto-rotation (start point to front) | ✅ Complete | `SculptureScene.tsx` |
| API usage logging for terrain tiles | ✅ Complete | `/api/tiles/[...path]/route.ts` |
| STL export | ✅ Complete | `lib/sculpture/stlExporter.ts` |
| Mesh generator/optimization | ✅ Complete | `lib/sculpture/meshGenerator.ts` |
| Sculpture export modal | ✅ Complete | `SculptureExportModal.tsx` |
| Database save integration | ✅ Complete | `lib/actions/maps.ts` |
| Sculpture thumbnail generation | ✅ Complete | `lib/export/sculptureThumbnail.ts` |
| Feed MapCard shows sculpture badge | ✅ Complete | `components/feed/MapCard.tsx` |
| Feed MapCard uses sculpture thumbnail | ✅ Complete | `components/feed/MapCard.tsx` |

### Remaining Work

| Feature | Priority | Notes |
|---------|----------|-------|
| ExploreDrawer product type badges | Medium | Add poster/sculpture badge like MapCard |
| ExploreDrawer sculpture thumbnails | Medium | Use `sculpture_thumbnail_url` for sculptures |
| Fulfillment API integration | Low | Future: for ordering physical prints |

**See Also**: [3D-SCULPTURE-GUIDE.md](./3D-SCULPTURE-GUIDE.md) for developer reference

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [UX Strategy](#ux-strategy)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Technical Implementation](#technical-implementation)
6. [Three.js/R3F Reference](#threejsr3f-reference)
7. [Leveraging Existing 3D Code](#leveraging-existing-3d-code)
8. [Implementation Phases](#implementation-phases)
9. [API & Fulfillment Integration](#api--fulfillment-integration)
10. [Design System](#design-system)

---

## Executive Summary

### Business Case

| Factor | Advantage |
|--------|-----------|
| Zero competition | Nobody does route-specific 3D sculptures |
| Premium pricing | €79-249 vs €20-40 posters |
| Tactile value | Physical object > flat print |
| Data ready | Already have GPX + elevation |
| Existing infrastructure | 3D terrain & buildings already implemented |

### Product Concept

- GPS track extruded as 3D ribbon/line following actual elevation
- Z-axis represents real elevation profile from route data
- Mounted on stylized base (rectangular, circular, or organic)
- Sizes: 10cm (€79-99), 15cm (€119-149), 20cm+ (€179-249)
- Materials: PLA, wood-fill PLA, resin

### Technical Approach Options

**Option A: Route Ribbon (MVP)**
```
GPS + elevation → TubeGeometry (Three.js) → Add base → Export STL
```

**Option B: Route on Terrain (Premium)**
```
GPS + elevation + terrain heightmap → PlaneGeometry with displacement → Route on surface → Export STL
```

---

## UX Strategy

### Mode Toggle Design

The editor supports two product modes with shared core functionality:

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                    [Undo][Redo][Export]│
│ │ LOGO │                                                        │
│ ├──────┤                                                        │
│ │ 🖼️   │ ← Mode Toggle                                          │
│ │ 🧊   │   (Poster / 3D Print)                                  │
│ ├──────┤                                                        │
│ │ 📚   │ Library                                                │
│ │ 📍   │ Location/Route  ← Shared                               │
│ │ 🎨   │ Style           ← Shared                               │
│ │ ✏️   │ Text            ← Poster only                          │
│ │ 🖼️   │ Frame           ← Poster only                          │
│ │ 🧊   │ Sculpture       ← 3D only (base, size, material)       │
│ ├──────┤                                                        │
│ │ 🧭   │ Explore                                                │
│ │ 👤   │ Account                                                │
│ └──────┘                                                        │
│                                                                 │
│            ┌─────────────────────────────────┐                  │
│            │                                 │                  │
│            │     Preview Area                │                  │
│            │     (Map Canvas OR R3F Scene)   │                  │
│            │                                 │                  │
│            └─────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### Mode-Specific UI Changes

| Element | Poster Mode | 3D Print Mode |
|---------|-------------|---------------|
| Preview | MapLibre canvas + TextOverlay | R3F 3D scene with OrbitControls |
| Tabs | Library, Location, Style, Text, Frame | Library, Location, Style, Sculpture |
| Export Modal | PNG resolution, pricing | STL download, size, material, order |
| Controls | Typography, format, texture | Base style, size, material preview |

### Mobile Layout

```
┌──────────────────────────────┐
│  🖼️ Poster  │  🧊 3D Print  │  ← Top toggle (replaces logo row)
├──────────────────────────────┤
│                              │
│       Preview Area           │
│                              │
├──────────────────────────────┤
│ 📚 │ 📍 │ 🎨 │ ✏️/🧊 │ ⋯ │  ← Bottom nav (adapts to mode)
└──────────────────────────────┘
```

### Tab Mapping Per Mode

```typescript
// Poster mode tabs
const POSTER_TABS = ['library', 'location', 'style', 'text', 'frame'] as const;

// 3D Print mode tabs
const SCULPTURE_TABS = ['library', 'location', 'style', 'sculpture'] as const;

// Shared tabs (available in both modes)
const SHARED_TABS = ['library', 'location', 'style'] as const;
```

---

## Component Architecture

### Directory Structure

```
frontend/
├── components/
│   ├── controls/
│   │   ├── SculptureControls.tsx      # 3D-specific controls panel
│   │   ├── SculptureBaseControls.tsx  # Base shape selection
│   │   ├── SculptureSizeControls.tsx  # Size/scale options
│   │   └── SculptureMaterialControls.tsx # Material preview
│   │
│   ├── sculpture/
│   │   ├── SculpturePreview.tsx       # Main R3F Canvas wrapper
│   │   ├── SculptureScene.tsx         # Scene composition
│   │   ├── RouteMesh.tsx              # Route as TubeGeometry
│   │   ├── TerrainMesh.tsx            # Optional terrain base
│   │   ├── BaseMesh.tsx               # Decorative base geometry
│   │   ├── SculptureLighting.tsx      # Lighting setup
│   │   └── SculptureCamera.tsx        # Camera controls
│   │
│   ├── export/
│   │   ├── ExportOptionsModal.tsx     # Updated with mode detection
│   │   ├── PosterExportPanel.tsx      # Poster-specific export
│   │   └── SculptureExportPanel.tsx   # 3D-specific export/order
│   │
│   └── layout/
│       ├── ModeToggle.tsx             # Poster/3D switch component
│       └── TabNavigation.tsx          # Updated with mode awareness
│
├── lib/
│   ├── sculpture/
│   │   ├── routeToMesh.ts             # Convert route to 3D geometry
│   │   ├── terrainToMesh.ts           # Convert terrain to mesh
│   │   ├── stlExporter.ts             # Export mesh as STL
│   │   ├── objExporter.ts             # Export mesh as OBJ
│   │   └── meshOptimizer.ts           # Optimize for 3D printing
│   │
│   └── elevation/
│       └── maptilerElevation.ts       # MapTiler elevation API wrapper
│
└── types/
    └── sculpture.ts                    # 3D-specific type definitions
```

### Component Hierarchy

```
<PosterEditor>
  ├── <ModeToggle mode={mode} onModeChange={setMode} />
  │
  ├── <TabNavigation
  │     mode={mode}
  │     tabs={mode === 'poster' ? POSTER_TABS : SCULPTURE_TABS}
  │   />
  │
  ├── {mode === 'poster' ? (
  │     <MapPreview config={config} />
  │   ) : (
  │     <SculpturePreview
  │       route={config.route}
  │       sculptureConfig={sculptureConfig}
  │     />
  │   )}
  │
  ├── <ControlDrawer>
  │     {mode === 'poster' ? (
  │       <PosterControls tab={activeTab} />
  │     ) : (
  │       <SculptureControls tab={activeTab} />
  │     )}
  │   </ControlDrawer>
  │
  └── <ExportOptionsModal mode={mode} />
</PosterEditor>
```

### SculpturePreview Component

```tsx
// components/sculpture/SculpturePreview.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { SculptureScene } from './SculptureScene';
import type { RouteConfig, SculptureConfig } from '@/types';

interface SculpturePreviewProps {
  route: RouteConfig;
  sculptureConfig: SculptureConfig;
  className?: string;
}

export function SculpturePreview({
  route,
  sculptureConfig,
  className
}: SculpturePreviewProps) {
  return (
    <div className={cn("w-full h-full bg-gray-100 dark:bg-gray-900", className)}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        shadows
        gl={{ preserveDrawingBuffer: true }} // For screenshot export
      >
        <Stage
          environment="city"
          intensity={0.5}
          shadows={{ type: 'contact', opacity: 0.5 }}
        >
          <SculptureScene
            route={route}
            config={sculptureConfig}
          />
        </Stage>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
```

### RouteMesh Component

```tsx
// components/sculpture/RouteMesh.tsx
'use client';

import { useMemo } from 'react';
import { TubeGeometry, CatmullRomCurve3, Vector3 } from 'three';
import type { RouteData } from '@/types';

interface RouteMeshProps {
  routeData: RouteData;
  exaggeration?: number;  // Vertical exaggeration (1.0 = realistic)
  tubeRadius?: number;    // Radius of the route tube
  tubeSegments?: number;  // Smoothness of the tube
  radialSegments?: number;
  color?: string;
}

export function RouteMesh({
  routeData,
  exaggeration = 1.5,
  tubeRadius = 0.02,
  tubeSegments = 200,
  radialSegments = 8,
  color = '#3b82f6'
}: RouteMeshProps) {

  const geometry = useMemo(() => {
    // Convert route points to normalized 3D coordinates
    const points = routeData.points.map(point => {
      // Normalize coordinates to fit within unit cube
      const x = normalizeX(point.lng, routeData.bounds);
      const z = normalizeZ(point.lat, routeData.bounds);
      const y = normalizeY(point.elevation ?? 0, routeData.stats) * exaggeration;

      return new Vector3(x, y, z);
    });

    // Create smooth curve through points
    const curve = new CatmullRomCurve3(points);

    // Generate tube geometry
    return new TubeGeometry(
      curve,
      tubeSegments,
      tubeRadius,
      radialSegments,
      false // closed
    );
  }, [routeData, exaggeration, tubeRadius, tubeSegments, radialSegments]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

// Normalization helpers
function normalizeX(lng: number, bounds: RouteBounds): number {
  const range = bounds.maxLng - bounds.minLng;
  return ((lng - bounds.minLng) / range - 0.5) * 2; // -1 to 1
}

function normalizeZ(lat: number, bounds: RouteBounds): number {
  const range = bounds.maxLat - bounds.minLat;
  return ((lat - bounds.minLat) / range - 0.5) * 2; // -1 to 1
}

function normalizeY(elevation: number, stats: RouteStats): number {
  const range = stats.maxElevation - stats.minElevation;
  if (range === 0) return 0;
  return (elevation - stats.minElevation) / range; // 0 to 1
}
```

---

## State Management

### SculptureConfig Type

```typescript
// types/sculpture.ts

export type ProductMode = 'poster' | 'sculpture';

export type SculptureBaseStyle =
  | 'rectangular'
  | 'circular'
  | 'organic'
  | 'terrain';

export type SculptureSize =
  | 'small'   // 10cm - €79-99
  | 'medium'  // 15cm - €119-149
  | 'large';  // 20cm+ - €179-249

export type SculptureMaterial =
  | 'pla-white'
  | 'pla-black'
  | 'pla-metallic'
  | 'wood-fill'
  | 'resin-clear'
  | 'resin-matte';

export interface SculptureConfig {
  // Base configuration
  baseStyle: SculptureBaseStyle;
  baseColor: string;
  basePadding: number;  // Space around route (0.1-0.5)

  // Route rendering
  routeRadius: number;           // Tube thickness
  routeExaggeration: number;     // Vertical exaggeration (0.5-3.0)
  routeColor: string;

  // Terrain (if baseStyle === 'terrain')
  terrainResolution: number;     // Grid density
  terrainSmoothing: number;      // Mesh smoothing passes

  // Physical product
  size: SculptureSize;
  material: SculptureMaterial;

  // Preview settings
  previewRotation: [number, number, number];
  previewZoom: number;
}

export const DEFAULT_SCULPTURE_CONFIG: SculptureConfig = {
  baseStyle: 'rectangular',
  baseColor: '#1f2937',
  basePadding: 0.2,

  routeRadius: 0.03,
  routeExaggeration: 1.5,
  routeColor: '#3b82f6',

  terrainResolution: 128,
  terrainSmoothing: 2,

  size: 'medium',
  material: 'pla-white',

  previewRotation: [0, 0, 0],
  previewZoom: 1,
};
```

### Extended PosterConfig

```typescript
// Update types/poster.ts

export interface PosterConfig {
  // ... existing fields ...

  // NEW: Product mode
  mode: ProductMode;

  // NEW: Sculpture-specific config (only used when mode === 'sculpture')
  sculpture?: SculptureConfig;
}
```

### State Hook

```typescript
// hooks/useSculptureConfig.ts
import { useState, useCallback } from 'react';
import type { SculptureConfig } from '@/types';
import { DEFAULT_SCULPTURE_CONFIG } from '@/types';

export function useSculptureConfig(initial?: Partial<SculptureConfig>) {
  const [config, setConfig] = useState<SculptureConfig>({
    ...DEFAULT_SCULPTURE_CONFIG,
    ...initial,
  });

  const updateConfig = useCallback((updates: Partial<SculptureConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_SCULPTURE_CONFIG);
  }, []);

  return { config, updateConfig, resetConfig };
}
```

---

## Technical Implementation

### Route to Mesh Pipeline

```typescript
// lib/sculpture/routeToMesh.ts
import * as THREE from 'three';
import type { RouteData, SculptureConfig } from '@/types';

export interface MeshGenerationResult {
  routeMesh: THREE.BufferGeometry;
  baseMesh: THREE.BufferGeometry;
  combinedMesh: THREE.BufferGeometry;
  bounds: THREE.Box3;
  stats: {
    vertices: number;
    faces: number;
    estimatedFileSize: number;
  };
}

export async function generateSculptureMesh(
  routeData: RouteData,
  config: SculptureConfig
): Promise<MeshGenerationResult> {
  // 1. Normalize route points to unit space
  const normalizedPoints = normalizeRoutePoints(routeData, config);

  // 2. Create smooth curve through points
  const curve = new THREE.CatmullRomCurve3(normalizedPoints);

  // 3. Generate tube geometry for route
  const routeGeometry = new THREE.TubeGeometry(
    curve,
    Math.max(100, routeData.points.length * 2),
    config.routeRadius,
    12,  // radial segments
    false
  );

  // 4. Generate base geometry
  const baseGeometry = generateBase(routeData, config);

  // 5. Combine meshes
  const combined = mergeGeometries([routeGeometry, baseGeometry]);

  // 6. Optimize for 3D printing
  const optimized = optimizeForPrinting(combined);

  return {
    routeMesh: routeGeometry,
    baseMesh: baseGeometry,
    combinedMesh: optimized,
    bounds: new THREE.Box3().setFromBufferAttribute(
      optimized.getAttribute('position')
    ),
    stats: {
      vertices: optimized.getAttribute('position').count,
      faces: optimized.index ? optimized.index.count / 3 : 0,
      estimatedFileSize: estimateStlSize(optimized),
    },
  };
}

function generateBase(
  routeData: RouteData,
  config: SculptureConfig
): THREE.BufferGeometry {
  const padding = config.basePadding;

  switch (config.baseStyle) {
    case 'rectangular': {
      const width = 2 + padding * 2;
      const depth = 2 + padding * 2;
      const height = 0.1;
      return new THREE.BoxGeometry(width, height, depth);
    }

    case 'circular': {
      const radius = Math.sqrt(2) + padding;
      return new THREE.CylinderGeometry(radius, radius, 0.1, 64);
    }

    case 'organic': {
      // Create organic-shaped base following route outline
      return generateOrganicBase(routeData, padding);
    }

    case 'terrain': {
      // Generate terrain mesh from elevation data
      return generateTerrainBase(routeData, config);
    }
  }
}
```

### STL Export

```typescript
// lib/sculpture/stlExporter.ts
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import * as THREE from 'three';

export function exportToSTL(
  geometry: THREE.BufferGeometry,
  filename: string = 'sculpture.stl',
  binary: boolean = true
): void {
  const exporter = new STLExporter();

  // Create a mesh with the geometry
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);

  // Export
  const result = exporter.parse(mesh, { binary });

  // Download
  const blob = binary
    ? new Blob([result], { type: 'application/octet-stream' })
    : new Blob([result], { type: 'text/plain' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToOBJ(
  geometry: THREE.BufferGeometry,
  filename: string = 'sculpture.obj'
): void {
  // Similar implementation with OBJExporter
}
```

### MapTiler Elevation API Integration

```typescript
// lib/elevation/maptilerElevation.ts

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

/**
 * Get elevation for a single point
 */
export async function getPointElevation(
  lng: number,
  lat: number
): Promise<number> {
  const url = `https://api.maptiler.com/elevation/point/${lng},${lat}?key=${MAPTILER_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.elevation;
}

/**
 * Get elevation grid for a bounding box
 * Used for terrain mesh generation
 */
export async function getElevationGrid(
  bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number },
  resolution: number = 128
): Promise<Float32Array> {
  const grid = new Float32Array(resolution * resolution);

  // Calculate step sizes
  const lngStep = (bounds.maxLng - bounds.minLng) / (resolution - 1);
  const latStep = (bounds.maxLat - bounds.minLat) / (resolution - 1);

  // Batch requests (MapTiler supports batch elevation)
  const points: [number, number][] = [];
  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const lng = bounds.minLng + x * lngStep;
      const lat = bounds.minLat + z * latStep;
      points.push([lng, lat]);
    }
  }

  // Fetch in batches of 100
  const batchSize = 100;
  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize);
    const elevations = await fetchElevationBatch(batch);

    for (let j = 0; j < elevations.length; j++) {
      grid[i + j] = elevations[j];
    }
  }

  return grid;
}

/**
 * Enrich route with elevation data
 */
export async function enrichRouteWithElevation(
  points: Array<{ lat: number; lng: number }>
): Promise<Array<{ lat: number; lng: number; elevation: number }>> {
  // Use LineString elevation endpoint for efficiency
  const coordinates = points.map(p => [p.lng, p.lat]);

  const response = await fetch(
    `https://api.maptiler.com/elevation/linestring?key=${MAPTILER_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'LineString',
        coordinates,
      }),
    }
  );

  const data = await response.json();

  return data.coordinates.map((coord: number[], i: number) => ({
    lat: points[i].lat,
    lng: points[i].lng,
    elevation: coord[2],
  }));
}
```

---

## Three.js/R3F Reference

### Key Dependencies

```json
{
  "dependencies": {
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "three": "^0.160.x",
    "three-stdlib": "^2.x"
  }
}
```

### React Three Fiber Core Concepts

```tsx
// Canvas - The root R3F component
<Canvas
  camera={{ position: [0, 5, 10], fov: 50 }}
  shadows
  gl={{ preserveDrawingBuffer: true }}
>
  {/* Scene contents */}
</Canvas>

// Mesh - Basic 3D object
<mesh position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="blue" />
</mesh>

// useFrame - Animation hook
function AnimatedMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return <mesh ref={meshRef}>...</mesh>;
}
```

### Drei Helper Components

```tsx
// OrbitControls - Mouse/touch camera control
import { OrbitControls } from '@react-three/drei';

<OrbitControls
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  minDistance={2}
  maxDistance={20}
/>

// Stage - Quick scene setup with lighting
import { Stage } from '@react-three/drei';

<Stage
  environment="city"       // HDR environment
  intensity={0.5}          // Light intensity
  shadows={{ type: 'contact', opacity: 0.5 }}
>
  <MyMesh />
</Stage>

// Line - For route visualization
import { Line } from '@react-three/drei';

<Line
  points={[[0, 0, 0], [1, 1, 1], [2, 0, 0]]}
  color="red"
  lineWidth={2}
/>

// PresentationControls - Drag to rotate
import { PresentationControls } from '@react-three/drei';

<PresentationControls
  global
  snap
  rotation={[0, -Math.PI / 4, 0]}
  polar={[-Math.PI / 4, Math.PI / 4]}
  azimuth={[-Math.PI / 4, Math.PI / 4]}
>
  <MySculpture />
</PresentationControls>
```

### Geometry Types for 3D Printing

```tsx
// TubeGeometry - For route ribbon
const curve = new THREE.CatmullRomCurve3(points);
const geometry = new THREE.TubeGeometry(
  curve,      // path
  100,        // tubular segments
  0.02,       // radius
  8,          // radial segments
  false       // closed
);

// PlaneGeometry - For terrain base
const geometry = new THREE.PlaneGeometry(
  width,
  height,
  widthSegments,
  heightSegments
);
// Then modify vertices for elevation

// ExtrudeGeometry - For custom shapes
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(1, 0);
shape.lineTo(1, 1);
shape.closePath();

const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 0.1,
  bevelEnabled: false,
});
```

---

## Leveraging Existing 3D Code

### Existing Infrastructure

The project already has substantial 3D infrastructure:

| Feature | Location | Reuse for 3D Print |
|---------|----------|-------------------|
| 3D Terrain | `lib/styles/applyPalette.ts:164-192` | Elevation data source |
| 3D Buildings | `lib/styles/layers/buildings3d.ts` | Style presets (glass, wireframe) |
| Route Elevation | `types/poster.ts` RoutePoint.elevation | Direct mesh generation |
| Route Stats | `types/poster.ts` RouteStats | Min/max elevation for normalization |
| MapTiler API | Already configured | Terrain tile fetching |

### Code to Adapt

#### From 3D Terrain (applyPalette.ts)

```typescript
// EXISTING: Terrain source injection
if (layers?.terrain3d) {
  const terrainUrl = getTerrainRgbTileJsonUrl();
  if (terrainUrl) {
    updatedStyle.sources['terrain-rgb'] = {
      type: 'raster-dem',
      url: terrainUrl,
      tileSize: 256,
    };
    updatedStyle.terrain = {
      source: 'terrain-rgb',
      exaggeration: layers.terrain3dExaggeration ?? 1.0,
    };
  }
}

// ADAPT FOR 3D PRINT:
// Use same MapTiler terrain tiles to generate heightmap
// for PlaneGeometry vertex displacement
```

#### From 3D Buildings (buildings3d.ts)

```typescript
// EXISTING: Style presets
export const BUILDING_3D_STYLE_PRESETS = {
  solid: { opacity: 0.9, lightIntensity: 0.4 },
  glass: { opacity: 0.5, lightIntensity: 0.6 },
  wireframe: { opacity: 0.7, lightIntensity: 0.3 },
  gradient: { opacity: 0.8, lightIntensity: 0.5 },
};

// EXISTING: Camera presets
export const BUILDING_3D_CAMERA_PRESETS = {
  isometric: { pitch: 45, bearing: -45 },
  skyline: { pitch: 60, bearing: 0 },
  birdseye: { pitch: 30, bearing: 45 },
  dramatic: { pitch: 70, bearing: -30 },
};

// ADAPT FOR 3D PRINT:
// Reuse camera presets for initial R3F camera position
// Adapt style presets for material appearance
```

#### From Route Data (types/poster.ts)

```typescript
// EXISTING: Route types with elevation
export interface RoutePoint {
  lat: number;
  lng: number;
  elevation?: number;  // ← Already have elevation!
  time?: Date;
}

export interface RouteStats {
  distance: number;
  elevationGain: number;
  elevationLoss: number;
  minElevation: number;  // ← For normalization
  maxElevation: number;  // ← For normalization
  duration?: number;
  startTime?: Date;
  endTime?: Date;
}

export interface RouteBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// DIRECT USE: All this data feeds directly into mesh generation
```

### Integration Strategy

1. **Share elevation data source** - Use MapTiler for both map terrain and sculpture terrain
2. **Reuse camera presets** - Adapt `BUILDING_3D_CAMERA_PRESETS` for R3F initial camera
3. **Reuse style concepts** - Glass, wireframe styles can inform material preview options
4. **Leverage route parsing** - GPX parser already extracts elevation, bounds, stats

---

## Implementation Phases

### Phase 4.1: Foundation (Week 1-2) ✅ COMPLETE

**Goal**: Basic mode switching and R3F integration

- [x] Add `@react-three/fiber` and `@react-three/drei` dependencies
- [x] Create `ModeToggle` component
- [x] Update `TabNavigation` with mode awareness
- [x] Create `SculpturePreview` component with basic R3F Canvas
- [x] Create `RouteMesh` component (TubeGeometry from route)
- [x] Create `TerrainMesh` component with height displacement
- [x] Add `sculpture` types to `types/sculpture.ts`
- [x] Basic OrbitControls for preview rotation

**Deliverable**: ✅ Can switch modes and see terrain + route as 3D model

### Phase 4.2: Controls & Customization (Week 2-3) ✅ COMPLETE

**Goal**: Full sculpture customization UI

- [x] Create `SculptureControls` drawer panel
- [x] Add base style selection (rectangular, circular)
- [x] Add size selection with real dimensions (10, 15, 20 cm)
- [x] Add material preview with different looks (PLA, Wood, Resin)
- [x] Add elevation scale slider (0.5x - 3.0x)
- [x] Add route thickness control
- [x] Add terrain settings (height limit, clearance, smoothing)
- [x] Add style presets (visual + behavior)
- [x] Update `SculptureConfig` with all options
- [ ] Persist sculpture config in saved maps (deferred to Phase 4.6)

**Deliverable**: ✅ Full control over sculpture appearance

### Phase 4.3: Export & Preview (Week 3-4)

**Goal**: STL export and enhanced preview

- [ ] Implement `routeToMesh.ts` complete pipeline
- [ ] Add STL export with Three.js STLExporter
- [ ] Create `SculptureExportPanel` in export modal
- [ ] Add mesh optimization for 3D printing
- [ ] Add printability validation (manifold, size)
- [ ] Enhanced lighting and materials for preview
- [ ] Screenshot capture from R3F scene

**Deliverable**: Downloadable STL files ready for 3D printing

### Phase 4.4: Terrain Mode (Week 4-5)

**Goal**: Premium terrain-based sculptures

- [ ] Create `TerrainMesh` component
- [ ] Implement `terrainToMesh.ts` using elevation API
- [ ] Add terrain smoothing controls
- [ ] Route floating above terrain surface
- [ ] Higher resolution elevation grid
- [ ] Terrain + route merged mesh export

**Deliverable**: Route on terrain sculptures

### Phase 4.5: Fulfillment Integration (Week 5-6)

**Goal**: Order and checkout flow

- [ ] Research fulfillment APIs (Shapeways, i.materialise, Craftcloud)
- [ ] Create order flow UI
- [ ] Integrate payment (Stripe)
- [ ] Order tracking page
- [ ] Email notifications

**Deliverable**: End-to-end ordering capability

---

## API & Fulfillment Integration

### Fulfillment Partners

| Partner | API | Pricing | Lead Time |
|---------|-----|---------|-----------|
| Shapeways | REST API | Per-volume | 7-14 days |
| i.materialise | REST API | Per-volume | 5-10 days |
| Craftcloud | REST API | Multi-provider | 3-14 days |
| Self-fulfill | N/A | Best margin | 2-5 days |

### Order Flow

```
1. User customizes sculpture
2. Generate preview + STL
3. Calculate price (based on volume + material)
4. User proceeds to checkout
5. Payment via Stripe
6. Upload STL to fulfillment API
7. Order confirmation email
8. Tracking updates via webhook
9. Delivery notification
```

### Pricing Strategy

```typescript
// lib/sculpture/pricing.ts

interface PricingConfig {
  basePrices: Record<SculptureSize, number>;
  materialMultipliers: Record<SculptureMaterial, number>;
  marginPercent: number;
}

const PRICING: PricingConfig = {
  basePrices: {
    small: 49,   // 10cm
    medium: 79,  // 15cm
    large: 129,  // 20cm+
  },
  materialMultipliers: {
    'pla-white': 1.0,
    'pla-black': 1.0,
    'pla-metallic': 1.2,
    'wood-fill': 1.3,
    'resin-clear': 1.8,
    'resin-matte': 1.6,
  },
  marginPercent: 40,
};

export function calculatePrice(
  size: SculptureSize,
  material: SculptureMaterial
): number {
  const base = PRICING.basePrices[size];
  const multiplier = PRICING.materialMultipliers[material];
  return Math.round(base * multiplier);
}
```

---

## Design System

### Sculpture Preview Theme

```css
/* 3D preview area styling */
.sculpture-preview {
  background: linear-gradient(
    180deg,
    #1a1a2e 0%,
    #16213e 50%,
    #0f3460 100%
  );
}

.sculpture-preview-controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}
```

### Material Preview Colors

```typescript
const MATERIAL_PREVIEW_COLORS = {
  'pla-white': '#f5f5f5',
  'pla-black': '#1a1a1a',
  'pla-metallic': '#a0a0a0',
  'wood-fill': '#c4a77d',
  'resin-clear': 'rgba(200, 220, 255, 0.6)',
  'resin-matte': '#e8e8e8',
};
```

### Mode Toggle Icons

```tsx
// Using Lucide icons
import { Image, Box } from 'lucide-react';

// Poster mode: Image icon
// 3D Print mode: Box icon (or Cube from lucide-react)
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Mode switch usage | Track adoption | % users trying 3D mode |
| Preview interaction | >30s average | Time rotating/zooming |
| STL downloads | Track | Downloads per session |
| Order conversion | >5% | Orders / STL downloads |
| Order value | €120 average | Revenue / orders |

---

## Phase 4.6: Database & Social Integration (CRITICAL)

**Goal**: Sculptures integrated with save/library/explore ecosystem

### Database Schema Changes

```sql
-- Add product_type to maps table
ALTER TABLE maps ADD COLUMN product_type TEXT DEFAULT 'poster' CHECK (product_type IN ('poster', 'sculpture'));

-- Add sculpture_config JSONB field
ALTER TABLE maps ADD COLUMN sculpture_config JSONB;

-- Add 3D thumbnail URL (optional, for sculptures)
ALTER TABLE maps ADD COLUMN sculpture_thumbnail_url TEXT;

-- Index for filtering by product type
CREATE INDEX idx_maps_product_type ON maps(product_type);
```

### TypeScript Type Updates

```typescript
// types/database.ts - Add to maps table
maps: {
  Row: {
    // ... existing fields ...
    product_type: 'poster' | 'sculpture';
    sculpture_config: Json | null;
    sculpture_thumbnail_url: string | null;
  };
  Insert: {
    // ... existing fields ...
    product_type?: 'poster' | 'sculpture';
    sculpture_config?: Json | null;
    sculpture_thumbnail_url?: string | null;
  };
  // ... Update type ...
}

// lib/actions/maps.ts - Update SavedMap interface
export interface SavedMap {
  // ... existing fields ...
  product_type: 'poster' | 'sculpture';
  sculpture_config: SculptureConfig | null;
  sculpture_thumbnail_url: string | null;
}
```

### Implementation Tasks

- [ ] Run SQL migration to add columns
- [ ] Update `types/database.ts` with new fields
- [ ] Update `SavedMap` interface in `lib/actions/maps.ts`
- [ ] Update `saveMap()` and `updateMap()` to accept sculpture config
- [ ] Create `saveSculpture()` function or extend existing
- [ ] Update `serializeMapConfig` / `deserializeMapConfig` for sculpture data
- [ ] Generate 3D thumbnail from R3F canvas (WebGL screenshot)
- [ ] Update `MyMapsList` to show poster/sculpture badges
- [ ] Update feed to show sculptures with 3D indicator
- [ ] Handle loading saved sculpture into editor (restore 3D mode + config)

### Thumbnail Generation for Sculptures

```typescript
// lib/sculpture/thumbnailCapture.ts
export async function captureSculptureThumbnail(
  canvasRef: React.RefObject<HTMLCanvasElement>
): Promise<Blob> {
  // R3F Canvas has preserveDrawingBuffer: true
  const canvas = canvasRef.current;
  if (!canvas) throw new Error('Canvas not found');

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/png', 0.9);
  });
}
```

### Saved Maps UI Updates

```tsx
// MyMapsList.tsx - Add product type badge
<div className="relative">
  {map.product_type === 'sculpture' && (
    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
      <Box className="w-3 h-3" />
      <span>3D</span>
    </div>
  )}
  <Image src={map.product_type === 'sculpture'
    ? (map.sculpture_thumbnail_url || map.thumbnail_url)
    : map.thumbnail_url}
  />
</div>
```

### Feed/Explore Integration

```tsx
// FeedCard.tsx - Show 3D indicator
{map.product_type === 'sculpture' && (
  <div className="absolute bottom-2 left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1 rounded-full">
    🧊 3D Sculpture
  </div>
)}
```

### Loading Saved Sculpture into Editor

When user clicks "Edit" on a saved sculpture:

1. Load the map config as usual
2. Detect `product_type === 'sculpture'`
3. Set `productMode` to 'sculpture'
4. Restore `sculptureConfig` from saved data
5. Show 3D preview with saved settings

### Important UX Considerations

1. **Saved maps show both types** - Users see all their creations in one place
2. **Clear visual distinction** - 3D sculptures have emerald/teal badge
3. **Edit preserves mode** - Opening a saved sculpture goes to 3D mode
4. **Publish works the same** - Sculptures can be published to explore feed
5. **GPX requirement** - Can't create sculpture without route data
6. **Convert poster to sculpture** - If poster has GPX, offer "Make 3D" option

---

## Open Questions

1. **Self-fulfillment vs partner?** - Better margins with own printers, but higher complexity
2. **Terrain MVP?** - Should terrain be part of initial launch or Phase 4.4?
3. **Material samples?** - Should we offer material sample packs?
4. **Gift wrapping?** - Premium add-on for gift orders?
5. **Rush shipping?** - Expedited production option?

---

## Appendix: File References

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Dev context |
| `STATUS.md` | Completed features |
| `FEATURES.md` | Roadmap |
| `types/poster.ts` | Core types |
| `lib/styles/applyPalette.ts` | 3D terrain implementation |
| `lib/styles/layers/buildings3d.ts` | 3D buildings implementation |
| `components/layout/TabNavigation.tsx` | Current nav structure |
| `components/layout/PosterEditor.tsx` | Main editor layout |

---

**Author**: Claude (AI Assistant)
**Version**: 1.0.0
**Status**: Specification Draft
