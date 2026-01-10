'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Heart, Loader2, ExternalLink } from 'lucide-react';
import { getTopExamples, type TopExample } from '@/lib/actions/feed';
import type { ProductMode } from '@/types/sculpture';
import Link from 'next/link';
import Image from 'next/image';

interface ExamplesGalleryProps {
  productMode: ProductMode;
}

export const ExamplesGallery: React.FC<ExamplesGalleryProps> = ({ productMode }) => {
  const [examples, setExamples] = useState<TopExample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExamples() {
      setIsLoading(true);
      try {
        const productType = productMode === 'sculpture' ? 'sculpture' : 'poster';
        const data = await getTopExamples(productType, 10);
        setExamples(data);
      } catch (error) {
        console.error('Failed to fetch examples:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExamples();
  }, [productMode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-5 h-5 text-primary dark:text-primary" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          {productMode === 'sculpture' ? '3D Sculpture Gallery' : 'Top Print Designs'}
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : examples.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No {productMode === 'sculpture' ? 'sculptures' : 'designs'} yet.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Be the first to publish!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          {examples.map((example) => {
            const thumbnailUrl = productMode === 'sculpture'
              ? example.sculpture_thumbnail_url || example.thumbnail_url
              : example.thumbnail_url;

            return (
              <Link
                key={example.id}
                href={`/map/${example.id}`}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg text-left bg-white dark:bg-gray-800",
                  "border-gray-100 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50"
                )}
              >
                <div className="aspect-[3/4] w-full relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={example.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

                  {/* Vote count badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium">
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{example.vote_score}</span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-semibold text-sm leading-tight drop-shadow-md line-clamp-2">
                      {example.title}
                    </h3>
                    <p className="text-xs text-white/80 mt-1">
                      by {example.author_username}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Explore more link */}
      {examples.length > 0 && (
        <Link
          href="/feed"
          className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <span>Explore More</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}

      <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/20 dark:border-primary/30">
        <p className="text-[11px] text-primary dark:text-primary/90 leading-relaxed italic">
          {productMode === 'sculpture'
            ? 'Tip: Click any sculpture to view details and remix it as your own.'
            : 'Tip: Click any design to view details and remix it as your starting point.'
          }
        </p>
      </div>
    </div>
  );
};
