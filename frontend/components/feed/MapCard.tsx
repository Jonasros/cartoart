'use client';

import Link from 'next/link';
import { User, MessageCircle } from 'lucide-react';
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
        {map.thumbnail_url ? (
          <div className="relative bg-gray-100 dark:bg-gray-700 w-full" style={{ minHeight: '200px' }}>
            <img
              src={map.thumbnail_url}
              alt={map.title}
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No thumbnail</p>
          </div>
        )}

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

