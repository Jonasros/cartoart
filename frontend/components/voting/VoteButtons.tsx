'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { voteOnMap, removeVote } from '@/lib/actions/votes';
import { cn } from '@/lib/utils';
import { LikeAnimation, FloatingHearts } from './LikeAnimation';
import posthog from 'posthog-js';

interface VoteButtonsProps {
  mapId: string;
  initialVote: number | null;
  initialScore: number;
  isAuthenticated?: boolean;
}

export function VoteButtons({ mapId, initialVote, initialScore, isAuthenticated = false }: VoteButtonsProps) {
  // Convert any positive vote to "liked" state (for backwards compatibility with old +1/-1 votes)
  const [liked, setLiked] = useState(initialVote === 1);
  const [score, setScore] = useState(initialScore);
  const [isPending, startTransition] = useTransition();
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showScoreBump, setShowScoreBump] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const newLiked = !liked;
    const scoreDelta = newLiked ? 1 : -1;

    // Optimistic update
    setLiked(newLiked);
    setScore(score + scoreDelta);

    // Trigger animations only when liking (not unliking)
    if (newLiked) {
      setAnimationTrigger(prev => prev + 1);
      setShowHeartPop(true);
      setShowScoreBump(true);

      // Reset animation states
      setTimeout(() => setShowHeartPop(false), 500);
      setTimeout(() => setShowScoreBump(false), 300);

      // Haptic feedback for mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }

    startTransition(async () => {
      try {
        if (newLiked) {
          await voteOnMap(mapId, 1);
          // Track map liked event
          posthog.capture('map_liked', {
            map_id: mapId,
          });
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
      ref={buttonRef}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
        "hover:bg-gray-100 dark:hover:bg-gray-700",
        isPending && "opacity-50 cursor-not-allowed"
      )}
      aria-label={liked ? "Unlike this map" : "Like this map"}
    >
      {/* Animation effects */}
      <LikeAnimation
        isActive={liked}
        trigger={animationTrigger}
        className="z-10"
      />
      <FloatingHearts trigger={animationTrigger} />

      <Heart
        className={cn(
          "w-5 h-5 transition-all",
          liked
            ? "fill-red-500 text-red-500"
            : "text-gray-400 dark:text-gray-500 hover:text-red-400",
          showHeartPop && "animate-heart-pop"
        )}
      />
      <span className={cn(
        "text-base font-semibold transition-all",
        liked ? "text-red-500" : "text-gray-600 dark:text-gray-300",
        showScoreBump && "animate-score-bump"
      )}>
        {score}
      </span>
    </button>
  );
}
