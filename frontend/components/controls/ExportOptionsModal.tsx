'use client';

import { useState } from 'react';
import { X, Check, Loader2, Printer, Monitor, Smartphone, Laptop, Tv, Image, Download, Frame, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPORT_RESOLUTIONS, type BaseExportResolution, type ExportResolutionKey } from '@/lib/export/constants';
import { calculateTargetResolution, getPhysicalDimensions } from '@/lib/export/resolution';
import type { PosterConfig } from '@/types/poster';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (resolutionKey: ExportResolutionKey) => void;
  isExporting: boolean;
  format: PosterConfig['format'];
}

// Resolution metadata with icons and pricing
// Premium pricing for print-ready exports, free for screen/sharing
const RESOLUTION_META: Record<ExportResolutionKey, {
  icon: React.ReactNode;
  price: string | null; // null = free
  fileSizeEstimate: string;
}> = {
  SMALL: {
    icon: <Printer className="w-4 h-4" />,
    price: '€19',
    fileSizeEstimate: '~8-15 MB'
  },
  MEDIUM: {
    icon: <Printer className="w-4 h-4" />,
    price: '€25',
    fileSizeEstimate: '~15-25 MB'
  },
  LARGE: {
    icon: <Printer className="w-4 h-4" />,
    price: '€29',
    fileSizeEstimate: '~30-50 MB'
  },
  THUMBNAIL: {
    icon: <Image className="w-4 h-4" />,
    price: null,
    fileSizeEstimate: '~0.5-1 MB'
  },
  PHONE_WALLPAPER: {
    icon: <Smartphone className="w-4 h-4" />,
    price: null,
    fileSizeEstimate: '~2-4 MB'
  },
  LAPTOP_WALLPAPER: {
    icon: <Laptop className="w-4 h-4" />,
    price: null,
    fileSizeEstimate: '~3-6 MB'
  },
  DESKTOP_4K: {
    icon: <Tv className="w-4 h-4" />,
    price: null,
    fileSizeEstimate: '~5-10 MB'
  },
};

// Print add-on options (placeholders)
const FRAME_OPTIONS = [
  { id: 'none', name: 'No Frame', price: null },
  { id: 'black', name: 'Black Wood', price: '€24.99' },
  { id: 'white', name: 'White Wood', price: '€24.99' },
  { id: 'natural', name: 'Natural Oak', price: '€29.99' },
  { id: 'walnut', name: 'Dark Walnut', price: '€34.99' },
];

const MATERIAL_OPTIONS = [
  { id: 'matte', name: 'Matte Paper', price: null, description: 'Classic finish, no glare' },
  { id: 'glossy', name: 'Glossy Paper', price: '€2.99', description: 'Vibrant colors, slight glare' },
  { id: 'canvas', name: 'Canvas', price: '€14.99', description: 'Textured, gallery-ready' },
  { id: 'metal', name: 'Metal Print', price: '€29.99', description: 'Modern, ultra-durable' },
];

const PRINT_RESOLUTIONS: ExportResolutionKey[] = ['SMALL', 'MEDIUM', 'LARGE'];
const DIGITAL_RESOLUTIONS: ExportResolutionKey[] = ['THUMBNAIL', 'PHONE_WALLPAPER', 'LAPTOP_WALLPAPER', 'DESKTOP_4K'];

export function ExportOptionsModal({ isOpen, onClose, onExport, isExporting, format }: ExportOptionsModalProps) {
  const [selectedKey, setSelectedKey] = useState<ExportResolutionKey>('SMALL');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [selectedMaterial, setSelectedMaterial] = useState('matte');
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  if (!isOpen) return null;

  const isPrintResolution = PRINT_RESOLUTIONS.includes(selectedKey);
  const selectedRes = calculateTargetResolution(
    EXPORT_RESOLUTIONS[selectedKey] as BaseExportResolution,
    format.aspectRatio,
    format.orientation
  );

  // Calculate total price
  const basePrice = RESOLUTION_META[selectedKey].price;
  const framePrice = FRAME_OPTIONS.find(f => f.id === selectedFrame)?.price;
  const materialPrice = MATERIAL_OPTIONS.find(m => m.id === selectedMaterial)?.price;

  const calculateTotal = () => {
    let total = 0;
    if (basePrice) total += parseFloat(basePrice.replace('€', ''));
    if (isPrintResolution && showPrintOptions) {
      if (framePrice) total += parseFloat(framePrice.replace('€', ''));
      if (materialPrice) total += parseFloat(materialPrice.replace('€', ''));
    }
    return total > 0 ? `€${total.toFixed(2)}` : 'Free';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-forest to-forest-light text-white shadow-lg shadow-forest/25">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export Your Print</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Choose resolution and format</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 space-y-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {/* Print Category */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Printer className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Print Ready
              </span>
            </div>
            <div className="grid gap-2">
              {PRINT_RESOLUTIONS.map((key) => {
                const base = EXPORT_RESOLUTIONS[key] as BaseExportResolution;
                const res = calculateTargetResolution(base, format.aspectRatio, format.orientation);
                const physical = getPhysicalDimensions(res.width, res.height, res.dpi);
                const meta = RESOLUTION_META[key];
                const isSelected = selectedKey === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={cn(
                      "group w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                    )}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "font-semibold text-sm",
                          isSelected ? "text-primary dark:text-primary" : "text-gray-900 dark:text-white"
                        )}>
                          {res.name}
                        </span>
                        {meta.price ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            {meta.price}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Free
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{physical}</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span>{res.dpi} DPI</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-gray-400">{meta.fileSizeEstimate}</span>
                      </div>
                    </div>

                    {/* Checkmark */}
                    <div className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-gray-200 dark:border-gray-700"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Print Add-ons Toggle */}
            {isPrintResolution && (
              <button
                onClick={() => setShowPrintOptions(!showPrintOptions)}
                className="mt-3 w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 text-sm transition-colors hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30"
              >
                <div className="flex items-center gap-2">
                  <Frame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    Add Frame & Material Options
                  </span>
                </div>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {showPrintOptions ? 'Hide' : 'Show'} →
                </span>
              </button>
            )}

            {/* Print Options (Frames & Materials) */}
            {isPrintResolution && showPrintOptions && (
              <div className="mt-4 space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                {/* Frame Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Frame className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Frame
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {FRAME_OPTIONS.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg border-2 text-left transition-all",
                          selectedFrame === frame.id
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-medium",
                            selectedFrame === frame.id ? "text-primary dark:text-primary" : "text-gray-900 dark:text-white"
                          )}>
                            {frame.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {frame.price || 'Free'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Material
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {MATERIAL_OPTIONS.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => setSelectedMaterial(material.id)}
                        className={cn(
                          "px-3 py-2.5 rounded-lg border-2 text-left transition-all",
                          selectedMaterial === material.id
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={cn(
                            "text-sm font-medium",
                            selectedMaterial === material.id ? "text-primary dark:text-primary" : "text-gray-900 dark:text-white"
                          )}>
                            {material.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {material.price ? `+${material.price}` : 'Included'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{material.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    🚧 Print fulfillment coming soon! For now, download and use your preferred print service.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Digital Category */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Digital & Wallpaper
              </span>
            </div>
            <div className="grid gap-2">
              {DIGITAL_RESOLUTIONS.map((key) => {
                const base = EXPORT_RESOLUTIONS[key] as BaseExportResolution;
                const res = calculateTargetResolution(base, format.aspectRatio, format.orientation);
                const meta = RESOLUTION_META[key];
                const isSelected = selectedKey === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={cn(
                      "group w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                    )}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "font-semibold text-sm",
                          isSelected ? "text-primary dark:text-primary" : "text-gray-900 dark:text-white"
                        )}>
                          {res.name}
                        </span>
                        {meta.price ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            {meta.price}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Free
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{res.width.toLocaleString()} × {res.height.toLocaleString()} px</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-gray-400">{meta.fileSizeEstimate}</span>
                      </div>
                    </div>

                    {/* Checkmark */}
                    <div className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-gray-200 dark:border-gray-700"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-800/80 dark:to-transparent border-t border-gray-100 dark:border-gray-800">
          {/* Selected resolution summary */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{selectedRes.name}</span>
              <span className="mx-2">·</span>
              <span>{selectedRes.width.toLocaleString()} × {selectedRes.height.toLocaleString()} px</span>
            </div>
            <span className={cn(
              "text-sm font-semibold",
              calculateTotal() === 'Free' ? "text-gray-500" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {calculateTotal()}
            </span>
          </div>

          <button
            onClick={() => onExport(selectedKey)}
            disabled={isExporting}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all",
              "bg-gradient-to-r from-gray-900 to-gray-800 text-white",
              "dark:from-white dark:to-gray-100 dark:text-gray-900",
              "hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/20",
              "active:scale-[0.98]",
              "disabled:opacity-70 disabled:cursor-wait disabled:hover:shadow-none"
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download PNG</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
