import { parseGPX as gpxParse } from '@we-gold/gpxjs';
import type { RouteData, RoutePoint, RouteStats } from '@/types/poster';

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
 * Parse GPX file content and extract route data
 */
export async function parseGPXFile(file: File): Promise<RouteData> {
  const text = await file.text();
  return parseGPXString(text);
}

/**
 * Parse GPX string content and extract route data
 */
export function parseGPXString(gpxContent: string): RouteData {
  const [parsedGPX, error] = gpxParse(gpxContent);

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
  // The library flattens track segments into a single points array
  if (parsedGPX.tracks && parsedGPX.tracks.length > 0) {
    const track = parsedGPX.tracks[0];
    if (!name && track.name) {
      name = track.name;
    }
    if (!description && track.description) {
      description = track.description;
    }

    // Get points from track (already flattened by the library)
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

    // Use pre-calculated stats from the library
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
    // Waypoints don't have pre-calculated stats, keep defaults
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
 * Convert RouteData to GeoJSON LineString for MapLibre
 */
export function routeToGeoJSON(route: RouteData): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    properties: {
      name: route.name,
      distance: route.stats.distance,
      elevationGain: route.stats.elevationGain,
    },
    geometry: {
      type: 'LineString',
      coordinates: route.points.map((p) => [p.lng, p.lat, p.elevation ?? 0]),
    },
  };
}

/**
 * Get start and end points as GeoJSON for markers
 */
export function routeEndpointsToGeoJSON(
  route: RouteData
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const start = route.points[0];
  const end = route.points[route.points.length - 1];

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { type: 'start' },
        geometry: {
          type: 'Point',
          coordinates: [start.lng, start.lat],
        },
      },
      {
        type: 'Feature',
        properties: { type: 'end' },
        geometry: {
          type: 'Point',
          coordinates: [end.lng, end.lat],
        },
      },
    ],
  };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format elevation for display
 */
export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}
