/**
 * GPX parsing utility for seed script
 * Uses xmldom-qsa for Node.js environment compatibility
 */

import { parseGPXWithCustomParser } from '@we-gold/gpxjs';
import { DOMParser } from 'xmldom-qsa';
import type { RouteData, RoutePoint, RouteStats } from '../../../types/poster';

/**
 * Custom DOM parser for Node.js environment
 */
function customParseMethod(txt: string): Document | null {
  return new DOMParser().parseFromString(txt, 'text/xml');
}

/**
 * Calculate bounds from points
 */
function calculateBounds(
  points: RoutePoint[]
): [[number, number], [number, number]] {
  if (points.length === 0) {
    return [
      [0, 0],
      [0, 0],
    ];
  }

  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;

  for (const point of points) {
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
  }

  // Add small padding to bounds
  const lngPadding = (maxLng - minLng) * 0.1;
  const latPadding = (maxLat - minLat) * 0.1;

  return [
    [minLng - lngPadding, minLat - latPadding], // SW
    [maxLng + lngPadding, maxLat + latPadding], // NE
  ];
}

/**
 * Parse GPX content string and return RouteData
 * Uses custom DOM parser for Node.js compatibility
 */
export function parseGPX(gpxContent: string): RouteData {
  const [parsedGPX, error] = parseGPXWithCustomParser(gpxContent, customParseMethod);

  if (error) {
    throw new Error(`Failed to parse GPX file: ${error.message}`);
  }

  if (!parsedGPX) {
    throw new Error('Failed to parse GPX file: No data returned');
  }

  const points: RoutePoint[] = [];
  let name: string | undefined;
  let description: string | undefined;
  let stats: RouteStats;

  // Extract metadata
  if (parsedGPX.metadata) {
    name = parsedGPX.metadata.name || undefined;
    description = parsedGPX.metadata.description || undefined;
  }

  // Process tracks (most common for hiking/running activities)
  if (parsedGPX.tracks && parsedGPX.tracks.length > 0) {
    const track = parsedGPX.tracks[0];
    if (!name && track.name) {
      name = track.name;
    }
    if (!description && track.description) {
      description = track.description;
    }

    // Get points from track
    if (track.points && Array.isArray(track.points)) {
      for (const point of track.points) {
        points.push({
          lat: point.latitude,
          lng: point.longitude,
          elevation: point.elevation ?? undefined,
          time: point.time ? new Date(point.time) : undefined,
        });
      }
    }

    // Use pre-calculated stats from the library
    stats = {
      distance: Math.round(track.distance?.total ?? 0),
      elevationGain: Math.round(track.elevation?.positive ?? 0),
      elevationLoss: Math.round(Math.abs(track.elevation?.negative ?? 0)),
      minElevation: Math.round(track.elevation?.minimum ?? 0),
      maxElevation: Math.round(track.elevation?.maximum ?? 0),
      duration: track.duration?.totalDuration ?? undefined,
      startTime: track.duration?.startTime ?? undefined,
      endTime: track.duration?.endTime ?? undefined,
    };
  } else {
    // Initialize default stats for routes/waypoints
    stats = {
      distance: 0,
      elevationGain: 0,
      elevationLoss: 0,
      minElevation: 0,
      maxElevation: 0,
    };
  }

  // Process routes (less common, but still used)
  if (points.length === 0 && parsedGPX.routes && parsedGPX.routes.length > 0) {
    const route = parsedGPX.routes[0];
    if (!name && route.name) {
      name = route.name;
    }
    if (!description && route.description) {
      description = route.description;
    }

    if (route.points && Array.isArray(route.points)) {
      for (const point of route.points) {
        points.push({
          lat: point.latitude,
          lng: point.longitude,
          elevation: point.elevation ?? undefined,
          time: point.time ? new Date(point.time) : undefined,
        });
      }
    }

    stats = {
      distance: Math.round(route.distance?.total ?? 0),
      elevationGain: Math.round(route.elevation?.positive ?? 0),
      elevationLoss: Math.round(Math.abs(route.elevation?.negative ?? 0)),
      minElevation: Math.round(route.elevation?.minimum ?? 0),
      maxElevation: Math.round(route.elevation?.maximum ?? 0),
      duration: route.duration?.totalDuration ?? undefined,
      startTime: route.duration?.startTime ?? undefined,
      endTime: route.duration?.endTime ?? undefined,
    };
  }

  // Process waypoints if no track/route data
  if (points.length === 0 && parsedGPX.waypoints && parsedGPX.waypoints.length > 0) {
    for (const waypoint of parsedGPX.waypoints) {
      points.push({
        lat: waypoint.latitude,
        lng: waypoint.longitude,
        elevation: waypoint.elevation ?? undefined,
        time: waypoint.time ? new Date(waypoint.time) : undefined,
      });
    }
  }

  if (points.length === 0) {
    throw new Error('No route data found in GPX file');
  }

  const bounds = calculateBounds(points);

  return {
    name,
    description,
    points,
    stats,
    bounds,
  };
}

/**
 * Validate that route data is reasonable
 */
export function validateRouteData(
  route: RouteData,
  expectedDistance?: number
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for minimum points
  if (route.points.length < 10) {
    warnings.push(`Route has only ${route.points.length} points (expected 10+)`);
  }

  // Check for valid bounds
  const [sw, ne] = route.bounds;
  if (sw[0] === ne[0] && sw[1] === ne[1]) {
    warnings.push('Route bounds are zero (all points at same location)');
  }

  // Check bounds are within valid lat/lng range
  if (sw[0] < -180 || ne[0] > 180 || sw[1] < -90 || ne[1] > 90) {
    warnings.push('Route bounds contain invalid coordinates');
  }

  // Check distance is reasonable
  if (route.stats.distance < 100) {
    warnings.push(`Route distance is very short: ${route.stats.distance}m`);
  }

  // If expected distance provided, check it's within 20%
  if (expectedDistance) {
    const expectedMeters = expectedDistance * 1000;
    const variance = Math.abs(route.stats.distance - expectedMeters) / expectedMeters;
    if (variance > 0.2) {
      warnings.push(
        `Distance variance: expected ${expectedDistance}km, got ${(route.stats.distance / 1000).toFixed(1)}km (${(variance * 100).toFixed(0)}% off)`
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Calculate the center point of a route
 */
export function calculateCenter(route: RouteData): [number, number] {
  const [sw, ne] = route.bounds;
  return [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2];
}

/**
 * Calculate an appropriate zoom level based on route bounds
 */
export function calculateZoom(route: RouteData): number {
  const [sw, ne] = route.bounds;
  const lngDiff = Math.abs(ne[0] - sw[0]);
  const latDiff = Math.abs(ne[1] - sw[1]);
  const maxDiff = Math.max(lngDiff, latDiff);

  // Rough zoom calculation based on bounds size
  if (maxDiff > 5) return 6;
  if (maxDiff > 2) return 7;
  if (maxDiff > 1) return 8;
  if (maxDiff > 0.5) return 9;
  if (maxDiff > 0.2) return 10;
  if (maxDiff > 0.1) return 11;
  if (maxDiff > 0.05) return 12;
  return 13;
}
