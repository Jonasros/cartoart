'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { POSTER_EXAMPLES } from '@/lib/config/examples';
import { PosterThumbnail } from '../map/PosterThumbnail';
import { fadeInUp } from '@/lib/animations/landing';

export function StyleShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-24 md:py-32 bg-stone-100 dark:bg-stone-900/50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          {...fadeInUp}
          className="text-center px-6 mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            11 Unique Styles
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            Find Your Perfect Style
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            From vintage nautical charts to modern minimalist designs. Each style tells
            your story in a different way.
          </p>
        </motion.div>

        {/* Gallery Navigation - Desktop */}
        <div className="hidden md:flex justify-end gap-2 px-6 mb-6">
          <button
            onClick={() => scroll('left')}
            className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-primary hover:border-primary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-primary hover:border-primary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Gallery */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 px-6 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {POSTER_EXAMPLES.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex-shrink-0 snap-center group cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="w-64 sm:w-72 md:w-80">
                {/* Poster Card */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border-2 border-white dark:border-stone-700">
                  <PosterThumbnail
                    config={example.config}
                    className="w-full h-full"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Link
                      href={`/create?style=${example.config.style.id}`}
                      className="flex items-center gap-2 text-white font-semibold"
                    >
                      Create with this style
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-stone-900 dark:text-white mb-1">
                    {example.name}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {example.config.style.name} Style
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile scroll indicator */}
        <div className="flex md:hidden justify-center gap-1.5 mt-4">
          {POSTER_EXAMPLES.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex
                  ? 'bg-primary'
                  : 'bg-stone-300 dark:bg-stone-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
