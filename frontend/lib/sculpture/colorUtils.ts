/**
 * Color Utilities for Terrain Colorization
 *
 * Provides functions for interpolating colors based on elevation
 * to create hypsometric-style terrain coloring in the 3D preview.
 *
 * Note: This is a preview-only feature. STL exports remain single-color.
 */

import * as THREE from 'three';
import type { ColorStop, TerrainColorizationConfig, TerrainColorPreset } from '@/types/sculpture';
import { TERRAIN_COLOR_PRESETS } from '@/types/sculpture';

/**
 * Interpolate between two colors
 */
function lerpColor(color1: THREE.Color, color2: THREE.Color, t: number): THREE.Color {
  const result = new THREE.Color();
  result.r = color1.r + (color2.r - color1.r) * t;
  result.g = color1.g + (color2.g - color1.g) * t;
  result.b = color1.b + (color2.b - color1.b) * t;
  return result;
}

/**
 * Get color from gradient stops based on normalized elevation (0-1)
 *
 * @param normalizedElevation - Value between 0 (lowest) and 1 (highest)
 * @param stops - Array of color stops with position and hex color
 * @param smoothness - 0 = stepped bands, 1 = smooth interpolation
 */
export function getColorFromStops(
  normalizedElevation: number,
  stops: ColorStop[],
  smoothness: number
): THREE.Color {
  // Clamp elevation to valid range
  const elevation = Math.max(0, Math.min(1, normalizedElevation));

  // Find the two stops to interpolate between
  let lowStop = stops[0];
  let highStop = stops[stops.length - 1];
  let lowIndex = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    if (elevation >= stops[i].position && elevation <= stops[i + 1].position) {
      lowStop = stops[i];
      highStop = stops[i + 1];
      lowIndex = i;
      break;
    }
  }

  // Calculate interpolation factor within this segment
  const range = highStop.position - lowStop.position;
  const t = range > 0 ? (elevation - lowStop.position) / range : 0;

  // Apply smoothness (0 = stepped/banded, 1 = smooth)
  let adjustedT: number;
  if (smoothness < 0.3) {
    // Fully stepped: snap to nearest stop
    adjustedT = t < 0.5 ? 0 : 1;
  } else if (smoothness < 0.7) {
    // Partially stepped: quantize to bands
    const bands = 5;
    adjustedT = Math.round(t * bands) / bands;
  } else {
    // Smooth interpolation
    adjustedT = t;
  }

  // Interpolate colors
  const lowColor = new THREE.Color(lowStop.color);
  const highColor = new THREE.Color(highStop.color);

  return lerpColor(lowColor, highColor, adjustedT);
}

/**
 * Get the color stops for a given preset or custom configuration
 */
export function getColorStops(config: TerrainColorizationConfig): ColorStop[] {
  if (config.preset === 'none') {
    return [];
  }

  if (config.preset === 'custom') {
    // Create 3-stop gradient from custom colors
    return [
      { position: 0.0, color: config.customColors.low },
      { position: 0.5, color: config.customColors.mid },
      { position: 1.0, color: config.customColors.high },
    ];
  }

  // Use predefined preset
  const preset = TERRAIN_COLOR_PRESETS[config.preset as Exclude<TerrainColorPreset, 'none' | 'custom'>];
  return preset?.stops ?? [];
}

/**
 * Create vertex color array for terrain geometry
 *
 * @param positionAttribute - BufferAttribute containing vertex positions
 * @param heightRange - Min and max Y values in the geometry
 * @param config - Colorization configuration
 * @param clippedVertices - Boolean array indicating which vertices are clipped (outside boundary)
 * @param fallbackColor - Color to use for clipped vertices (defaults to base terrain color)
 * @returns Float32Array of RGB values (3 floats per vertex)
 */
export function createVertexColors(
  positionAttribute: THREE.BufferAttribute,
  heightRange: { min: number; max: number },
  config: TerrainColorizationConfig,
  clippedVertices: boolean[],
  fallbackColor: string = '#8b7355'
): Float32Array {
  const vertexCount = positionAttribute.count;
  const colors = new Float32Array(vertexCount * 3);
  const stops = getColorStops(config);
  const fallback = new THREE.Color(fallbackColor);

  // Handle edge case: no height range (flat terrain)
  const range = heightRange.max - heightRange.min;
  const hasRange = range > 0.0001;

  for (let i = 0; i < vertexCount; i++) {
    let color: THREE.Color;

    if (clippedVertices[i]) {
      // Use fallback color for clipped vertices
      color = fallback;
    } else if (stops.length === 0) {
      // No colorization - use fallback
      color = fallback;
    } else {
      // Get vertex Y position (elevation)
      const y = positionAttribute.getY(i);

      // Normalize to 0-1 range
      const normalizedElevation = hasRange
        ? (y - heightRange.min) / range
        : 0.5; // Flat terrain gets middle color

      // Get color from gradient
      color = getColorFromStops(normalizedElevation, stops, config.smoothness);
    }

    // Store RGB values
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return colors;
}

/**
 * Calculate the height range from a position attribute
 */
export function calculateHeightRange(
  positionAttribute: THREE.BufferAttribute,
  clippedVertices: boolean[]
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < positionAttribute.count; i++) {
    if (clippedVertices[i]) continue; // Skip clipped vertices

    const y = positionAttribute.getY(i);
    if (y < min) min = y;
    if (y > max) max = y;
  }

  // Handle edge case where all vertices are clipped
  if (min === Infinity) {
    min = 0;
    max = 0;
  }

  return { min, max };
}
