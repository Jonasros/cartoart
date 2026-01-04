'use client';

import { useState, useEffect, useMemo } from 'react';
import type { RouteData } from '@/types/poster';

interface ElevationGridResult {
  /** 2D array of elevation values [row][col] */
  grid: number[][] | null;
  /** Whether the grid is being computed */
  loading: boolean;
  /** Error message if computation failed */
  error: string | null;
}

/**
 * Generate an elevation grid from route data.
 *
 * Phase 4.1: Uses simplified interpolation from route points.
 * Phase 4.4: Will add MapTiler Elevation API for full terrain resolution.
 *
 * @param routeData - Route data with points and bounds
 * @param gridSize - Number of grid cells per dimension (default: 32)
 * @returns Elevation grid result with loading and error states
 *
 * @example
 * ```tsx
 * const { grid, loading, error } = useElevationGrid(routeData, 64);
 * if (grid) {
 *   // Use grid for terrain mesh
 * }
 * ```
 */
export function useElevationGrid(
  routeData: RouteData | null,
  gridSize: number = 32
): ElevationGridResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute grid using route point interpolation
  const grid = useMemo(() => {
    if (!routeData) {
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
  }, [routeData, gridSize]);

  // Update loading state (for future async operations)
  useEffect(() => {
    if (routeData) {
      setLoading(true);
      // Simulate async for consistent API (future: actual async fetch)
      const timeout = setTimeout(() => {
        setLoading(false);
        if (!grid && routeData.points.some((p) => p.elevation !== undefined)) {
          setError('Failed to generate elevation grid');
        } else {
          setError(null);
        }
      }, 0);
      return () => clearTimeout(timeout);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [routeData, grid]);

  return { grid, loading, error };
}
