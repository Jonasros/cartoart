'use client';

import { useState } from 'react';
import { Download, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KofiTipModal } from './KofiTipModal';
import { Tooltip } from '@/components/ui/tooltip';
import { DEFAULT_EXPORT_RESOLUTION } from '@/lib/export/constants';

interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
}

export function ExportButton({ onExport, isExporting }: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleButtonClick = () => {
    // Start download immediately
    onExport();
    // Show modal overlay
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Tooltip 
          content={`PNG • ${DEFAULT_EXPORT_RESOLUTION.name} • ${DEFAULT_EXPORT_RESOLUTION.width}×${DEFAULT_EXPORT_RESOLUTION.height}px • ${DEFAULT_EXPORT_RESOLUTION.dpi} DPI`}
          side="left"
        >
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Export format info"
          >
            <Info className="w-4 h-4" />
          </button>
        </Tooltip>
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
      </div>

      <KofiTipModal
        isOpen={showModal}
        onClose={handleClose}
      />
    </>
  );
}

