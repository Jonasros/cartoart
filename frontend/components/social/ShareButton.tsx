'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  map: {
    id: string;
    title: string;
    subtitle?: string;
    thumbnail_url?: string | null;
  };
  variant?: 'icon' | 'button' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function ShareButton({
  map,
  variant = 'icon',
  size = 'md',
  className,
  showLabel = false,
}: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  // Handle click - stop propagation to prevent card click
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
            'bg-secondary/80 hover:bg-secondary text-foreground',
            'border border-border hover:border-border/80',
            className
          )}
          aria-label="Share adventure"
        >
          <Share2 className={sizeClasses[size]} />
          {showLabel && <span className="text-sm font-medium">Share</span>}
        </button>
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          map={map}
        />
      </>
    );
  }

  if (variant === 'ghost') {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center gap-2 rounded-lg transition-colors',
            buttonSizeClasses[size],
            'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
            className
          )}
          aria-label="Share adventure"
        >
          <Share2 className={sizeClasses[size]} />
          {showLabel && <span className="text-sm">Share</span>}
        </button>
        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          map={map}
        />
      </>
    );
  }

  // Icon variant (default)
  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center justify-center rounded-full transition-all',
          buttonSizeClasses[size],
          'text-muted-foreground hover:text-primary',
          'hover:bg-primary/10',
          className
        )}
        aria-label="Share adventure"
      >
        <Share2 className={sizeClasses[size]} />
      </button>
      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        map={map}
      />
    </>
  );
}
