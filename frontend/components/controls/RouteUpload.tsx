'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Upload, Route, X, Mountain, Clock, Ruler, TrendingUp, TrendingDown, MousePointerClick, Navigation2, Loader2 } from 'lucide-react';
import { parseGPXFile, formatDistance, formatElevation, formatDuration } from '@/lib/route';
import type { RouteConfig, PosterLocation, PosterConfig, RouteData } from '@/types/poster';
import { cn } from '@/lib/utils';
import { ControlLabel } from '@/components/ui/control-components';
import { LocationSearch } from '@/components/controls/LocationSearch';
import { StravaActivityPicker } from '@/components/strava/StravaActivityPicker';
import { RouteBuilder } from '@/components/controls/RouteBuilder';
import type { StravaConnectionStatus } from '@/types/strava';
import type { RoutingProfile } from '@/lib/route/routeBuilder';
import posthog from 'posthog-js';

type RouteTab = 'upload' | 'draw' | 'strava';

interface RouteUploadProps {
  route: RouteConfig | undefined;
  onRouteChange: (route: RouteConfig | undefined) => void;
  onLocationChange?: (location: Partial<PosterLocation>) => void;
  drawMode?: boolean;
  onDrawModeChange?: (enabled: boolean) => void;
  // Location search props (for Draw tab)
  config?: PosterConfig;
  useMyLocation?: () => void;
  isLocating?: boolean;
  locationError?: string | null;
  // Route drawing props (forwarded to RouteBuilder)
  drawWaypoints?: [number, number][];
  drawProfile?: RoutingProfile;
  onDrawProfileChange?: (profile: RoutingProfile) => void;
  isSnapping?: boolean;
  snapError?: string | null;
  onUndoWaypoint?: () => void;
  onClearWaypoints?: () => void;
}

export function RouteUpload({ route, onRouteChange, onLocationChange, drawMode = false, onDrawModeChange, config, useMyLocation, isLocating, locationError, drawWaypoints, drawProfile, onDrawProfileChange, isSnapping, snapError, onUndoWaypoint, onClearWaypoints }: RouteUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [stravaStatus, setStravaStatus] = useState<StravaConnectionStatus | null>(null);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<RouteTab>('upload');

  // Check Strava connection status on mount
  useEffect(() => {
    const checkStravaStatus = async () => {
      try {
        const response = await fetch('/api/strava/status');
        if (response.ok) {
          const data = await response.json();
          setStravaStatus(data);
        }
      } catch (err) {
        // Silently fail - user just won't see the Strava option
        console.error('Failed to check Strava status:', err);
      }
    };
    checkStravaStatus();
  }, []);

  // When switching away from draw tab, disable draw mode
  useEffect(() => {
    if (activeTab !== 'draw' && drawMode && onDrawModeChange) {
      onDrawModeChange(false);
    }
  }, [activeTab, drawMode, onDrawModeChange]);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    const validExtensions = ['.gpx'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      setError('Please upload a GPX file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const routeData = await parseGPXFile(file);

      // Create new route config with the parsed data
      const newRoute: RouteConfig = {
        data: { ...routeData, source: 'gpx' },
        style: route?.style ?? {
          color: '#FF4444',
          width: 3,
          opacity: 0.9,
          lineStyle: 'solid',
          showStartEnd: true,
          startColor: '#22C55E',
          endColor: '#EF4444',
        },
        privacyZones: route?.privacyZones ?? [],
        showStats: route?.showStats ?? true,
        statsPosition: route?.statsPosition ?? 'bottom-left',
      };

      onRouteChange(newRoute);

      // Track GPX route upload event
      posthog.capture('route_uploaded', {
        source: 'gpx_file',
        distance_meters: routeData.stats.distance,
        elevation_gain_meters: routeData.stats.elevationGain,
        has_timestamps: !!routeData.stats.duration,
      });

      // Auto-populate title and subtitle from GPX metadata
      if (onLocationChange && routeData.name) {
        onLocationChange({
          name: routeData.name,
          // Use description as subtitle if available, otherwise clear it
          city: routeData.description || '',
        });
      }
    } catch (err) {
      posthog.captureException(err);
      setError(err instanceof Error ? err.message : 'Failed to parse GPX file');
    } finally {
      setIsLoading(false);
    }
  }, [route, onRouteChange, onLocationChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClearRoute = useCallback(() => {
    onRouteChange(undefined);
    setError(null);
    if (onDrawModeChange) {
      onDrawModeChange(false);
    }
  }, [onRouteChange, onDrawModeChange]);

  const handleStravaImport = useCallback((routeData: RouteData) => {
    // Create new route config with the imported data
    const newRoute: RouteConfig = {
      data: { ...routeData, source: 'strava' },
      style: route?.style ?? {
        color: '#FF4444',
        width: 3,
        opacity: 0.9,
        lineStyle: 'solid',
        showStartEnd: true,
        startColor: '#22C55E',
        endColor: '#EF4444',
      },
      privacyZones: route?.privacyZones ?? [],
      showStats: route?.showStats ?? true,
      statsPosition: route?.statsPosition ?? 'bottom-left',
    };

    onRouteChange(newRoute);

    // Track Strava import event
    posthog.capture('strava_activity_imported', {
      distance_meters: routeData.stats.distance,
      elevation_gain_meters: routeData.stats.elevationGain,
      has_timestamps: !!routeData.stats.duration,
    });

    // Auto-populate title from activity name
    if (onLocationChange && routeData.name) {
      onLocationChange({
        name: routeData.name,
        city: '',
      });
    }
  }, [route, onRouteChange, onLocationChange]);

  const routeData = route?.data;

  // Build tabs list — only show Strava tab if connected
  const tabs: { id: RouteTab; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload', icon: <Upload className="h-3.5 w-3.5" /> },
    { id: 'draw', label: 'Draw', icon: <MousePointerClick className="h-3.5 w-3.5" /> },
  ];
  if (stravaStatus?.connected) {
    tabs.push({
      id: 'strava',
      label: 'Strava',
      icon: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
      ),
    });
  }

  return (
    <div className="space-y-3">
      <ControlLabel>Route</ControlLabel>

      {routeData ? (
        // Route info display (same for all sources)
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
          {/* Route header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 min-w-0">
              <Route className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {routeData.name || (routeData.source === 'draw' ? 'Drawn Route' : 'Uploaded Route')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearRoute}
              className="h-7 w-7 p-0 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Route stats */}
          <div className="grid grid-cols-2 gap-2 p-3">
            <StatItem
              icon={Ruler}
              label="Distance"
              value={formatDistance(routeData.stats.distance)}
            />
            <StatItem
              icon={TrendingUp}
              label="Elevation Gain"
              value={formatElevation(routeData.stats.elevationGain)}
            />
            <StatItem
              icon={Mountain}
              label="Max Elevation"
              value={formatElevation(routeData.stats.maxElevation)}
            />
            {routeData.stats.duration ? (
              <StatItem
                icon={Clock}
                label="Duration"
                value={formatDuration(routeData.stats.duration)}
              />
            ) : (
              <StatItem
                icon={TrendingDown}
                label="Elevation Loss"
                value={formatElevation(routeData.stats.elevationLoss)}
              />
            )}
          </div>
        </div>
      ) : (
        // No route yet — show tabs
        <div className="space-y-3">
          {/* Tab bar */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                'relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                isDragOver
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                isLoading && 'opacity-50 pointer-events-none'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".gpx"
                onChange={handleInputChange}
                className="sr-only"
              />

              <div className="flex flex-col items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-8 w-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Processing GPX file...
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                      <Upload className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Upload GPX file
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Drag & drop or click to browse
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="space-y-3">
              {/* Location search to navigate to area */}
              {config && onLocationChange && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Navigate to an area, then draw your route
                  </p>
                  <LocationSearch
                    onLocationSelect={onLocationChange}
                    currentLocation={config.location}
                  />
                  {useMyLocation && (
                    <button
                      onClick={useMyLocation}
                      disabled={isLocating}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                        isLocating
                          ? "bg-primary/5 text-primary/50 cursor-wait"
                          : "text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 border border-primary/30 dark:border-primary/40"
                      )}
                    >
                      {isLocating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <Navigation2 className="w-3.5 h-3.5" />
                          Use my location
                        </>
                      )}
                    </button>
                  )}
                  {locationError && (
                    <p className="text-xs text-red-500 dark:text-red-400">{locationError}</p>
                  )}
                </div>
              )}

              {/* Route drawing controls */}
              <RouteBuilder
                route={route}
                drawMode={drawMode}
                onDrawModeChange={onDrawModeChange ?? (() => {})}
                waypoints={drawWaypoints ?? []}
                profile={drawProfile ?? 'foot'}
                onProfileChange={onDrawProfileChange ?? (() => {})}
                isSnapping={isSnapping ?? false}
                snapError={snapError ?? null}
                onUndo={onUndoWaypoint ?? (() => {})}
                onClear={onClearWaypoints ?? (() => {})}
              />
            </div>
          )}

          {activeTab === 'strava' && stravaStatus?.connected && (
            <div className="space-y-3">
              <button
                onClick={() => setShowActivityPicker(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#FC4C02]/50 hover:bg-[#FC4C02]/5 transition-colors text-left"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FC4C02]/10">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FC4C02">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Import from Strava
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Connected as {stravaStatus.athlete?.name}
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Strava Activity Picker Modal */}
      <StravaActivityPicker
        isOpen={showActivityPicker}
        onClose={() => setShowActivityPicker(false)}
        onSelectActivity={handleStravaImport}
      />
    </div>
  );
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
