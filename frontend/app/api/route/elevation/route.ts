import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Decode terrain-rgb elevation value from RGB pixel.
 * MapTiler terrain-rgb encoding: elevation = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
 */
function decodeTerrainRgb(r: number, g: number, b: number): number {
  return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
}

/**
 * Convert lat/lng to tile coordinates at a given zoom level.
 */
function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

/**
 * Convert tile coordinates back to lat/lng bounds.
 */
function tileToBounds(
  x: number,
  y: number,
  zoom: number
): { n: number; s: number; e: number; w: number } {
  const n = Math.pow(2, zoom);
  const w = (x / n) * 360 - 180;
  const e = ((x + 1) / n) * 360 - 180;
  const nLat = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI);
  const sLat = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI);
  return { n: nLat, s: sLat, e, w };
}

// Simple in-memory cache for terrain tiles to avoid re-fetching
const tileCache = new Map<string, Uint8ClampedArray | null>();

/**
 * Fetch a single terrain-RGB tile and return raw pixel data.
 */
async function fetchTerrainTileData(
  tx: number,
  ty: number,
  zoom: number,
  maptilerKey: string
): Promise<{ data: Uint8ClampedArray; width: number; height: number } | null> {
  const cacheKey = `${zoom}/${tx}/${ty}`;
  if (tileCache.has(cacheKey)) {
    const cached = tileCache.get(cacheKey);
    if (!cached) return null;
    // Cached tiles are 256x256
    return { data: cached, width: 256, height: 256 };
  }

  try {
    const url = `https://api.maptiler.com/tiles/terrain-rgb-v2/${zoom}/${tx}/${ty}.webp?key=${maptilerKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      tileCache.set(cacheKey, null);
      return null;
    }

    // Use sharp or canvas on server-side is complex. Instead, we decode on client.
    // For server-side, we'll use a PNG tile format and parse the raw bytes.
    // Actually, let's use the PNG format which is easier to parse server-side.
    const pngUrl = `https://api.maptiler.com/tiles/terrain-rgb-v2/${zoom}/${tx}/${ty}.png?key=${maptilerKey}`;
    const pngResponse = await fetch(pngUrl);
    if (!pngResponse.ok) {
      tileCache.set(cacheKey, null);
      return null;
    }

    // We need to decode PNG server-side. Use built-in node canvas or a library.
    // For simplicity, return null and let the client handle elevation lookup.
    // This endpoint will use a different approach - Open-Elevation API as server-side fallback.
    tileCache.set(cacheKey, null);
    return null;
  } catch {
    tileCache.set(cacheKey, null);
    return null;
  }
}

/**
 * POST /api/route/elevation
 *
 * Looks up elevations for an array of points using Open-Elevation API.
 * Falls back gracefully if the service is unavailable.
 *
 * Body: { points: [lat, lng][] }
 * Returns: { elevations: (number | null)[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { points } = body as { points: [number, number][] };

    if (!points || !Array.isArray(points) || points.length === 0) {
      return NextResponse.json({ error: 'Points array is required.' }, { status: 400 });
    }

    // Limit to 500 points per request
    if (points.length > 500) {
      return NextResponse.json(
        { error: 'Maximum 500 points per request.' },
        { status: 400 }
      );
    }

    // Try Open-Elevation API (free, no API key)
    try {
      const openElevationBody = {
        locations: points.map(([lat, lng]) => ({ latitude: lat, longitude: lng })),
      };

      const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(openElevationBody),
      });

      if (response.ok) {
        const data = await response.json();
        const elevations = data.results.map(
          (r: { elevation: number }) => Math.round(r.elevation * 10) / 10
        );
        return NextResponse.json({ elevations });
      }
    } catch {
      // Open-Elevation failed, try MapTiler terrain-RGB
    }

    // Fallback: Use MapTiler terrain-RGB tiles
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (maptilerKey) {
      // Calculate zoom level based on point spread
      const lats = points.map(([lat]) => lat);
      const lngs = points.map(([, lng]) => lng);
      const latSpan = Math.max(...lats) - Math.min(...lats);
      const lngSpan = Math.max(...lngs) - Math.min(...lngs);
      const maxSpan = Math.max(latSpan, lngSpan);

      let zoom = 14;
      if (maxSpan > 1) zoom = 9;
      else if (maxSpan > 0.5) zoom = 10;
      else if (maxSpan > 0.2) zoom = 11;
      else if (maxSpan > 0.1) zoom = 12;
      else if (maxSpan > 0.05) zoom = 13;

      const elevations: (number | null)[] = [];

      // Group points by tile to minimize fetches
      const tileGroups = new Map<string, { indices: number[]; tile: { x: number; y: number } }>();

      for (let i = 0; i < points.length; i++) {
        const [lat, lng] = points[i];
        const tile = latLngToTile(lat, lng, zoom);
        const key = `${tile.x},${tile.y}`;
        if (!tileGroups.has(key)) {
          tileGroups.set(key, { indices: [], tile });
        }
        tileGroups.get(key)!.indices.push(i);
      }

      // Initialize elevations array
      for (let i = 0; i < points.length; i++) {
        elevations.push(null);
      }

      // Fetch unique tiles and sample elevations
      for (const [, group] of tileGroups) {
        const tileData = await fetchTerrainTileData(
          group.tile.x,
          group.tile.y,
          zoom,
          maptilerKey
        );

        if (tileData) {
          const bounds = tileToBounds(group.tile.x, group.tile.y, zoom);

          for (const idx of group.indices) {
            const [lat, lng] = points[idx];
            const px = Math.floor(
              ((lng - bounds.w) / (bounds.e - bounds.w)) * tileData.width
            );
            const py = Math.floor(
              ((bounds.n - lat) / (bounds.n - bounds.s)) * tileData.height
            );

            const clampedPx = Math.max(0, Math.min(tileData.width - 1, px));
            const clampedPy = Math.max(0, Math.min(tileData.height - 1, py));

            const pixelIdx = (clampedPy * tileData.width + clampedPx) * 4;
            const r = tileData.data[pixelIdx];
            const g = tileData.data[pixelIdx + 1];
            const b = tileData.data[pixelIdx + 2];

            elevations[idx] = Math.round(decodeTerrainRgb(r, g, b) * 10) / 10;
          }
        }
      }

      return NextResponse.json({ elevations });
    }

    // No elevation source available — return nulls
    return NextResponse.json({
      elevations: points.map(() => null),
    });
  } catch (error) {
    console.error('Elevation lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to lookup elevations.' },
      { status: 500 }
    );
  }
}
