'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const benefits = [
  {
    icon: Zap,
    title: 'One-Click Import',
    description: 'Connect your Strava and import any activity instantly.',
  },
  {
    icon: RefreshCw,
    title: 'Always Synced',
    description: 'Your latest adventures are always ready to transform.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'We only read your activities. Never post or modify.',
  },
];

export function StravaIntegration() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[#FC4C02]/5 via-transparent to-transparent dark:from-[#FC4C02]/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Strava Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FC4C02]/10 dark:bg-[#FC4C02]/20 mb-6">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#FC4C02]" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
              </svg>
              <span className="text-sm font-semibold text-[#FC4C02]">Strava Integration</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4">
              Import Your Adventures
              <br />
              <span className="text-[#FC4C02]">Directly from Strava</span>
            </h2>

            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 max-w-lg">
              Connect your Strava account and turn your runs, rides, and hikes into beautiful wall art.
              No file downloads needed — just pick an activity and start designing.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-[#FC4C02]/10 dark:bg-[#FC4C02]/20">
                    <benefit.icon className="w-4 h-4 text-[#FC4C02]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FC4C02] hover:bg-[#FC4C02]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#FC4C02]/25 hover:shadow-xl hover:shadow-[#FC4C02]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Connect Strava
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Mock activity cards */}
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FC4C02]/20 to-primary/20 blur-3xl opacity-50" />

              {/* Activity cards stack */}
              <div className="relative space-y-4">
                {[
                  { name: 'Morning Trail Run', distance: '12.4 km', elevation: '342 m', type: 'Run' },
                  { name: 'Weekend Mountain Hike', distance: '18.7 km', elevation: '1,240 m', type: 'Hike' },
                  { name: 'Coastal Bike Ride', distance: '45.2 km', elevation: '580 m', type: 'Ride' },
                ].map((activity, index) => (
                  <motion.div
                    key={activity.name}
                    initial={{ opacity: 0, y: 20, x: index * 10 }}
                    whileInView={{ opacity: 1, y: 0, x: index * 10 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                    className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow-lg border border-stone-200 dark:border-stone-700"
                    style={{ marginLeft: index * 16 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#FC4C02] bg-[#FC4C02]/10 px-2 py-0.5 rounded">
                        {activity.type}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.03 13.828h4.169" />
                        </svg>
                        via Strava
                      </div>
                    </div>
                    <h4 className="font-semibold text-stone-900 dark:text-white mb-1">
                      {activity.name}
                    </h4>
                    <div className="flex gap-4 text-sm text-stone-600 dark:text-stone-400">
                      <span>{activity.distance}</span>
                      <span>↑ {activity.elevation}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
