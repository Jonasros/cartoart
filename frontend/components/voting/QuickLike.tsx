'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { voteOnMap, removeVote } from '@/lib/actions/votes';
import { cn } from '@/lib/utils';

interface QuickLikeProps {
  mapId: string;
  initialScore: number;
  initialLiked?: boolean;
  className?: string;
}

export function QuickLike({ mapId, initialScore, initialLiked = false, className }: QuickLikeProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [score, setScore] = useState(initialScore);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when inside a link
    e.stopPropagation();

    const newLiked = !liked;
    const scoreDelta = newLiked ? 1 : -1;

    // Optimistic update
    setLiked(newLiked);
    setScore(score + scoreDelta);

    startTransition(async () => {
      try {
        if (newLiked) {
          await voteOnMap(mapId, 1);
        } else {
          await removeVote(mapId);
        }
      } catch (error) {
        // Revert on error
        setLiked(liked);
        setScore(score);
        console.error('Failed to like:', error);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all",
        "hover:bg-gray-100 dark:hover:bg-gray-700",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={liked ? "Unlike this map" : "Like this map"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all",
          liked
            ? "fill-red-500 text-red-500 scale-110"
            : "text-gray-400 dark:text-gray-500 hover:text-red-400"
        )}
      />
      <span className={cn(
        "text-sm font-medium",
        liked ? "text-red-500" : "text-gray-500 dark:text-gray-400"
      )}>
        {score}
      </span>
    </button>
  );
}
