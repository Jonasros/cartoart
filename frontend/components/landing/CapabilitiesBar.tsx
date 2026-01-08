'use client';

import { motion } from 'framer-motion';
import { Palette, Layers, Mountain, Printer } from 'lucide-react';
import { fadeInUp } from '@/lib/animations/landing';

// Strava icon component
const StravaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
  </svg>
);

interface Capability {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  description: string;
  isStrava?: boolean;
}

const capabilities: Capability[] = [
  {
    icon: Palette,
    value: '11',
    label: 'Map Styles',
    description: 'From vintage to modern',
  },
  {
    icon: Layers,
    value: '15+',
    label: 'Color Palettes',
    description: 'Curated combinations',
  },
  {
    icon: Mountain,
    value: '3D',
    label: 'Terrain',
    description: 'Real elevation data',
  },
  {
    icon: StravaIcon,
    value: '',
    label: 'Strava Sync',
    description: 'One-click import',
    isStrava: true,
  },
  {
    icon: Printer,
    value: '24×36"',
    label: 'Print Ready',
    description: 'Up to 300 DPI',
  },
];

export function CapabilitiesBar() {
  return (
    <section className="relative py-12 bg-white dark:bg-stone-800/50 border-y border-stone-200 dark:border-stone-700/50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          {...fadeInUp}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {capabilities.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center gap-4 group"
            >
              <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 ${
                item.isStrava
                  ? 'bg-[#FC4C02]/10 dark:bg-[#FC4C02]/20 text-[#FC4C02]'
                  : 'bg-primary/10 dark:bg-primary/20 text-primary'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  {item.value && (
                    <span className="text-2xl font-bold text-stone-900 dark:text-white font-mono">
                      {item.value}
                    </span>
                  )}
                  <span className={`text-sm font-semibold ${
                    item.isStrava
                      ? 'text-[#FC4C02]'
                      : 'text-stone-700 dark:text-stone-300'
                  }`}>
                    {item.label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
