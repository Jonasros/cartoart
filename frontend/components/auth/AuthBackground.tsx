'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { POSTER_EXAMPLES } from '@/lib/config/examples';
import { PosterThumbnail } from '../map/PosterThumbnail';

interface FloatingCardProps {
  example: (typeof POSTER_EXAMPLES)[0];
  index: number;
  totalCards: number;
}

function FloatingCard({ example, index, totalCards }: FloatingCardProps) {
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
        opacity: [0, 0.8, 0.8, 0],
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
      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/20 transform-gpu">
        {/* Actual PosterThumbnail with example config */}
        <div className="relative h-3/4 overflow-hidden">
          <PosterThumbnail
            config={example.config}
            className="w-full h-full"
          />
          {/* Style badge */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
            <span className="text-[8px] font-medium text-white/90">{example.config.style.name}</span>
          </div>
        </div>
        {/* Title area */}
        <div
          className="h-1/4 p-2 flex flex-col justify-center"
          style={{ backgroundColor: example.config.palette.background }}
        >
          <p
            className="text-[10px] font-bold truncate"
            style={{ color: example.config.palette.text }}
          >
            {example.name}
          </p>
          <p
            className="text-[8px] truncate opacity-70"
            style={{ color: example.config.palette.text }}
          >
            {example.config.location.subtitle || example.config.location.city}
          </p>
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
      <div className="absolute inset-0 opacity-40 dark:opacity-25">
        {POSTER_EXAMPLES.map((example, index) => (
          <FloatingCard
            key={example.id}
            example={example}
            index={index}
            totalCards={POSTER_EXAMPLES.length}
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
