'use client';

import { useState } from 'react';
import type { PosterStyle, PosterConfig } from '@/types/poster';
import { styles } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { ControlSection } from '@/components/ui/control-components';
import { PosterThumbnail } from '@/components/map/PosterThumbnail';

interface StyleSelectorProps {
  selectedStyleId: string;
  onStyleSelect: (style: PosterStyle) => void;
  currentConfig: PosterConfig;
}

export function StyleSelector({ selectedStyleId, onStyleSelect, currentConfig }: StyleSelectorProps) {
  const [hoveredStyleId, setHoveredStyleId] = useState<string | null>(null);

  return (
    <ControlSection title="Theme">
      <div className="grid grid-cols-1 gap-2">
        {styles.map((style) => {
          const isSelected = selectedStyleId === style.id;
          const isHovered = hoveredStyleId === style.id;
          const previewConfig: PosterConfig = {
            ...currentConfig,
            style,
            palette: style.defaultPalette,
          };
          
          return (
            <div key={style.id} className="relative">
              <button
                type="button"
                onClick={() => onStyleSelect(style)}
                onMouseEnter={() => setHoveredStyleId(style.id)}
                onMouseLeave={() => setHoveredStyleId(null)}
                className={cn(
                  'group relative flex items-start gap-4 p-4 text-left border rounded-lg transition-all w-full',
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 dark:border-primary/50 ring-1 ring-primary/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                <div className="flex-1 space-y-1">
                  <div className={cn(
                    "font-medium transition-colors",
                    isSelected ? "text-primary dark:text-primary" : "text-gray-900 dark:text-white"
                  )}>
                    {style.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {style.description}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="text-primary dark:text-primary">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </button>

              {isHovered && !isSelected && (
                <div className="absolute left-full ml-4 top-0 z-50 w-32 h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden pointer-events-none">
                  <PosterThumbnail config={previewConfig} className="w-full h-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ControlSection>
  );
}

