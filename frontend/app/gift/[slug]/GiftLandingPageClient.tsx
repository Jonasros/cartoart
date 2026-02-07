'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Gift,
  Heart,
  Zap,
  Sparkles,
  Mountain,
  Globe,
  Box,
  Target,
  Trophy,
  Timer,
  MapPin,
  Palette,
  Download,
  ChevronDown,
  Layers,
  Route as RouteIcon,
  Link as LinkIcon,
} from 'lucide-react';
import type { GiftPageMetadata, FAQ } from '@/types/seo';
import { getRelatedGiftPages } from '@/lib/seo/gifts';
import { RouteDisclaimer } from '@/components/seo/RouteDisclaimer';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { Footer } from '@/components/layout/Footer';
import { POSTER_EXAMPLES } from '@/lib/config/examples';
import { PosterThumbnail } from '@/components/map/PosterThumbnail';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  zap: Zap,
  sparkles: Sparkles,
  mountain: Mountain,
  globe: Globe,
  box: Box,
  target: Target,
  trophy: Trophy,
  timer: Timer,
  link: LinkIcon,
  route: RouteIcon,
  palette: Palette,
  layers: Layers,
};

// Fallback poster examples when no Supabase thumbnails available
const FALLBACK_HERO = [
  POSTER_EXAMPLES[0], // Chesapeake Bay - Vintage
  POSTER_EXAMPLES[3], // San Francisco Noir - Dark Mode
  POSTER_EXAMPLES[8], // Kennedy Space Center - Topographic
];

const FALLBACK_GALLERY = [
  POSTER_EXAMPLES[0], // Vintage
  POSTER_EXAMPLES[1], // Midnight
  POSTER_EXAMPLES[2], // Minimal
  POSTER_EXAMPLES[3], // Dark Mode
  POSTER_EXAMPLES[7], // Watercolor Botanical
  POSTER_EXAMPLES[8], // Topographic
];

interface RouteThumbnail {
  url: string;
  title: string;
}

interface Props {
  gift: GiftPageMetadata;
  faqSchema: object;
  productSchema: object;
  breadcrumbSchema: object;
  thumbnails?: RouteThumbnail[];
}

export function GiftLandingPageClient({
  gift,
  faqSchema,
  productSchema,
  breadcrumbSchema,
  thumbnails = [],
}: Props) {
  useEffect(() => {
    const schemas = [
      { id: 'faq-schema', data: faqSchema },
      { id: 'product-schema', data: productSchema },
      { id: 'breadcrumb-schema', data: breadcrumbSchema },
    ];

    schemas.forEach(({ id, data }) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      script.id = id;
      document.head.appendChild(script);
    });

    return () => {
      schemas.forEach(({ id }) => document.getElementById(id)?.remove());
    };
  }, [faqSchema, productSchema, breadcrumbSchema]);

  const relatedGifts = getRelatedGiftPages(gift.slug);

  return (
    <>
      <UnifiedHeader variant="feed" />
      <main className="min-h-screen bg-background">
        <HeroSection gift={gift} thumbnails={thumbnails} />
        <WhyThisGiftSection gift={gift} />
        <StyleGallerySection thumbnails={thumbnails} />
        <FeaturedRoutesSection gift={gift} />
        <PersonalizationSection gift={gift} />
        <HowItWorksSection gift={gift} />
        <PricingSection gift={gift} />
        <FAQSection faqs={gift.faqs} />
        {relatedGifts.length > 0 && (
          <RelatedGiftsSection gifts={relatedGifts} />
        )}
        <FinalCTASection gift={gift} />
        <div className="pb-8 px-6">
          <RouteDisclaimer />
        </div>
      </main>
      <Footer />
    </>
  );
}

// ============================================
// HERO SECTION — 2-column with poster examples
// ============================================
function HeroSection({ gift, thumbnails }: { gift: GiftPageMetadata; thumbnails: RouteThumbnail[] }) {
  const useThumbnails = thumbnails.length >= 3;

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background gradient — warm orange tint for gift pages */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-accent/5 dark:from-stone-900 dark:via-stone-900 dark:to-accent/10" />

      {/* Topographic texture */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5C20 15 10 20 5 30s5 20 25 25c20-5 25-15 25-25S40 15 30 5z' fill='none' stroke='%232D5A3D' stroke-width='0.5'/%3E%3Cpath d='M30 15C23 22 18 25 15 30s3 12 15 15c12-3 15-8 15-15s-8-13-15-15z' fill='none' stroke='%232D5A3D' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 dark:bg-accent/20 border border-accent/20 mb-6"
            >
              <Gift className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Gift Guide</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-white leading-[1.1] tracking-tight mb-4"
            >
              {gift.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-stone-600 dark:text-stone-400 mb-6"
            >
              {gift.subtitle}
            </motion.p>

            {/* Intro */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-8 max-w-xl"
            >
              {gift.intro}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/create?source=gift"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Gift className="w-5 h-5" />
                {gift.ctaText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#styles"
                className="inline-flex items-center gap-2 px-6 py-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold rounded-xl border-2 border-stone-200 dark:border-stone-700 transition-all duration-300"
              >
                See Examples
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-6 text-sm text-stone-500 dark:text-stone-400"
            >
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                11 Map Styles
              </span>
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                15+ Palettes
              </span>
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                From EUR 12
              </span>
            </motion.div>
          </div>

          {/* Right - Poster Examples */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative flex gap-4 items-start">
              {(useThumbnails ? thumbnails.slice(0, 3) : FALLBACK_HERO).map((item, index) => {
                const rotations = [-6, 2, -3];
                const offsets = [20, 0, 40];
                const isThumbnail = useThumbnails && 'url' in item;
                const key = isThumbnail ? (item as RouteThumbnail).url : (item as typeof FALLBACK_HERO[0]).id;

                return (
                  <div
                    key={key}
                    className="w-[160px] xl:w-[180px] flex-shrink-0 transform-gpu hover:scale-105 transition-transform duration-500"
                    style={{
                      transform: `rotate(${rotations[index]}deg) translateY(${offsets[index]}px)`,
                    }}
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-700 relative">
                      {isThumbnail ? (
                        <Image
                          src={(item as RouteThumbnail).url}
                          alt={(item as RouteThumbnail).title}
                          fill
                          className="object-cover"
                          sizes="180px"
                        />
                      ) : (
                        <PosterThumbnail config={(item as typeof FALLBACK_HERO[0]).config} className="w-full h-full" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm shadow-sm text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                        {isThumbnail ? (item as RouteThumbnail).title : (item as typeof FALLBACK_HERO[0]).config.style.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile Poster Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:hidden flex justify-center gap-4 -mt-4"
          >
            {(useThumbnails ? thumbnails.slice(0, 3) : FALLBACK_HERO).map((item, index) => {
              const isThumbnail = useThumbnails && 'url' in item;
              const key = isThumbnail ? (item as RouteThumbnail).url : (item as typeof FALLBACK_HERO[0]).id;

              return (
                <div
                  key={key}
                  className="w-24 sm:w-28 flex-shrink-0"
                  style={{ transform: `rotate(${-4 + index * 4}deg)` }}
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-stone-200 dark:border-stone-700 relative">
                    {isThumbnail ? (
                      <Image
                        src={(item as RouteThumbnail).url}
                        alt={(item as RouteThumbnail).title}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <PosterThumbnail config={(item as typeof FALLBACK_HERO[0]).config} className="w-full h-full" />
                    )}
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium text-stone-500 dark:text-stone-400 text-center">
                    {isThumbnail ? (item as RouteThumbnail).title : (item as typeof FALLBACK_HERO[0]).config.style.name}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// WHY THIS GIFT SECTION
// ============================================
function WhyThisGiftSection({ gift }: { gift: GiftPageMetadata }) {
  return (
    <section className="py-16 sm:py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Why a Route Poster?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {gift.whyCards.map((card, index) => {
            const Icon = iconMap[card.icon] || Sparkles;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================
// STYLE GALLERY SECTION — poster examples
// ============================================
function StyleGallerySection({ thumbnails }: { thumbnails: RouteThumbnail[] }) {
  const useThumbnails = thumbnails.length >= 6;

  return (
    <section id="styles" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Choose from 11 Map Styles
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Each poster is a work of art. Pick a style that matches their personality and home decor.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {useThumbnails ? (
            thumbnails.slice(0, 6).map((thumbnail, index) => (
              <motion.div
                key={thumbnail.url}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 relative">
                  <Image
                    src={thumbnail.url}
                    alt={thumbnail.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
                <p className="mt-2 text-center text-xs font-semibold text-stone-600 dark:text-stone-400">
                  {thumbnail.title}
                </p>
              </motion.div>
            ))
          ) : (
            FALLBACK_GALLERY.map((example, index) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-700 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <PosterThumbnail config={example.config} className="w-full h-full" />
                </div>
                <p className="mt-2 text-center text-xs font-semibold text-stone-600 dark:text-stone-400">
                  {example.config.style.name}
                </p>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            href="/create?source=gift"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Explore all styles in the editor
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// FEATURED ROUTES SECTION
// ============================================
function FeaturedRoutesSection({ gift }: { gift: GiftPageMetadata }) {
  return (
    <section className="py-16 sm:py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Popular Routes to Gift
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Start with an iconic route or import their personal GPS data from Strava
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gift.featuredRoutes.map((route, index) => (
            <motion.div
              key={route.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/${route.category}/${route.slug}`}
                className="block p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:shadow-lg hover:-translate-y-1 transition-all h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <RouteIcon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-white mb-2">
                  {route.name}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  {route.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/create?source=gift"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Or import any route from Strava
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PERSONALIZATION SECTION
// ============================================
function PersonalizationSection({ gift }: { gift: GiftPageMetadata }) {
  const features = [
    {
      Icon: LinkIcon,
      title: 'Import from Strava',
      description: 'Connect their Strava account and import GPS data from any activity.',
    },
    {
      Icon: Palette,
      title: '11 Map Styles',
      description: 'From minimalist to topographic, vintage to modern — find their look.',
    },
    {
      Icon: Target,
      title: 'Add Their Details',
      description: 'Finish time, date, name, and any custom text they want.',
    },
    {
      Icon: Layers,
      title: '15+ Colour Palettes',
      description: 'Match their home decor or pick colours that speak to them.',
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            {gift.personalizationHeading}
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            {gift.personalizationText}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS SECTION
// ============================================
function HowItWorksSection({ gift }: { gift: GiftPageMetadata }) {
  const stepIcons = [MapPin, Palette, Download];

  return (
    <section className="py-16 sm:py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Create their gift in just 3 steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {gift.steps.map((step, index) => {
            const StepIcon = stepIcons[index] || MapPin;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Connector line */}
                {index < gift.steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 mb-6">
                    <StepIcon className="w-10 h-10 text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-stone-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/create?source=gift"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl shadow-lg shadow-accent/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION
// ============================================
function PricingSection({ gift }: { gift: GiftPageMetadata }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Simple Pricing
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Poster card */}
          <div className="p-8 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl font-semibold text-stone-900 dark:text-white">
                Route Poster
              </h3>
            </div>
            <p className="font-display text-4xl font-bold text-stone-900 dark:text-white mb-2">
              From &euro;12
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              High-resolution PNG download
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Up to 7200x10800px (300 DPI)',
                'Print at any size, any shop',
                '11 map styles, 15+ palettes',
                'Instant digital download',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-primary mt-1 font-bold">+</span>
                  <span className="text-stone-600 dark:text-stone-400 text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/create?source=gift"
              className="block w-full text-center py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              Create a Poster Gift
            </Link>
          </div>

          {/* Sculpture card */}
          <div className="p-8 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-3 mb-4">
              <Box className="w-6 h-6 text-accent" />
              <h3 className="font-display text-xl font-semibold text-stone-900 dark:text-white">
                3D Sculpture
              </h3>
            </div>
            <p className="font-display text-4xl font-bold text-stone-900 dark:text-white mb-2">
              From &euro;29
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              STL file for 3D printing
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Real terrain elevation data',
                'Raised or engraved route line',
                'Engraved text on base',
                'Compatible with any 3D printer',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-accent mt-1 font-bold">+</span>
                  <span className="text-stone-600 dark:text-stone-400 text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/create?source=gift"
              className="block w-full text-center py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
            >
              Create a Sculpture Gift
            </Link>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-stone-500 dark:text-stone-400">
          {gift.pricingText}
        </p>
      </div>
    </section>
  );
}

// ============================================
// FAQ SECTION
// ============================================
function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-stone-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// RELATED GIFTS SECTION
// ============================================
function RelatedGiftsSection({ gifts }: { gifts: GiftPageMetadata[] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            More Gift Ideas
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {gifts.map((g) => (
            <Link
              key={g.slug}
              href={`/gift/${g.slug}`}
              className="group block p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Gift className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                {g.title}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
                {g.subtitle}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium">
                View gift ideas
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FINAL CTA SECTION
// ============================================
function FinalCTASection({ gift }: { gift: GiftPageMetadata }) {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-700" />

      {/* Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5C20 15 10 20 5 30s5 20 25 25c20-5 25-15 25-25S40 15 30 5z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
        >
          <Timer className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-white/90">
            Takes just 5 minutes
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
        >
          {gift.finalCTA.heading}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          {gift.finalCTA.subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/create?source=gift"
            className="group inline-flex items-center gap-2 px-10 py-5 bg-white hover:bg-stone-100 text-primary font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-lg"
          >
            <Gift className="w-5 h-5" />
            {gift.finalCTA.buttonText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-white/60"
        >
          Starting at &euro;12 &middot; High-resolution download &middot; No subscription required
        </motion.p>
      </div>
    </section>
  );
}
