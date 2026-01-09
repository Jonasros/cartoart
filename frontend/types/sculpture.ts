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
 * Terrain data source mode
 * - 'route': Interpolate elevation from route points only (simpler, faster)
 * - 'terrain': Fetch real terrain-rgb data from MapTiler (detailed, slower)
 */
export type SculptureTerrainMode = 'route' | 'terrain';

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
  /** Base/platform color (optional, defaults to terrain color) */
  baseColor?: string;
  /** Text configuration */
  text: SculptureTextConfig;
  /** Terrain rotation in degrees (-1 = auto-orient start to front) */
  terrainRotation: number;
  /** Terrain data source mode */
  terrainMode: SculptureTerrainMode;
  /** Maximum terrain height as fraction of elevation scale (0.3-1.0) - for 3D printability */
  terrainHeightLimit: number;
  /** Distance around route where terrain is lowered to ensure visibility (0-0.15) */
  routeClearance: number;
  /** Terrain smoothing passes for better 3D printing (0-3) */
  terrainSmoothing: number;
  /** Enable auto-rotation turntable animation for preview */
  turntableEnabled?: boolean;
  /** Turntable rotation speed (rotations per 10 seconds, default 0.3) */
  turntableSpeed?: number;
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
  terrainMode: 'route', // Default to route-based terrain (faster)
  terrainHeightLimit: 0.8, // 80% of elevation scale - keeps terrain printable
  routeClearance: 0.05, // Terrain dips near route for visibility
  terrainSmoothing: 1, // One smoothing pass for gentle terrain
  turntableEnabled: false, // Auto-rotation disabled by default
  turntableSpeed: 0.3, // Slow rotation for hero shots
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

/**
 * Terrain mode display information for UI
 */
export const SCULPTURE_TERRAIN_MODES: Record<
  SculptureTerrainMode,
  { label: string; description: string }
> = {
  route: { label: 'Route Only', description: 'Use route elevation data (fast)' },
  terrain: { label: 'Full Terrain', description: 'Fetch real terrain data (detailed)' },
};

/**
 * Style preset identifier
 */
export type SculptureStylePreset = 'balanced' | 'dramatic' | 'subtle' | 'detailed' | 'smooth';

/**
 * Style preset configuration (partial config to apply)
 */
export interface StylePresetConfig {
  elevationScale: number;
  terrainHeightLimit: number;
  routeClearance: number;
  terrainSmoothing: number;
  terrainMode: SculptureTerrainMode;
  terrainResolution: number;
}

/**
 * Style presets for different terrain looks and use cases
 */
export const SCULPTURE_STYLE_PRESETS: Record<
  SculptureStylePreset,
  { label: string; description: string; config: StylePresetConfig }
> = {
  balanced: {
    label: 'Balanced',
    description: 'Good for most routes',
    config: {
      elevationScale: 1.5,
      terrainHeightLimit: 0.8,
      routeClearance: 0.05,
      terrainSmoothing: 1,
      terrainMode: 'route',
      terrainResolution: 128,
    },
  },
  dramatic: {
    label: 'Dramatic',
    description: 'Bold elevation for mountain routes',
    config: {
      elevationScale: 2.5,
      terrainHeightLimit: 1.0,
      routeClearance: 0.08,
      terrainSmoothing: 0,
      terrainMode: 'terrain',
      terrainResolution: 128,
    },
  },
  subtle: {
    label: 'Subtle',
    description: 'Gentle terrain for flat routes',
    config: {
      elevationScale: 1.0,
      terrainHeightLimit: 0.6,
      routeClearance: 0.03,
      terrainSmoothing: 2,
      terrainMode: 'route',
      terrainResolution: 96,
    },
  },
  detailed: {
    label: 'Detailed',
    description: 'Maximum terrain detail',
    config: {
      elevationScale: 1.8,
      terrainHeightLimit: 0.9,
      routeClearance: 0.06,
      terrainSmoothing: 1,
      terrainMode: 'terrain',
      terrainResolution: 192,
    },
  },
  smooth: {
    label: 'Smooth',
    description: 'Gentle curves, polished look',
    config: {
      elevationScale: 1.2,
      terrainHeightLimit: 0.7,
      routeClearance: 0.05,
      terrainSmoothing: 2,
      terrainMode: 'route',
      terrainResolution: 128,
    },
  },
};
