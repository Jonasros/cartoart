'use client';

import { useState } from 'react';
import { MousePointerClick, Footprints, Bike } from 'lucide-react';
import type { RouteConfig, PosterLocation } from '@/types/poster';
import type { RoutingProfile } from '@/lib/route/routeBuilder';

interface RouteBuilderProps {
  route: RouteConfig | undefined;
  onRouteChange: (route: RouteConfig | undefined) => void;
  onLocationChange?: (location: Partial<PosterLocation>) => void;
  drawMode: boolean;
  onDrawModeChange: (enabled: boolean) => void;
}

export function RouteBuilder({
  drawMode,
  onDrawModeChange,
}: RouteBuilderProps) {
  const [profile, setProfile] = useState<RoutingProfile>('foot');

  return (
    <div className="space-y-3">
      {/* Profile selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setProfile('foot')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            profile === 'foot'
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Footprints className="h-3.5 w-3.5" />
          Walking
        </button>
        <button
          type="button"
          onClick={() => setProfile('bike')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            profile === 'bike'
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Bike className="h-3.5 w-3.5" />
          Cycling
        </button>
      </div>

      {/* Draw mode toggle */}
      <button
        type="button"
        onClick={() => onDrawModeChange(!drawMode)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          drawMode
            ? 'bg-primary text-white hover:bg-primary/90'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <MousePointerClick className="h-4 w-4" />
        {drawMode ? 'Drawing... Click map to add points' : 'Start Drawing Route'}
      </button>

      {/* Instructions */}
      {drawMode && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Click on the map to place waypoints.</p>
          <p>The route will snap to {profile === 'foot' ? 'walkable paths' : 'cycling routes'}.</p>
          <p>Click the button again to stop drawing.</p>
        </div>
      )}

      {!drawMode && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Draw a route by clicking points on the map. The route automatically snaps to roads.
        </p>
      )}
    </div>
  );
}
