/**
 * SEO Types for Programmatic Landing Pages
 */

export type SEOCategory = 'race' | 'trail' | 'cycling';

export interface SEORouteMetadata {
  // Identifiers
  id: string;
  slug: string; // URL slug without leading slash (e.g., "boston-marathon")
  category: SEOCategory;

  // Display
  name: string;
  shortName: string;
  subtitle?: string;
  description?: string;

  // Location
  country: string;
  countries?: string[];
  region?: string;

  // Route details
  distance: number; // km
  elevationGain?: number; // meters
  difficulty?: 'easy' | 'moderate' | 'hard' | 'expert';
  duration?: string;

  // SEO content
  introText?: string; // Unique intro paragraph for the route
  routeSpecificFAQs?: FAQ[];

  // Design
  routeColor: string;
  styleId: string;
  paletteId: string;

  // Images (optional overrides - set these in routes.ts for easy customization)
  posterImageUrl?: string; // Override main poster image (defaults to DB thumbnail)
  sculptureImageUrl?: string; // URL to sculpture render image
  exampleImages?: ExampleImage[]; // Gallery of example poster styles

  // Metadata
  tags: string[];
  year?: number;
  eventDate?: string;
  website?: string;

  // Map reference (title in maps table)
  mapTitle: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ExampleImage {
  url: string;
  label: string; // e.g., "Minimalist", "Topographic", "Dark Mode"
}

export interface FAQTemplate {
  category: SEOCategory;
  questions: FAQ[];
}

export interface RoutePageData {
  route: SEORouteMetadata;
  mapId?: string;
  thumbnailUrl?: string;
  config?: unknown; // PosterConfig from database
}
