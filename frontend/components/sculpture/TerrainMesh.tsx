'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';
import { getMaterialProperties } from './materials';

interface TerrainMeshProps {
  routeData: RouteData;
  config: SculptureConfig;
  /** Pre-fetched elevation grid (optional, will use route points if not provided) */
  elevationGrid?: number[][];
}

/**
 * Calculate the minimum distance from a point to the route path.
 * Returns the distance and the elevation at the nearest route point.
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

    // Calculate distance from point to line segment
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
      // Interpolate elevation between p1 and p2
      nearestElev = p1.y + t * (p2.y - p1.y);
    }
  }

  return { distance: minDist, elevation: nearestElev };
}

/**
 * 3D Terrain mesh with height displacement based on elevation data.
 *
 * Uses PlaneGeometry with grid subdivision for detailed terrain.
 * For circular shapes, vertices outside the radius are clipped.
 * When routeStyle is 'engraved', carves a groove into the terrain along the route.
 *
 * The terrain is normalized to fit within the sculpture size and
 * elevation scale parameters from the config.
 */
export function TerrainMesh({ routeData, config, elevationGrid }: TerrainMeshProps) {
  const geometry = useMemo(() => {
    const { size, elevationScale, terrainResolution, shape, rimHeight, routeStyle, routeThickness } = config;
    const segments = terrainResolution;

    // Account for rim when sizing terrain
    const rimWidth = shape === 'circular' ? size * 0.03 : size * 0.04;
    const effectiveSize = rimHeight > 0 ? size - rimWidth * 2 : size;
    const meshSize = effectiveSize / 10; // Convert cm to scene units

    // Create geometry - always use PlaneGeometry for proper grid subdivision
    // For circular shape, we'll clip vertices outside the radius
    const geo = new THREE.PlaneGeometry(meshSize, meshSize, segments, segments);
    geo.rotateX(-Math.PI / 2); // Lay flat (Y is up)

    // For circular shape, calculate radius for clipping
    const circleRadius = meshSize / 2;

    // Get elevation range from route stats
    const { minElevation, maxElevation } = routeData.stats;
    const elevRange = maxElevation - minElevation || 1;

    // Height scale factor (convert to Three.js units)
    const heightScale = elevationScale * (size / 100);

    const positions = geo.attributes.position;
    const [[minLng, minLat], [maxLng, maxLat]] = routeData.bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;

    // Determine the coordinate range for normalization
    // For circular: radius is meshSize/2, for rectangular: half-size is meshSize/2
    const coordRange = meshSize;

    // Pre-compute route points in mesh coordinates for groove carving
    const routeMeshPoints: Array<{ x: number; z: number; y: number }> = [];
    const grooveWidth = routeStyle === 'engraved' ? (routeThickness / 100) * 2.5 : 0; // Much wider for visibility
    const grooveDepth = routeStyle === 'engraved' ? 0.05 : 0; // Deep groove for strong shadow effect

    // Circular boundary for clipping route points (stays inside rim)
    const routeClipRadius = meshSize / 2 * 0.88;

    if (routeStyle === 'engraved') {
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
        const y = normalizedElev * heightScale;
        routeMeshPoints.push({ x, z, y });
      }
    }

    if (elevationGrid && elevationGrid.length > 0) {
      // Use provided elevation grid
      const gridRows = elevationGrid.length;
      const gridCols = elevationGrid[0]?.length || 1;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // For circular shape, clip vertices outside the radius
        if (shape === 'circular') {
          const distFromCenter = Math.sqrt(x * x + z * z);
          if (distFromCenter > circleRadius * 0.95) {
            // Collapse vertices outside circle to the edge at base level
            const scale = (circleRadius * 0.95) / distFromCenter;
            positions.setX(i, x * scale);
            positions.setZ(i, z * scale);
            positions.setY(i, 0);
            continue;
          }
        }

        // Convert from mesh coordinates to grid indices
        const normalizedX = (x / coordRange + 0.5);
        const normalizedZ = (z / coordRange + 0.5);

        // Grid indices (clamped)
        const xi = Math.min(gridCols - 1, Math.max(0, Math.floor(normalizedX * gridCols)));
        const zi = Math.min(gridRows - 1, Math.max(0, Math.floor(normalizedZ * gridRows)));

        const elev = elevationGrid[zi]?.[xi] ?? minElevation;
        const normalizedElev = (elev - minElevation) / elevRange;
        let y = normalizedElev * heightScale;

        // Carve groove if engraved style and vertex is near route
        if (routeStyle === 'engraved' && routeMeshPoints.length > 1) {
          const { distance } = getDistanceToRoute(x, z, routeMeshPoints);
          if (distance < grooveWidth / 2) {
            // Smooth groove with rounded edges
            const t = distance / (grooveWidth / 2);
            const smoothFactor = 1 - Math.cos(t * Math.PI / 2); // 0 at center, 1 at edge
            y -= grooveDepth * (1 - smoothFactor);
          }
        }

        positions.setY(i, y);
      }
    } else {
      // Interpolate from route points (simplified nearest-neighbor)
      const points = routeData.points;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // For circular shape, clip vertices outside the radius
        if (shape === 'circular') {
          const distFromCenter = Math.sqrt(x * x + z * z);
          if (distFromCenter > circleRadius * 0.95) {
            // Collapse vertices outside circle to the edge at base level
            const scale = (circleRadius * 0.95) / distFromCenter;
            positions.setX(i, x * scale);
            positions.setZ(i, z * scale);
            positions.setY(i, 0);
            continue;
          }
        }

        // Convert from mesh coordinates to geographic coordinates
        const normalizedX = (x / coordRange + 0.5);
        const normalizedZ = (z / coordRange + 0.5);
        const lng = minLng + normalizedX * lngRange;
        const lat = minLat + normalizedZ * latRange;

        // Find nearest route point
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

        // Carve groove if engraved style and vertex is near route
        if (routeStyle === 'engraved' && routeMeshPoints.length > 1) {
          const { distance } = getDistanceToRoute(x, z, routeMeshPoints);
          if (distance < grooveWidth / 2) {
            // Smooth groove with rounded edges
            const t = distance / (grooveWidth / 2);
            const smoothFactor = 1 - Math.cos(t * Math.PI / 2); // 0 at center, 1 at edge
            y -= grooveDepth * (1 - smoothFactor);
          }
        }

        positions.setY(i, y);
      }
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();

    return geo;
  }, [routeData, config, elevationGrid]);

  // Get material properties based on selected material
  const materialProps = getMaterialProperties(config.material);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshPhysicalMaterial
        color={config.terrainColor}
        roughness={materialProps.roughness}
        metalness={materialProps.metalness}
        clearcoat={materialProps.clearcoat ?? 0}
        clearcoatRoughness={materialProps.clearcoatRoughness ?? 0}
        envMapIntensity={materialProps.envMapIntensity ?? 0.5}
        flatShading={config.material === 'wood'}
      />
    </mesh>
  );
}
