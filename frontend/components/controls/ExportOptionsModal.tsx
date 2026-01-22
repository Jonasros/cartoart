'use client';

import { useState } from 'react';
import { X, Check, Loader2, Printer, Monitor, Smartphone, Laptop, Tv, Image, Download, AlertCircle } from 'lucide-react';
import { ComingSoonCard } from '@/components/voting/ComingSoonCard';
import { cn } from '@/lib/utils';
import { EXPORT_RESOLUTIONS, type BaseExportResolution, type ExportResolutionKey } from '@/lib/export/constants';
import { calculateTargetResolution, getPhysicalDimensions } from '@/lib/export/resolution';
import type { PosterConfig } from '@/types/poster';
import type { ExportProduct } from '@/lib/stripe/products';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (resolutionKey: ExportResolutionKey) => void;
  isExporting: boolean;
  format: PosterConfig['format'];
  mapId?: string | null;
  onSaveMap?: () => Promise<string | null>; // Returns mapId after save
  /**
   * CRITICAL: Get fresh config right before checkout.
   * This prevents stale config issues where user edits after opening modal.
   */
  getCurrentConfig?: () => PosterConfig;
  /**
   * Optional: Get current sculpture config for sculpture purchases
   */
  getSculptureConfig?: () => import('@/types/sculpture').SculptureConfig | undefined;
  /**
   * Product mode: 'poster' or 'sculpture'
   */
  productMode?: import('@/types/sculpture').ProductMode;
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
    price: '€12',
    fileSizeEstimate: '~8-15 MB'
  },
  MEDIUM: {
    icon: <Printer className="w-4 h-4" />,
    price: '€15',
    fileSizeEstimate: '~15-25 MB'
  },
  LARGE: {
    icon: <Printer className="w-4 h-4" />,
    price: '€18',
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

const PRINT_RESOLUTIONS: ExportResolutionKey[] = ['SMALL', 'MEDIUM', 'LARGE'];
const DIGITAL_RESOLUTIONS: ExportResolutionKey[] = ['THUMBNAIL', 'PHONE_WALLPAPER', 'LAPTOP_WALLPAPER', 'DESKTOP_4K'];

// Map resolution keys to Stripe product IDs
const RESOLUTION_TO_PRODUCT: Partial<Record<ExportResolutionKey, ExportProduct>> = {
  SMALL: 'poster-small',
  MEDIUM: 'poster-medium',
  LARGE: 'poster-large',
};

export function ExportOptionsModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  format,
  mapId,
  onSaveMap,
  getCurrentConfig,
  getSculptureConfig,
  productMode = 'poster',
}: ExportOptionsModalProps) {
  const [selectedKey, setSelectedKey] = useState<ExportResolutionKey>('SMALL');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const isPrintResolution = PRINT_RESOLUTIONS.includes(selectedKey);
  const selectedRes = calculateTargetResolution(
    EXPORT_RESOLUTIONS[selectedKey] as BaseExportResolution,
    format.aspectRatio,
    format.orientation
  );

  // Get price for selected resolution
  const basePrice = RESOLUTION_META[selectedKey].price;

  // Check if selected resolution requires payment
  const isPaidResolution = RESOLUTION_TO_PRODUCT[selectedKey] !== undefined;

  // Handle checkout for paid resolutions
  const handleCheckout = async () => {
    const product = RESOLUTION_TO_PRODUCT[selectedKey];
    if (!product) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // CRITICAL: Get FRESH config right before checkout
      // This prevents stale config issues where user edits after opening modal
      const freshConfig = getCurrentConfig?.();
      const freshSculptureConfig = getSculptureConfig?.();

      // Auto-save map if not saved yet
      let currentMapId = mapId;
      if (!currentMapId && onSaveMap) {
        setIsSaving(true);
        currentMapId = await onSaveMap();
        setIsSaving(false);

        if (!currentMapId) {
          throw new Error('Please save your map before purchasing. Sign in to save your design.');
        }
      }

      // Build the full export config with complete snapshot
      const exportConfig = {
        resolutionKey: selectedKey,
        format: format,
        productMode: productMode,
        // CRITICAL: Include full config snapshot for integrity
        // This is stored in orders.config_snapshot via webhook
        configSnapshot: freshConfig || undefined,
        sculptureConfigSnapshot: freshSculptureConfig || undefined,
      };

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          mapId: currentMapId || undefined,
          exportConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed');
      setIsCheckingOut(false);
    }
  };

  // Handle export button click
  const handleExportClick = () => {
    if (isPaidResolution) {
      handleCheckout();
    } else {
      onExport(selectedKey);
    }
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

            {/* Coming Soon Features */}
            {isPrintResolution && (
              <ComingSoonCard category="poster" className="mt-4" source="poster_export_modal" />
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
          {/* Checkout Error */}
          {checkoutError && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{checkoutError}</p>
            </div>
          )}

          {/* Selected resolution summary */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{selectedRes.name}</span>
              <span className="mx-2">·</span>
              <span>{selectedRes.width.toLocaleString()} × {selectedRes.height.toLocaleString()} px</span>
            </div>
            <span className={cn(
              "text-sm font-semibold",
              basePrice === null ? "text-gray-500" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {basePrice || 'Free'}
            </span>
          </div>

          <button
            onClick={handleExportClick}
            disabled={isExporting || isCheckingOut}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all",
              isPaidResolution
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/20"
                : "bg-gradient-to-r from-gray-900 to-gray-800 text-white dark:from-white dark:to-gray-100 dark:text-gray-900 hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/20",
              "active:scale-[0.98]",
              "disabled:opacity-70 disabled:cursor-wait disabled:hover:shadow-none"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving your map...</span>
              </>
            ) : isCheckingOut ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirecting to checkout...</span>
              </>
            ) : isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : isPaidResolution ? (
              <>
                <Download className="w-5 h-5" />
                <span>Purchase & Download</span>
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
