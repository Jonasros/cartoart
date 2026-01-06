'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LikeAnimationProps {
  isActive: boolean;
  trigger: number; // Increment to trigger animation
  className?: string;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

const PARTICLE_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
];

export function LikeAnimation({ isActive, trigger, className }: LikeAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showRing, setShowRing] = useState(false);

  useEffect(() => {
    if (isActive && trigger > 0) {
      // Generate burst particles
      const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 30) + (Math.random() * 15 - 7.5), // 30° intervals with jitter
        distance: 20 + Math.random() * 15,
        size: 4 + Math.random() * 4,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        delay: Math.random() * 50,
      }));

      setParticles(newParticles);
      setShowRing(true);

      // Trigger haptic feedback on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Clear particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
        setShowRing(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [trigger, isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-visible", className)}>
      {/* Ring burst effect */}
      {showRing && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-red-400 animate-like-ring"
        />
      )}

      {/* Particle burst */}
      {particles.map((particle) => {
        const x = Math.cos((particle.angle * Math.PI) / 180) * particle.distance;
        const y = Math.sin((particle.angle * Math.PI) / 180) * particle.distance;

        return (
          <div
            key={particle.id}
            className="absolute left-1/2 top-1/2 rounded-full animate-like-particle"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              '--particle-x': `${x}px`,
              '--particle-y': `${y}px`,
              animationDelay: `${particle.delay}ms`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

// Mini hearts that float up on like
export function FloatingHearts({ trigger, className }: { trigger: number; className?: string }) {
  const [hearts, setHearts] = useState<{ id: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    if (trigger > 0) {
      const newHearts = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        left: 30 + Math.random() * 40, // 30-70% from left
        delay: i * 80,
      }));

      setHearts(newHearts);

      const timer = setTimeout(() => {
        setHearts([]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (hearts.length === 0) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-visible", className)}>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-full text-red-500 animate-float-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}ms`,
            fontSize: '12px',
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}
