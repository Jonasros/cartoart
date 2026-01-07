import type { StravaActivity, StravaStream } from '@/types/strava';
import type { RouteData, RoutePoint, RouteStats } from '@/types/poster';

/**
 * Calculates elevation loss from altitude data
 */
function calculateElevationLoss(altitudeData?: number[]): number {
  if (!altitudeData || altitudeData.length < 2) return 0;

  let loss = 0;
  for (let i = 1; i < altitudeData.length; i++) {
    const diff = altitudeData[i - 1] - altitudeData[i];
    if (diff > 0) loss += diff;
  }
  return loss;
}

/**
 * Calculates bounding box from route points
 * Returns [SW, NE] corners as [[lng, lat], [lng, lat]]
 */
function calculateBounds(points: RoutePoint[]): [[number, number], [number, number]] {
  if (points.length === 0) {
    return [[0, 0], [0, 0]];
  }

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  for (const point of points) {
    if (point.lat > north) north = point.lat;
    if (point.lat < south) south = point.lat;
    if (point.lng > east) east = point.lng;
    if (point.lng < west) west = point.lng;
  }

  // Return [SW, NE] as [lng, lat] pairs
  return [[west, south], [east, north]];
}

/**
 * Converts Strava activity and streams to RouteData format
 */
export function convertStravaToRouteData(
  activity: StravaActivity,
  streams: StravaStream
): RouteData {
  // Convert latlng stream to RoutePoints
  const latlngData = streams.latlng?.data ?? [];
  const altitudeData = streams.altitude?.data ?? [];
  const timeData = streams.time?.data ?? [];

  const startTime = new Date(activity.start_date);

  const points: RoutePoint[] = latlngData.map((coord, i) => ({
    lat: coord[0],
    lng: coord[1],
    elevation: altitudeData[i],
    time: timeData[i]
      ? new Date(startTime.getTime() + timeData[i] * 1000)
      : undefined,
  }));

  // Calculate elevation stats from stream data
  const minElevation = altitudeData.length > 0 ? Math.min(...altitudeData) : 0;
  const maxElevation = altitudeData.length > 0 ? Math.max(...altitudeData) : 0;
  const elevationLoss = calculateElevationLoss(altitudeData);

  // Build stats from activity data
  const stats: RouteStats = {
    distance: activity.distance,
    elevationGain: activity.total_elevation_gain,
    elevationLoss,
    minElevation,
    maxElevation,
    duration: activity.moving_time,
    startTime: new Date(activity.start_date),
    endTime: timeData.length > 0
      ? new Date(startTime.getTime() + timeData[timeData.length - 1] * 1000)
      : undefined,
  };

  // Calculate bounds
  const bounds = calculateBounds(points);

  return {
    name: activity.name,
    points,
    stats,
    bounds,
  };
}

/**
 * Decodes a Google-encoded polyline string to coordinates
 * Used for summary_polyline preview
 */
export function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}
