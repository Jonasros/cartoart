/**
 * Types for the famous routes seeding system
 */

export interface RouteEntry {
  id: string; // Unique slug: "tdf-2025-stage-16"
  category: 'cycling' | 'hiking' | 'running' | 'ultra' | 'city';
  subcategory?: string; // "tour-de-france", "world-major-marathon"

  // Display info
  name: string; // "Tour de France 2025 - Stage 16"
  shortName: string; // "TdF Stage 16 - Mont Ventoux"
  subtitle?: string; // "Montpellier → Mont Ventoux"
  description?: string;

  // Location
  country: string;
  countries?: string[]; // For multi-country routes
  region?: string;

  // Route details
  distance: number; // km
  elevationGain?: number; // meters
  difficulty?: 'easy' | 'moderate' | 'hard' | 'expert';
  duration?: string; // "5-7 hours" or "11 days"

  // GPX source
  gpxSource: {
    type: 'direct' | 'scrape' | 'api' | 'manual';
    url: string;
    fallbackUrl?: string;
    notes?: string;
  };

  // Poster design
  template: string; // Template ID to use
  styleId: string; // Map style ID
  paletteId: string; // Palette ID
  routeColor?: string; // Override route color

  // SEO integration
  seoSlug: string; // URL path: "/cycling/tour-de-france-2025-stage-16"
  seoCategory: string; // "cycling" | "trail" | "race"
  tags: string[]; // ["tour-de-france", "mountains", "iconic-climb"]

  // Metadata
  year?: number; // For annual events
  eventDate?: string; // ISO date for races
  website?: string; // Official website
}

export interface PosterTemplate {
  id: string;
  name: string;
  styleId: string;
  paletteId: string;
  typography: {
    titleFont: string;
    titleSize: number;
    titleWeight: number;
    titleLetterSpacing?: number;
    titleAllCaps?: boolean;
    subtitleFont: string;
    subtitleSize: number;
    showTitle: boolean;
    showSubtitle: boolean;
    showCoordinates: boolean;
    position: 'top' | 'bottom' | 'center';
    textBackdrop?: 'none' | 'subtle' | 'strong' | 'gradient';
    backdropHeight?: number;
    backdropAlpha?: number;
  };
  format: {
    aspectRatio: '2:3' | '3:4' | '4:5' | '1:1' | 'ISO' | '16:9';
    orientation: 'portrait' | 'landscape';
    margin: number;
    borderStyle: 'none' | 'thin' | 'thick' | 'double' | 'inset';
  };
  layers: {
    streets: boolean;
    buildings: boolean;
    water: boolean;
    parks: boolean;
    terrain: boolean;
    terrain3d?: boolean;
    terrain3dExaggeration?: number;
    contours: boolean;
    labels: boolean;
  };
  route: {
    color: string;
    width: number;
    opacity: number;
    lineStyle: 'solid' | 'dashed' | 'dotted';
    showStartEnd: boolean;
    startColor?: string;
    endColor?: string;
  };
}

export interface FetchResult {
  success: boolean;
  gpxContent?: string;
  error?: string;
  source: string;
}

export interface SeedResult {
  routeId: string;
  success: boolean;
  mapId?: string;
  error?: string;
}

export interface SeedOptions {
  dryRun?: boolean;
  verbose?: boolean;
  category?: RouteEntry['category'];
  limit?: number;
  skipExisting?: boolean;
  directOnly?: boolean;
  useRandomUser?: boolean;
  useRandomDate?: boolean;
  daysBackRange?: number;
}
