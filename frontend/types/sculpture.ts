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
 * Terrain colorization preset identifiers (preview-only feature)
 * - 'none': Single solid color (current behavior)
 * - 'natural': Blue (water) → Green (forest) → Brown (hills) → White (snow)
 * - 'earth': Warm brown gradient for desert/arid terrain
 * - 'topo': Classic topographic map colors
 * - 'mono': Single color gradient (dark to light)
 * - 'custom': User-defined 3-color gradient
 */
export type TerrainColorPreset = 'none' | 'natural' | 'earth' | 'topo' | 'mono' | 'custom';

/**
 * A color stop in a gradient (position 0-1, hex color)
 */
export interface ColorStop {
  position: number;
  color: string;
}

/**
 * Configuration for terrain colorization (preview-only feature)
 * Note: Colorization is for visualization inspiration only.
 * STL exports remain single-color for 3D printing.
 */
export interface TerrainColorizationConfig {
  /** Enable/disable colorization */
  enabled: boolean;
  /** Selected color preset */
  preset: TerrainColorPreset;
  /** Custom colors when preset is 'custom' */
  customColors: {
    low: string;   // Lowest elevation color
    mid: string;   // Middle elevation color
    high: string;  // Highest elevation color
  };
  /** Gradient smoothness (0 = stepped bands, 1 = smooth interpolation) */
  smoothness: number;
}

/**
 * Default colorization configuration
 */
export const DEFAULT_COLORIZATION_CONFIG: TerrainColorizationConfig = {
  enabled: false,
  preset: 'natural',
  customColors: {
    low: '#4a7c59',   // Forest green
    mid: '#b8860b',   // Goldenrod/brown
    high: '#f5f5f5',  // Off-white/snow
  },
  smoothness: 0.8,
};

/**
 * Predefined color stops for each colorization preset
 */
export const TERRAIN_COLOR_PRESETS: Record<
  Exclude<TerrainColorPreset, 'none' | 'custom'>,
  { name: string; description: string; stops: ColorStop[] }
> = {
  natural: {
    name: 'Natural',
    description: 'Water → Forest → Hills → Snow',
    stops: [
      { position: 0.0, color: '#1a5f7a' },   // Deep water blue
      { position: 0.15, color: '#4a7c59' },  // Forest green
      { position: 0.4, color: '#8fbc8f' },   // Light green meadows
      { position: 0.6, color: '#daa520' },   // Goldenrod hills
      { position: 0.8, color: '#8b7355' },   // Brown mountains
      { position: 1.0, color: '#f5f5f5' },   // Snow peaks
    ],
  },
  earth: {
    name: 'Earth Tones',
    description: 'Warm brown gradient for arid terrain',
    stops: [
      { position: 0.0, color: '#3d2914' },   // Dark brown
      { position: 0.3, color: '#8b5a2b' },   // Saddle brown
      { position: 0.6, color: '#d2691e' },   // Chocolate
      { position: 1.0, color: '#f4e4d4' },   // Light sand
    ],
  },
  topo: {
    name: 'Topographic',
    description: 'Classic topo map green-yellow-red',
    stops: [
      { position: 0.0, color: '#006400' },   // Dark green
      { position: 0.25, color: '#9acd32' },  // Yellow-green
      { position: 0.5, color: '#ffd700' },   // Gold
      { position: 0.75, color: '#cd853f' },  // Peru/tan
      { position: 0.9, color: '#a0522d' },   // Sienna
      { position: 1.0, color: '#ffffff' },   // White
    ],
  },
  mono: {
    name: 'Monochrome',
    description: 'Single color gradient dark to light',
    stops: [
      { position: 0.0, color: '#2d2d2d' },   // Dark gray
      { position: 0.5, color: '#6b6b6b' },   // Medium gray
      { position: 1.0, color: '#e8e8e8' },   // Light gray
    ],
  },
};

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
  /** Terrain colorization configuration (preview-only feature) */
  colorization?: TerrainColorizationConfig;
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
  colorization: DEFAULT_COLORIZATION_CONFIG,
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
