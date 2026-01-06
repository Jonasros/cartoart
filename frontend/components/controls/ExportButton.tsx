'use client';

import { useState } from 'react';
import { Download, Loader2, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareModal } from './ShareModal';
import { ExportOptionsModal } from './ExportOptionsModal';
import { SculptureExportModal } from './SculptureExportModal';
import type { ExportResolutionKey } from '@/lib/export/constants';
import type { PosterConfig, RouteData } from '@/types/poster';
import type { SculptureConfig, ProductMode } from '@/types/sculpture';
import type { ExportResult } from '@/hooks/useMapExport';

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
}: ExportButtonProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSculptureModal, setShowSculptureModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const isSculptureMode = productMode === 'sculpture';

  const handleButtonClick = () => {
    if (isSculptureMode) {
      setShowSculptureModal(true);
    } else {
      setShowExportModal(true);
    }
  };

  const handleExport = (resolutionKey: ExportResolutionKey) => {
    onExport(resolutionKey);
    setShowExportModal(false);
    // Show share modal after export starts (it will display when lastExportResult is ready)
    setShowShareModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  const handleCloseSculptureModal = () => {
    setShowSculptureModal(false);
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
          'group relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium shadow-lg transition-all duration-300',
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
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        <span className={cn(
          "transition-all duration-300",
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
        />
      )}

      {/* Share Modal - shown after export completes */}
      <ShareModal
        isOpen={showShareModal && !!lastExportResult}
        onClose={handleCloseShareModal}
        imageBlob={lastExportResult?.shareThumbnail || lastExportResult?.blob}
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

