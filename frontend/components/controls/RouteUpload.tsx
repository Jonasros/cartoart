'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Upload, Route, X, Mountain, Clock, Ruler, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { parseGPXFile, formatDistance, formatElevation, formatDuration } from '@/lib/route';
import type { RouteConfig, PosterLocation, RouteData } from '@/types/poster';
import { cn } from '@/lib/utils';
import { ControlLabel, Button } from '@/components/ui/control-components';
import { StravaActivityPicker } from '@/components/strava/StravaActivityPicker';
import type { StravaConnectionStatus } from '@/types/strava';

interface RouteUploadProps {
  route: RouteConfig | undefined;
  onRouteChange: (route: RouteConfig | undefined) => void;
  onLocationChange?: (location: Partial<PosterLocation>) => void;
}

export function RouteUpload({ route, onRouteChange, onLocationChange }: RouteUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [stravaStatus, setStravaStatus] = useState<StravaConnectionStatus | null>(null);
  const [showActivityPicker, setShowActivityPicker] = useState(false);

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
        data: routeData,
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

      // Auto-populate title and subtitle from GPX metadata
      if (onLocationChange && routeData.name) {
        onLocationChange({
          name: routeData.name,
          // Use description as subtitle if available, otherwise clear it
          city: routeData.description || '',
        });
      }
    } catch (err) {
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
  }, [onRouteChange]);

  const handleStravaImport = useCallback((routeData: RouteData) => {
    // Create new route config with the imported data
    const newRoute: RouteConfig = {
      data: routeData,
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

    // Auto-populate title from activity name
    if (onLocationChange && routeData.name) {
      onLocationChange({
        name: routeData.name,
        city: '',
      });
    }
  }, [route, onRouteChange, onLocationChange]);

  const routeData = route?.data;

  return (
    <div className="space-y-3">
      <ControlLabel>Route Upload</ControlLabel>

      {!routeData ? (
        // Upload zone
        <div className="space-y-3">
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

          {/* Strava Import Option */}
          {stravaStatus?.connected && (
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
          )}
        </div>
      ) : (
        // Route info display
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
          {/* Route header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 min-w-0">
              <Route className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {routeData.name || 'Uploaded Route'}
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
