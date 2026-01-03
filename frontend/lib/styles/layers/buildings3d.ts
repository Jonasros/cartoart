import type { ColorPalette } from '@/types/poster';

export type Building3DStyle = 'solid' | 'glass' | 'wireframe' | 'gradient';

export interface Building3DLayerOptions {
    heightScale?: number;      // Height exaggeration multiplier (default: 1)
    defaultHeight?: number;    // Fallback height for buildings without data (default: 6m)
    opacity?: number;          // Fill extrusion opacity (default: 0.9)
    minZoom?: number;          // Minimum zoom to show 3D buildings (default: 10)
    style?: Building3DStyle;   // Artistic rendering style
    // Lighting options
    lightAnchor?: 'map' | 'viewport';
    lightPosition?: [number, number, number]; // [radial, azimuth, polar]
    lightColor?: string;
    lightIntensity?: number;
}

/**
 * Artistic style presets for 3D buildings
 */
export const buildingStylePresets = {
    solid: { label: 'Solid', description: 'Classic opaque buildings', opacity: 1.0, verticalGradient: true },
    glass: { label: 'Glass', description: 'Transparent see-through effect', opacity: 0.4, verticalGradient: false },
    wireframe: { label: 'Wireframe', description: 'Outline-only sketch look', opacity: 0.15, verticalGradient: false },
    gradient: { label: 'Gradient', description: 'Height-based color fade', opacity: 0.85, verticalGradient: true },
} as const;

/**
 * Creates a 3D building extrusion layer using MapLibre's fill-extrusion type.
 * Uses OpenMapTiles render_height property with intelligent fallbacks.
 * Supports multiple artistic styles: solid, glass, wireframe, gradient.
 */
export function createBuilding3DLayer(
    palette: ColorPalette,
    options: Building3DLayerOptions = {}
): any {
    const {
        heightScale = 1,
        defaultHeight = 6,
        opacity: customOpacity,
        minZoom = 8,
        style = 'solid',
    } = options;

    // Get style preset settings
    const stylePreset = buildingStylePresets[style];
    const finalOpacity = customOpacity ?? stylePreset.opacity;

    // Get colors from palette's 3D config or fall back to building color
    const baseColor = palette.buildings || '#d4d4d4';
    const colors = palette.building3D || {
        colorLow: baseColor,
        colorMid: palette.buildings || '#a3a3a3',
        colorHigh: palette.buildings || '#737373',
        opacity: finalOpacity,
    };

    // Height expression with fallbacks:
    // 1. Use render_height if available (pre-calculated by OpenMapTiles from OSM)
    // 2. Fall back to defaultHeight
    const heightExpression = [
        '*',
        heightScale,
        [
            'coalesce',
            ['get', 'render_height'],
            defaultHeight
        ]
    ];

    // Base height for buildings on podiums
    const baseHeightExpression = [
        'coalesce',
        ['get', 'render_min_height'],
        0
    ];

    // Style-specific color expressions
    let colorExpression: any;

    switch (style) {
        case 'glass':
            // Glass: Single semi-transparent color with subtle height variation
            colorExpression = [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], defaultHeight],
                0, colors.colorLow,
                100, colors.colorMid,
            ];
            break;

        case 'wireframe':
            // Wireframe: Very light, almost outline-only appearance
            colorExpression = baseColor;
            break;

        case 'gradient':
            // Gradient: Strong height-based color variation
            colorExpression = [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], defaultHeight],
                0, colors.colorLow,
                20, colors.colorLow,
                50, colors.colorMid,
                80, colors.colorHigh,
                150, colors.colorHigh,
            ];
            break;

        case 'solid':
        default:
            // Solid: Standard height-based gradient
            colorExpression = [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', 'render_height'], defaultHeight],
                0, colors.colorLow,
                30, colors.colorMid,
                100, colors.colorHigh,
            ];
            break;
    }

    return {
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: minZoom,
        filter: [
            'all',
            ['==', ['geometry-type'], 'Polygon'],
            // Exclude building outlines marked for 2D only
            ['!=', ['get', 'hide_3d'], true]
        ],
        paint: {
            'fill-extrusion-color': colorExpression,
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                // Animate height as user zooms in
                minZoom, 0,
                minZoom + 0.5, heightExpression,
            ],
            'fill-extrusion-base': baseHeightExpression,
            'fill-extrusion-opacity': finalOpacity,
            'fill-extrusion-vertical-gradient': stylePreset.verticalGradient,
        },
    };
}

/**
 * Camera presets for common 3D poster compositions
 */
export const cameraPresets = {
    isometric: { pitch: 45, bearing: 45 },
    skyline: { pitch: 60, bearing: -15 },
    birdseye: { pitch: 35, bearing: 0 },
    architectural: { pitch: 55, bearing: 30 },
} as const;

export type CameraPreset = keyof typeof cameraPresets;

/**
 * Light presets for different times of day/atmospheres
 */
export const lightPresets = {
    morning: { position: [1.5, 90, 60], color: '#FDF4E3', intensity: 0.35 },
    noon: { position: [1.5, 180, 25], color: '#FFFFFF', intensity: 0.45 },
    evening: { position: [1.5, 270, 55], color: '#FFD4A0', intensity: 0.4 },
    night: { position: [1.5, 180, 80], color: '#B8D4F0', intensity: 0.2 },
} as const;

export type LightPreset = keyof typeof lightPresets;

/**
 * Creates a global light object for the MapLibre style
 */
export function createBuilding3DLight(
    palette: ColorPalette,
    options: Partial<Building3DLayerOptions> = {}
): any {
    const {
        lightAnchor = 'viewport',
        lightPosition = lightPresets.noon.position,
        lightColor = palette.building3D?.lightColor || lightPresets.noon.color,
        lightIntensity = palette.building3D?.lightIntensity ?? lightPresets.noon.intensity,
    } = options;

    return {
        anchor: lightAnchor,
        position: lightPosition,
        color: lightColor,
        intensity: lightIntensity,
    };
}
