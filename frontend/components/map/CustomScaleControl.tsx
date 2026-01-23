'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';

const SCALE_MAX_WIDTH = 100; // px

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Radius of the earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface CustomScaleControlProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: string;
}

export function CustomScaleControl({
  className,
  position = 'bottom-left',
  color = 'rgba(255, 255, 255, 0.9)',
}: CustomScaleControlProps) {
  const { current: map } = useMap();
  const [scale, setScale] = useState<{ width: number; text: string } | null>(null);

  useEffect(() => {
    if (!map) return;

    const updateScale = () => {
      const container = map.getContainer();
      if (!container) return;

      const y = container.clientHeight / 2;
      const p1 = map.unproject([0, y]);
      const p2 = map.unproject([SCALE_MAX_WIDTH, y]);
      const dist = getDistance(p1.lat, p1.lng, p2.lat, p2.lng);

      if (dist === 0) return;

      const maxDistance = dist;
      const distanceMagnitude = Math.pow(10, Math.floor(Math.log10(maxDistance)));
      const d = maxDistance / distanceMagnitude;

      let suffix = 'm';
      let niceDistance = 1 * distanceMagnitude;
      if (d >= 10) niceDistance = 10 * distanceMagnitude;
      else if (d >= 5) niceDistance = 5 * distanceMagnitude;
      else if (d >= 2) niceDistance = 2 * distanceMagnitude;
      else niceDistance = 1 * distanceMagnitude;

      let displayDistance = niceDistance;
      if (displayDistance >= 1000) {
        displayDistance /= 1000;
        suffix = 'km';
      }

      const width = (niceDistance / maxDistance) * SCALE_MAX_WIDTH;
      setScale({ width, text: `${Math.round(displayDistance)} ${suffix}` });
    };

    updateScale();
    map.on('move', updateScale);
    map.on('zoom', updateScale);
    map.on('resize', updateScale);

    return () => {
      map.off('move', updateScale);
      map.off('zoom', updateScale);
      map.off('resize', updateScale);
    };
  }, [map]);

  if (!scale) return null;

  // Position classes based on the position prop
  const positionClasses = {
    'top-left': 'top-14 left-4',
    'top-right': 'top-14 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} z-20 flex flex-col items-start pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300 ${className || ''}`}
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      <div
        className="text-xs font-semibold mb-1 font-mono tracking-wider ml-0.5"
        style={{ color }}
      >
        {scale.text}
      </div>
      <div
        className="h-2 flex items-end transition-all duration-300 ease-out relative"
        style={{ width: scale.width }}
      >
        {/* Left tick */}
        <div className="absolute left-0 bottom-0 w-[1px] h-2 shadow-sm" style={{ backgroundColor: color }} />
        {/* Horizontal bar */}
        <div className="absolute bottom-0 h-[2px] w-full shadow-sm" style={{ backgroundColor: color, opacity: 0.9 }} />
        {/* Right tick */}
        <div className="absolute right-0 bottom-0 w-[1px] h-2 shadow-sm" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}
