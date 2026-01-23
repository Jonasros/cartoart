'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';
import { DEFAULT_COLORIZATION_CONFIG } from '@/types/sculpture';
import { getMaterialProperties } from './materials';
import { createVertexColors, calculateHeightRange } from '@/lib/sculpture/colorUtils';

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
 * Apply box blur smoothing to a 2D height array.
 * Each pass averages each cell with its neighbors for smoother terrain.
 */
function applySmoothing(heights: number[], width: number, height: number, passes: number): number[] {
  if (passes <= 0) return heights;

  let current = [...heights];
  let next = new Array(heights.length).fill(0);

  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        let sum = 0;
        let count = 0;

        // Sample 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              sum += current[ny * width + nx];
              count++;
            }
          }
        }

        next[idx] = sum / count;
      }
    }

    // Swap buffers
    [current, next] = [next, current];
  }

  return current;
}

/**
 * Create skirt geometry (vertical walls) around rectangular terrain edges.
 * This closes the gap between the terrain and the base platform.
 */
function createSkirtGeometry(
  mainPositions: THREE.BufferAttribute,
  segments: number,
  meshSize: number
): THREE.BufferGeometry {
  const gridSize = segments + 1;
  const skirtVertices: number[] = [];
  const skirtIndices: number[] = [];
  const skirtNormals: number[] = [];

  // Helper to get vertex index in the main geometry grid
  const getMainIdx = (row: number, col: number) => row * gridSize + col;

  // Helper to add a quad (2 triangles) for the skirt
  // v0, v1 are on the terrain edge, v2, v3 are at Y=0
  const addQuad = (
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    normalX: number, normalZ: number
  ) => {
    const baseIdx = skirtVertices.length / 3;

    // Top-left (terrain edge)
    skirtVertices.push(x0, y0, z0);
    // Top-right (terrain edge)
    skirtVertices.push(x1, y1, z1);
    // Bottom-right (at Y=0)
    skirtVertices.push(x1, 0, z1);
    // Bottom-left (at Y=0)
    skirtVertices.push(x0, 0, z0);

    // Normals pointing outward
    for (let i = 0; i < 4; i++) {
      skirtNormals.push(normalX, 0, normalZ);
    }

    // Two triangles for the quad (CCW winding when viewed from outside)
    skirtIndices.push(baseIdx, baseIdx + 2, baseIdx + 3);
    skirtIndices.push(baseIdx, baseIdx + 1, baseIdx + 2);
  };

  // Process all four edges
  // Top edge (Z = -meshSize/2, row = 0)
  for (let col = 0; col < segments; col++) {
    const idx0 = getMainIdx(0, col);
    const idx1 = getMainIdx(0, col + 1);
    addQuad(
      mainPositions.getX(idx0), mainPositions.getY(idx0), mainPositions.getZ(idx0),
      mainPositions.getX(idx1), mainPositions.getY(idx1), mainPositions.getZ(idx1),
      0, -1 // Normal pointing -Z
    );
  }

  // Bottom edge (Z = +meshSize/2, row = segments)
  for (let col = 0; col < segments; col++) {
    const idx0 = getMainIdx(segments, col + 1);
    const idx1 = getMainIdx(segments, col);
    addQuad(
      mainPositions.getX(idx0), mainPositions.getY(idx0), mainPositions.getZ(idx0),
      mainPositions.getX(idx1), mainPositions.getY(idx1), mainPositions.getZ(idx1),
      0, 1 // Normal pointing +Z
    );
  }

  // Left edge (X = -meshSize/2, col = 0)
  for (let row = 0; row < segments; row++) {
    const idx0 = getMainIdx(row + 1, 0);
    const idx1 = getMainIdx(row, 0);
    addQuad(
      mainPositions.getX(idx0), mainPositions.getY(idx0), mainPositions.getZ(idx0),
      mainPositions.getX(idx1), mainPositions.getY(idx1), mainPositions.getZ(idx1),
      -1, 0 // Normal pointing -X
    );
  }

  // Right edge (X = +meshSize/2, col = segments)
  for (let row = 0; row < segments; row++) {
    const idx0 = getMainIdx(row, segments);
    const idx1 = getMainIdx(row + 1, segments);
    addQuad(
      mainPositions.getX(idx0), mainPositions.getY(idx0), mainPositions.getZ(idx0),
      mainPositions.getX(idx1), mainPositions.getY(idx1), mainPositions.getZ(idx1),
      1, 0 // Normal pointing +X
    );
  }

  const skirtGeo = new THREE.BufferGeometry();
  skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(skirtVertices, 3));
  skirtGeo.setAttribute('normal', new THREE.Float32BufferAttribute(skirtNormals, 3));
  skirtGeo.setIndex(skirtIndices);

  return skirtGeo;
}

/**
 * 3D Terrain mesh with height displacement based on elevation data.
 *
 * Uses PlaneGeometry with grid subdivision for detailed terrain.
 * For circular shapes, vertices outside the radius are clipped.
 * For rectangular shapes, adds a skirt (vertical walls) to close gaps.
 * When routeStyle is 'engraved', carves a groove into the terrain along the route.
 *
 * The terrain is normalized to fit within the sculpture size and
 * elevation scale parameters from the config.
 */
export function TerrainMesh({ routeData, config, elevationGrid }: TerrainMeshProps) {
  const { geometry, skirtGeometry } = useMemo(() => {
    const {
      size, elevationScale, terrainResolution, shape, rimHeight, routeStyle, routeThickness,
      terrainHeightLimit = 0.8, routeClearance = 0.05, routeDepth = 0.04, terrainSmoothing = 1,
      routeElevationSource = 'gps'
    } = config;
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
    const maxHeight = terrainHeightLimit * heightScale; // Max terrain height

    const positions = geo.attributes.position;
    const [[minLng, minLat], [maxLng, maxLat]] = routeData.bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;

    // Determine the coordinate range for normalization
    // For circular: radius is meshSize/2, for rectangular: half-size is meshSize/2
    const coordRange = meshSize;

    // Pre-compute route points in mesh coordinates for groove carving and route clearance
    const routeMeshPoints: Array<{ x: number; z: number; y: number }> = [];
    const grooveWidth = routeStyle === 'engraved' ? (routeThickness / 100) * 2.5 : 0; // Much wider for visibility
    const grooveDepth = routeStyle === 'engraved' ? routeDepth : 0; // Use routeDepth from config

    // Circular boundary for clipping route points (stays inside rim)
    const routeClipRadius = meshSize / 2 * 0.88;

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
      // Clamp to maxHeight to match how RouteMesh positions the tube
      const y = Math.min(normalizedElev * heightScale, maxHeight);
      routeMeshPoints.push({ x, z, y });
    }

    // Calculate the grid dimensions for smoothing
    const gridWidth = segments + 1;
    const gridHeight = segments + 1;

    // First pass: compute raw heights into an array
    const rawHeights: number[] = new Array(gridWidth * gridHeight).fill(0);
    const vertexClipped: boolean[] = new Array(gridWidth * gridHeight).fill(false);

    // Route clearance settings - wider effect zone for better visibility
    const clearanceRadius = routeClearance * meshSize; // Scale clearance to mesh size

    if (elevationGrid && elevationGrid.length > 0) {
      // Use provided elevation grid
      const gridRows = elevationGrid.length;
      const gridCols = elevationGrid[0]?.length || 1;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // For circular shape, check if outside radius
        if (shape === 'circular') {
          const distFromCenter = Math.sqrt(x * x + z * z);
          if (distFromCenter > circleRadius * 0.95) {
            vertexClipped[i] = true;
            rawHeights[i] = 0;
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
        rawHeights[i] = normalizedElev * heightScale;
      }
    } else {
      // Interpolate from route points (simplified nearest-neighbor)
      const points = routeData.points;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);

        // For circular shape, check if outside radius
        if (shape === 'circular') {
          const distFromCenter = Math.sqrt(x * x + z * z);
          if (distFromCenter > circleRadius * 0.95) {
            vertexClipped[i] = true;
            rawHeights[i] = 0;
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
        rawHeights[i] = normalizedElev * heightScale;
      }
    }

    // Apply smoothing to raw heights (only for non-clipped vertices)
    let smoothedHeights = rawHeights;
    if (terrainSmoothing > 0) {
      smoothedHeights = applySmoothing(rawHeights, gridWidth, gridHeight, terrainSmoothing);
      // Preserve clipped vertices
      for (let i = 0; i < vertexClipped.length; i++) {
        if (vertexClipped[i]) {
          smoothedHeights[i] = 0;
        }
      }
    }

    // Minimum terrain height to prevent z-fighting with base platform
    // The base top surface is at Y=0, so terrain must always be slightly above
    const minTerrainHeight = 0.003; // ~0.3mm offset prevents z-fighting

    // Final pass: apply height limit, route clearance, and groove carving
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Handle clipped vertices (outside circle)
      if (vertexClipped[i]) {
        if (shape === 'circular') {
          const distFromCenter = Math.sqrt(x * x + z * z);
          const scale = (circleRadius * 0.95) / distFromCenter;
          positions.setX(i, x * scale);
          positions.setZ(i, z * scale);
        }
        positions.setY(i, minTerrainHeight); // Use minimum height instead of 0
        continue;
      }

      let y = smoothedHeights[i];

      // Apply height limit - clamp maximum terrain height
      y = Math.min(y, maxHeight);

      // Apply route clearance - ensure route is visible
      // Note: When routeElevationSource is 'terrain', the tube follows terrain surface exactly,
      // so we don't need to clear terrain for raised routes (the tube naturally sits on terrain)
      if (routeMeshPoints.length > 1 && clearanceRadius > 0) {
        const { distance, elevation: routeElev } = getDistanceToRoute(x, z, routeMeshPoints);

        if (distance < clearanceRadius) {
          if (routeStyle === 'raised' && routeElevationSource === 'gps') {
            // Only clear terrain for GPS-based elevation (when tube uses GPS coordinates)
            // Route tube parameters (must match RouteMesh.tsx)
            const tubeVerticalOffset = routeDepth; // Tube center floats above terrain (from config)
            const tubeRadius = routeThickness / 200; // Tube radius in scene units

            // Calculate the bottom of the tube with small safety margin
            const tubeBottom = routeElev + tubeVerticalOffset - tubeRadius - 0.005;

            // Hard cap: terrain must not exceed tube bottom
            // This prevents terrain from poking through the route tube
            y = Math.min(y, tubeBottom);
          } else if (routeStyle === 'engraved') {
            // For engraved: blend terrain toward route elevation near the groove
            const t = distance / clearanceRadius;
            const falloff = Math.pow(t, 0.5);
            const blendedHeight = falloff * y + (1 - falloff) * routeElev;
            y = blendedHeight;
          }
          // When routeElevationSource === 'terrain' and routeStyle === 'raised':
          // No clearance needed - tube follows terrain surface exactly with routeDepth offset
        }
      }

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

      // Ensure terrain is always above base platform to prevent z-fighting
      y = Math.max(y, minTerrainHeight);

      positions.setY(i, y);
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();

    // Apply vertex colors if colorization is enabled (preview-only feature)
    const colorization = config.colorization ?? DEFAULT_COLORIZATION_CONFIG;
    if (colorization.enabled && colorization.preset !== 'none') {
      const heightRange = calculateHeightRange(positions as THREE.BufferAttribute, vertexClipped);
      const colors = createVertexColors(
        positions as THREE.BufferAttribute,
        heightRange,
        colorization,
        vertexClipped,
        config.terrainColor
      );
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    // Create skirt geometry for rectangular shapes to close the gaps
    let skirt: THREE.BufferGeometry | null = null;
    if (shape === 'rectangular') {
      skirt = createSkirtGeometry(positions as THREE.BufferAttribute, segments, meshSize);
    }

    return { geometry: geo, skirtGeometry: skirt };
  }, [routeData, config, elevationGrid]);

  // Get material properties based on selected material
  // Textures temporarily disabled for debugging - will enable after refinement
  const materialProps = getMaterialProperties(config.material);

  // Check if colorization is enabled
  const colorization = config.colorization ?? DEFAULT_COLORIZATION_CONFIG;
  const useVertexColors = colorization.enabled && colorization.preset !== 'none';

  return (
    <group>
      {/* Main terrain surface */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshPhysicalMaterial
          // When vertex colors are active, use white base to show true colors
          color={useVertexColors ? '#ffffff' : config.terrainColor}
          vertexColors={useVertexColors}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
          clearcoat={materialProps.clearcoat ?? 0}
          clearcoatRoughness={materialProps.clearcoatRoughness ?? 0}
          envMapIntensity={materialProps.envMapIntensity ?? 0.5}
          flatShading={config.material === 'wood'}
          // Enhanced texture properties (PLA layer lines, Wood grain)
          normalMap={materialProps.normalMap}
          normalScale={materialProps.normalScale}
          roughnessMap={materialProps.roughnessMap}
          // Don't use color map when vertex colors are active
          map={useVertexColors ? undefined : materialProps.map}
          // Resin SSS properties
          transmission={materialProps.transmission ?? 0}
          thickness={materialProps.thickness ?? 0}
          ior={materialProps.ior ?? 1.5}
          sheen={materialProps.sheen ?? 0}
          sheenRoughness={materialProps.sheenRoughness ?? 0}
          sheenColor={materialProps.sheenColor}
        />
      </mesh>

      {/* Skirt (vertical walls) for rectangular shapes to close gaps */}
      {skirtGeometry && (
        <mesh geometry={skirtGeometry} receiveShadow castShadow>
          <meshPhysicalMaterial
            color={config.terrainColor}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
            clearcoat={materialProps.clearcoat ?? 0}
            clearcoatRoughness={materialProps.clearcoatRoughness ?? 0}
            envMapIntensity={materialProps.envMapIntensity ?? 0.5}
            flatShading={config.material === 'wood'}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
