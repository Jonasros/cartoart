'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KofiTipModal } from './KofiTipModal';
import { ExportOptionsModal } from './ExportOptionsModal';
import type { ExportResolutionKey } from '@/lib/export/constants';
import type { PosterConfig } from '@/types/poster';

interface ExportButtonProps {
  onExport: (resolutionKey: ExportResolutionKey) => void;
  isExporting: boolean;
  format: PosterConfig['format'];
}

export function ExportButton({ onExport, isExporting, format }: ExportButtonProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  const handleButtonClick = () => {
    setShowExportModal(true);
  };

  const handleExport = (resolutionKey: ExportResolutionKey) => {
    onExport(resolutionKey);
    setShowExportModal(false);
    // Show tip modal after export starts
    setShowTipModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  const handleCloseTipModal = () => {
    setShowTipModal(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isExporting}
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
          <Download className="h-4 w-4" />
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
          {isExporting ? 'Exporting...' : 'Export Poster'}
        </span>
      </button>

      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        onExport={handleExport}
        isExporting={isExporting}
        format={format}
      />

      <KofiTipModal
        isOpen={showTipModal}
        onClose={handleCloseTipModal}
      />
    </>
  );
}

