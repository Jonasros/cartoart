'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { POSTER_EXAMPLES } from '@/lib/config/examples';
import { PosterThumbnail } from '../map/PosterThumbnail';
import { staggerContainer, staggerItem } from '@/lib/animations/landing';

// Select diverse examples for the community preview
const PREVIEW_EXAMPLES = [
  POSTER_EXAMPLES[0], // Chesapeake Bay - Vintage
  POSTER_EXAMPLES[3], // San Francisco Noir - Dark Mode
  POSTER_EXAMPLES[5], // Organic North America
  POSTER_EXAMPLES[7], // North America Botanical - Watercolor
  POSTER_EXAMPLES[8], // Kennedy Space Center - Topographic
  POSTER_EXAMPLES[1], // Salt Lake City - Midnight
];

export function CommunityPreview() {
  return (
    <section className="py-24 md:py-32 bg-stone-100 dark:bg-stone-900/50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-6">
            <Compass className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">See What&apos;s Possible</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            Endless Possibilities
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            From coastal charts to mountain terrain, urban landscapes to wilderness trails.
            Every adventure can become art.
          </p>
        </motion.div>

        {/* Examples Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          {PREVIEW_EXAMPLES.map((example, index) => (
            <motion.div
              key={example.id}
              variants={staggerItem}
              className="group relative"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1 border border-stone-200 dark:border-stone-700">
                <PosterThumbnail
                  config={example.config}
                  className="w-full h-full"
                />

                {/* Overlay with info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-sm">
                      {example.name}
                    </p>
                    <p className="text-white/70 text-xs">
                      {example.config.style.name}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold rounded-xl border-2 border-stone-200 dark:border-stone-700 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          >
            Explore the Community
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
