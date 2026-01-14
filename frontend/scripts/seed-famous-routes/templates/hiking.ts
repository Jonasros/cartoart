/**
 * Poster templates for hiking trails
 * Long-distance trails, iconic hikes
 */

import type { PosterTemplate } from '../types';

/**
 * Trail Explorer - Topographic adventure look
 */
export const trailExplorer: PosterTemplate = {
  id: 'hiking-explorer',
  name: 'Trail Explorer',
  styleId: 'topographic',
  paletteId: 'topographic-classic',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 10, // Scale 0-15
    titleWeight: 700,
    titleLetterSpacing: 0.5,
    titleAllCaps: false,
    subtitleFont: 'DM Sans',
    subtitleSize: 4, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: true,
    position: 'bottom',
    textBackdrop: 'gradient',
    backdropHeight: 28,
    backdropAlpha: 0.85,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 0,
    borderStyle: 'none',
  },
  layers: {
    streets: false,
    buildings: false,
    water: true,
    parks: true,
    terrain: true,
    terrain3d: true,
    terrain3dExaggeration: 1.8,
    contours: true,
    labels: false,
  },
  route: {
    color: '#E74C3C',
    width: 3,
    opacity: 0.95,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#EF4444',
  },
};

/**
 * Vintage Map - Old explorer aesthetic
 */
export const vintageMap: PosterTemplate = {
  id: 'hiking-vintage',
  name: 'Vintage Explorer',
  styleId: 'vintage',
  paletteId: 'vintage-sepia',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 9.5, // Scale 0-15
    titleWeight: 600,
    titleLetterSpacing: 2,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 3.5, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'subtle',
    backdropHeight: 22,
    backdropAlpha: 0.7,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 5,
    borderStyle: 'double',
  },
  layers: {
    streets: false,
    buildings: false,
    water: true,
    parks: true,
    terrain: true,
    terrain3d: false,
    contours: true,
    labels: true,
  },
  route: {
    color: '#8B4513',
    width: 3,
    opacity: 0.9,
    lineStyle: 'dashed',
    showStartEnd: true,
    startColor: '#228B22',
    endColor: '#8B0000',
  },
};

/**
 * Mountain Adventure - High contrast terrain
 */
export const mountainAdventure: PosterTemplate = {
  id: 'hiking-mountain',
  name: 'Mountain Adventure',
  styleId: 'topographic',
  paletteId: 'topographic-terrain',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 10.5, // Scale 0-15
    titleWeight: 700,
    titleLetterSpacing: 1,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 3.75, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'strong',
    backdropHeight: 25,
    backdropAlpha: 0.9,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 0,
    borderStyle: 'none',
  },
  layers: {
    streets: false,
    buildings: false,
    water: true,
    parks: true,
    terrain: true,
    terrain3d: true,
    terrain3dExaggeration: 2.2,
    contours: true,
    labels: false,
  },
  route: {
    color: '#FF6B35',
    width: 4,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#DC2626',
  },
};

/**
 * Forest Trail - Green nature emphasis
 */
export const forestTrail: PosterTemplate = {
  id: 'hiking-forest',
  name: 'Forest Trail',
  styleId: 'minimal',
  paletteId: 'minimal-sage',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 10, // Scale 0-15
    titleWeight: 600,
    titleLetterSpacing: 0.5,
    titleAllCaps: false,
    subtitleFont: 'DM Sans',
    subtitleSize: 4, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: true,
    position: 'bottom',
    textBackdrop: 'subtle',
    backdropHeight: 24,
    backdropAlpha: 0.75,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 4,
    borderStyle: 'thin',
  },
  layers: {
    streets: false,
    buildings: false,
    water: true,
    parks: true,
    terrain: true,
    terrain3d: true,
    terrain3dExaggeration: 1.5,
    contours: false,
    labels: true,
  },
  route: {
    color: '#2E7D32',
    width: 3,
    opacity: 0.9,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#4CAF50',
    endColor: '#1B5E20',
  },
};

/**
 * Camino Style - Pilgrim path aesthetic
 */
export const caminoStyle: PosterTemplate = {
  id: 'hiking-camino',
  name: 'Pilgrim Path',
  styleId: 'minimal',
  paletteId: 'minimal-copper',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 9.5, // Scale 0-15
    titleWeight: 600,
    titleLetterSpacing: 1.5,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 3.5, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'gradient',
    backdropHeight: 26,
    backdropAlpha: 0.8,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 3,
    borderStyle: 'none',
  },
  layers: {
    streets: true,
    buildings: false,
    water: true,
    parks: true,
    terrain: true,
    terrain3d: false,
    contours: false,
    labels: true,
  },
  route: {
    color: '#D4A574', // Warm tan/ochre
    width: 4,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#B8860B',
  },
};

// Export all hiking templates
export const hikingTemplates: Record<string, PosterTemplate> = {
  'hiking-explorer': trailExplorer,
  'hiking-vintage': vintageMap,
  'hiking-mountain': mountainAdventure,
  'hiking-forest': forestTrail,
  'hiking-camino': caminoStyle,
};

/**
 * Get template for a hiking trail based on characteristics
 */
export function getHikingTemplate(
  terrain: 'alpine' | 'forest' | 'coastal' | 'desert' | 'mixed',
  isLongDistance?: boolean,
  isPilgrimage?: boolean
): PosterTemplate {
  // Pilgrimage routes get special treatment
  if (isPilgrimage) {
    return caminoStyle;
  }

  // Terrain-based selection
  switch (terrain) {
    case 'alpine':
      return mountainAdventure;
    case 'forest':
      return forestTrail;
    case 'coastal':
    case 'desert':
      return vintageMap;
    case 'mixed':
    default:
      return isLongDistance ? trailExplorer : forestTrail;
  }
}
