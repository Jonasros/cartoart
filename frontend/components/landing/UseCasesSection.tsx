'use client';

import { motion } from 'framer-motion';
import { Heart, Gift, Map } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations/landing';

const useCases = [
  {
    icon: Heart,
    title: 'Preserve Memories',
    description:
      'That summit you conquered. That trail that changed you. Turn your most meaningful adventures into art you\'ll treasure forever.',
    gradient: 'from-rose-500/20 to-orange-500/20',
    iconColor: 'text-rose-500',
  },
  {
    icon: Gift,
    title: 'Give Meaningful Gifts',
    description:
      'The perfect gift for the adventurer in your life. Personalized, unique, and unforgettable. Celebrate their journeys with something special.',
    gradient: 'from-primary/20 to-emerald-500/20',
    iconColor: 'text-primary',
  },
  {
    icon: Map,
    title: 'Collect Souvenirs',
    description:
      'Forget fridge magnets. Create a gallery of everywhere you\'ve explored. Each piece tells a story of adventure and discovery.',
    gradient: 'from-blue-500/20 to-violet-500/20',
    iconColor: 'text-blue-500',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 md:py-32 bg-stone-50 dark:bg-stone-900">
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
            More Than Maps
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            Whether you&apos;re commemorating a personal milestone or creating the perfect gift,
            your adventures deserve to be displayed.
          </p>
        </motion.div>

        {/* Use Case Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              variants={staggerItem}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-xl bg-stone-100 dark:bg-stone-700/50 ${useCase.iconColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <useCase.icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">
                    {useCase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>

                {/* Decorative corner element */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-stone-100 dark:bg-stone-700/30 opacity-50 group-hover:scale-150 transition-transform duration-700" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
