/**
 * Sculpture Types
 *
 * Core types for 3D printed route sculptures feature (Phase 4).
 * Defines product mode, sculpture configuration, and defaults.
 */

/**
 * Product mode toggle between 2D poster and 3D sculpture preview
 */
export type ProductMode = 'poster' | 'sculpture';

/**
 * Base style for the sculpture platform
 */
export type SculptureBaseStyle = 'rectangular' | 'circular' | 'organic' | 'terrain';

/**
 * Material options for 3D printing
 */
export type SculptureMaterial = 'pla' | 'wood' | 'resin';

/**
 * Sculpture configuration for 3D preview and export
 */
export interface SculptureConfig {
  /** Base platform style */
  baseStyle: SculptureBaseStyle;
  /** Physical size in cm (10, 15, 20) */
  size: number;
  /** 3D printing material */
  material: SculptureMaterial;
  /** Route tube thickness in mm */
  routeThickness: number;
  /** Elevation scale multiplier for terrain and route height */
  elevationScale: number;
  /** Whether to show the base platform */
  showBase: boolean;
  /** Base platform height in mm */
  baseHeight: number;
  /** Terrain mesh resolution (grid segments) */
  terrainResolution: number;
  /** Terrain color */
  terrainColor: string;
  /** Route tube color */
  routeColor: string;
}

/**
 * Default sculpture configuration
 */
export const DEFAULT_SCULPTURE_CONFIG: SculptureConfig = {
  baseStyle: 'rectangular',
  size: 15,
  material: 'pla',
  routeThickness: 2,
  elevationScale: 1.5,
  showBase: true,
  baseHeight: 5,
  terrainResolution: 64,
  terrainColor: '#8b7355',
  routeColor: '#4ade80',
};

/**
 * Material display information for UI
 */
export const SCULPTURE_MATERIALS: Record<
  SculptureMaterial,
  { label: string; description: string }
> = {
  pla: { label: 'PLA', description: 'Standard plastic, vibrant colors' },
  wood: { label: 'Wood PLA', description: 'Wood-fill filament, natural texture' },
  resin: { label: 'Resin', description: 'High detail, smooth finish' },
};

/**
 * Base style display information for UI
 */
export const SCULPTURE_BASE_STYLES: Record<
  SculptureBaseStyle,
  { label: string; description: string }
> = {
  rectangular: { label: 'Rectangular', description: 'Clean square platform' },
  circular: { label: 'Circular', description: 'Round platform' },
  organic: { label: 'Organic', description: 'Follows route bounds' },
  terrain: { label: 'Terrain', description: 'Full 3D terrain base' },
};

/**
 * Available size options in cm
 */
export const SCULPTURE_SIZES = [10, 15, 20] as const;
