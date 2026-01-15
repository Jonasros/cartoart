'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  Mountain,
  Globe,
  Trophy,
  Gift,
  Heart,
  Palette,
  Download,
  ChevronDown,
  Sparkles,
  Timer,
  Route as RouteIcon,
  Layers,
  Link as LinkIcon,
  Target,
  Image as ImageIcon,
  Box,
} from 'lucide-react';
import type { SEORouteMetadata, FAQ } from '@/types/seo';

interface Props {
  route: SEORouteMetadata;
  faqs: FAQ[];
  relatedRoutes: SEORouteMetadata[];
  faqSchema: object;
  productSchema: object;
  thumbnailUrl: string | null;
}

export function RaceLandingPageClient({
  route,
  faqs,
  relatedRoutes,
  faqSchema,
  productSchema,
  thumbnailUrl
}: Props) {
  // Inject JSON-LD on client side to avoid hydration mismatch
  useEffect(() => {
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.textContent = JSON.stringify(faqSchema);
    faqScript.id = 'faq-schema';
    document.head.appendChild(faqScript);

    const productScript = document.createElement('script');
    productScript.type = 'application/ld+json';
    productScript.textContent = JSON.stringify(productSchema);
    productScript.id = 'product-schema';
    document.head.appendChild(productScript);

    return () => {
      document.getElementById('faq-schema')?.remove();
      document.getElementById('product-schema')?.remove();
    };
  }, [faqSchema, productSchema]);

  return (
    <main className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <HeroSection route={route} thumbnailUrl={thumbnailUrl} />

      {/* ROUTE DETAILS */}
      <RouteDetailsSection route={route} />

      {/* GIFT MESSAGING */}
      <GiftMessagingSection route={route} />

      {/* PRODUCT SHOWCASE */}
      <ProductShowcaseSection route={route} thumbnailUrl={thumbnailUrl} />

      {/* PERSONALIZATION */}
      <PersonalizationSection />

      {/* HOW IT WORKS */}
      <HowItWorksSection route={route} />

      {/* FAQ */}
      <FAQSection faqs={faqs} routeName={route.name} />

      {/* RELATED ROUTES */}
      {relatedRoutes.length > 0 && (
        <RelatedRoutesSection routes={relatedRoutes} />
      )}

      {/* FINAL CTA */}
      <FinalCTASection route={route} />
    </main>
  );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection({ route, thumbnailUrl }: { route: SEORouteMetadata; thumbnailUrl: string | null }) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background with topographic pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-primary/5 dark:from-stone-900 dark:via-stone-900 dark:to-primary/10" />

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
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-6"
            >
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Marathon Route</span>
            </motion.div>

            {/* H1 - Route Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-white leading-[1.1] tracking-tight mb-4"
            >
              {route.name}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-accent">
                Route Poster
              </span>
            </motion.h1>

            {/* Subtitle */}
            {route.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-stone-600 dark:text-stone-400 mb-6"
              >
                {route.subtitle} · {route.distance}km
              </motion.p>
            )}

            {/* Intro Text */}
            {route.introText && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-8 max-w-xl"
              >
                {route.introText}
              </motion.p>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href={`/create?route=${route.slug}&source=seo`}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <MapPin className="w-5 h-5" />
                Create Your Poster
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#product-showcase"
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
                15+ Color Palettes
              </span>
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                High-Res Downloads
              </span>
            </motion.div>
          </div>

          {/* Right - Map Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
              {/* Use posterImageUrl override if set in routes.ts, otherwise fall back to DB thumbnail */}
              {(route.posterImageUrl || thumbnailUrl) ? (
                <Image
                  src={route.posterImageUrl || thumbnailUrl!}
                  alt={`${route.name} route map poster`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: route.routeColor + '15' }}
                >
                  <div className="text-center p-8">
                    <RouteIcon
                      className="w-16 h-16 mx-auto mb-4"
                      style={{ color: route.routeColor }}
                    />
                    <p className="font-display text-xl font-semibold text-stone-700 dark:text-stone-300">
                      {route.name}
                    </p>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">
                      {route.distance}km - {route.country}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating style badge */}
            <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Starting at
              </span>
              <p className="font-display text-2xl font-bold text-stone-900 dark:text-white">
                €12
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// ROUTE DETAILS SECTION
// ============================================
function RouteDetailsSection({ route }: { route: SEORouteMetadata }) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    expert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <section className="py-12 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {/* Distance */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-stone-100 dark:bg-stone-800">
            <RouteIcon className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Distance</p>
              <p className="font-semibold text-stone-900 dark:text-white">{route.distance} km</p>
            </div>
          </div>

          {/* Elevation */}
          {route.elevationGain && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-stone-100 dark:bg-stone-800">
              <Mountain className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">Elevation</p>
                <p className="font-semibold text-stone-900 dark:text-white">{route.elevationGain}m</p>
              </div>
            </div>
          )}

          {/* Country */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-stone-100 dark:bg-stone-800">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Location</p>
              <p className="font-semibold text-stone-900 dark:text-white">
                {route.region ? `${route.region}, ` : ''}{route.country}
              </p>
            </div>
          </div>

          {/* Difficulty */}
          {route.difficulty && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-stone-100 dark:bg-stone-800">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">Difficulty</p>
                <span className={`px-2 py-0.5 rounded text-sm font-medium capitalize ${difficultyColors[route.difficulty]}`}>
                  {route.difficulty}
                </span>
              </div>
            </div>
          )}

          {/* Official Website */}
          {route.website && (
            <a
              href={route.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">Official Website →</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// GIFT MESSAGING SECTION
// ============================================
function GiftMessagingSection({ route }: { route: SEORouteMetadata }) {
  const messages = [
    {
      icon: Trophy,
      title: 'Commemorate the Achievement',
      description: `Finishing ${route.name} is a milestone worth celebrating. Turn those 42.2km into beautiful wall art.`,
    },
    {
      icon: Gift,
      title: 'The Perfect Gift',
      description: 'Know someone who conquered this marathon? Give them a gift that captures their achievement forever.',
    },
    {
      icon: Heart,
      title: 'Remember Every Step',
      description: 'From the starting line to the finish, preserve the memory of your personal journey.',
    },
    {
      icon: Palette,
      title: 'Your Route, Your Style',
      description: 'Customize with 11 map styles, 15+ color palettes, and add your finish time and date.',
    },
  ];

  return (
    <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Why This Makes a Perfect Gift
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            More than a poster—it&apos;s a celebration of an incredible achievement
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {messages.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRODUCT SHOWCASE SECTION
// ============================================
function ProductShowcaseSection({ route, thumbnailUrl }: { route: SEORouteMetadata; thumbnailUrl: string | null }) {
  const [activeTab, setActiveTab] = useState<'poster' | 'sculpture'>('poster');

  return (
    <section id="product-showcase" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Choose Your Format
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Download as a high-resolution poster or 3D sculpture file
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('poster')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'poster'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Poster
          </button>
          <button
            onClick={() => setActiveTab('sculpture')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'sculpture'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Box className="w-5 h-5" />
            3D Sculpture
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Preview */}
          <div className="aspect-square rounded-2xl bg-stone-50 dark:bg-stone-900 overflow-hidden relative border border-stone-200 dark:border-stone-700">
            {/* Poster tab with image */}
            {activeTab === 'poster' && (route.posterImageUrl || thumbnailUrl) ? (
              <Image
                src={route.posterImageUrl || thumbnailUrl!}
                alt={`${route.name} poster example`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : activeTab === 'sculpture' && route.sculptureImageUrl ? (
              /* Sculpture tab with image */
              <Image
                src={route.sculptureImageUrl}
                alt={`${route.name} 3D sculpture example`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              /* Placeholder when no image available */
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                <div className="text-center p-8">
                  {activeTab === 'poster' ? (
                    <>
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-stone-400" />
                      <p className="font-display text-xl font-semibold text-stone-700 dark:text-stone-300">
                        High-Resolution Poster
                      </p>
                      <p className="text-stone-500 dark:text-stone-400 mt-2">
                        Up to 7200x10800px (300 DPI)
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <Box className="w-full h-full text-stone-300 dark:text-stone-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mountain className="w-12 h-12 text-primary/60" />
                        </div>
                      </div>
                      <p className="font-display text-xl font-semibold text-stone-700 dark:text-stone-300">
                        3D Printed Terrain
                      </p>
                      <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-xs mx-auto">
                        Your route rises from the base with real elevation data - every hill and valley captured
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h3 className="font-display text-2xl font-bold text-stone-900 dark:text-white mb-4">
              {activeTab === 'poster' ? 'Print-Ready Poster' : '3D Journey Sculpture'}
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
              {activeTab === 'poster'
                ? `Download your ${route.name} route as a stunning high-resolution poster. Perfect for printing at any size from A4 to 24x36 inches at professional 300 DPI quality.`
                : `Turn your ${route.name} journey into a 3D sculpture showing the actual terrain elevation along your route. Download the STL file and print it yourself or use a 3D printing service.`}
            </p>

            <ul className="space-y-3 mb-8">
              {(activeTab === 'poster'
                ? [
                    'Multiple aspect ratios (2:3, 3:4, 1:1, 16:9)',
                    'Print sizes up to 24x36 inches',
                    'Professional 300 DPI resolution',
                    'Transparent PNG with your custom design',
                  ]
                : [
                    'STL file compatible with any 3D printer',
                    'Terrain elevation from real GPS data',
                    'Multiple base shapes (circular, rectangular)',
                    'Adjustable elevation exaggeration',
                  ]
              ).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-primary mt-1 font-bold">+</span>
                  <span className="text-stone-600 dark:text-stone-400">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-end gap-4">
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Starting at</span>
                <p className="font-display text-3xl font-bold text-stone-900 dark:text-white">
                  {activeTab === 'poster' ? '€12' : '€29'}
                </p>
              </div>
              <Link
                href={`/create?route=${route.slug}&source=seo`}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-all"
              >
                Create Yours
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// PERSONALIZATION SECTION
// ============================================
function PersonalizationSection() {
  const features = [
    {
      Icon: LinkIcon,
      title: 'Import from Strava',
      description: 'Connect your Strava account and import your exact GPS data from race day.',
    },
    {
      Icon: Palette,
      title: '11 Map Styles',
      description: 'From minimalist to topographic, vintage to modern—find your perfect look.',
    },
    {
      Icon: Target,
      title: 'Add Your Time',
      description: 'Personalize with your finish time, date, and any custom text.',
    },
    {
      Icon: Layers,
      title: '15+ Color Palettes',
      description: 'Match your home decor or pick colors that speak to you.',
    },
  ];

  return (
    <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Make It Truly Yours
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Every poster is completely customizable. Start with the official route or import your own GPS data.
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
function HowItWorksSection({ route }: { route: SEORouteMetadata }) {
  const steps = [
    {
      number: '01',
      title: 'Start with This Route',
      description: `Begin with the official ${route.name} route or import your own GPS data from Strava.`,
      icon: MapPin,
    },
    {
      number: '02',
      title: 'Customize Your Design',
      description: 'Choose your map style, colors, typography. Add your finish time and date.',
      icon: Palette,
    },
    {
      number: '03',
      title: 'Download & Print',
      description: 'Get your high-resolution file and print it anywhere—or order a 3D sculpture.',
      icon: Download,
    },
  ];

  return (
    <section className="py-20">
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
            Create your custom poster in just 3 simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center">
                    {step.number}
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
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href={`/create?route=${route.slug}&source=seo`}
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
// FAQ SECTION
// ============================================
function FAQSection({ faqs, routeName }: { faqs: FAQ[]; routeName: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
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
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Everything you need to know about your {routeName} poster
          </p>
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
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
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
// RELATED ROUTES SECTION
// ============================================
function RelatedRoutesSection({ routes }: { routes: SEORouteMetadata[] }) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
            Explore More Routes
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            Other popular marathons you might like
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {routes.map((route, index) => (
            <motion.div
              key={route.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/race/${route.slug}`}
                className="block p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                  style={{ backgroundColor: route.routeColor + '20' }}
                >
                  <RouteIcon className="w-6 h-6" style={{ color: route.routeColor }} />
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-white mb-1">
                  {route.name}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {route.distance}km · {route.country}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FINAL CTA SECTION
// ============================================
function FinalCTASection({ route }: { route: SEORouteMetadata }) {
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
          <span className="text-sm font-medium text-white/90">Takes just 5 minutes</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
        >
          Ready to Create Your {route.name} Poster?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          Turn your achievement into stunning wall art. Import your Strava data or start with the official route.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href={`/create?route=${route.slug}&source=seo`}
            className="group inline-flex items-center gap-2 px-10 py-5 bg-white hover:bg-stone-100 text-primary font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-lg"
          >
            <MapPin className="w-5 h-5" />
            Create Your Poster Now
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
          Starting at €12 - High-resolution download - No subscription required
        </motion.p>
      </div>
    </section>
  );
}
