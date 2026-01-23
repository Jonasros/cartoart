'use client';

import { useState, useRef, useCallback } from 'react';
import type MapLibreGL from 'maplibre-gl';
import type { PosterConfig } from '@/types/poster';
import { exportMapToPNG, downloadBlob } from '@/lib/export/exportCanvas';
import { EXPORT_RESOLUTIONS, type ExportResolutionKey } from '@/lib/export/constants';
import { generateShareThumbnail } from '@/lib/export/shareThumbnail';
import { logger } from '@/lib/logger';

export interface ExportResult {
  /** The exported full-resolution blob */
  blob: Blob;
  /** Social-media-sized square thumbnail for sharing */
  shareThumbnail: Blob | null;
  /** Location/adventure name */
  title: string;
}

/**
 * Hook for exporting the map as a high-resolution PNG image.
 * Handles map reference management and export state.
 *
 * @param config - Current poster configuration for export settings
 * @returns Object containing:
 * - isExporting: Whether an export is currently in progress
 * - exportToPNG: Function to trigger PNG export with resolution key
 * - lastExportResult: Result of the last successful export (for sharing)
 * - clearLastExport: Clear the last export result
 * - setMapRef: Set the MapLibre map instance reference
 * - fitToLocation: Fit map to original location bounds
 * - zoomIn: Zoom in on the map
 * - zoomOut: Zoom out on the map
 *
 * @example
 * ```tsx
 * const { isExporting, exportToPNG, lastExportResult, setMapRef } = useMapExport(config);
 * <MapPreview onMapLoad={setMapRef} />
 * <button onClick={() => exportToPNG('MEDIUM')} disabled={isExporting}>Export</button>
 * ```
 */
export function useMapExport(config: PosterConfig) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);

  const setMapRef = (map: MapLibreGL.Map | null) => {
    mapRef.current = map;
  };

  const clearLastExport = useCallback(() => {
    setLastExportResult(null);
  }, []);

  const exportToPNG = async (resolutionKey: ExportResolutionKey = 'SMALL', filename?: string, hideWatermark = false) => {
    if (!mapRef.current) {
      throw new Error('Map instance not available');
    }

    const resolution = EXPORT_RESOLUTIONS[resolutionKey];
    const title = (config.location.name || 'My Adventure').toString();

    setIsExporting(true);
    try {
      const blob = await exportMapToPNG({
        map: mapRef.current,
        config,
        resolution,
        hideWatermark,
      });

      // Download the full-resolution image
      const exportFilename = filename || `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-adventure-print.png`;
      downloadBlob(blob, exportFilename);

      // Generate a share-optimized thumbnail (1080x1080 square)
      let shareThumbnail: Blob | null = null;
      try {
        shareThumbnail = await generateShareThumbnail(blob, {
          title,
          addWatermark: true,
        });
      } catch (thumbError) {
        logger.warn('Failed to generate share thumbnail:', thumbError);
        // Continue without share thumbnail
      }

      // Store the result for sharing
      setLastExportResult({
        blob,
        shareThumbnail,
        title,
      });
    } catch (error) {
      logger.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const fitToLocation = () => {
    if (!mapRef.current) return;
    const { bounds } = config.location;
    mapRef.current.fitBounds(bounds as [[number, number], [number, number]], {
      padding: 40,
      duration: 1000,
    });
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn({ duration: 300 });
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut({ duration: 300 });
  };

  return {
    isExporting,
    exportToPNG,
    lastExportResult,
    clearLastExport,
    setMapRef,
    mapRef,
    fitToLocation,
    zoomIn,
    zoomOut,
  };
}

