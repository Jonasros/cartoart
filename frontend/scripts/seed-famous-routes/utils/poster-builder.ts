/**
 * Poster config builder
 * Converts RouteEntry + RouteData into a complete PosterConfig
 */

import { getStyleById } from '../../../lib/styles';
import type { PosterConfig, RouteData, RouteConfig } from '../../../types/poster';
import type { RouteEntry, PosterTemplate } from '../types';
import { getTemplateById, getDefaultTemplate } from '../templates';
import { calculateCenter, calculateZoom } from './gpx-parser';

/**
 * Build a complete PosterConfig from route entry and data
 */
export function buildPosterConfig(
  entry: RouteEntry,
  routeData: RouteData,
  providedTemplate?: PosterTemplate
): PosterConfig {
  // Use provided template, or get from entry, or use default for category
  let template = providedTemplate;

  if (!template) {
    template = entry.template
      ? getTemplateById(entry.template)
      : getDefaultTemplate(entry.category);
  }

  if (!template) {
    throw new Error(`Template not found: ${entry.template}`);
  }

  // Get style and palette
  const style = getStyleById(template.styleId);
  if (!style) {
    throw new Error(`Style not found: ${template.styleId}`);
  }

  // Find palette in style
  let palette = style.palettes.find((p) => p.id === template.paletteId);
  if (!palette) {
    // Fallback to default palette
    palette = style.defaultPalette;
  }

  // Calculate map center and zoom from route data
  const center = calculateCenter(routeData);
  const zoom = calculateZoom(routeData);

  // Build location from route data
  const location = {
    name: entry.name,
    subtitle: entry.subtitle,
    center: center,
    bounds: routeData.bounds,
    zoom: zoom,
  };

  // Build route config
  const routeConfig: RouteConfig = {
    data: routeData,
    style: {
      color: entry.routeColor || template.route.color,
      width: template.route.width,
      opacity: template.route.opacity,
      lineStyle: template.route.lineStyle,
      showStartEnd: template.route.showStartEnd,
      startColor: template.route.startColor,
      endColor: template.route.endColor,
    },
    privacyZones: [],
    showStats: true,
    statsPosition: 'bottom-left',
  };

  // Build the full config
  const config: PosterConfig = {
    location,
    style,
    palette,
    route: routeConfig,
    typography: {
      titleFont: template.typography.titleFont,
      titleSize: template.typography.titleSize,
      titleWeight: template.typography.titleWeight,
      titleLetterSpacing: template.typography.titleLetterSpacing,
      titleAllCaps: template.typography.titleAllCaps,
      subtitleFont: template.typography.subtitleFont,
      subtitleSize: template.typography.subtitleSize,
      showTitle: template.typography.showTitle,
      showSubtitle: template.typography.showSubtitle,
      showCoordinates: template.typography.showCoordinates,
      position: template.typography.position,
      textBackdrop: template.typography.textBackdrop,
      backdropHeight: template.typography.backdropHeight,
      backdropAlpha: template.typography.backdropAlpha,
    },
    format: {
      aspectRatio: template.format.aspectRatio,
      orientation: template.format.orientation,
      margin: template.format.margin,
      borderStyle: template.format.borderStyle,
    },
    layers: {
      streets: template.layers.streets,
      buildings: template.layers.buildings,
      water: template.layers.water,
      parks: template.layers.parks,
      terrain: template.layers.terrain,
      terrain3d: template.layers.terrain3d,
      terrain3dExaggeration: template.layers.terrain3dExaggeration,
      contours: template.layers.contours,
      labels: template.layers.labels,
      // Defaults for other layer options
      marker: false,
      population: false,
      terrainUnderWater: false,
      hillshadeExaggeration: 1,
      contourDensity: 50,
      labelSize: 1,
      labelMaxWidth: 10,
      roadWeight: 1,
    },
  };

  return config;
}

/**
 * Generate a title for the map
 */
export function generateMapTitle(entry: RouteEntry): string {
  return entry.shortName || entry.name;
}

/**
 * Generate tags for the map
 */
export function generateMapTags(entry: RouteEntry): string[] {
  const tags = [...entry.tags];

  // Add category tag
  tags.push(entry.category);

  // Add country tags
  if (entry.countries && entry.countries.length > 0) {
    tags.push(...entry.countries.map((c) => c.toLowerCase()));
  } else if (entry.country) {
    tags.push(entry.country.toLowerCase());
  }

  // Add subcategory if present
  if (entry.subcategory) {
    tags.push(entry.subcategory);
  }

  // Deduplicate
  return [...new Set(tags)];
}
