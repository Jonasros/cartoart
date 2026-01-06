'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Demo map card representations - styled to match our example gallery styles
const DEMO_CARDS = [
  {
    id: 'chesapeake',
    name: 'Chesapeake Bay',
    gradient: 'from-amber-100 via-amber-50 to-stone-100',
    accent: 'bg-amber-700/20',
    style: 'Vintage',
  },
  {
    id: 'salt-lake',
    name: 'Salt Lake City',
    gradient: 'from-slate-900 via-slate-800 to-indigo-900',
    accent: 'bg-indigo-500/30',
    style: 'Midnight',
  },
  {
    id: 'tucson',
    name: 'Tucson',
    gradient: 'from-slate-100 via-white to-blue-50',
    accent: 'bg-blue-900/10',
    style: 'Minimal',
  },
  {
    id: 'sf-noir',
    name: 'San Francisco',
    gradient: 'from-gray-900 via-gray-800 to-slate-900',
    accent: 'bg-gray-400/20',
    style: 'Dark Mode',
  },
  {
    id: 'channel-neon',
    name: 'The Channel',
    gradient: 'from-purple-900 via-fuchsia-900 to-pink-900',
    accent: 'bg-cyan-400/30',
    style: 'Neon',
  },
  {
    id: 'na-organic',
    name: 'North America',
    gradient: 'from-coral-100 via-rose-100 to-orange-100',
    accent: 'bg-coral-500/20',
    style: 'Organic',
  },
  {
    id: 'midatlantic',
    name: 'The Midatlantic',
    gradient: 'from-orange-100 via-amber-100 to-yellow-100',
    accent: 'bg-orange-600/20',
    style: 'Pueblo',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    gradient: 'from-emerald-100 via-green-100 to-teal-100',
    accent: 'bg-emerald-600/20',
    style: 'Watercolor',
  },
  {
    id: 'ksc',
    name: 'Kennedy Space Center',
    gradient: 'from-stone-100 via-gray-100 to-slate-100',
    accent: 'bg-stone-600/20',
    style: 'Topographic',
  },
];

interface FloatingCardProps {
  card: typeof DEMO_CARDS[0];
  index: number;
  totalCards: number;
}

function FloatingCard({ card, index, totalCards }: FloatingCardProps) {
  // Calculate initial position based on index
  const column = index % 3;
  const row = Math.floor(index / 3);

  // Random animation parameters
  const duration = 20 + Math.random() * 15; // 20-35s
  const delay = index * 0.5;

  // Starting positions spread across the screen
  const startX = (column * 33) + (Math.random() * 10);
  const startY = (row * 33) + (Math.random() * 10);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: 'clamp(140px, 18vw, 220px)',
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: -5 + Math.random() * 10 }}
      animate={{
        opacity: [0, 0.7, 0.7, 0],
        y: [0, -30, -60, -100],
        x: [0, 10 * (Math.random() > 0.5 ? 1 : -1), 20 * (Math.random() > 0.5 ? 1 : -1), 0],
        rotate: [-5 + Math.random() * 10, 5 * (Math.random() > 0.5 ? 1 : -1), -3 + Math.random() * 6],
        scale: [0.85, 1, 1, 0.9],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      <div className={`
        aspect-[2/3] rounded-xl overflow-hidden shadow-2xl
        bg-gradient-to-br ${card.gradient}
        border border-white/20
        transform-gpu
      `}>
        {/* Map content area */}
        <div className="relative h-3/4 overflow-hidden">
          {/* Simulated terrain lines */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute h-px ${card.accent} rounded-full`}
                style={{
                  top: `${15 + i * 10}%`,
                  left: '10%',
                  right: '10%',
                  transform: `rotate(${-2 + Math.random() * 4}deg)`,
                }}
              />
            ))}
          </div>
          {/* Style badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-sm">
            <span className="text-[8px] font-medium text-white/90">{card.style}</span>
          </div>
        </div>
        {/* Title area */}
        <div className="h-1/4 p-2 flex flex-col justify-center bg-gradient-to-t from-black/40 to-transparent">
          <p className="text-[10px] font-bold text-white/90 truncate">{card.name}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AuthBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-trail-light/80 via-background/90 to-background dark:from-background/95 dark:via-background/98 dark:to-card/90" />

      {/* Floating cards */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        {DEMO_CARDS.map((card, index) => (
          <FloatingCard
            key={card.id}
            card={card}
            index={index}
            totalCards={DEMO_CARDS.length}
          />
        ))}
      </div>

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
