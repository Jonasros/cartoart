'use client';

import { HeroSection } from './HeroSection';
import { CapabilitiesBar } from './CapabilitiesBar';
import { UseCasesSection } from './UseCasesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { StravaIntegration } from './StravaIntegration';
import { StyleShowcase } from './StyleShowcase';
import { ProductFormats } from './ProductFormats';
import { CommunityPreview } from './CommunityPreview';
import { FinalCTA } from './FinalCTA';
import { Footer } from '@/components/layout/Footer';

interface RouteThumbnail {
  url: string;
  title: string;
}

interface LandingPageProps {
  featuredThumbnails?: RouteThumbnail[];
}

export function LandingPage({ featuredThumbnails = [] }: LandingPageProps) {
  // Split thumbnails: first 4 for hero, all for style showcase
  const heroThumbnails = featuredThumbnails.slice(0, 4);
  const styleThumbnails = featuredThumbnails;

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-900 overflow-x-hidden">
      {/* Hero - Full viewport with floating posters */}
      <HeroSection thumbnails={heroThumbnails} />

      {/* Capabilities Bar - Trust signal with product stats */}
      <CapabilitiesBar />

      {/* Use Cases - Memories, Gifts, Souvenirs */}
      <UseCasesSection />

      {/* How It Works - 3 step flow */}
      <HowItWorksSection />

      {/* Strava Integration - Easy import callout */}
      <StravaIntegration />

      {/* Style Showcase - Gallery of 9 map styles */}
      <StyleShowcase thumbnails={styleThumbnails} />

      {/* Product Formats - Prints vs Sculptures */}
      <ProductFormats />

      {/* Community Preview - Showcase examples */}
      <CommunityPreview />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
