'use client';

import { cn } from '@/lib/utils';

interface WaymarkerLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

/**
 * Waymarker Mountain Logo
 * Stylized mountain peak with trail path
 * Forest green to sunset orange gradient
 */
export function WaymarkerLogo({ size = 'md', className, showText = false }: WaymarkerLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClasses[size], 'flex-shrink-0')}
        aria-label="Waymarker logo"
      >
        <defs>
          {/* Forest to sunset gradient */}
          <linearGradient id="mountain-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.45 0.12 145)" /> {/* Forest green */}
            <stop offset="100%" stopColor="oklch(0.65 0.18 45)" /> {/* Sunset orange */}
          </linearGradient>
          {/* Trail gradient */}
          <linearGradient id="trail-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.55 0.10 145)" /> {/* Lighter forest */}
            <stop offset="100%" stopColor="oklch(0.75 0.15 45)" /> {/* Lighter sunset */}
          </linearGradient>
        </defs>

        {/* Main mountain shape */}
        <path
          d="M16 4L28 26H4L16 4Z"
          fill="url(#mountain-gradient)"
        />

        {/* Secondary peak (smaller, offset) */}
        <path
          d="M22 12L28 26H16L22 12Z"
          fill="url(#mountain-gradient)"
          opacity="0.7"
        />

        {/* Trail/path winding up the mountain */}
        <path
          d="M10 24C12 22 13 20 14 18C15 16 15.5 14 16 12C16.5 10 16.8 8 17 6"
          stroke="url(#trail-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Trail marker dots */}
        <circle cx="11" cy="23" r="1" fill="oklch(0.98 0.005 80)" opacity="0.9" />
        <circle cx="14.5" cy="17" r="1" fill="oklch(0.98 0.005 80)" opacity="0.9" />
        <circle cx="16.5" cy="10" r="1" fill="oklch(0.98 0.005 80)" opacity="0.9" />

        {/* Summit marker */}
        <circle cx="16" cy="6" r="1.5" fill="oklch(0.65 0.18 45)" />
      </svg>

      {showText && (
        <span className={cn('font-bold text-foreground font-display', textSizeClasses[size])}>
          Waymarker
        </span>
      )}
    </div>
  );
}
