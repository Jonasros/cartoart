/**
 * Douglas-Peucker Line Simplification Algorithm
 *
 * Reduces the number of points in a polyline while preserving its shape.
 * More effective than simple step-based decimation as it preserves
 * shape-defining points (curves, corners) while simplifying straight sections.
 *
 * Used for route point reduction before 3D mesh generation.
 */

export interface Point3D {
  lng: number;
  lat: number;
  elevation?: number;
}

/**
 * Calculate perpendicular distance from a point to a line segment
 */
function perpendicularDistance(
  point: Point3D,
  lineStart: Point3D,
  lineEnd: Point3D
): number {
  const dx = lineEnd.lng - lineStart.lng;
  const dy = lineEnd.lat - lineStart.lat;

  // If start and end are the same point, return distance to that point
  const lineLengthSq = dx * dx + dy * dy;
  if (lineLengthSq === 0) {
    return Math.sqrt(
      (point.lng - lineStart.lng) ** 2 + (point.lat - lineStart.lat) ** 2
    );
  }

  // Calculate projection of point onto line
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.lng - lineStart.lng) * dx + (point.lat - lineStart.lat) * dy) /
        lineLengthSq
    )
  );

  const projX = lineStart.lng + t * dx;
  const projY = lineStart.lat + t * dy;

  return Math.sqrt((point.lng - projX) ** 2 + (point.lat - projY) ** 2);
}

/**
 * Douglas-Peucker recursive simplification
 */
function douglasPeuckerRecursive(
  points: Point3D[],
  tolerance: number,
  start: number,
  end: number,
  keepFlags: boolean[]
): void {
  if (end <= start + 1) return;

  let maxDistance = 0;
  let maxIndex = start;

  // Find the point with maximum distance from line segment
  for (let i = start + 1; i < end; i++) {
    const distance = perpendicularDistance(
      points[i],
      points[start],
      points[end]
    );
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    keepFlags[maxIndex] = true;
    douglasPeuckerRecursive(points, tolerance, start, maxIndex, keepFlags);
    douglasPeuckerRecursive(points, tolerance, maxIndex, end, keepFlags);
  }
}

/**
 * Simplify a path using the Douglas-Peucker algorithm
 *
 * @param points - Array of GPS points with lat, lng, and optional elevation
 * @param tolerance - Maximum perpendicular distance for point removal
 * @returns Simplified array of points
 */
export function simplifyPath(points: Point3D[], tolerance: number): Point3D[] {
  if (points.length <= 2) return points;

  // Initialize: keep first and last points
  const keepFlags = new Array(points.length).fill(false);
  keepFlags[0] = true;
  keepFlags[points.length - 1] = true;

  // Run recursive simplification
  douglasPeuckerRecursive(points, tolerance, 0, points.length - 1, keepFlags);

  // Collect kept points
  return points.filter((_, index) => keepFlags[index]);
}

/**
 * Calculate optimal tolerance to achieve target point count
 *
 * Uses binary search to find a tolerance that results in approximately
 * the target number of points. This is more predictable than using
 * a fixed tolerance value.
 *
 * @param points - Original array of GPS points
 * @param targetCount - Desired number of points after simplification
 * @param maxIterations - Maximum binary search iterations (default: 20)
 * @returns Calculated tolerance value
 */
export function calculateTolerance(
  points: Point3D[],
  targetCount: number,
  maxIterations: number = 20
): number {
  if (points.length <= targetCount) return 0;

  // Calculate bounding box for initial tolerance range
  let minLng = Infinity,
    maxLng = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  for (const p of points) {
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }

  const diagonalDistance = Math.sqrt(
    (maxLng - minLng) ** 2 + (maxLat - minLat) ** 2
  );

  // Binary search for optimal tolerance
  let lowTolerance = 0;
  let highTolerance = diagonalDistance / 10;

  // Ensure high tolerance results in fewer points than target
  let simplified = simplifyPath(points, highTolerance);
  while (simplified.length > targetCount && highTolerance < diagonalDistance) {
    highTolerance *= 2;
    simplified = simplifyPath(points, highTolerance);
  }

  // Binary search
  for (let i = 0; i < maxIterations; i++) {
    const midTolerance = (lowTolerance + highTolerance) / 2;
    simplified = simplifyPath(points, midTolerance);

    if (simplified.length === targetCount) {
      return midTolerance;
    }

    if (simplified.length > targetCount) {
      lowTolerance = midTolerance;
    } else {
      highTolerance = midTolerance;
    }

    // Close enough - within 5% of target
    if (Math.abs(simplified.length - targetCount) / targetCount < 0.05) {
      return midTolerance;
    }
  }

  return (lowTolerance + highTolerance) / 2;
}

/**
 * Simplify path to approximately target point count
 *
 * Convenience function that calculates tolerance and simplifies in one call.
 *
 * @param points - Original array of GPS points
 * @param targetCount - Desired number of points after simplification
 * @returns Simplified array of points (may be slightly more or less than target)
 */
export function simplifyToCount(
  points: Point3D[],
  targetCount: number
): Point3D[] {
  if (points.length <= targetCount) return points;

  const tolerance = calculateTolerance(points, targetCount);
  return simplifyPath(points, tolerance);
}
