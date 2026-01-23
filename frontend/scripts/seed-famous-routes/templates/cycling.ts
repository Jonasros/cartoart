/**
 * Poster templates for cycling routes
 * Tour de France, Giro d'Italia, iconic climbs
 */

import type { PosterTemplate } from '../types';

/**
 * Tour de France Yellow - Classic yellow route on terrain
 */
export const tdfYellow: PosterTemplate = {
  id: 'cycling-tdf-yellow',
  name: 'Tour de France Yellow',
  styleId: 'topographic',
  paletteId: 'topographic-classic',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 3.5, // Scale 0-15 (reduced from 10.5 to prevent overflow)
    titleWeight: 700,
    titleLetterSpacing: 1,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 2.2, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'gradient',
    backdropHeight: 25,
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
    terrain3dExaggeration: 1.5,
    contours: true,
    labels: false,
  },
  route: {
    color: '#FFD700', // Tour de France yellow
    width: 4,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#EF4444',
  },
};

/**
 * Cycling Classic - Clean minimal look
 */
export const cyclingClassic: PosterTemplate = {
  id: 'cycling-classic',
  name: 'Cycling Classic',
  styleId: 'minimal',
  paletteId: 'minimal-charcoal',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 3.5, // Scale 0-15 (reduced from 10 to prevent overflow)
    titleWeight: 600,
    titleLetterSpacing: 0.5,
    titleAllCaps: false,
    subtitleFont: 'DM Sans',
    subtitleSize: 2.2, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: true,
    position: 'bottom',
    textBackdrop: 'subtle',
    backdropHeight: 22,
    backdropAlpha: 0.7,
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
    terrain: true,
    terrain3d: false,
    contours: false,
    labels: true,
  },
  route: {
    color: '#E74C3C',
    width: 3,
    opacity: 0.9,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#E74C3C',
  },
};

/**
 * Mountain Stage - Emphasizes elevation
 */
export const mountainStage: PosterTemplate = {
  id: 'cycling-mountain',
  name: 'Mountain Stage',
  styleId: 'topographic',
  paletteId: 'topographic-terrain',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 3.5, // Scale 0-15 (reduced from 9.5 to prevent overflow)
    titleWeight: 700,
    titleLetterSpacing: 1,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 2.2, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'strong',
    backdropHeight: 28,
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
 * Giro Rosa - Pink theme for Giro d'Italia
 */
export const giroRosa: PosterTemplate = {
  id: 'cycling-giro-rosa',
  name: 'Giro Rosa',
  styleId: 'minimal',
  paletteId: 'minimal-blush',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 3.5, // Scale 0-15 (reduced from 10.5 to prevent overflow)
    titleWeight: 700,
    titleLetterSpacing: 1,
    titleAllCaps: true,
    subtitleFont: 'DM Sans',
    subtitleSize: 2.2, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: false,
    position: 'bottom',
    textBackdrop: 'gradient',
    backdropHeight: 25,
    backdropAlpha: 0.85,
  },
  format: {
    aspectRatio: '2:3',
    orientation: 'portrait',
    margin: 0,
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
    labels: false,
  },
  route: {
    color: '#E91E8C', // Giro pink
    width: 4,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#22C55E',
    endColor: '#E91E8C',
  },
};

/**
 * Midnight Rider - Dark theme
 */
export const midnightRider: PosterTemplate = {
  id: 'cycling-midnight',
  name: 'Midnight Rider',
  styleId: 'dark-mode',
  paletteId: 'dark-neon',
  typography: {
    titleFont: 'DM Sans',
    titleSize: 3.5, // Scale 0-15 (reduced from 10 to prevent overflow)
    titleWeight: 600,
    titleLetterSpacing: 0.5,
    titleAllCaps: false,
    subtitleFont: 'DM Sans',
    subtitleSize: 2.2, // Scale 0-8
    showTitle: true,
    showSubtitle: true,
    showCoordinates: true,
    position: 'bottom',
    textBackdrop: 'subtle',
    backdropHeight: 20,
    backdropAlpha: 0.6,
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
    color: '#00FFFF', // Cyan neon
    width: 3,
    opacity: 1,
    lineStyle: 'solid',
    showStartEnd: true,
    startColor: '#00FF88',
    endColor: '#FF00FF',
  },
};

// Export all cycling templates
export const cyclingTemplates: Record<string, PosterTemplate> = {
  'cycling-tdf-yellow': tdfYellow,
  'cycling-classic': cyclingClassic,
  'cycling-mountain': mountainStage,
  'cycling-giro-rosa': giroRosa,
  'cycling-midnight': midnightRider,
};

/**
 * Get template for a cycling route based on type
 */
export function getCyclingTemplate(
  type: 'flat' | 'hills' | 'mountains' | 'itt',
  race?: 'tdf' | 'giro' | 'vuelta'
): PosterTemplate {
  // Tour de France gets yellow theme
  if (race === 'tdf') {
    return type === 'mountains' ? mountainStage : tdfYellow;
  }

  // Giro gets pink theme
  if (race === 'giro') {
    return type === 'mountains' ? mountainStage : giroRosa;
  }

  // Default based on terrain
  switch (type) {
    case 'mountains':
      return mountainStage;
    case 'flat':
    case 'hills':
    default:
      return cyclingClassic;
  }
}
