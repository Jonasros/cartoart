'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';
import { getRouteMaterialProperties, getMaterialProperties } from './materials';

interface RouteMeshProps {
  routeData: RouteData;
  config: SculptureConfig;
}

/**
 * Create a flat ribbon geometry that follows a curve on the terrain surface.
 * Used for engraved/embedded route style.
 */
function createRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  width: number,
  segments: number
): THREE.BufferGeometry {
  const points = curve.getPoints(segments);
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    // Calculate direction for this segment
    let direction: THREE.Vector3;
    if (i === 0) {
      direction = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
    } else if (i === points.length - 1) {
      direction = new THREE.Vector3().subVectors(points[i], points[i - 1]).normalize();
    } else {
      direction = new THREE.Vector3().subVectors(points[i + 1], points[i - 1]).normalize();
    }

    // Calculate perpendicular vector (cross with up vector)
    const up = new THREE.Vector3(0, 1, 0);
    const perpendicular = new THREE.Vector3().crossVectors(direction, up).normalize();

    // Create left and right vertices
    const halfWidth = width / 2;
    const leftVertex = new THREE.Vector3().copy(point).add(perpendicular.clone().multiplyScalar(-halfWidth));
    const rightVertex = new THREE.Vector3().copy(point).add(perpendicular.clone().multiplyScalar(halfWidth));

    vertices.push(leftVertex.x, leftVertex.y, leftVertex.z);
    vertices.push(rightVertex.x, rightVertex.y, rightVertex.z);

    // Normals pointing up
    normals.push(0, 1, 0);
    normals.push(0, 1, 0);

    // UVs
    const t = i / (points.length - 1);
    uvs.push(0, t);
    uvs.push(1, t);
  }

  // Create faces (two triangles per segment)
  for (let i = 0; i < points.length - 1; i++) {
    const baseIndex = i * 2;
    // Triangle 1
    indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
    // Triangle 2
    indices.push(baseIndex + 1, baseIndex + 2, baseIndex + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

/**
 * 3D Route mesh that follows the GPS trail path.
 *
 * Supports two styles:
 * - 'raised': Floating tube above terrain (traditional 3D look)
 * - 'engraved': Flat ribbon embedded in terrain surface (carved look)
 *
 * The route is normalized to fit within the sculpture size and
 * elevation scale parameters from the config.
 */
export function RouteMesh({ routeData, config }: RouteMeshProps) {
  const geometry = useMemo(() => {
    // For engraved style, don't render a separate mesh - the groove in terrain IS the route
    if (config.routeStyle === 'engraved') {
      return null;
    }

    const { points, stats, bounds } = routeData;
    const { size, routeThickness, elevationScale, shape } = config;

    // Calculate bounds for normalization
    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;
    const elevRange = stats.maxElevation - stats.minElevation || 1;

    // Height scale factor (convert to Three.js units)
    const heightScale = elevationScale * (size / 100);

    // Offset: raised tube floats above terrain
    // Use routeDepth from config (default 0.04 for backwards compatibility)
    const verticalOffset = config.routeDepth ?? 0.04;

    // Mesh size and circular boundary (for clipping)
    const meshSize = size / 10;
    const circleRadius = meshSize / 2 * 0.88; // Stay well inside the rim

    // Simplify points if there are too many (for performance)
    const maxPoints = 500;
    let processedPoints = points;
    if (points.length > maxPoints) {
      const step = Math.ceil(points.length / maxPoints);
      processedPoints = points.filter((_, i) => i % step === 0);
      // Always include the last point
      if (processedPoints[processedPoints.length - 1] !== points[points.length - 1]) {
        processedPoints.push(points[points.length - 1]);
      }
    }

    // Convert route points to 3D vectors
    const curve3Points: THREE.Vector3[] = [];

    for (const point of processedPoints) {
      // Normalize coordinates to mesh space
      const normalizedX = (point.lng - minLng) / lngRange;
      const normalizedZ = (point.lat - minLat) / latRange;

      // Convert to mesh coordinates (centered at origin)
      let x = (normalizedX - 0.5) * meshSize;
      let z = (normalizedZ - 0.5) * meshSize;

      // For circular shape, clamp points to stay within the circle
      if (shape === 'circular') {
        const distFromCenter = Math.sqrt(x * x + z * z);
        if (distFromCenter > circleRadius) {
          // Scale point to be on the circle edge
          const scale = circleRadius / distFromCenter;
          x *= scale;
          z *= scale;
        }
      }

      // Calculate height from elevation (or use minimum if not available)
      const elevation = point.elevation ?? stats.minElevation;
      const normalizedElev = (elevation - stats.minElevation) / elevRange;
      const y = normalizedElev * heightScale + verticalOffset;

      curve3Points.push(new THREE.Vector3(x, y, z));
    }

    // Need at least 2 points for a curve
    if (curve3Points.length < 2) {
      return new THREE.BufferGeometry();
    }

    // Create smooth curve through all points
    const curve = new THREE.CatmullRomCurve3(curve3Points, false, 'catmullrom', 0.5);

    // Calculate segments based on curve length
    const curveLength = curve.getLength();
    const segments = Math.max(64, Math.min(500, Math.floor(curveLength * 50)));

    // Create tube for raised style
    const radius = routeThickness / 200;
    const radialSegments = 8;
    return new THREE.TubeGeometry(curve, segments, radius, radialSegments, false);
  }, [routeData, config]);

  // Get route-specific material properties (shinier than terrain to stand out)
  // Textures temporarily disabled for debugging
  const materialProps = getRouteMaterialProperties(config.material);

  // Early return for engraved style (no mesh rendered) or empty geometry
  if (!geometry || geometry.attributes.position?.count === 0) {
    return null;
  }

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={config.routeColor}
        roughness={materialProps.roughness}
        metalness={materialProps.metalness}
        clearcoat={materialProps.clearcoat ?? 0}
        clearcoatRoughness={materialProps.clearcoatRoughness ?? 0}
        envMapIntensity={materialProps.envMapIntensity ?? 0.5}
        side={THREE.DoubleSide}
        // Enhanced texture properties (PLA layer lines, Wood grain)
        normalMap={materialProps.normalMap}
        normalScale={materialProps.normalScale}
        roughnessMap={materialProps.roughnessMap}
        // Note: We don't use colorMap for route to preserve routeColor
        // Resin SSS properties
        transmission={materialProps.transmission ?? 0}
        thickness={materialProps.thickness ?? 0}
        ior={materialProps.ior ?? 1.5}
        sheen={materialProps.sheen ?? 0}
        sheenRoughness={materialProps.sheenRoughness ?? 0}
        sheenColor={materialProps.sheenColor}
      />
    </mesh>
  );
}

/**
 * Start marker mesh (green sphere at route start)
 */
export function RouteStartMarker({
  routeData,
  config,
}: {
  routeData: RouteData;
  config: SculptureConfig;
}) {
  const position = useMemo(() => {
    const { points, stats, bounds } = routeData;
    const { size, elevationScale, shape } = config;

    if (points.length === 0) return new THREE.Vector3(0, 0, 0);

    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;
    const elevRange = stats.maxElevation - stats.minElevation || 1;
    const heightScale = elevationScale * (size / 100);
    const meshSize = size / 10;
    const circleRadius = meshSize / 2 * 0.92;

    const point = points[0];
    const normalizedX = (point.lng - minLng) / lngRange;
    const normalizedZ = (point.lat - minLat) / latRange;
    let x = (normalizedX - 0.5) * meshSize;
    let z = (normalizedZ - 0.5) * meshSize;

    // Clamp to circle boundary if circular shape
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
    const y = normalizedElev * heightScale + 0.05;

    return new THREE.Vector3(x, y, z);
  }, [routeData, config]);

  const materialProps = getMaterialProperties(config.material);

  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshPhysicalMaterial
        color="#22c55e"
        emissive="#22c55e"
        emissiveIntensity={0.2}
        roughness={materialProps.roughness * 0.6}
        metalness={materialProps.metalness + 0.1}
        clearcoat={materialProps.clearcoat ?? 0}
        clearcoatRoughness={materialProps.clearcoatRoughness ?? 0}
      />
    </mesh>
  );
}

/**
 * End marker mesh (red cube at route end)
 */
export function RouteEndMarker({
  routeData,
  config,
}: {
  routeData: RouteData;
  config: SculptureConfig;
}) {
  const position = useMemo(() => {
    const { points, stats, bounds } = routeData;
    const { size, elevationScale, shape } = config;

    if (points.length === 0) return new THREE.Vector3(0, 0, 0);

    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;
    const elevRange = stats.maxElevation - stats.minElevation || 1;
    const heightScale = elevationScale * (size / 100);
    const meshSize = size / 10;
    const circleRadius = meshSize / 2 * 0.92;

    const point = points[points.length - 1];
    const normalizedX = (point.lng - minLng) / lngRange;
    const normalizedZ = (point.lat - minLat) / latRange;
    let x = (normalizedX - 0.5) * meshSize;
    let z = (normalizedZ - 0.5) * meshSize;

    // Clamp to circle boundary if circular shape
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
    const y = normalizedElev * heightScale + 0.05;

    return new THREE.Vector3(x, y, z);
  }, [routeData, config]);

  const materialProps = getMaterialProperties(config.material);

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.04, 0.06, 0.04]} />
      <meshPhysicalMaterial
        color="#ef4444"
        emissive="#ef4444"
        emissiveIntensity={0.2}
        roughness={materialProps.roughness * 0.6}
        metalness={materialProps.metalness + 0.1}
        clearcoat={materialProps.clearcoat ?? 0}
        clearcoatRoughness={materialProps.clearcoatRoughness ?? 0}
      />
    </mesh>
  );
}
