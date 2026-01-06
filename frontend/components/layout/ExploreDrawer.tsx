'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Compass, ExternalLink, Loader2, TrendingUp, Clock, Heart, MessageCircle, Box, ImageIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFeed } from '@/lib/actions/feed';
import type { FeedMap, ProductTypeFilter } from '@/lib/actions/feed';
import Link from 'next/link';
import Image from 'next/image';

interface ExploreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExploreDrawer({ isOpen, onClose }: ExploreDrawerProps) {
  const [maps, setMaps] = useState<FeedMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'fresh' | 'top'>('top');
  const [productType, setProductType] = useState<ProductTypeFilter>('all');
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Only render portal after mount (SSR safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load maps when drawer opens or sort/productType changes
  useEffect(() => {
    if (!isOpen) return;

    const loadMaps = async () => {
      setLoading(true);
      try {
        const feedMaps = await getFeed(sort, 0, 12, 'all', productType);
        setMaps(feedMaps);
      } catch (error) {
        console.error('Failed to load explore maps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaps();
  }, [isOpen, sort, productType]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Don't render on server or when closed
  if (!mounted || !isOpen) return null;

  const drawerContent = (
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
        style={{ maxWidth: '384px' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Explore
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Sort Tabs */}
        <div className="flex-shrink-0 flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setSort('top')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-b-2 transition-colors",
              sort === 'top'
                ? "text-primary border-primary"
                : "text-gray-500 border-transparent hover:text-gray-700"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Top
          </button>
          <button
            onClick={() => setSort('fresh')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-b-2 transition-colors",
              sort === 'fresh'
                ? "text-primary border-primary"
                : "text-gray-500 border-transparent hover:text-gray-700"
            )}
          >
            <Clock className="w-4 h-4" />
            Fresh
          </button>
        </div>

        {/* Product Type Filter */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1 flex-1">
            <button
              onClick={() => setProductType('all')}
              className={cn(
                "flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                productType === 'all'
                  ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              All
            </button>
            <button
              onClick={() => setProductType('poster')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                productType === 'poster'
                  ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <ImageIcon className="w-3 h-3" />
              Prints
            </button>
            <button
              onClick={() => setProductType('sculpture')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                productType === 'sculpture'
                  ? "bg-journey-sculpture/10 dark:bg-journey-sculpture/20 text-journey-sculpture"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Box className="w-3 h-3" />
              Sculpture
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : maps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Compass className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No adventures to explore yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Be the first to share!
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {maps.map((map) => (
                <ExploreCard key={map.id} map={map} onClose={onClose} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <Link
            href="/feed"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Browse All Adventures
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}

interface ExploreCardProps {
  map: FeedMap;
  onClose: () => void;
}

function ExploreCard({ map, onClose }: ExploreCardProps) {
  // Use sculpture thumbnail for sculptures, regular thumbnail for posters
  const thumbnailUrl = map.product_type === 'sculpture'
    ? map.sculpture_thumbnail_url
    : map.thumbnail_url;

  return (
    <Link
      href={`/map/${map.id}`}
      onClick={onClose}
      className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={map.title}
            fill
            className="object-cover"
            sizes="384px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <Compass className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Product Type Badge */}
        <div className="absolute top-2 left-2 z-10">
          {map.product_type === 'sculpture' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-journey-sculpture text-white shadow-sm backdrop-blur-sm">
              <Box className="w-3 h-3" />
              Sculpture
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/90 text-white shadow-sm backdrop-blur-sm">
              <ImageIcon className="w-3 h-3" />
              Print
            </span>
          )}
        </div>

        {/* Stats badges */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
            <Heart className="w-3 h-3" />
            <span>{map.vote_score}</span>
          </div>
          {map.comment_count > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
              <MessageCircle className="w-3 h-3" />
              <span>{map.comment_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
          {map.title}
        </h3>
        {map.subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
            {map.subtitle}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          by {map.author.display_name || map.author.username}
        </p>
      </div>
    </Link>
  );
}
