'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { RouteConfig, RouteData } from '@/types/poster';
import type { RoutingProfile } from '@/lib/route/routeBuilder';
import { buildRouteFromWaypoints } from '@/lib/route/routeBuilder';
import posthog from 'posthog-js';

interface UseRouteDrawingOptions {
  onRouteChange: (route: RouteConfig | undefined) => void;
  existingRoute?: RouteConfig;
}

export function useRouteDrawing({ onRouteChange, existingRoute }: UseRouteDrawingOptions) {
  const [drawMode, setDrawMode] = useState(false);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]); // [lat, lng][]
  const [profile, setProfile] = useState<RoutingProfile>('foot');
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapError, setSnapError] = useState<string | null>(null);

  // Track the latest snap request to discard stale results
  const snapSeqRef = useRef(0);

  // Restore waypoints from existing drawn route when entering draw mode
  useEffect(() => {
    if (drawMode && existingRoute?.data?.source === 'draw' && existingRoute.data.waypoints) {
      // Convert stored waypoints [lng, lat] back to [lat, lng] for internal use
      const restored = existingRoute.data.waypoints.map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );
      if (restored.length > 0 && waypoints.length === 0) {
        setWaypoints(restored);
      }
    }
  // Only run when drawMode becomes true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawMode]);

  // Snap route when waypoints or profile change
  useEffect(() => {
    if (waypoints.length < 2) return;

    const seq = ++snapSeqRef.current;
    setIsSnapping(true);
    setSnapError(null);

    buildRouteFromWaypoints(waypoints, profile)
      .then((routeData: RouteData) => {
        // Discard if a newer request was started
        if (seq !== snapSeqRef.current) return;

        const newRoute: RouteConfig = {
          data: routeData,
          style: existingRoute?.style ?? {
            color: '#FF4444',
            width: 3,
            opacity: 0.9,
            lineStyle: 'solid',
            showStartEnd: true,
            startColor: '#22C55E',
            endColor: '#EF4444',
          },
          privacyZones: existingRoute?.privacyZones ?? [],
          showStats: existingRoute?.showStats ?? true,
          statsPosition: existingRoute?.statsPosition ?? 'bottom-left',
        };

        onRouteChange(newRoute);
        setSnapError(null);
      })
      .catch((err: Error) => {
        if (seq !== snapSeqRef.current) return;
        setSnapError(err.message);
      })
      .finally(() => {
        if (seq !== snapSeqRef.current) return;
        setIsSnapping(false);
      });
  }, [waypoints, profile, onRouteChange, existingRoute?.style, existingRoute?.privacyZones, existingRoute?.showStats, existingRoute?.statsPosition]);

  const addWaypoint = useCallback((lat: number, lng: number) => {
    setWaypoints(prev => [...prev, [lat, lng]]);
    setSnapError(null);
  }, []);

  const undoWaypoint = useCallback(() => {
    setWaypoints(prev => {
      const next = prev.slice(0, -1);
      // If less than 2 waypoints remain, clear the route
      if (next.length < 2) {
        onRouteChange(undefined);
      }
      return next;
    });
    setSnapError(null);
  }, [onRouteChange]);

  const clearWaypoints = useCallback(() => {
    setWaypoints([]);
    onRouteChange(undefined);
    setSnapError(null);
  }, [onRouteChange]);

  const handleDrawModeChange = useCallback((enabled: boolean) => {
    setDrawMode(enabled);
    if (!enabled) {
      // Track route creation when exiting draw mode with a route
      if (waypoints.length >= 2) {
        posthog.capture('route_drawn', {
          source: 'draw',
          waypoint_count: waypoints.length,
          profile,
        });
      }
    }
  }, [waypoints.length, profile]);

  return {
    drawMode,
    setDrawMode: handleDrawModeChange,
    waypoints,
    profile,
    setProfile,
    isSnapping,
    snapError,
    addWaypoint,
    undoWaypoint,
    clearWaypoints,
  };
}
