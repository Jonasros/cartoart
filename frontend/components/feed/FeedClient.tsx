'use client';

import { useEffect, useRef } from 'react';
import { FeedFilters } from './FeedFilters';
import { MapGrid } from './MapGrid';
import { useInfiniteFeed } from '@/hooks/useInfiniteFeed';
import { Loader2 } from 'lucide-react';
import type { TimeRange, ProductTypeFilter, SortOption } from '@/lib/actions/feed';

interface FeedClientProps {
  initialSort: SortOption;
  initialTimeRange: TimeRange;
  initialProductType: ProductTypeFilter;
}

export function FeedClient({ initialSort, initialTimeRange, initialProductType }: FeedClientProps) {
  const { maps, loadMore, hasMore, loading, initialLoading, error } = useInfiniteFeed(initialSort, initialTimeRange, initialProductType);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !initialLoading) {
          loadMore();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before reaching the bottom
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, initialLoading, loadMore]);

  return (
    <>
      <FeedFilters currentSort={initialSort} currentTimeRange={initialTimeRange} currentProductType={initialProductType} />
      
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {initialLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <MapGrid maps={maps} />

          {/* Sentinel element for infinite scroll */}
          <div ref={sentinelRef} className="h-10 flex items-center justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading more adventures...</span>
              </div>
            )}
            {!hasMore && maps.length > 0 && (
              <p className="text-sm text-muted-foreground">
                You've explored all adventures
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}

