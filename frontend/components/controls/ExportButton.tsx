'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareModal } from './ShareModal';
import { ExportOptionsModal } from './ExportOptionsModal';
import { SculptureExportModal } from './SculptureExportModal';
import type { ExportResolutionKey } from '@/lib/export/constants';
import type { PosterConfig, RouteData } from '@/types/poster';
import type { SculptureConfig, ProductMode } from '@/types/sculpture';
import type { ExportResult } from '@/hooks/useMapExport';
import posthog from 'posthog-js';

interface ExportButtonProps {
  onExport: (resolutionKey: ExportResolutionKey) => void;
  isExporting: boolean;
  format: PosterConfig['format'];
  // Sculpture mode props
  productMode?: ProductMode;
  sculptureConfig?: SculptureConfig;
  routeData?: RouteData | null;
  elevationGrid?: number[][];
  routeName?: string;
  sculptureThumbnail?: Blob | null;
  // Share modal props
  lastExportResult?: ExportResult | null;
  onClearExport?: () => void;
  isAuthenticated?: boolean;
  isPublished?: boolean;
  isSaved?: boolean;
  onPublish?: () => Promise<void>;
  // Map ID for paid exports
  mapId?: string | null;
  // Auto-save callback for paid exports
  onSaveMap?: () => Promise<string | null>;
  // Auto-trigger sculpture export (from paid download flow)
  autoTriggerSculptureExport?: boolean;
  onAutoExportTriggered?: () => void;
  // Auto-show share modal after poster auto-export completes
  autoShowShareModal?: boolean;
  onShareModalShown?: () => void;
  // CRITICAL: Fresh config getters for checkout integrity
  getCurrentConfig?: () => PosterConfig;
  getSculptureConfig?: () => SculptureConfig | undefined;
}

export function ExportButton({
  onExport,
  isExporting,
  format,
  productMode = 'poster',
  sculptureConfig,
  routeData,
  elevationGrid,
  routeName,
  sculptureThumbnail,
  lastExportResult,
  onClearExport,
  isAuthenticated = false,
  isPublished = false,
  isSaved = false,
  onPublish,
  mapId,
  onSaveMap,
  autoTriggerSculptureExport = false,
  onAutoExportTriggered,
  autoShowShareModal = false,
  onShareModalShown,
  getCurrentConfig,
  getSculptureConfig,
}: ExportButtonProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSculptureModal, setShowSculptureModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // Local state to persist the auto-export flag after parent clears it
  const [shouldAutoExportSculpture, setShouldAutoExportSculpture] = useState(false);

  const isSculptureMode = productMode === 'sculpture';

  // Auto-open sculpture modal when triggered from paid download flow
  useEffect(() => {
    if (autoTriggerSculptureExport && isSculptureMode) {
      // Store the flag locally before parent clears it
      setShouldAutoExportSculpture(true);
      setShowSculptureModal(true);
      // Clear the parent flag
      onAutoExportTriggered?.();
    }
  }, [autoTriggerSculptureExport, isSculptureMode, onAutoExportTriggered]);

  // Auto-show share modal after poster auto-export completes (from paid download flow)
  useEffect(() => {
    if (autoShowShareModal && lastExportResult && !isSculptureMode) {
      setShowShareModal(true);
      // Clear the parent flag
      onShareModalShown?.();
    }
  }, [autoShowShareModal, lastExportResult, isSculptureMode, onShareModalShown]);

  const handleButtonClick = () => {
    if (isSculptureMode) {
      setShowSculptureModal(true);
    } else {
      setShowExportModal(true);
    }
  };

  const handleExport = (resolutionKey: ExportResolutionKey) => {
    onExport(resolutionKey);
    // Track poster download event
    posthog.capture('poster_downloaded', {
      resolution: resolutionKey,
      format: format,
    });
    setShowExportModal(false);
    // Show share modal after export starts (it will display when lastExportResult is ready)
    setShowShareModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  const handleCloseSculptureModal = () => {
    setShowSculptureModal(false);
    // Reset the auto-export flag when modal closes
    setShouldAutoExportSculpture(false);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    onClearExport?.();
  };

  // Sculpture mode: disable if no route data
  const isDisabled = isSculptureMode ? (!routeData || isExporting) : isExporting;

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={cn(
          'group relative flex items-center justify-center gap-2 rounded-full font-medium shadow-lg transition-all duration-300',
          'p-2.5 md:px-5 md:py-2.5',
          'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
          'hover:shadow-xl hover:scale-105 active:scale-95',
          'disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100 disabled:shadow-lg'
        )}
      >
        <div className={cn(
          "transition-transform duration-300",
          isExporting ? "scale-0 w-0" : "scale-100"
        )}>
          {isSculptureMode ? (
            <Box className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </div>

        {isExporting && (
          <div className="absolute left-1/2 md:left-5 top-1/2 -translate-x-1/2 md:translate-x-0 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        <span className={cn(
          "transition-all duration-300 hidden md:inline",
          isExporting && "translate-x-4"
        )}>
          {isExporting
            ? 'Creating...'
            : isSculptureMode
              ? 'Download Sculpture'
              : 'Download Print'}
        </span>
      </button>

      {/* Poster Export Modal */}
      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        onExport={handleExport}
        isExporting={isExporting}
        format={format}
        mapId={mapId}
        onSaveMap={onSaveMap}
        getCurrentConfig={getCurrentConfig}
        getSculptureConfig={getSculptureConfig}
        productMode={productMode}
      />

      {/* Sculpture Export Modal */}
      {sculptureConfig && (
        <SculptureExportModal
          isOpen={showSculptureModal}
          onClose={handleCloseSculptureModal}
          routeData={routeData ?? null}
          config={sculptureConfig}
          elevationGrid={elevationGrid}
          routeName={routeName}
          sculptureThumbnail={sculptureThumbnail}
          isAuthenticated={isAuthenticated}
          isPublished={isPublished}
          isSaved={isSaved}
          onPublish={onPublish}
          mapId={mapId}
          onSaveMap={onSaveMap}
          autoTriggerExport={shouldAutoExportSculpture}
          getCurrentConfig={getCurrentConfig}
          getSculptureConfig={getSculptureConfig}
        />
      )}

      {/* Share Modal - shown after export completes */}
      <ShareModal
        isOpen={showShareModal && !!lastExportResult}
        onClose={handleCloseShareModal}
        imageBlob={lastExportResult?.blob}
        title={lastExportResult?.title}
        type="poster"
        isAuthenticated={isAuthenticated}
        isPublished={isPublished}
        isSaved={isSaved}
        onPublish={onPublish}
      />
    </>
  );
}

