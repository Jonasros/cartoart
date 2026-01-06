'use client';

import Link from 'next/link';
import { User, MessageCircle, Image as ImageIcon, Box, Sparkles } from 'lucide-react';
import { QuickLike } from '@/components/voting/QuickLike';
import { ShareButton } from '@/components/social/ShareButton';
import type { FeedMap } from '@/lib/actions/feed';

interface MapCardProps {
  map: FeedMap;
  userLiked?: boolean;
}

export function MapCard({ map, userLiked = false }: MapCardProps) {
  // Get the appropriate thumbnail
  const thumbnailUrl = map.product_type === 'sculpture'
    ? map.sculpture_thumbnail_url
    : map.thumbnail_url;

  return (
    <Link href={`/map/${map.id}`}>
      <div className="group bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col">
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

          {/* Quick Actions Overlay (visible on hover) */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShareButton
              map={{
                id: map.id,
                title: map.title,
                subtitle: map.subtitle || undefined,
                thumbnail_url: thumbnailUrl,
              }}
              variant="icon"
              size="sm"
              className="bg-black/50 backdrop-blur-sm text-white hover:text-white hover:bg-black/70"
            />
          </div>

          {/* Thumbnail Image */}
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
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
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {map.subtitle}
            </p>
          )}

          {/* Remix indicator */}
          {map.remixed_from_id && (
            <div className="flex items-center gap-1 text-xs text-accent mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Remixed</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{map.author.display_name || map.author.username}</span>
            </div>
            <div className="flex items-center gap-3">
              {map.remix_count > 0 && (
                <div className="flex items-center gap-1 text-accent">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{map.remix_count}</span>
                </div>
              )}
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
