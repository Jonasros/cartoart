import type { ColorPalette } from '@/types/poster';
import { isColorDark } from '@/lib/utils';

export type Building2DStyle = 'fill' | 'sketch' | 'outline';

export interface Building2DLayerOptions {
  style?: Building2DStyle;
  fillOpacity?: number;
  strokeWidth?: number;
  strokeOpacity?: number;
}

/**
 * Style presets for 2D buildings
 */
export const building2DStylePresets = {
  fill: {
    label: 'Fill',
    description: 'Classic filled buildings',
    fillOpacity: 0.15,
    strokeWidth: 0,
    strokeOpacity: 0
  },
  sketch: {
    label: 'Sketch',
    description: 'Hand-drawn pencil effect',
    fillOpacity: 0.03,
    strokeWidth: 0.8,
    strokeOpacity: 0.6
  },
  outline: {
    label: 'Outline',
    description: 'Clean outline only',
    fillOpacity: 0,
    strokeWidth: 1.0,
    strokeOpacity: 0.8
  },
} as const;

/**
 * Creates 2D building layers with various artistic styles.
 * Returns an array of layers (fill and optionally stroke).
 */
export function createBuilding2DLayers(
  palette: ColorPalette,
  options: Building2DLayerOptions = {}
): any[] {
  const {
    style = 'fill',
    fillOpacity: customFillOpacity,
    strokeWidth: customStrokeWidth,
    strokeOpacity: customStrokeOpacity,
  } = options;

  const preset = building2DStylePresets[style];
  const isDark = isColorDark(palette.background);

  const buildingColor = palette.buildings || palette.primary || palette.secondary || palette.text;

  // Calculate stroke color - darker/lighter than building color for contrast
  const strokeColor = isDark
    ? palette.text || '#ffffff'
    : buildingColor;

  const layers: any[] = [];

  // Fill layer (always present, opacity may be 0)
  const effectiveFillOpacity = customFillOpacity ?? preset.fillOpacity;
  layers.push({
    id: 'buildings',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'building',
    paint: {
      'fill-color': buildingColor,
      'fill-opacity': effectiveFillOpacity,
    },
  });

  // Stroke/outline layer for sketch and outline styles
  const effectiveStrokeWidth = customStrokeWidth ?? preset.strokeWidth;
  const effectiveStrokeOpacity = customStrokeOpacity ?? preset.strokeOpacity;

  if (effectiveStrokeWidth > 0) {
    layers.push({
      id: 'buildings-outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'building',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': strokeColor,
        'line-width': [
          'interpolate', ['linear'], ['zoom'],
          10, effectiveStrokeWidth * 0.3,
          12, effectiveStrokeWidth * 0.5,
          14, effectiveStrokeWidth * 0.8,
          16, effectiveStrokeWidth,
          18, effectiveStrokeWidth * 1.2,
        ],
        'line-opacity': [
          'interpolate', ['linear'], ['zoom'],
          10, effectiveStrokeOpacity * 0.3,
          12, effectiveStrokeOpacity * 0.6,
          14, effectiveStrokeOpacity * 0.8,
          16, effectiveStrokeOpacity,
        ],
      },
    });
  }

  return layers;
}

/**
 * Get layer IDs that would be created for a given style
 */
export function getBuilding2DLayerIds(style: Building2DStyle = 'fill'): string[] {
  const ids = ['buildings'];
  if (style === 'sketch' || style === 'outline') {
    ids.push('buildings-outline');
  }
  return ids;
}
