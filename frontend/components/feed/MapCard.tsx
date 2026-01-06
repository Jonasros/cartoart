'use client';

import Link from 'next/link';
import { User, MessageCircle, Image as ImageIcon, Box } from 'lucide-react';
import { QuickLike } from '@/components/voting/QuickLike';
import type { FeedMap } from '@/lib/actions/feed';

interface MapCardProps {
  map: FeedMap;
  userLiked?: boolean;
}

export function MapCard({ map, userLiked = false }: MapCardProps) {
  return (
    <Link href={`/map/${map.id}`}>
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col">
        <div className="relative bg-secondary w-full" style={{ minHeight: '200px' }}>
          {/* Product Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            {map.product_type === 'sculpture' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-journey-sculpture text-white shadow-sm backdrop-blur-sm">
                <Box className="w-3 h-3" />
                Sculpture
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-adventure-print text-white shadow-sm backdrop-blur-sm">
                <ImageIcon className="w-3 h-3" />
                Print
              </span>
            )}
          </div>

          {/* Thumbnail Image */}
          {(map.product_type === 'sculpture' ? map.sculpture_thumbnail_url : map.thumbnail_url) ? (
            <img
              src={(map.product_type === 'sculpture' ? map.sculpture_thumbnail_url : map.thumbnail_url) as string}
              alt={map.title}
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          ) : (
            <div className="aspect-[2/3] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No thumbnail</p>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
            {map.title}
          </h3>
          {map.subtitle && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {map.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{map.author.display_name || map.author.username}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{map.comment_count}</span>
              </div>
              <QuickLike
                mapId={map.id}
                initialScore={map.vote_score}
                initialLiked={userLiked}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

