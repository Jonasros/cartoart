export * from './parseGPX';

import type { RouteConfig, RouteStyle } from '@/types/poster';

export const DEFAULT_ROUTE_STYLE: RouteStyle = {
  color: '#FF4444',
  width: 3,
  opacity: 0.9,
  lineStyle: 'solid',
  showStartEnd: true,
  startColor: '#22C55E', // green
  endColor: '#EF4444', // red
};

export const DEFAULT_ROUTE_CONFIG: RouteConfig = {
  data: null,
  style: DEFAULT_ROUTE_STYLE,
  privacyZones: [],
  showStats: true,
  statsPosition: 'bottom-left',
};
