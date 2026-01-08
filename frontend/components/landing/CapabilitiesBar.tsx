'use client';

import { motion } from 'framer-motion';
import { Palette, Layers, Mountain, Printer } from 'lucide-react';
import { fadeInUp } from '@/lib/animations/landing';

interface Capability {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  description: string;
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
              <div className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 bg-primary/10 dark:bg-primary/20 text-primary">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-900 dark:text-white font-mono">
                    {item.value}
                  </span>
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
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
