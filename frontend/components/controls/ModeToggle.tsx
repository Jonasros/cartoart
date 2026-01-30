'use client';

import { Image, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductMode } from '@/types/sculpture';

interface ModeToggleProps {
  mode: ProductMode;
  onModeChange: (mode: ProductMode) => void;
  /** Sculpture mode requires a route to be loaded */
  hasRoute: boolean;
}

/**
 * Toggle between Poster (2D) and Sculpture (3D) modes.
 * Placed below logo in TabNavigation.
 */
export function ModeToggle({ mode, onModeChange, hasRoute }: ModeToggleProps) {
  const sculptureDisabled = !hasRoute;

  return (
    <div className="w-full px-2 py-3 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
        {/* Poster Mode Button */}
        <button
          onClick={() => onModeChange('poster')}
          className={cn(
            'flex-1 min-w-0 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all',
            mode === 'poster'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-adventure-print'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
          title="Create Adventure Print"
        >
          <Image className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-1 hidden md:block">Print</span>
        </button>

        {/* Sculpture Mode Button */}
        <button
          onClick={() => !sculptureDisabled && onModeChange('sculpture')}
          disabled={sculptureDisabled}
          className={cn(
            'flex-1 min-w-0 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all',
            mode === 'sculpture'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-journey-sculpture'
              : sculptureDisabled
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
          title={sculptureDisabled ? 'Add a route to enable Journey Sculpture mode' : 'Create Journey Sculpture'}
        >
          <Box className="w-4 h-4" />
          <span className="text-[9px] font-medium mt-1 hidden md:block">3D</span>
        </button>
      </div>

      {/* Tooltip for disabled state */}
      {sculptureDisabled && mode === 'poster' && (
        <p className="text-[8px] text-gray-400 dark:text-gray-500 text-center mt-1.5 px-1 hidden md:block leading-tight">
          Add route for 3D
        </p>
      )}
    </div>
  );
}
