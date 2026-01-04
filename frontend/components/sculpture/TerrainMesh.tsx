'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';

interface TerrainMeshProps {
  routeData: RouteData;
  config: SculptureConfig;
  /** Pre-fetched elevation grid (optional, will use route points if not provided) */
  elevationGrid?: number[][];
}

/**
 * 3D Terrain mesh with height displacement based on elevation data.
 *
 * Creates a PlaneGeometry and displaces vertices vertically based on
 * either a provided elevation grid or interpolated from route points.
 *
 * The terrain is normalized to fit within the sculpture size and
 * elevation scale parameters from the config.
 */
export function TerrainMesh({ routeData, config, elevationGrid }: TerrainMeshProps) {
  const geometry = useMemo(() => {
    const { size, elevationScale, terrainResolution } = config;
    const segments = terrainResolution;

    // Create plane geometry (horizontal, facing up)
    const geo = new THREE.PlaneGeometry(size / 10, size / 10, segments, segments);
    geo.rotateX(-Math.PI / 2); // Lay flat (Y is up)

    // Get elevation range from route stats
    const { minElevation, maxElevation } = routeData.stats;
    const elevRange = maxElevation - minElevation || 1;

    // Height scale factor (convert to Three.js units)
    const heightScale = elevationScale * (size / 100);

    const positions = geo.attributes.position;
    const [[minLng, minLat], [maxLng, maxLat]] = routeData.bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;

    if (elevationGrid && elevationGrid.length > 0) {
      // Use provided elevation grid
      const gridRows = elevationGrid.length;
      const gridCols = elevationGrid[0]?.length || 1;

      for (let i = 0; i < positions.count; i++) {
        // Get normalized position in grid (0-1)
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // Convert from mesh coordinates to grid indices
        // Mesh goes from -size/20 to size/20, we need 0 to 1
        const normalizedX = (x / (size / 10) + 0.5);
        const normalizedZ = (z / (size / 10) + 0.5);

        // Grid indices (clamped)
        const xi = Math.min(gridCols - 1, Math.max(0, Math.floor(normalizedX * gridCols)));
        const zi = Math.min(gridRows - 1, Math.max(0, Math.floor(normalizedZ * gridRows)));

        const elev = elevationGrid[zi]?.[xi] ?? minElevation;
        const normalizedElev = (elev - minElevation) / elevRange;
        positions.setY(i, normalizedElev * heightScale);
      }
    } else {
      // Interpolate from route points (simplified nearest-neighbor)
      const points = routeData.points;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // Convert from mesh coordinates to geographic coordinates
        const normalizedX = (x / (size / 10) + 0.5);
        const normalizedZ = (z / (size / 10) + 0.5);
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
        positions.setY(i, normalizedElev * heightScale);
      }
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();

    return geo;
  }, [routeData, config, elevationGrid]);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        color={config.terrainColor}
        roughness={0.85}
        metalness={0.05}
        flatShading={true}
      />
    </mesh>
  );
}
