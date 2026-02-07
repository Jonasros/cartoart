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

// ============================================
// Gift Page Types
// ============================================

export type GiftAudience =
  | 'marathon-finisher'
  | 'trail-runner'
  | 'cyclist'
  | 'first-marathon'
  | 'personal-best';

export interface GiftWhyCard {
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface GiftFeaturedRoute {
  name: string;
  description: string;
  slug: string; // Link to /race/, /trail/, or /cycling/ page
  category: SEOCategory;
}

export interface GiftPageMetadata {
  slug: GiftAudience;
  title: string; // H1
  subtitle: string;
  intro: string;
  ctaText: string;

  // Why this gift section
  whyCards: GiftWhyCard[];

  // Featured routes to showcase
  featuredRoutes: GiftFeaturedRoute[];

  // Personalization angle
  personalizationHeading: string;
  personalizationText: string;

  // How it works steps
  steps: { title: string; description: string }[];

  // Price anchoring text
  pricingText: string;

  // FAQs specific to this gift page
  faqs: FAQ[];

  // Final CTA
  finalCTA: {
    heading: string;
    subtext: string;
    buttonText: string;
  };

  // SEO metadata
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

// ============================================
// Guide Page Types
// ============================================

export type GuideSlug =
  | 'strava-to-poster'
  | 'gpx-to-poster'
  | '3d-print-running-route'
  | 'custom-running-map'
  | 'cycling-route-poster';

export interface GuideStep {
  title: string;
  description: string;
  tip?: string;
}

export interface GuideTip {
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface GuidePageMetadata {
  slug: GuideSlug;
  title: string; // H1
  subtitle: string;
  intro: string;
  ctaText: string;

  // Step-by-step guide
  steps: GuideStep[];

  // Tips section
  tips: GuideTip[];

  // FAQs
  faqs: FAQ[];

  // Final CTA
  finalCTA: {
    heading: string;
    subtext: string;
    buttonText: string;
  };

  // SEO metadata
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}
