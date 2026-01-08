'use client';

import { motion } from 'framer-motion';
import { Upload, Palette, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { staggerContainer, staggerItem } from '@/lib/animations/landing';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Connect or Upload',
    description:
      'Connect your Strava account in one click, drop a GPX file, or search for any location on Earth. Your adventure awaits.',
    features: ['Strava sync', 'GPX upload', 'Location search'],
  },
  {
    number: '02',
    icon: Palette,
    title: 'Customize Your Way',
    description:
      'Choose from 11 unique styles and 15+ color palettes. Add routes, adjust typography, and make it uniquely yours.',
    features: ['11 map styles', '15+ palettes', 'Full customization'],
  },
  {
    number: '03',
    icon: Download,
    title: 'Export & Print',
    description:
      'Download in ultra-high resolution ready for professional printing, or create a stunning 3D sculpture of your terrain.',
    features: ['High-res PNG', 'Print-ready', '3D sculptures'],
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white dark:bg-stone-800/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-white mb-4">
            Three Steps to Your Keepsake
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Creating your adventure art is quick and intuitive. No design skills required.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="relative"
        >
          {/* Connection line - Desktop only */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={staggerItem}
                className="relative text-center"
              >
                {/* Step number badge */}
                <div className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-lg mb-6 shadow-lg shadow-primary/25">
                  {step.number}
                </div>

                {/* Icon container */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-700/50 mb-6">
                  <step.icon className="w-9 h-9 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 mb-4 leading-relaxed">
                  {step.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-2">
                  {step.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-block px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-700/50 text-xs font-medium text-stone-600 dark:text-stone-400"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Arrow indicator for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-6 text-primary/40">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Try It Now — It&apos;s Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
