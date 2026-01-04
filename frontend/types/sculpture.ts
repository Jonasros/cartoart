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
 * Base shape for the sculpture platform
 */
export type SculptureShape = 'rectangular' | 'circular';

/**
 * Route rendering style
 */
export type SculptureRouteStyle = 'raised' | 'engraved';

/**
 * Material options for 3D printing
 */
export type SculptureMaterial = 'pla' | 'wood' | 'resin';

/**
 * Text configuration for engraved typography
 */
export interface SculptureTextConfig {
  /** Main title text (e.g., route name) */
  title: string;
  /** Subtitle/stats text (e.g., "79.3 km · 3,887 m↑") */
  subtitle: string;
  /** Whether to show text on sculpture */
  enabled: boolean;
  /** Engraving depth in mm */
  depth: number;
}

/**
 * Sculpture configuration for 3D preview and export
 */
export interface SculptureConfig {
  /** Base platform shape */
  shape: SculptureShape;
  /** Physical size in cm (10, 15, 20) */
  size: number;
  /** 3D printing material */
  material: SculptureMaterial;
  /** Route rendering style */
  routeStyle: SculptureRouteStyle;
  /** Route thickness in mm */
  routeThickness: number;
  /** Elevation scale multiplier for terrain height */
  elevationScale: number;
  /** Whether to show the base platform */
  showBase: boolean;
  /** Base platform height in mm */
  baseHeight: number;
  /** Rim height in mm (raised border around edge) */
  rimHeight: number;
  /** Terrain mesh resolution (grid segments) */
  terrainResolution: number;
  /** Terrain color */
  terrainColor: string;
  /** Route color */
  routeColor: string;
  /** Text configuration */
  text: SculptureTextConfig;
  /** Terrain rotation in degrees (-1 = auto-orient start to front) */
  terrainRotation: number;
}

/**
 * Default text configuration
 */
export const DEFAULT_TEXT_CONFIG: SculptureTextConfig = {
  title: '',
  subtitle: '',
  enabled: true,
  depth: 0.8,
};

/**
 * Default sculpture configuration
 */
export const DEFAULT_SCULPTURE_CONFIG: SculptureConfig = {
  shape: 'circular',
  size: 15,
  material: 'pla',
  routeStyle: 'engraved',
  routeThickness: 2,
  elevationScale: 1.5,
  showBase: true,
  baseHeight: 5,
  rimHeight: 2,
  terrainResolution: 128, // Higher resolution for smoother terrain
  terrainColor: '#8b7355',
  routeColor: '#4ade80',
  text: DEFAULT_TEXT_CONFIG,
  terrainRotation: -1, // -1 = auto-orient start point to front
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
 * Shape display information for UI
 */
export const SCULPTURE_SHAPES: Record<
  SculptureShape,
  { label: string; description: string }
> = {
  circular: { label: 'Medallion', description: 'Round coin-style with rim' },
  rectangular: { label: 'Plaque', description: 'Rectangular with border' },
};

/**
 * Route style display information for UI
 */
export const SCULPTURE_ROUTE_STYLES: Record<
  SculptureRouteStyle,
  { label: string; description: string }
> = {
  engraved: { label: 'Engraved', description: 'Carved groove in surface' },
  raised: { label: 'Raised', description: 'Elevated tube above terrain' },
};

/**
 * Available size options in cm
 */
export const SCULPTURE_SIZES = [10, 15, 20] as const;
