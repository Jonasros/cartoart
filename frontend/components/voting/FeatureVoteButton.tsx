'use client';

import { useState } from 'react';
import { ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFeatureVote, type FeatureCategory } from '@/lib/features/comingSoon';
import posthog from 'posthog-js';

interface FeatureVoteButtonProps {
  featureKey: string;
  category: FeatureCategory;
  initialVoted: boolean;
  source?: string;
}

export function FeatureVoteButton({
  featureKey,
  category,
  initialVoted,
  source = 'export_modal',
}: FeatureVoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    const newVoted = toggleFeatureVote(featureKey);
    setVoted(newVoted);

    // Trigger animation
    if (newVoted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }

    // Track in PostHog
    if (newVoted) {
      posthog.capture('feature_vote_added', {
        feature_key: featureKey,
        category,
        source,
      });
    } else {
      posthog.capture('feature_vote_removed', {
        feature_key: featureKey,
        category,
        source,
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
        'border-2 flex-shrink-0',
        voted
          ? 'bg-primary/10 border-primary text-primary'
          : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 text-gray-400 hover:text-primary/70',
        isAnimating && 'scale-110'
      )}
      title={voted ? 'Remove vote' : 'Vote for this feature'}
      aria-label={voted ? `Remove vote for ${featureKey}` : `Vote for ${featureKey}`}
    >
      {voted ? (
        <Check className="w-4 h-4" />
      ) : (
        <ChevronUp className="w-4 h-4" />
      )}
    </button>
  );
}
