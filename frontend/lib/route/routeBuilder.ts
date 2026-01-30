import type { RouteData, RoutePoint, RouteStats } from '@/types/poster';

export type RoutingProfile = 'foot' | 'bike';

interface SnapResponse {
  coordinates: [number, number][]; // [lng, lat][]
  distance: number; // meters
  duration: number; // seconds
}

interface ElevationResponse {
  elevations: (number | null)[];
}

/**
 * Snap waypoints to roads via OSRM proxy API.
 * Returns the full snapped geometry as [lng, lat][] coordinates.
 */
export async function snapRouteToRoads(
  waypoints: [number, number][], // [lat, lng][]
  profile: RoutingProfile
): Promise<SnapResponse> {
  const response = await fetch('/api/route/snap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ waypoints, profile }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Routing failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch elevation data for a set of points.
 * Samples every Nth point if there are too many to keep requests manageable.
 */
export async function fetchElevations(
  points: RoutePoint[]
): Promise<(number | null)[]> {
  if (points.length === 0) return [];

  // Sample points if there are too many (max 200 for elevation lookup)
  const maxSamples = 200;
  let sampleIndices: number[];

  if (points.length <= maxSamples) {
    sampleIndices = points.map((_, i) => i);
  } else {
    // Always include first and last, sample evenly between
    sampleIndices = [0];
    const step = (points.length - 1) / (maxSamples - 1);
    for (let i = 1; i < maxSamples - 1; i++) {
      sampleIndices.push(Math.round(i * step));
    }
    sampleIndices.push(points.length - 1);
  }

  const samplePoints: [number, number][] = sampleIndices.map((i) => [
    points[i].lat,
    points[i].lng,
  ]);

  try {
    const response = await fetch('/api/route/elevation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: samplePoints }),
    });

    if (!response.ok) {
      console.warn('Elevation lookup failed, continuing without elevation');
      return points.map(() => null);
    }

    const data: ElevationResponse = await response.json();
    const sampledElevations = data.elevations;

    // If we sampled, interpolate elevation for non-sampled points
    if (points.length <= maxSamples) {
      return sampledElevations;
    }

    // Linear interpolation between sampled points
    const allElevations: (number | null)[] = new Array(points.length).fill(null);

    for (let s = 0; s < sampleIndices.length; s++) {
      allElevations[sampleIndices[s]] = sampledElevations[s];
    }

    // Interpolate gaps
    for (let s = 0; s < sampleIndices.length - 1; s++) {
      const startIdx = sampleIndices[s];
      const endIdx = sampleIndices[s + 1];
      const startElev = allElevations[startIdx];
      const endElev = allElevations[endIdx];

      if (startElev != null && endElev != null) {
        for (let i = startIdx + 1; i < endIdx; i++) {
          const t = (i - startIdx) / (endIdx - startIdx);
          allElevations[i] = startElev + t * (endElev - startElev);
        }
      }
    }

    return allElevations;
  } catch (error) {
    console.warn('Elevation lookup error:', error);
    return points.map(() => null);
  }
}

/**
 * Haversine distance between two lat/lng points in meters.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate route stats from points with optional elevation data.
 */
export function calculateStatsFromPoints(
  points: RoutePoint[],
  osrmDistance?: number,
  osrmDuration?: number
): RouteStats {
  let distance = 0;
  let elevationGain = 0;
  let elevationLoss = 0;
  let minElevation = Infinity;
  let maxElevation = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];

    if (i > 0) {
      const prev = points[i - 1];
      distance += haversineDistance(prev.lat, prev.lng, p.lat, p.lng);

      if (p.elevation != null && prev.elevation != null) {
        const diff = p.elevation - prev.elevation;
        if (diff > 0) elevationGain += diff;
        else elevationLoss += Math.abs(diff);
      }
    }

    if (p.elevation != null) {
      minElevation = Math.min(minElevation, p.elevation);
      maxElevation = Math.max(maxElevation, p.elevation);
    }
  }

  // Prefer OSRM distance (road-following) over Haversine (straight-line)
  if (osrmDistance != null) {
    distance = osrmDistance;
  }

  return {
    distance: Math.round(distance),
    elevationGain: Math.round(elevationGain),
    elevationLoss: Math.round(elevationLoss),
    minElevation: minElevation === Infinity ? 0 : Math.round(minElevation),
    maxElevation: maxElevation === -Infinity ? 0 : Math.round(maxElevation),
    duration: osrmDuration != null ? Math.round(osrmDuration) : undefined,
  };
}

/**
 * Calculate bounds from points with 10% padding (matches parseGPX.ts).
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

  const lngPadding = (maxLng - minLng) * 0.1;
  const latPadding = (maxLat - minLat) * 0.1;

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ];
}

/**
 * Build a complete RouteData from user-placed waypoints.
 *
 * Pipeline: waypoints → OSRM snap → elevation lookup → RouteData
 *
 * The output is identical in shape to what parseGPXFile() produces,
 * so all downstream consumers (poster export, sculpture export) work unchanged.
 */
export async function buildRouteFromWaypoints(
  waypoints: [number, number][], // [lat, lng][]
  profile: RoutingProfile
): Promise<RouteData> {
  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints are required to build a route.');
  }

  // Step 1: Snap to roads via OSRM
  const snap = await snapRouteToRoads(waypoints, profile);

  // Step 2: Convert OSRM coordinates [lng, lat] to RoutePoint[]
  const points: RoutePoint[] = snap.coordinates.map(([lng, lat]) => ({
    lat,
    lng,
  }));

  // Step 3: Fetch elevation data
  const elevations = await fetchElevations(points);

  // Apply elevations to points
  for (let i = 0; i < points.length; i++) {
    if (elevations[i] != null) {
      points[i].elevation = elevations[i]!;
    }
  }

  // Step 4: Calculate stats
  const stats = calculateStatsFromPoints(points, snap.distance, snap.duration);

  // Step 5: Calculate bounds
  const bounds = calculateBounds(points);

  return {
    points,
    stats,
    bounds,
    source: 'draw',
    waypoints: waypoints.map(([lat, lng]) => [lng, lat] as [number, number]),
  };
}
