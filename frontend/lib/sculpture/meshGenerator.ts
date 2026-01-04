/**
 * Mesh Generator for 3D Sculpture Export
 *
 * Generates Three.js geometries for terrain, route, and base meshes.
 * Used for STL export - mirrors the geometry logic in the R3F components.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';

export interface GeneratedMeshes {
  terrain: THREE.BufferGeometry;
  route: THREE.BufferGeometry;
  base: THREE.BufferGeometry;
  combined: THREE.BufferGeometry;
}

/**
 * Generate all sculpture meshes for export
 */
export function generateSculptureMeshes(
  routeData: RouteData,
  config: SculptureConfig,
  elevationGrid?: number[][]
): GeneratedMeshes {
  const terrainGeo = generateTerrainGeometry(routeData, config, elevationGrid);
  const routeGeo = generateRouteGeometry(routeData, config);
  const baseGeo = generateBaseGeometry(config);

  // Combine all geometries into one mesh for export
  const combined = mergeGeometries([terrainGeo, routeGeo, baseGeo], false);

  if (!combined) {
    throw new Error('Failed to merge geometries');
  }

  return {
    terrain: terrainGeo,
    route: routeGeo,
    base: baseGeo,
    combined,
  };
}

/**
 * Generate terrain mesh geometry
 * Mirrors the logic in TerrainMesh.tsx
 */
function generateTerrainGeometry(
  routeData: RouteData,
  config: SculptureConfig,
  elevationGrid?: number[][]
): THREE.BufferGeometry {
  const { size, elevationScale, terrainResolution, shape, rimHeight } = config;
  const segments = terrainResolution;

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

  if (elevationGrid && elevationGrid.length > 0) {
    const gridRows = elevationGrid.length;
    const gridCols = elevationGrid[0]?.length || 1;

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
      const elev = elevationGrid[zi]?.[xi] ?? minElevation;
      const normalizedElev = (elev - minElevation) / elevRange;
      positions.setY(i, normalizedElev * heightScale);
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
      positions.setY(i, normalizedElev * heightScale);
    }
  }

  positions.needsUpdate = true;
  geo.computeVertexNormals();

  return geo;
}

/**
 * Generate route tube geometry
 * Mirrors the logic in RouteMesh.tsx
 */
function generateRouteGeometry(
  routeData: RouteData,
  config: SculptureConfig
): THREE.BufferGeometry {
  const { points, stats, bounds } = routeData;
  const { size, routeThickness, elevationScale, shape } = config;

  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  const lngRange = maxLng - minLng || 0.001;
  const latRange = maxLat - minLat || 0.001;
  const elevRange = stats.maxElevation - stats.minElevation || 1;
  const heightScale = elevationScale * (size / 100);
  const tubeOffset = 0.02;
  const meshSize = size / 10;
  const circleRadius = meshSize / 2 * 0.92;

  // Simplify points if needed
  const maxPoints = 500;
  let processedPoints = points;
  if (points.length > maxPoints) {
    const step = Math.ceil(points.length / maxPoints);
    processedPoints = points.filter((_, i) => i % step === 0);
    if (processedPoints[processedPoints.length - 1] !== points[points.length - 1]) {
      processedPoints.push(points[points.length - 1]);
    }
  }

  // Convert to 3D vectors
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

    const elevation = point.elevation ?? stats.minElevation;
    const normalizedElev = (elevation - stats.minElevation) / elevRange;
    const y = normalizedElev * heightScale + tubeOffset;

    curve3Points.push(new THREE.Vector3(x, y, z));
  }

  if (curve3Points.length < 2) {
    return new THREE.BufferGeometry();
  }

  const curve = new THREE.CatmullRomCurve3(curve3Points, false, 'catmullrom', 0.5);
  const curveLength = curve.getLength();
  const tubularSegments = Math.max(64, Math.min(500, Math.floor(curveLength * 50)));
  const radius = routeThickness / 200;

  return new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
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
