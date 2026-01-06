'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemixBadgeProps {
  originalMapId: string;
  originalTitle?: string;
  originalAuthor?: string;
  className?: string;
  variant?: 'inline' | 'card';
}

export function RemixBadge({
  originalMapId,
  originalTitle,
  originalAuthor,
  className,
  variant = 'inline',
}: RemixBadgeProps) {
  if (variant === 'card') {
    return (
      <Link
        href={`/map/${originalMapId}`}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
          'hover:text-accent transition-colors',
          className
        )}
      >
        <Sparkles className="w-3 h-3" />
        <span>
          Remixed
          {originalAuthor && (
            <> from <span className="font-medium">@{originalAuthor}</span></>
          )}
        </span>
      </Link>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-accent/10 border border-accent/20',
        className
      )}
    >
      <Sparkles className="w-4 h-4 text-accent" />
      <div className="text-sm">
        <span className="text-muted-foreground">Remixed from </span>
        <Link
          href={`/map/${originalMapId}`}
          className="font-medium text-foreground hover:text-accent transition-colors"
        >
          {originalTitle || 'Original Adventure'}
        </Link>
        {originalAuthor && (
          <span className="text-muted-foreground">
            {' '}by <span className="font-medium">@{originalAuthor}</span>
          </span>
        )}
      </div>
    </div>
  );
}
