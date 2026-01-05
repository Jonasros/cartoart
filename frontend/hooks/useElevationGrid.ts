'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RouteData } from '@/types/poster';
import type { SculptureTerrainMode } from '@/types/sculpture';

interface ElevationGridResult {
  /** 2D array of elevation values [row][col] */
  grid: number[][] | null;
  /** Whether the grid is being computed */
  loading: boolean;
  /** Error message if computation failed */
  error: string | null;
}

/**
 * Decode terrain-rgb elevation value from RGB pixel
 * MapTiler terrain-rgb encoding: elevation = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
 */
function decodeTerrainRgb(r: number, g: number, b: number): number {
  return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
}

/**
 * Calculate the appropriate zoom level for fetching terrain tiles
 * Higher zoom = more detail but more tiles to fetch
 */
function calculateZoom(bounds: [[number, number], [number, number]]): number {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  const lngSpan = maxLng - minLng;
  const latSpan = maxLat - minLat;
  const maxSpan = Math.max(lngSpan, latSpan);

  // Choose zoom level based on area size
  // Smaller areas get higher zoom for more detail
  if (maxSpan > 1) return 9;
  if (maxSpan > 0.5) return 10;
  if (maxSpan > 0.2) return 11;
  if (maxSpan > 0.1) return 12;
  if (maxSpan > 0.05) return 13;
  return 14;
}

/**
 * Convert lat/lng to tile coordinates
 */
function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

/**
 * Convert tile coordinates to lat/lng bounds
 */
function tileToBounds(x: number, y: number, zoom: number): { n: number; s: number; e: number; w: number } {
  const n = Math.pow(2, zoom);
  const w = (x / n) * 360 - 180;
  const e = ((x + 1) / n) * 360 - 180;
  const nLat = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI);
  const sLat = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI);
  return { n: nLat, s: sLat, e, w };
}

/**
 * Fetch terrain-rgb tile and return elevation data as ImageData
 */
async function fetchTerrainTile(x: number, y: number, zoom: number): Promise<ImageData | null> {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!maptilerKey) {
    console.warn('MapTiler key not configured, falling back to route-based terrain');
    return null;
  }

  const url = `/api/tiles/maptiler/tiles/terrain-rgb-v2/${zoom}/${x}/${y}.webp?key=${maptilerKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch terrain tile: ${response.status}`);
      return null;
    }

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    // Draw to canvas to get pixel data
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } catch (e) {
    console.warn('Error fetching terrain tile:', e);
    return null;
  }
}

/**
 * Generate an elevation grid from route data.
 *
 * Supports two modes:
 * - 'route': Interpolate from route elevation points (fast, simpler)
 * - 'terrain': Fetch real terrain-rgb tiles from MapTiler (detailed, async)
 *
 * @param routeData - Route data with points and bounds
 * @param gridSize - Number of grid cells per dimension (default: 32)
 * @param terrainMode - Whether to use route points or fetch terrain data
 * @returns Elevation grid result with loading and error states
 *
 * @example
 * ```tsx
 * const { grid, loading, error } = useElevationGrid(routeData, 64, 'terrain');
 * if (grid) {
 *   // Use grid for terrain mesh
 * }
 * ```
 */
export function useElevationGrid(
  routeData: RouteData | null,
  gridSize: number = 32,
  terrainMode: SculptureTerrainMode = 'route'
): ElevationGridResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terrainGrid, setTerrainGrid] = useState<number[][] | null>(null);

  // Generate grid from route points (synchronous)
  const routeBasedGrid = useMemo(() => {
    if (!routeData || terrainMode === 'terrain') {
      return null;
    }

    try {
      const { points, stats, bounds } = routeData;

      // Validate we have elevation data
      const hasElevation = points.some((p) => p.elevation !== undefined);
      if (!hasElevation) {
        return null;
      }

      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      const lngRange = maxLng - minLng || 0.001;
      const latRange = maxLat - minLat || 0.001;
      const { minElevation } = stats;

      // Build spatial index for faster lookups
      // Divide the area into buckets for O(1) average lookup
      const bucketCount = Math.max(8, Math.floor(gridSize / 4));
      const buckets: Map<string, typeof points> = new Map();

      for (const p of points) {
        if (p.elevation === undefined) continue;

        const bucketX = Math.floor(((p.lng - minLng) / lngRange) * bucketCount);
        const bucketY = Math.floor(((p.lat - minLat) / latRange) * bucketCount);
        const key = `${bucketX},${bucketY}`;

        if (!buckets.has(key)) {
          buckets.set(key, []);
        }
        buckets.get(key)!.push(p);
      }

      // Create the elevation grid
      const newGrid: number[][] = [];

      for (let y = 0; y < gridSize; y++) {
        const row: number[] = [];
        const normalizedY = y / gridSize;
        const lat = minLat + normalizedY * latRange;

        for (let x = 0; x < gridSize; x++) {
          const normalizedX = x / gridSize;
          const lng = minLng + normalizedX * lngRange;

          // Get the bucket and neighboring buckets
          const bucketX = Math.floor(normalizedX * bucketCount);
          const bucketY = Math.floor(normalizedY * bucketCount);

          let nearestElev = minElevation;
          let minDist = Infinity;

          // Search current bucket and neighbors
          for (let bx = bucketX - 1; bx <= bucketX + 1; bx++) {
            for (let by = bucketY - 1; by <= bucketY + 1; by++) {
              const bucketPoints = buckets.get(`${bx},${by}`);
              if (!bucketPoints) continue;

              for (const p of bucketPoints) {
                const dist = Math.sqrt((p.lng - lng) ** 2 + (p.lat - lat) ** 2);
                if (dist < minDist && p.elevation !== undefined) {
                  minDist = dist;
                  nearestElev = p.elevation;
                }
              }
            }
          }

          // If no points found in nearby buckets, search all points
          if (minDist === Infinity) {
            for (const p of points) {
              if (p.elevation === undefined) continue;
              const dist = Math.sqrt((p.lng - lng) ** 2 + (p.lat - lat) ** 2);
              if (dist < minDist) {
                minDist = dist;
                nearestElev = p.elevation;
              }
            }
          }

          row.push(nearestElev);
        }
        newGrid.push(row);
      }

      return newGrid;
    } catch (e) {
      console.error('Error generating elevation grid:', e);
      return null;
    }
  }, [routeData, gridSize, terrainMode]);

  // Fetch terrain-rgb data asynchronously
  const fetchTerrainData = useCallback(async () => {
    if (!routeData || terrainMode !== 'terrain') {
      setTerrainGrid(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { bounds } = routeData;
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      const lngRange = maxLng - minLng || 0.001;
      const latRange = maxLat - minLat || 0.001;

      // Calculate zoom level and determine tiles needed
      const zoom = calculateZoom(bounds);
      const minTile = latLngToTile(maxLat, minLng, zoom); // Note: maxLat gives lower y
      const maxTile = latLngToTile(minLat, maxLng, zoom);

      // Fetch all required tiles
      const tiles: Map<string, ImageData> = new Map();
      const fetchPromises: Promise<void>[] = [];

      for (let tx = minTile.x; tx <= maxTile.x; tx++) {
        for (let ty = minTile.y; ty <= maxTile.y; ty++) {
          fetchPromises.push(
            fetchTerrainTile(tx, ty, zoom).then((data) => {
              if (data) {
                tiles.set(`${tx},${ty}`, data);
              }
            })
          );
        }
      }

      await Promise.all(fetchPromises);

      // If no tiles fetched, fall back to route-based
      if (tiles.size === 0) {
        console.warn('No terrain tiles fetched, falling back to route-based terrain');
        setTerrainGrid(null);
        setError('Could not fetch terrain data');
        setLoading(false);
        return;
      }

      // Sample elevation from tiles to create grid
      const newGrid: number[][] = [];

      for (let gy = 0; gy < gridSize; gy++) {
        const row: number[] = [];
        const normalizedY = gy / gridSize;
        const lat = minLat + normalizedY * latRange;

        for (let gx = 0; gx < gridSize; gx++) {
          const normalizedX = gx / gridSize;
          const lng = minLng + normalizedX * lngRange;

          // Find which tile contains this point
          const tile = latLngToTile(lat, lng, zoom);
          const tileData = tiles.get(`${tile.x},${tile.y}`);

          if (tileData) {
            // Get pixel coordinates within tile
            const tileBounds = tileToBounds(tile.x, tile.y, zoom);
            const pixelX = Math.floor(
              ((lng - tileBounds.w) / (tileBounds.e - tileBounds.w)) * tileData.width
            );
            const pixelY = Math.floor(
              ((tileBounds.n - lat) / (tileBounds.n - tileBounds.s)) * tileData.height
            );

            // Clamp to valid range
            const px = Math.max(0, Math.min(tileData.width - 1, pixelX));
            const py = Math.max(0, Math.min(tileData.height - 1, pixelY));

            // Get RGB values from tile
            const idx = (py * tileData.width + px) * 4;
            const r = tileData.data[idx];
            const g = tileData.data[idx + 1];
            const b = tileData.data[idx + 2];

            row.push(decodeTerrainRgb(r, g, b));
          } else {
            // Fallback: use route point elevation if tile not available
            row.push(routeData.stats.minElevation);
          }
        }
        newGrid.push(row);
      }

      setTerrainGrid(newGrid);
      setError(null);
    } catch (e) {
      console.error('Error fetching terrain data:', e);
      setError('Failed to fetch terrain data');
      setTerrainGrid(null);
    } finally {
      setLoading(false);
    }
  }, [routeData, gridSize, terrainMode]);

  // Trigger terrain fetch when mode is 'terrain'
  useEffect(() => {
    if (terrainMode === 'terrain' && routeData) {
      fetchTerrainData();
    } else {
      setTerrainGrid(null);
    }
  }, [routeData, terrainMode, fetchTerrainData]);

  // Update loading state for route-based grid
  useEffect(() => {
    if (terrainMode === 'route' && routeData) {
      setLoading(true);
      const timeout = setTimeout(() => {
        setLoading(false);
        if (!routeBasedGrid && routeData.points.some((p) => p.elevation !== undefined)) {
          setError('Failed to generate elevation grid');
        } else {
          setError(null);
        }
      }, 0);
      return () => clearTimeout(timeout);
    } else if (terrainMode === 'route') {
      setLoading(false);
      setError(null);
    }
  }, [routeData, routeBasedGrid, terrainMode]);

  // Return appropriate grid based on mode
  const grid = terrainMode === 'terrain' ? terrainGrid : routeBasedGrid;

  return { grid, loading, error };
}
