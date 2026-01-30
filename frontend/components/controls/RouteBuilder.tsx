'use client';

import { MousePointerClick, Footprints, Bike, Undo2, Trash2, Loader2 } from 'lucide-react';
import { formatDistance, formatElevation } from '@/lib/route';
import type { RouteConfig } from '@/types/poster';
import type { RoutingProfile } from '@/lib/route/routeBuilder';

interface RouteBuilderProps {
  route: RouteConfig | undefined;
  drawMode: boolean;
  onDrawModeChange: (enabled: boolean) => void;
  waypoints: [number, number][];
  profile: RoutingProfile;
  onProfileChange: (profile: RoutingProfile) => void;
  isSnapping: boolean;
  snapError: string | null;
  onUndo: () => void;
  onClear: () => void;
}

export function RouteBuilder({
  route,
  drawMode,
  onDrawModeChange,
  waypoints,
  profile,
  onProfileChange,
  isSnapping,
  snapError,
  onUndo,
  onClear,
}: RouteBuilderProps) {
  const routeData = route?.data;
  const hasWaypoints = waypoints.length > 0;

  return (
    <div className="space-y-3">
      {/* Profile selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onProfileChange('foot')}
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
          onClick={() => onProfileChange('bike')}
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
        {isSnapping ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MousePointerClick className="h-4 w-4" />
        )}
        {drawMode
          ? isSnapping
            ? 'Snapping route to roads...'
            : 'Drawing... Click map to add points'
          : hasWaypoints
            ? 'Continue Drawing'
            : 'Start Drawing Route'}
      </button>

      {/* Undo / Clear buttons */}
      {hasWaypoints && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={isSnapping}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={isSnapping}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Live stats */}
      {routeData && routeData.source === 'draw' && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Distance</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDistance(routeData.stats.distance)}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Elevation Gain</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatElevation(routeData.stats.elevationGain)}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Waypoints</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {waypoints.length}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Max Elevation</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatElevation(routeData.stats.maxElevation)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Snap error */}
      {snapError && (
        <p className="text-xs text-red-500 dark:text-red-400">{snapError}</p>
      )}

      {/* Instructions */}
      {drawMode && !hasWaypoints && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Click on the map to place waypoints.</p>
          <p>The route will snap to {profile === 'foot' ? 'walkable paths' : 'cycling routes'}.</p>
        </div>
      )}

      {!drawMode && !hasWaypoints && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Draw a route by clicking points on the map. The route automatically snaps to roads.
        </p>
      )}
    </div>
  );
}
