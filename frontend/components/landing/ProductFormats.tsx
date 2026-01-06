'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Frame, Box, ArrowRight, Check } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations/landing';

const products = [
  {
    id: 'prints',
    icon: Frame,
    name: 'Adventure Prints',
    tagline: 'Premium wall art',
    description:
      'Museum-quality prints up to 24×36" at 300 DPI. Perfect for framing and displaying your most cherished adventures.',
    features: [
      'Ultra high-resolution export',
      'Print-ready PNG files',
      'Up to 7200×10800 pixels',
      'Perfect for professional printing',
    ],
    color: 'primary',
    gradient: 'from-primary/10 to-emerald-500/10',
    cta: 'Create a Print',
  },
  {
    id: 'sculptures',
    icon: Box,
    name: 'Journey Sculptures',
    tagline: '3D terrain models',
    description:
      'Transform your terrain into a physical 3D sculpture. Real elevation data, tangible memories. Coming soon.',
    features: [
      'Real terrain elevation',
      '3D printable STL files',
      'Topographic accuracy',
      'Physical keepsakes',
    ],
    color: 'accent',
    gradient: 'from-accent/10 to-amber-500/10',
    cta: 'Explore 3D',
    comingSoon: false,
  },
];

export function ProductFormats() {
  return (
    <section className="py-24 md:py-32 bg-white dark:bg-stone-800/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            Choose Your Format
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            From stunning wall art to tangible 3D sculptures. Multiple ways to
            bring your adventures into the physical world.
          </p>
        </motion.div>

        {/* Product Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={staggerItem}
              className="group relative"
            >
              <div
                className={`relative h-full p-8 md:p-10 rounded-2xl bg-gradient-to-br ${product.gradient} border border-stone-200 dark:border-stone-700 overflow-hidden`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-xl mb-6 ${
                    product.color === 'primary'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-accent/20 text-accent'
                  }`}
                >
                  <product.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
                      {product.name}
                    </h3>
                    {product.comingSoon && (
                      <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-4">
                    {product.tagline}
                  </p>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400"
                    >
                      <Check
                        className={`w-4 h-4 ${
                          product.color === 'primary' ? 'text-primary' : 'text-accent'
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/create"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 group-hover:-translate-y-0.5 ${
                    product.color === 'primary'
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                      : 'bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/25'
                  }`}
                >
                  {product.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Decorative element */}
                <div
                  className={`absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30 ${
                    product.color === 'primary' ? 'bg-primary' : 'bg-accent'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
