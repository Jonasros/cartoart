'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Download, Loader2, Box, Ruler, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RouteData, PosterConfig } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';
import { SCULPTURE_MATERIALS, SCULPTURE_SHAPES } from '@/types/sculpture';
import {
  generateSculptureMeshes,
  exportToSTL,
  generateFilename,
  calculatePrintDimensions,
} from '@/lib/sculpture';
import { ShareModal } from './ShareModal';
import { generateShareThumbnail } from '@/lib/export/shareThumbnail';
import { ComingSoonCard } from '@/components/voting/ComingSoonCard';
import posthog from 'posthog-js';

interface SculptureExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData | null;
  config: SculptureConfig;
  elevationGrid?: number[][];
  routeName?: string;
  // Share modal props
  sculptureThumbnail?: Blob | null;
  isAuthenticated?: boolean;
  isPublished?: boolean;
  isSaved?: boolean;
  onPublish?: () => Promise<void>;
  // Map ID for paid exports
  mapId?: string | null;
  // Auto-save callback for paid exports (returns mapId or null)
  onSaveMap?: () => Promise<string | null>;
  // Auto-trigger export when opened (from paid download flow)
  autoTriggerExport?: boolean;
  // CRITICAL: Fresh config getters for checkout integrity
  getCurrentConfig?: () => PosterConfig;
  getSculptureConfig?: () => SculptureConfig | undefined;
}

export function SculptureExportModal({
  isOpen,
  onClose,
  routeData,
  config,
  elevationGrid,
  routeName,
  sculptureThumbnail,
  isAuthenticated = false,
  isPublished = false,
  isSaved = false,
  onPublish,
  mapId,
  onSaveMap,
  autoTriggerExport = false,
  getCurrentConfig,
  getSculptureConfig,
}: SculptureExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportStats, setExportStats] = useState<{
    vertices: number;
    triangles: number;
    fileSize: number;
  } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareThumbnail, setShareThumbnail] = useState<Blob | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate share thumbnail when export is successful and we have a source thumbnail
  useEffect(() => {
    if (exportStats && sculptureThumbnail) {
      generateShareThumbnail(sculptureThumbnail, {
        title: routeName,
        addWatermark: true,
      })
        .then(setShareThumbnail)
        .catch(console.error);
    }
  }, [exportStats, sculptureThumbnail, routeName]);

  // Track if we've already auto-triggered to prevent duplicate exports
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

  // Auto-trigger export ref - we use a ref to avoid dependency cycles
  const autoTriggerRef = useRef(false);

  // Auto-trigger export when modal opens from paid download flow
  useEffect(() => {
    if (isOpen && autoTriggerExport && !autoTriggerRef.current && !isExporting && routeData) {
      autoTriggerRef.current = true;
      // Small delay to ensure modal is fully rendered
      const triggerTimeout = setTimeout(() => {
        setHasAutoTriggered(true);
      }, 500);
      return () => clearTimeout(triggerTimeout);
    }
    // Reset the flag when modal closes
    if (!isOpen) {
      autoTriggerRef.current = false;
      setHasAutoTriggered(false);
    }
  }, [isOpen, autoTriggerExport, isExporting, routeData]);

  // Internal export function that can be called from both button click and auto-trigger
  const handleExportInternal = useCallback(async () => {
    if (!routeData) {
      setExportError('No route data available for export');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportStats(null);

    // Small delay to allow UI to update and show loading state before heavy computation
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // Debug: Log export parameters to diagnose freezing
      console.log('[STL Export] Starting with:', {
        hasElevationGrid: !!elevationGrid,
        elevationGridSize: elevationGrid ? `${elevationGrid.length}x${elevationGrid[0]?.length}` : 'null',
        routePoints: routeData.points.length,
        terrainResolution: config.terrainResolution,
        hasElevationInRoute: routeData.points.some(p => p.elevation !== undefined),
      });

      // Use a much lower resolution for export to prevent freezing
      // 32x32 = 1,089 vertices vs 64x64 = 4,225 vertices
      const exportConfig = {
        ...config,
        terrainResolution: Math.min(config.terrainResolution, 32), // Cap at 32 for export
      };

      console.log('[STL Export] Using terrainResolution:', exportConfig.terrainResolution);

      // Generate meshes
      const meshes = generateSculptureMeshes(routeData, exportConfig, elevationGrid);

      // Create a scene with the combined mesh
      const THREE = await import('three');
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(meshes.combined, material);
      const scene = new THREE.Scene();
      scene.add(mesh);

      // Export to STL
      const filename = generateFilename(config, routeName);
      const result = exportToSTL(scene, {
        filename,
        binary: true,
        scale: 10, // 1 scene unit = 10mm (so 15cm sculpture = 1.5 scene units = 15 * 10 = 150mm)
      });

      if (result.success) {
        setExportStats({
          vertices: result.stats?.vertices ?? 0,
          triangles: result.stats?.triangles ?? 0,
          fileSize: result.fileSize ?? 0,
        });
        // Track sculpture export event
        posthog.capture('sculpture_exported', {
          shape: config.shape,
          size_cm: config.size,
          material: config.material,
          vertices: result.stats?.vertices ?? 0,
          triangles: result.stats?.triangles ?? 0,
          file_size_bytes: result.fileSize ?? 0,
        });
        // Show share modal after successful export
        setShowShareModal(true);
      } else {
        setExportError(result.error ?? 'Export failed');
      }
    } catch (error) {
      posthog.captureException(error);
      setExportError(
        error instanceof Error ? error.message : 'Unknown export error'
      );
    } finally {
      setIsExporting(false);
    }
  }, [routeData, config, elevationGrid, routeName]);

  // Effect that actually triggers the export when hasAutoTriggered becomes true
  useEffect(() => {
    if (hasAutoTriggered && !isExporting) {
      // Reset immediately to prevent re-triggering when isExporting becomes false
      setHasAutoTriggered(false);
      handleExportInternal();
    }
  }, [hasAutoTriggered, isExporting, handleExportInternal]);

  // Handle checkout for paid STL download
  const handleCheckout = useCallback(async () => {
    if (!routeData) {
      setCheckoutError('No route data available');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Auto-save the map first if not already saved (to get mapId for download flow)
      let effectiveMapId = mapId;
      if (!effectiveMapId && onSaveMap) {
        setIsSaving(true);
        try {
          effectiveMapId = await onSaveMap();
        } catch (saveError) {
          console.error('Failed to auto-save map:', saveError);
          // Continue without mapId - user can still purchase but download flow may be limited
        } finally {
          setIsSaving(false);
        }
      }

      // CRITICAL: Capture fresh configs right before checkout
      // This ensures we store the EXACT design the user is purchasing
      const currentPosterConfig = getCurrentConfig?.();
      const currentSculptureConfig = getSculptureConfig?.() || config;

      console.log('[SCULPTURE CHECKOUT] Capturing config snapshot');
      console.log('[SCULPTURE CHECKOUT] Sculpture config shape:', currentSculptureConfig.shape);
      console.log('[SCULPTURE CHECKOUT] Sculpture config size:', currentSculptureConfig.size);

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'sculpture-stl',
          mapId: effectiveMapId || undefined,
          // CRITICAL: Include full config snapshots for purchase integrity
          exportConfig: {
            productMode: 'sculpture',
            configSnapshot: currentPosterConfig || null,
            sculptureConfigSnapshot: currentSculptureConfig,
            routeName: routeName?.substring(0, 100),
          },
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
  }, [routeData, config, mapId, routeName, onSaveMap, getCurrentConfig, getSculptureConfig]);

  if (!isOpen) return null;

  const dimensions = calculatePrintDimensions(config);
  const shapeInfo = SCULPTURE_SHAPES[config.shape];
  const materialInfo = SCULPTURE_MATERIALS[config.material];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-journey-sculpture to-amber-600 text-white shadow-lg shadow-journey-sculpture/25">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Export Journey Sculpture
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Download STL for 3D printing
                </p>
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
        <div className="px-6 pb-4 space-y-4">
          {/* Sculpture Info */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Sculpture Details
            </h3>

            <div className="space-y-3">
              {/* Shape */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>Shape</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {shapeInfo.label}
                </span>
              </div>

              {/* Size */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Ruler className="w-4 h-4 text-gray-400" />
                  <span>Size</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {config.size} cm ({dimensions.width} × {dimensions.depth} ×{' '}
                  {dimensions.height.toFixed(1)} mm)
                </span>
              </div>

              {/* Material */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Box className="w-4 h-4 text-gray-400" />
                  <span>Material</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {materialInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Export Stats (shown after successful export) */}
          {exportStats && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                Export Complete
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {exportStats.vertices.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    Vertices
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {exportStats.triangles.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    Triangles
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {(exportStats.fileSize / 1024 / 1024).toFixed(1)} MB
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    File Size
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {exportError}
              </p>
            </div>
          )}

          {/* No Route Warning */}
          {!routeData && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Upload a GPX route to enable STL export
              </p>
            </div>
          )}

          {/* Printing Tips */}
          <div className="p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
            <p className="text-xs text-primary dark:text-primary/90">
              <strong>Printing Tips:</strong> Use 0.2mm layer height, 20% infill.
              Support material may be needed for overhangs. PLA or PETG recommended.
            </p>
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

          {/* Price */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">3D Sculpture STL</span>
              <span className="mx-2">·</span>
              <span>Ready for 3D printing</span>
            </div>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              €19
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut || isSaving || !routeData}
            className={cn(
              'w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all',
              'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white',
              'hover:shadow-lg hover:shadow-emerald-500/20',
              'active:scale-[0.98]',
              'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving your sculpture...</span>
              </>
            ) : isCheckingOut ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirecting to checkout...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Purchase & Download STL</span>
              </>
            )}
          </button>

          {/* Coming Soon Features */}
          <ComingSoonCard category="sculpture" className="mt-4" source="sculpture_export_modal" />
        </div>
      </div>

      {/* Share Modal - shown after successful export */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareThumbnail(null);
        }}
        imageBlob={shareThumbnail || sculptureThumbnail}
        title={routeName}
        type="sculpture"
        isAuthenticated={isAuthenticated}
        isPublished={isPublished}
        isSaved={isSaved}
        onPublish={onPublish}
      />
    </div>
  );
}
