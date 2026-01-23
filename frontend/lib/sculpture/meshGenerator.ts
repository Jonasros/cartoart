/**
 * Mesh Generator for 3D Sculpture Export
 *
 * Generates Three.js geometries for terrain, route, and base meshes.
 * Used for STL export - mirrors the geometry logic in the R3F components.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig, ExportQualityParams } from '@/types/sculpture';
import { EXPORT_QUALITY_PRESETS } from '@/types/sculpture';
import { simplifyToCount } from '@/lib/algorithms/douglasPeucker';

export interface GeneratedMeshes {
  terrain: THREE.BufferGeometry;
  route: THREE.BufferGeometry;
  base: THREE.BufferGeometry;
  text: THREE.BufferGeometry | null;
  combined: THREE.BufferGeometry;
}

/**
 * Generate all sculpture meshes for export
 *
 * @param routeData - GPS route data with points and bounds
 * @param config - Sculpture configuration
 * @param elevationGrid - Optional pre-fetched terrain elevation grid
 * @param qualityParams - Optional quality parameters (defaults to 'high' preset)
 */
export function generateSculptureMeshes(
  routeData: RouteData,
  config: SculptureConfig,
  elevationGrid?: number[][],
  qualityParams?: ExportQualityParams
): GeneratedMeshes {
  // Default to 'high' quality for paid exports
  const params = qualityParams ?? EXPORT_QUALITY_PRESETS.high.params;

  const terrainGeo = generateTerrainGeometry(routeData, config, elevationGrid, params);
  const routeGeo = generateRouteGeometry(routeData, config, params);
  const baseGeo = generateBaseGeometry(config);
  const textGeo = generateTextGeometry(config, params);

  // Build list of geometries to merge
  const geometriesToMerge: THREE.BufferGeometry[] = [];

  // Always include terrain and base
  geometriesToMerge.push(terrainGeo, baseGeo);

  // Include route tube only for raised style
  if (config.routeStyle !== 'engraved') {
    geometriesToMerge.push(routeGeo);
  }

  // Include text geometry if generated
  if (textGeo) {
    geometriesToMerge.push(textGeo);
  }

  const combined = mergeGeometries(geometriesToMerge, false);

  if (!combined) {
    throw new Error('Failed to merge geometries');
  }

  return {
    terrain: terrainGeo,
    route: routeGeo,
    base: baseGeo,
    text: textGeo,
    combined,
  };
}

/**
 * Calculate the minimum distance from a point to the route path.
 * Used for groove carving in engraved style.
 */
function getDistanceToRoute(
  x: number,
  z: number,
  routePoints: Array<{ x: number; z: number; y: number }>
): { distance: number; elevation: number } {
  let minDist = Infinity;
  let nearestElev = 0;

  for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i + 1];

    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const lenSq = dx * dx + dz * dz;

    let t = 0;
    if (lenSq > 0) {
      t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (z - p1.z) * dz) / lenSq));
    }

    const projX = p1.x + t * dx;
    const projZ = p1.z + t * dz;
    const dist = Math.sqrt((x - projX) ** 2 + (z - projZ) ** 2);

    if (dist < minDist) {
      minDist = dist;
      nearestElev = p1.y + t * (p2.y - p1.y);
    }
  }

  return { distance: minDist, elevation: nearestElev };
}

/**
 * Apply Gaussian smoothing to a 2D height grid
 * Multi-pass smoothing for print-quality terrain surfaces
 */
function applyGaussianSmoothing(
  heightGrid: number[][],
  passes: number
): number[][] {
  if (passes <= 0) return heightGrid;

  const rows = heightGrid.length;
  const cols = heightGrid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return heightGrid;

  let result = heightGrid.map(row => [...row]);

  // Gaussian kernel (3x3, sigma ≈ 0.85)
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];
  const kernelSum = 16;

  for (let pass = 0; pass < passes; pass++) {
    const next = result.map(row => [...row]);

    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += result[y + ky][x + kx] * kernel[ky + 1][kx + 1];
          }
        }
        next[y][x] = sum / kernelSum;
      }
    }

    result = next;
  }

  return result;
}

/**
 * Generate terrain mesh geometry
 * Mirrors the logic in TerrainMesh.tsx
 *
 * @param routeData - GPS route data
 * @param config - Sculpture configuration
 * @param elevationGrid - Optional pre-fetched terrain data
 * @param qualityParams - Quality parameters for mesh resolution
 */
function generateTerrainGeometry(
  routeData: RouteData,
  config: SculptureConfig,
  elevationGrid?: number[][],
  qualityParams?: ExportQualityParams
): THREE.BufferGeometry {
  const {
    size, elevationScale, shape, rimHeight, routeStyle, routeThickness,
    terrainHeightLimit = 0.8, routeClearance = 0.05, routeDepth = 0.04
  } = config;
  // Use quality params for resolution, fall back to config
  const segments = qualityParams?.terrainResolution ?? config.terrainResolution;
  const smoothingPasses = qualityParams?.smoothingPasses ?? config.terrainSmoothing;

  // Account for rim when sizing terrain
  const rimWidth = shape === 'circular' ? size * 0.03 : size * 0.04;
  const effectiveSize = rimHeight > 0 ? size - rimWidth * 2 : size;
  const meshSize = effectiveSize / 10; // Convert cm to scene units

  const geo = new THREE.PlaneGeometry(meshSize, meshSize, segments, segments);
  geo.rotateX(-Math.PI / 2); // Lay flat

  const circleRadius = meshSize / 2;
  const { minElevation, maxElevation } = routeData.stats;
  const elevRange = maxElevation - minElevation || 1;
  const heightScale = elevationScale * (size / 100);

  const positions = geo.attributes.position;
  const [[minLng, minLat], [maxLng, maxLat]] = routeData.bounds;
  const lngRange = maxLng - minLng || 0.001;
  const latRange = maxLat - minLat || 0.001;
  const coordRange = meshSize;

  // Pre-compute route points in mesh coordinates for groove carving and route clearance
  const routeMeshPoints: Array<{ x: number; z: number; y: number }> = [];
  const grooveWidth = routeStyle === 'engraved' ? (routeThickness / 100) * 2.5 : 0;
  const grooveDepth = routeStyle === 'engraved' ? routeDepth : 0; // Use config value
  const routeClipRadius = meshSize / 2 * 0.88;

  // Route clearance and terrain height limits (match TerrainMesh.tsx preview)
  const clearanceRadius = routeClearance * meshSize; // Scale clearance to mesh size
  const maxHeight = terrainHeightLimit * heightScale; // Max terrain height
  const minTerrainHeight = 0.003; // ~0.3mm offset prevents z-fighting with base

  // Always compute route mesh points (needed for both engraved groove and raised clearance)
  for (const point of routeData.points) {
    const normalizedX = (point.lng - minLng) / lngRange;
    const normalizedZ = (point.lat - minLat) / latRange;
    let x = (normalizedX - 0.5) * meshSize;
    let z = (normalizedZ - 0.5) * meshSize;

    // For circular shape, clamp route points to stay within the circle
    if (shape === 'circular') {
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > routeClipRadius) {
        const scale = routeClipRadius / distFromCenter;
        x *= scale;
        z *= scale;
      }
    }

    const elev = point.elevation ?? minElevation;
    const normalizedElev = (elev - minElevation) / elevRange;
    // Clamp to maxHeight to match how tube is positioned
    const y = Math.min(normalizedElev * heightScale, maxHeight);
    routeMeshPoints.push({ x, z, y });
  }

  if (elevationGrid && elevationGrid.length > 0) {
    // Apply Gaussian smoothing to elevation grid for smoother terrain surfaces
    const smoothedGrid = applyGaussianSmoothing(elevationGrid, smoothingPasses);
    const gridRows = smoothedGrid.length;
    const gridCols = smoothedGrid[0]?.length || 1;

    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i);
      let z = positions.getZ(i);

      if (shape === 'circular') {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > circleRadius * 0.95) {
          const scale = (circleRadius * 0.95) / distFromCenter;
          positions.setX(i, x * scale);
          positions.setZ(i, z * scale);
          positions.setY(i, 0);
          continue;
        }
      }

      const normalizedX = (x / coordRange + 0.5);
      const normalizedZ = (z / coordRange + 0.5);
      const xi = Math.min(gridCols - 1, Math.max(0, Math.floor(normalizedX * gridCols)));
      const zi = Math.min(gridRows - 1, Math.max(0, Math.floor(normalizedZ * gridRows)));
      const elev = smoothedGrid[zi]?.[xi] ?? minElevation;
      const normalizedElev = (elev - minElevation) / elevRange;
      let y = normalizedElev * heightScale;

      // Apply height limit - clamp maximum terrain height (match preview)
      y = Math.min(y, maxHeight);

      // Apply route clearance - ensure route is visible (match preview)
      if (routeMeshPoints.length > 1 && clearanceRadius > 0) {
        const { distance, elevation: routeElev } = getDistanceToRoute(x, z, routeMeshPoints);

        if (distance < clearanceRadius) {
          if (routeStyle === 'raised') {
            // Route tube parameters (must match RouteMesh.tsx)
            const tubeVerticalOffset = routeDepth; // Tube center floats above terrain (from config)
            const tubeRadius = routeThickness / 200; // Tube radius in scene units

            // Calculate the bottom of the tube with small safety margin
            const tubeBottom = routeElev + tubeVerticalOffset - tubeRadius - 0.005;

            // Hard cap: terrain must not exceed tube bottom
            y = Math.min(y, tubeBottom);
          } else {
            // For engraved: blend terrain toward route elevation near the groove
            const t = distance / clearanceRadius;
            const falloff = Math.pow(t, 0.5);
            const blendedHeight = falloff * y + (1 - falloff) * routeElev;
            y = blendedHeight;
          }
        }
      }

      // Carve groove if engraved style and vertex is near route
      if (routeStyle === 'engraved' && routeMeshPoints.length > 1) {
        const { distance } = getDistanceToRoute(x, z, routeMeshPoints);
        if (distance < grooveWidth / 2) {
          const t = distance / (grooveWidth / 2);
          const smoothFactor = 1 - Math.cos(t * Math.PI / 2);
          y -= grooveDepth * (1 - smoothFactor);
        }
      }

      // Ensure terrain is always above base platform (match preview)
      y = Math.max(y, minTerrainHeight);

      positions.setY(i, y);
    }
  } else {
    // Interpolate from route points
    const points = routeData.points;

    for (let i = 0; i < positions.count; i++) {
      let x = positions.getX(i);
      let z = positions.getZ(i);

      if (shape === 'circular') {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > circleRadius * 0.95) {
          const scale = (circleRadius * 0.95) / distFromCenter;
          positions.setX(i, x * scale);
          positions.setZ(i, z * scale);
          positions.setY(i, 0);
          continue;
        }
      }

      const normalizedX = (x / coordRange + 0.5);
      const normalizedZ = (z / coordRange + 0.5);
      const lng = minLng + normalizedX * lngRange;
      const lat = minLat + normalizedZ * latRange;

      let nearestElev = minElevation;
      let minDist = Infinity;

      for (const p of points) {
        if (p.elevation === undefined) continue;
        const dist = Math.sqrt((p.lng - lng) ** 2 + (p.lat - lat) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearestElev = p.elevation;
        }
      }

      const normalizedElev = (nearestElev - minElevation) / elevRange;
      let y = normalizedElev * heightScale;

      // Apply height limit - clamp maximum terrain height (match preview)
      y = Math.min(y, maxHeight);

      // Apply route clearance - ensure route is visible (match preview)
      if (routeMeshPoints.length > 1 && clearanceRadius > 0) {
        const { distance, elevation: routeElev } = getDistanceToRoute(x, z, routeMeshPoints);

        if (distance < clearanceRadius) {
          if (routeStyle === 'raised') {
            // Route tube parameters (must match RouteMesh.tsx)
            const tubeVerticalOffset = routeDepth; // Tube center floats above terrain (from config)
            const tubeRadius = routeThickness / 200; // Tube radius in scene units

            // Calculate the bottom of the tube with small safety margin
            const tubeBottom = routeElev + tubeVerticalOffset - tubeRadius - 0.005;

            // Hard cap: terrain must not exceed tube bottom
            y = Math.min(y, tubeBottom);
          } else {
            // For engraved: blend terrain toward route elevation near the groove
            const t = distance / clearanceRadius;
            const falloff = Math.pow(t, 0.5);
            const blendedHeight = falloff * y + (1 - falloff) * routeElev;
            y = blendedHeight;
          }
        }
      }

      // Carve groove if engraved style and vertex is near route
      if (routeStyle === 'engraved' && routeMeshPoints.length > 1) {
        const { distance } = getDistanceToRoute(x, z, routeMeshPoints);
        if (distance < grooveWidth / 2) {
          const t = distance / (grooveWidth / 2);
          const smoothFactor = 1 - Math.cos(t * Math.PI / 2);
          y -= grooveDepth * (1 - smoothFactor);
        }
      }

      // Ensure terrain is always above base platform (match preview)
      y = Math.max(y, minTerrainHeight);

      positions.setY(i, y);
    }
  }

  positions.needsUpdate = true;
  geo.computeVertexNormals();

  return geo;
}

/**
 * Generate route tube geometry
 * Mirrors the logic in RouteMesh.tsx
 *
 * Uses GPS elevation from route points to position the tube.
 * This matches how terrain clearance is calculated, ensuring the tube
 * sits exactly on the cleared terrain surface.
 *
 * @param routeData - GPS route data
 * @param config - Sculpture configuration
 * @param qualityParams - Quality parameters for mesh resolution
 */
function generateRouteGeometry(
  routeData: RouteData,
  config: SculptureConfig,
  qualityParams?: ExportQualityParams
): THREE.BufferGeometry {
  const { points, stats, bounds } = routeData;
  const { size, routeThickness, elevationScale, shape, terrainHeightLimit = 0.8, routeDepth = 0.04 } = config;

  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  const lngRange = maxLng - minLng || 0.001;
  const latRange = maxLat - minLat || 0.001;
  const elevRange = stats.maxElevation - stats.minElevation || 1;
  const heightScale = elevationScale * (size / 100);
  const maxHeight = terrainHeightLimit * heightScale;
  const meshSize = size / 10;
  const circleRadius = meshSize / 2 * 0.92;

  // Tube radius - position tube so bottom touches terrain
  const tubeRadius = routeThickness / 200;

  // Use Douglas-Peucker for adaptive point simplification (preserves shape better than step-based)
  const maxPoints = qualityParams?.maxRoutePoints ?? 750;
  let processedPoints = points;
  if (points.length > maxPoints) {
    // Use Douglas-Peucker algorithm for shape-preserving simplification
    processedPoints = simplifyToCount(points, maxPoints);
  }

  // Convert to 3D vectors
  // IMPORTANT: Use GPS elevation from route points, NOT terrain grid sampling.
  // This matches how generateTerrainGeometry calculates route clearance.
  // The terrain is cleared around the route based on GPS elevation, so the tube must
  // also be positioned based on GPS elevation for them to align perfectly.
  const curve3Points: THREE.Vector3[] = [];

  for (const point of processedPoints) {
    const normalizedX = (point.lng - minLng) / lngRange;
    const normalizedZ = (point.lat - minLat) / latRange;

    let x = (normalizedX - 0.5) * meshSize;
    let z = (normalizedZ - 0.5) * meshSize;

    // Circular clipping
    if (shape === 'circular') {
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > circleRadius) {
        const scale = circleRadius / distFromCenter;
        x *= scale;
        z *= scale;
      }
    }

    // Use GPS elevation from the route point
    // This matches generateTerrainGeometry's route clearance calculation which uses:
    //   routeElev = (point.elevation - minElevation) / elevRange * heightScale
    const elevation = point.elevation ?? stats.minElevation;
    const normalizedElev = (elevation - stats.minElevation) / elevRange;
    let routeHeight = normalizedElev * heightScale;

    // Apply height limit (same as terrain does)
    routeHeight = Math.min(routeHeight, maxHeight);

    // Position tube center at routeDepth above terrain surface
    // Terrain clears to: tubeBottom = routeElev + routeDepth - tubeRadius - 0.005
    // So tube center must be at: routeElev + routeDepth
    // This creates a 0.005 unit gap between terrain max and tube bottom (the safety margin)
    const y = routeHeight + routeDepth;

    curve3Points.push(new THREE.Vector3(x, y, z));
  }

  if (curve3Points.length < 2) {
    return new THREE.BufferGeometry();
  }

  const curve = new THREE.CatmullRomCurve3(curve3Points, false, 'catmullrom', 0.5);
  const curveLength = curve.getLength();
  const tubularSegments = Math.max(64, Math.min(500, Math.floor(curveLength * 50)));

  // Use quality param for radial segments (8=octagonal, 24+=smooth cylinder)
  const radialSegments = qualityParams?.routeRadialSegments ?? 24;

  return new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, false);
}

/**
 * Generate base platform geometry
 * Mirrors the logic in CircularBase.tsx and RectangularBase.tsx
 */
function generateBaseGeometry(config: SculptureConfig): THREE.BufferGeometry {
  const { size, baseHeight, rimHeight, shape } = config;
  const sceneSize = size / 10;
  const baseThickness = baseHeight / 100;
  const rimThickness = rimHeight / 100;

  if (shape === 'circular') {
    return generateCircularBaseGeometry(sceneSize, baseThickness, rimThickness);
  }
  return generateRectangularBaseGeometry(sceneSize, baseThickness, rimThickness);
}

function generateCircularBaseGeometry(
  sceneSize: number,
  baseThickness: number,
  rimThickness: number
): THREE.BufferGeometry {
  const radius = sceneSize / 2;
  const rimWidth = sceneSize * 0.03;

  const geometries: THREE.BufferGeometry[] = [];

  // Main base cylinder
  const baseCylinder = new THREE.CylinderGeometry(radius, radius, baseThickness, 64);
  baseCylinder.translate(0, -baseThickness / 2, 0);
  geometries.push(baseCylinder);

  // Outer rim (torus ring)
  if (rimThickness > 0) {
    const torusGeo = new THREE.TorusGeometry(radius - rimWidth / 2, rimWidth / 2, 16, 64);
    torusGeo.rotateX(Math.PI / 2);
    torusGeo.translate(0, rimThickness / 2, 0);
    geometries.push(torusGeo);

    // Inner ring surface
    const ringGeo = new THREE.RingGeometry(radius - rimWidth, radius, 64);
    ringGeo.rotateX(-Math.PI / 2);
    ringGeo.translate(0, 0.001, 0);
    geometries.push(ringGeo);
  }

  const merged = mergeGeometries(geometries, false);
  return merged || new THREE.BufferGeometry();
}

function generateRectangularBaseGeometry(
  sceneSize: number,
  baseThickness: number,
  rimThickness: number
): THREE.BufferGeometry {
  const rimWidth = sceneSize * 0.04;
  const geometries: THREE.BufferGeometry[] = [];

  // Main base box
  const baseBox = new THREE.BoxGeometry(sceneSize, baseThickness, sceneSize);
  baseBox.translate(0, -baseThickness / 2, 0);
  geometries.push(baseBox);

  // Frame border segments
  if (rimThickness > 0) {
    const halfSize = sceneSize / 2;

    // Top edge
    const topEdge = new THREE.BoxGeometry(sceneSize, rimThickness, rimWidth);
    topEdge.translate(0, rimThickness / 2, -halfSize + rimWidth / 2);
    geometries.push(topEdge);

    // Bottom edge
    const bottomEdge = new THREE.BoxGeometry(sceneSize, rimThickness, rimWidth);
    bottomEdge.translate(0, rimThickness / 2, halfSize - rimWidth / 2);
    geometries.push(bottomEdge);

    // Left edge
    const leftEdge = new THREE.BoxGeometry(rimWidth, rimThickness, sceneSize - rimWidth * 2);
    leftEdge.translate(-halfSize + rimWidth / 2, rimThickness / 2, 0);
    geometries.push(leftEdge);

    // Right edge
    const rightEdge = new THREE.BoxGeometry(rimWidth, rimThickness, sceneSize - rimWidth * 2);
    rightEdge.translate(halfSize - rimWidth / 2, rimThickness / 2, 0);
    geometries.push(rightEdge);
  }

  const merged = mergeGeometries(geometries, false);
  return merged || new THREE.BufferGeometry();
}

/**
 * Generate engraved text geometry using canvas-based displacement
 * Creates a plaque on the FRONT VERTICAL FACE of the base with text engraved into it
 * Matches the positioning in TextMesh.tsx preview component
 *
 * @param config - Sculpture configuration
 * @param qualityParams - Quality parameters for text resolution
 */
function generateTextGeometry(
  config: SculptureConfig,
  qualityParams?: ExportQualityParams
): THREE.BufferGeometry | null {
  const { text, size, shape, baseHeight } = config;

  // Skip if text is disabled or no text content
  if (!text.enabled || (!text.title && !text.subtitle)) {
    console.log('[TextGeometry] Skipping - text disabled or no content');
    return null;
  }

  // Skip on server-side (no document available)
  if (typeof document === 'undefined') {
    console.log('[TextGeometry] Skipping - server-side render');
    return null;
  }

  // Get quality-adjusted parameters
  const textCanvasResolution = qualityParams?.textCanvasResolution ?? 2048;
  const textGridSegments = qualityParams?.textGridSegments ?? [1024, 512];
  const textDepthMm = qualityParams?.textDepth ?? 1.2;

  console.log('[TextGeometry] Generating text plaque for:', {
    title: text.title,
    subtitle: text.subtitle,
    shape,
    depth: textDepthMm,
    canvasResolution: textCanvasResolution,
    gridSegments: textGridSegments
  });

  const sceneSize = size / 10;
  const baseThickness = baseHeight / 100;
  // Use quality param depth, with minimum for visibility
  const textDepth = Math.max(textDepthMm / 100, 0.012); // Minimum 1.2mm depth for better visibility
  const radius = sceneSize / 2;

  // Plaque dimensions on the FRONT VERTICAL FACE
  // Width scales with sculpture size
  let plaqueWidth: number;
  let plaqueHeight: number; // Height on the vertical face (Y direction)

  if (shape === 'circular') {
    // Small nameplate for circular sculptures - about 10% of current size
    plaqueWidth = sceneSize * 0.08; // ~8% of diameter (small nameplate)
    plaqueHeight = baseThickness * 0.5; // 50% of base thickness
  } else {
    plaqueWidth = sceneSize * 0.7; // 70% of width
    plaqueHeight = baseThickness * 0.7; // 70% of base thickness
  }

  // Position: center of front face
  // The base is at Y = -baseThickness/2 to Y = 0
  // Front face is at Z = radius (for rectangular) or on the circle edge
  const plaqueY = -baseThickness / 2; // Center of base thickness
  const plaqueZ = radius + textDepth / 2; // Just in front of the base edge

  console.log('[TextGeometry] Plaque dimensions:', {
    plaqueWidth,
    plaqueHeight,
    plaqueY,
    plaqueZ,
    textDepth,
    baseThickness
  });

  // Canvas for text rendering - use quality param for resolution
  // Low resolution causes "morse code" appearance - need 1024+ for quality
  const aspectRatio = plaqueWidth / plaqueHeight;
  const canvasHeight = textCanvasResolution; // Quality-adjusted resolution
  const canvasWidth = Math.round(canvasHeight * aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    console.log('[TextGeometry] Failed to get canvas context');
    return null;
  }

  // Enable high-quality text rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Clear canvas (white = raised surface, black = engraved)
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw text in black (will be engraved)
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (text.title && text.subtitle) {
    const titleFontSize = Math.floor(canvasHeight * 0.38);
    ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
    ctx.fillText(text.title.toUpperCase(), canvasWidth / 2, canvasHeight * 0.35, canvasWidth * 0.9);

    const subtitleFontSize = Math.floor(canvasHeight * 0.22);
    ctx.font = `${subtitleFontSize}px Arial, sans-serif`;
    ctx.fillText(text.subtitle, canvasWidth / 2, canvasHeight * 0.68, canvasWidth * 0.9);
  } else if (text.title) {
    const titleFontSize = Math.floor(canvasHeight * 0.45);
    ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
    ctx.fillText(text.title.toUpperCase(), canvasWidth / 2, canvasHeight * 0.5, canvasWidth * 0.9);
  } else if (text.subtitle) {
    const subtitleFontSize = Math.floor(canvasHeight * 0.35);
    ctx.font = `${subtitleFontSize}px Arial, sans-serif`;
    ctx.fillText(text.subtitle, canvasWidth / 2, canvasHeight * 0.5, canvasWidth * 0.9);
  }

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imageData.data;

  // Subdivisions for the plaque surface - use quality params for grid resolution
  // Higher segments = better text detail but more triangles
  const segmentsX = Math.min(canvasWidth, textGridSegments[0]);
  const segmentsY = Math.min(canvasHeight, textGridSegments[1]);

  // Build the plaque geometry - a box with engraved front face
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Generate grid of Z depths based on text (engraving into front face)
  // Z axis is depth: higher Z = further from base, lower Z = engraved into plaque
  const depths: number[][] = [];
  for (let iy = 0; iy <= segmentsY; iy++) {
    depths[iy] = [];
    for (let ix = 0; ix <= segmentsX; ix++) {
      const u = ix / segmentsX;
      const v = iy / segmentsY;

      // Map to canvas pixel
      const canvasX = Math.floor(u * (canvasWidth - 1));
      const canvasY = Math.floor((1 - v) * (canvasHeight - 1)); // Flip Y for canvas

      const pixelIndex = (canvasY * canvasWidth + canvasX) * 4;
      const pixelValue = pixels[pixelIndex] ?? 255;
      const normalizedValue = pixelValue / 255; // 0 = black (text), 1 = white (no text)

      // Calculate Z depth: full depth for surface, reduced (engraved) where text is
      const engraveAmount = textDepth * (1 - normalizedValue);
      depths[iy][ix] = textDepth - engraveAmount;
    }
  }

  // === FRONT FACE (engraved text surface) ===
  // This face points toward +Z (facing outward from sculpture)
  const frontStartIndex = 0;
  for (let iy = 0; iy <= segmentsY; iy++) {
    for (let ix = 0; ix <= segmentsX; ix++) {
      const u = ix / segmentsX;
      const v = iy / segmentsY;

      const x = (u - 0.5) * plaqueWidth;
      const y = (v - 0.5) * plaqueHeight + plaqueY;
      const z = plaqueZ + depths[iy][ix]; // Engraved areas have smaller Z

      vertices.push(x, y, z);
      uvs.push(u, v);
    }
  }

  // Front face triangles (facing +Z)
  for (let iy = 0; iy < segmentsY; iy++) {
    for (let ix = 0; ix < segmentsX; ix++) {
      const a = frontStartIndex + iy * (segmentsX + 1) + ix;
      const b = frontStartIndex + iy * (segmentsX + 1) + (ix + 1);
      const c = frontStartIndex + (iy + 1) * (segmentsX + 1) + ix;
      const d = frontStartIndex + (iy + 1) * (segmentsX + 1) + (ix + 1);

      // Counter-clockwise winding for front face (normal points +Z)
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // === BACK FACE (flat, attaches to base) ===
  const backStartIndex = vertices.length / 3;
  for (let iy = 0; iy <= segmentsY; iy++) {
    for (let ix = 0; ix <= segmentsX; ix++) {
      const u = ix / segmentsX;
      const v = iy / segmentsY;

      const x = (u - 0.5) * plaqueWidth;
      const y = (v - 0.5) * plaqueHeight + plaqueY;
      const z = plaqueZ; // Flat back at base edge

      vertices.push(x, y, z);
      uvs.push(u, v);
    }
  }

  // Back face triangles (facing -Z, reversed winding)
  for (let iy = 0; iy < segmentsY; iy++) {
    for (let ix = 0; ix < segmentsX; ix++) {
      const a = backStartIndex + iy * (segmentsX + 1) + ix;
      const b = backStartIndex + iy * (segmentsX + 1) + (ix + 1);
      const c = backStartIndex + (iy + 1) * (segmentsX + 1) + ix;
      const d = backStartIndex + (iy + 1) * (segmentsX + 1) + (ix + 1);

      // Clockwise winding for back face (normal points -Z)
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // === SIDE FACES (4 edges connecting front to back) ===

  // TOP edge (y = plaqueY + plaqueHeight/2)
  const topStartIndex = vertices.length / 3;
  for (let ix = 0; ix <= segmentsX; ix++) {
    const u = ix / segmentsX;
    const x = (u - 0.5) * plaqueWidth;
    const y = plaqueY + plaqueHeight / 2;

    // Front vertex
    vertices.push(x, y, plaqueZ + depths[segmentsY][ix]);
    uvs.push(u, 1);
    // Back vertex
    vertices.push(x, y, plaqueZ);
    uvs.push(u, 0);
  }

  // Top edge triangles
  for (let ix = 0; ix < segmentsX; ix++) {
    const base = topStartIndex + ix * 2;
    // Facing +Y
    indices.push(base, base + 2, base + 1);
    indices.push(base + 1, base + 2, base + 3);
  }

  // BOTTOM edge (y = plaqueY - plaqueHeight/2)
  const bottomStartIndex = vertices.length / 3;
  for (let ix = 0; ix <= segmentsX; ix++) {
    const u = ix / segmentsX;
    const x = (u - 0.5) * plaqueWidth;
    const y = plaqueY - plaqueHeight / 2;

    // Front vertex
    vertices.push(x, y, plaqueZ + depths[0][ix]);
    uvs.push(u, 1);
    // Back vertex
    vertices.push(x, y, plaqueZ);
    uvs.push(u, 0);
  }

  // Bottom edge triangles (facing -Y, reversed)
  for (let ix = 0; ix < segmentsX; ix++) {
    const base = bottomStartIndex + ix * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }

  // LEFT edge (x = -plaqueWidth/2)
  const leftStartIndex = vertices.length / 3;
  for (let iy = 0; iy <= segmentsY; iy++) {
    const v = iy / segmentsY;
    const y = (v - 0.5) * plaqueHeight + plaqueY;
    const x = -plaqueWidth / 2;

    // Front vertex
    vertices.push(x, y, plaqueZ + depths[iy][0]);
    uvs.push(1, v);
    // Back vertex
    vertices.push(x, y, plaqueZ);
    uvs.push(0, v);
  }

  // Left edge triangles (facing -X)
  for (let iy = 0; iy < segmentsY; iy++) {
    const base = leftStartIndex + iy * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }

  // RIGHT edge (x = plaqueWidth/2)
  const rightStartIndex = vertices.length / 3;
  for (let iy = 0; iy <= segmentsY; iy++) {
    const v = iy / segmentsY;
    const y = (v - 0.5) * plaqueHeight + plaqueY;
    const x = plaqueWidth / 2;

    // Front vertex
    vertices.push(x, y, plaqueZ + depths[iy][segmentsX]);
    uvs.push(0, v);
    // Back vertex
    vertices.push(x, y, plaqueZ);
    uvs.push(1, v);
  }

  // Right edge triangles (facing +X, reversed)
  for (let iy = 0; iy < segmentsY; iy++) {
    const base = rightStartIndex + iy * 2;
    indices.push(base, base + 2, base + 1);
    indices.push(base + 1, base + 2, base + 3);
  }

  // Create buffer geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  console.log('[TextGeometry] Created geometry with', vertices.length / 3, 'vertices and', indices.length / 3, 'triangles');

  return geometry;
}
