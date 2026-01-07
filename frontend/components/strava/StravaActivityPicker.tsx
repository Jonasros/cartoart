'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/control-components';
import {
  Loader2,
  X,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  Bike,
  Mountain,
  Footprints,
} from 'lucide-react';
import type { StravaActivitySummary } from '@/types/strava';
import type { RouteData } from '@/types/poster';
import { decodePolyline } from '@/lib/strava/convertToRouteData';

interface StravaActivityPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActivity: (routeData: RouteData) => void;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km >= 100 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getActivityIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'run':
    case 'virtualrun':
    case 'trailrun':
      return Footprints;
    case 'ride':
    case 'virtualride':
    case 'ebikeride':
    case 'mountainbikeride':
    case 'gravelride':
      return Bike;
    case 'hike':
    case 'walk':
      return Mountain;
    default:
      return Activity;
  }
}

function MiniPolyline({ polyline }: { polyline: string }) {
  const coordinates = decodePolyline(polyline);
  if (coordinates.length < 2) return null;

  // Normalize to SVG viewbox
  const lats = coordinates.map((c) => c[0]);
  const lngs = coordinates.map((c) => c[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const width = maxLng - minLng || 1;
  const height = maxLat - minLat || 1;
  const padding = 2;
  const svgWidth = 60;
  const svgHeight = 40;

  const scaleFactor = Math.min(
    (svgWidth - padding * 2) / width,
    (svgHeight - padding * 2) / height
  );

  const points = coordinates
    .map((c) => {
      const x = padding + (c[1] - minLng) * scaleFactor;
      const y = svgHeight - padding - (c[0] - minLat) * scaleFactor;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-full"
      style={{ transform: 'scaleY(-1)' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StravaActivityPicker({
  isOpen,
  onClose,
  onSelectActivity,
}: StravaActivityPickerProps) {
  const [activities, setActivities] = useState<StravaActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchActivities = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await fetch(
          `/api/strava/activities?page=${pageNum}&per_page=20`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();

        if (append) {
          setActivities((prev) => [...prev, ...data.activities]);
        } else {
          setActivities(data.activities);
        }

        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (err) {
        setError('Failed to load activities. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      fetchActivities(1);
    }
  }, [isOpen, fetchActivities]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(page + 1, true);
    }
  };

  const handleSelectActivity = async (activity: StravaActivitySummary) => {
    setSelectedId(activity.id);
    setImporting(true);

    try {
      const response = await fetch(`/api/strava/activities/${activity.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch activity details');
      }

      const data = await response.json();
      onSelectActivity(data.routeData);
      onClose();
    } catch (err) {
      setError('Failed to import activity. Please try again.');
      setSelectedId(null);
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FC4C02]/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FC4C02">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import from Strava
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#FC4C02]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button variant="outline" onClick={() => fetchActivities(1)}>
                Try Again
              </Button>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No activities with GPS data found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const isSelected = selectedId === activity.id;

                return (
                  <button
                    key={activity.id}
                    onClick={() => handleSelectActivity(activity)}
                    disabled={importing}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-[#FC4C02] bg-[#FC4C02]/5 dark:bg-[#FC4C02]/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#FC4C02]/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    } ${importing && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Mini Map Preview */}
                      <div className="w-16 h-12 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0 text-[#FC4C02]">
                        <MiniPolyline polyline={activity.polyline} />
                      </div>

                      {/* Activity Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {activity.name}
                            </h3>
                          </div>
                          {isSelected && importing && (
                            <Loader2 className="w-4 h-4 animate-spin text-[#FC4C02] flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatDate(activity.date)}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {formatDistance(activity.distance)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(activity.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {Math.round(activity.elevation)}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Load More */}
              {hasMore && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Load More Activities
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
