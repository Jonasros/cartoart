'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles,
  Truck,
  Frame,
  Image,
  Layers,
  Printer,
  Gem,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureVoteButton } from './FeatureVoteButton';
import {
  getFeaturesByCategory,
  getVotedFeatures,
  type FeatureCategory,
  type ComingSoonFeature,
} from '@/lib/features/comingSoon';

// Map icon names to Lucide components
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  Frame,
  Image,
  Layers,
  Printer,
  Gem,
};

interface ComingSoonCardProps {
  category: FeatureCategory;
  className?: string;
  source?: string;
}

export function ComingSoonCard({
  category,
  className,
  source = 'export_modal',
}: ComingSoonCardProps) {
  const [votedFeatures, setVotedFeatures] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const features = getFeaturesByCategory(category);

  // Load voted features from localStorage on mount
  useEffect(() => {
    setVotedFeatures(getVotedFeatures());
    setIsLoaded(true);
  }, []);

  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-gradient-to-br from-amber-50 to-orange-50',
        'dark:from-amber-950/30 dark:to-orange-950/30',
        'border border-amber-200/50 dark:border-amber-800/30',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            Coming Soon
          </span>
        </div>
        <span className="text-xs text-amber-600 dark:text-amber-400">
          Vote for what you want!
        </span>
      </div>

      {/* Feature list */}
      <div className="space-y-2">
        {features.map((feature) => (
          <FeatureRow
            key={feature.key}
            feature={feature}
            isVoted={isLoaded && votedFeatures.includes(feature.key)}
            source={source}
          />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-3 text-xs text-amber-600/80 dark:text-amber-400/80 text-center">
        Your votes help us prioritize
      </p>
    </div>
  );
}

interface FeatureRowProps {
  feature: ComingSoonFeature;
  isVoted: boolean;
  source: string;
}

function FeatureRow({ feature, isVoted, source }: FeatureRowProps) {
  const IconComponent = ICONS[feature.icon] || Sparkles;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3',
        'p-2.5 rounded-lg',
        'bg-white/60 dark:bg-gray-800/40'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {feature.label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {feature.description}
          </p>
        </div>
      </div>

      <FeatureVoteButton
        featureKey={feature.key}
        category={feature.category}
        initialVoted={isVoted}
        source={source}
      />
    </div>
  );
}
