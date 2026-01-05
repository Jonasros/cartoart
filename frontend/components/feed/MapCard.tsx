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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col">
        <div className="relative bg-gray-100 dark:bg-gray-700 w-full" style={{ minHeight: '200px' }}>
          {/* Product Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            {map.product_type === 'sculpture' ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/90 text-white shadow-sm backdrop-blur-sm">
                <Box className="w-3 h-3" />
                3D
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/90 text-white shadow-sm backdrop-blur-sm">
                <ImageIcon className="w-3 h-3" />
                Poster
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
              <p className="text-gray-400 dark:text-gray-500 text-sm">No thumbnail</p>
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {map.title}
          </h3>
          {map.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
              {map.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
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

