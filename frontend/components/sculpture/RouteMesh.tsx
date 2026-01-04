'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';

interface RouteMeshProps {
  routeData: RouteData;
  config: SculptureConfig;
}

/**
 * 3D Route tube mesh that follows the GPS trail path.
 *
 * Creates a smooth tube geometry using Three.js TubeGeometry and
 * CatmullRomCurve3. The tube is positioned above the terrain surface
 * to create a visual separation.
 *
 * The route is normalized to fit within the sculpture size and
 * elevation scale parameters from the config.
 */
export function RouteMesh({ routeData, config }: RouteMeshProps) {
  const geometry = useMemo(() => {
    const { points, stats, bounds } = routeData;
    const { size, routeThickness, elevationScale } = config;

    // Calculate bounds for normalization
    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;
    const elevRange = stats.maxElevation - stats.minElevation || 1;

    // Height scale factor (convert to Three.js units)
    const heightScale = elevationScale * (size / 100);

    // Offset to lift tube above terrain surface
    const tubeOffset = 0.02;

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
      const x = (normalizedX - 0.5) * (size / 10);
      const z = (normalizedZ - 0.5) * (size / 10);

      // Calculate height from elevation (or use minimum if not available)
      const elevation = point.elevation ?? stats.minElevation;
      const normalizedElev = (elevation - stats.minElevation) / elevRange;
      const y = normalizedElev * heightScale + tubeOffset;

      curve3Points.push(new THREE.Vector3(x, y, z));
    }

    // Need at least 2 points for a curve
    if (curve3Points.length < 2) {
      // Return empty geometry
      return new THREE.BufferGeometry();
    }

    // Create smooth curve through all points
    const curve = new THREE.CatmullRomCurve3(curve3Points, false, 'catmullrom', 0.5);

    // Calculate tube segments based on curve length
    const curveLength = curve.getLength();
    const tubularSegments = Math.max(64, Math.min(500, Math.floor(curveLength * 50)));

    // Create tube geometry
    // routeThickness is in mm, convert to Three.js units
    const radius = routeThickness / 200;
    const radialSegments = 8;

    return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
  }, [routeData, config]);

  // Early return for empty geometry
  if (geometry.attributes.position?.count === 0) {
    return null;
  }

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial
        color={config.routeColor}
        roughness={0.4}
        metalness={0.15}
      />
    </mesh>
  );
}

/**
 * Start marker mesh (optional, for future enhancement)
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
    const { size, elevationScale } = config;

    if (points.length === 0) return new THREE.Vector3(0, 0, 0);

    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;
    const elevRange = stats.maxElevation - stats.minElevation || 1;
    const heightScale = elevationScale * (size / 100);

    const point = points[0];
    const normalizedX = (point.lng - minLng) / lngRange;
    const normalizedZ = (point.lat - minLat) / latRange;
    const x = (normalizedX - 0.5) * (size / 10);
    const z = (normalizedZ - 0.5) * (size / 10);
    const elevation = point.elevation ?? stats.minElevation;
    const normalizedElev = (elevation - stats.minElevation) / elevRange;
    const y = normalizedElev * heightScale + 0.05;

    return new THREE.Vector3(x, y, z);
  }, [routeData, config]);

  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
    </mesh>
  );
}

/**
 * End marker mesh (optional, for future enhancement)
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
    const { size, elevationScale } = config;

    if (points.length === 0) return new THREE.Vector3(0, 0, 0);

    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const lngRange = maxLng - minLng || 0.001;
    const latRange = maxLat - minLat || 0.001;
    const elevRange = stats.maxElevation - stats.minElevation || 1;
    const heightScale = elevationScale * (size / 100);

    const point = points[points.length - 1];
    const normalizedX = (point.lng - minLng) / lngRange;
    const normalizedZ = (point.lat - minLat) / latRange;
    const x = (normalizedX - 0.5) * (size / 10);
    const z = (normalizedZ - 0.5) * (size / 10);
    const elevation = point.elevation ?? stats.minElevation;
    const normalizedElev = (elevation - stats.minElevation) / elevRange;
    const y = normalizedElev * heightScale + 0.05;

    return new THREE.Vector3(x, y, z);
  }, [routeData, config]);

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.04, 0.06, 0.04]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
    </mesh>
  );
}
