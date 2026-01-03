import type { PosterConfig } from '@/types/poster';
import { ASPECT_RATIOS } from '../styles/dimensions';
import type { BaseExportResolution } from './constants';

export interface ExportResolution {
  width: number;
  height: number;
  dpi: number;
  name: string;
  description?: string;
}

/**
 * Calculate target resolution from a base resolution (longEdge format)
 * based on aspect ratio and orientation.
 */
export function calculateTargetResolution(
  baseResolution: BaseExportResolution,
  aspectRatio: PosterConfig['format']['aspectRatio'],
  orientation: 'portrait' | 'landscape'
): ExportResolution {
  const ratio = ASPECT_RATIOS[aspectRatio] || 1;
  const longEdge = baseResolution.longEdge;

  let targetWidth: number;
  let targetHeight: number;

  if (orientation === 'portrait') {
    // In portrait, height is the long edge
    targetHeight = longEdge;
    targetWidth = Math.round(targetHeight * ratio);
  } else {
    // In landscape, width is the long edge
    targetWidth = longEdge;
    targetHeight = Math.round(targetWidth * ratio);
  }

  return {
    width: targetWidth,
    height: targetHeight,
    dpi: baseResolution.dpi,
    name: baseResolution.name,
    description: baseResolution.description
  };
}

/**
 * Get physical dimensions string (e.g., "12 × 18 in")
 */
export function getPhysicalDimensions(width: number, height: number, dpi: number): string {
  const widthInches = width / dpi;
  const heightInches = height / dpi;

  // Format nicely - round to 1 decimal if needed
  const formatDim = (val: number) => {
    const rounded = Math.round(val * 10) / 10;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
  };

  return `${formatDim(widthInches)} × ${formatDim(heightInches)} in`;
}
