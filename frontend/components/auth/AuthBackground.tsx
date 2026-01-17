'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

export interface RouteThumbnail {
  url: string;
  title: string;
}

interface FloatingCardProps {
  thumbnail: RouteThumbnail;
  index: number;
  animationSeed: number;
}

function FloatingCard({ thumbnail, index, animationSeed }: FloatingCardProps) {
  // Calculate initial position based on index
  const column = index % 3;
  const row = Math.floor(index / 3);

  // Use seeded random values for consistent animations
  const seed = animationSeed + index;
  const seededRandom = (n: number) => ((seed * (n + 1) * 9301 + 49297) % 233280) / 233280;

  const duration = 20 + seededRandom(1) * 15; // 20-35s
  const delay = index * 0.2; // Faster staggered appearance

  // Starting positions spread across the screen
  const startX = (column * 33) + (seededRandom(2) * 10);
  const startY = (row * 33) + (seededRandom(3) * 10);

  const initialRotate = -5 + seededRandom(4) * 10;
  const xDirection = seededRandom(5) > 0.5 ? 1 : -1;
  const x2Direction = seededRandom(6) > 0.5 ? 1 : -1;
  const rotateDirection = seededRandom(7) > 0.5 ? 1 : -1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: 'clamp(140px, 18vw, 220px)',
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: initialRotate }}
      animate={{
        opacity: [0, 0.8, 0.8, 0],
        y: [0, -30, -60, -100],
        x: [0, 10 * xDirection, 20 * x2Direction, 0],
        rotate: [initialRotate, 5 * rotateDirection, -3 + seededRandom(8) * 6],
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
      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/20 transform-gpu bg-card">
        <Image
          src={thumbnail.url}
          alt={thumbnail.title}
          fill
          className="object-cover"
          sizes="220px"
          unoptimized
        />
      </div>
    </motion.div>
  );
}

interface AuthBackgroundProps {
  thumbnails?: RouteThumbnail[];
}

export function AuthBackground({ thumbnails = [] }: AuthBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  // Generate a stable animation seed once on mount
  const animationSeed = useMemo(() => Math.floor(Math.random() * 10000), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || thumbnails.length === 0) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-trail-light/80 via-background/90 to-background dark:from-background/95 dark:via-background/98 dark:to-card/90" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-trail-light/80 via-background/90 to-background dark:from-background/95 dark:via-background/98 dark:to-card/90" />

      {/* Floating cards */}
      <div className="absolute inset-0 opacity-40 dark:opacity-25">
        {thumbnails.map((thumbnail, index) => (
          <FloatingCard
            key={`${thumbnail.url}-${index}`}
            thumbnail={thumbnail}
            index={index}
            animationSeed={animationSeed}
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
