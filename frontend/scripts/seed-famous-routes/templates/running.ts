/**
 * Poster templates for running routes
 * Marathons, ultra trails, city runs
 */

import type { PosterTemplate } from '../types';

/**
 * Marathon City - Clean urban look for city marathons
 */
export const marathonCity: PosterTemplate = {
  id: 'running-marathon-city',
  name: 'Marathon City',
  styleId: 'minimal',
  paletteId: 'minimal-ink',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 11, // Scale 0-15
    titleWeight: 700,
    titleLetterSpacing: 0,
    titleAllCaps: false,
    subtitleFont: 'DM Sans',
    subtitleSize: 4.5, // Scale 0-8
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
    margin: 5,
    borderStyle: 'thin',
  },
  layers: {
    streets: true,
    buildings: false,
    water: true,
    parks: true,
    terrain: false,
    terrain3d: false,
    contours: false,
    labels: true,
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
 * Ultra Dark - Dark theme for ultra marathons
 */
export const ultraDark: PosterTemplate = {
  id: 'running-ultra-dark',
  name: 'Ultra Dark',
  styleId: 'dark-mode',
  paletteId: 'dark-default',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 10, // Scale 0-15
    titleWeight: 700,
    titleLetterSpacing: 1,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 3.75, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'subtle',
    backdropHeight: 22,
    backdropAlpha: 0.6,
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
    contours: false,
    labels: false,
  },
  route: {
    color: '#FF4444',
    width: 3,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#FF4444',
  },
};

/**
 * Ultra Terrain - Topographic style for trail ultras
 */
export const ultraTerrain: PosterTemplate = {
  id: 'running-ultra-terrain',
  name: 'Ultra Terrain',
  styleId: 'topographic',
  paletteId: 'topographic-terrain',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 10.5, // Scale 0-15
    titleWeight: 700,
    titleLetterSpacing: 1,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 3.5, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'strong',
    backdropHeight: 26,
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
    terrain3dExaggeration: 2.0,
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
 * Boston Blue - Blue theme inspired by Boston Marathon
 */
export const bostonBlue: PosterTemplate = {
  id: 'running-boston',
  name: 'Boston Blue',
  styleId: 'minimal',
  paletteId: 'minimal-navy',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 11, // Scale 0-15
    titleWeight: 700,
    titleLetterSpacing: 0,
    titleAllCaps: false,
    subtitleFont: 'DM Sans',
    subtitleSize: 4.5, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: true,
    position: 'bottom',
    textBackdrop: 'gradient',
    backdropHeight: 26,
    backdropAlpha: 0.85,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 4,
    borderStyle: 'thin',
  },
  layers: {
    streets: true,
    buildings: false,
    water: true,
    parks: true,
    terrain: false,
    terrain3d: false,
    contours: false,
    labels: true,
  },
  route: {
    color: '#FFD700', // Gold/yellow for BAA
    width: 4,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#1E3A5F',
  },
};

/**
 * Neon Runner - Vibrant city running look
 */
export const neonRunner: PosterTemplate = {
  id: 'running-neon',
  name: 'Neon Runner',
  styleId: 'dark-mode',
  paletteId: 'dark-neon',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 10.5, // Scale 0-15
    titleWeight: 600,
    titleLetterSpacing: 0.5,
    titleAllCaps: false,
    subtitleFont: 'DM Sans',
    subtitleSize: 4, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: true,
    position: 'bottom',
    textBackdrop: 'none',
    backdropHeight: 20,
    backdropAlpha: 0.5,
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
    terrain: false,
    terrain3d: false,
    contours: false,
    labels: true,
  },
  route: {
    color: '#00FFFF',
    width: 3,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#00FF88',
    endColor: '#FF00FF',
  },
};

// Export all running templates
export const runningTemplates: Record<string, PosterTemplate> = {
  'running-marathon-city': marathonCity,
  'running-ultra-dark': ultraDark,
  'running-ultra-terrain': ultraTerrain,
  'running-boston': bostonBlue,
  'running-neon': neonRunner,
};

/**
 * Get template for a running route based on type
 */
export function getRunningTemplate(
  type: 'marathon' | 'ultra' | 'trail' | 'city',
  majorRace?: 'boston' | 'london' | 'berlin' | 'chicago' | 'nyc' | 'tokyo'
): PosterTemplate {
  // Special templates for major marathons
  if (majorRace === 'boston') {
    return bostonBlue;
  }

  // Type-based selection
  switch (type) {
    case 'ultra':
    case 'trail':
      return ultraTerrain;
    case 'marathon':
      return marathonCity;
    case 'city':
    default:
      return neonRunner;
  }
}
