'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Download, Loader2, Box, Ruler, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RouteData, PosterConfig } from '@/types/poster';
import type { SculptureConfig, ExportQuality } from '@/types/sculpture';
import { SCULPTURE_MATERIALS, SCULPTURE_SHAPES, EXPORT_QUALITY_PRESETS, getExportQualityParams } from '@/types/sculpture';
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

  // Export progress tracking
  const [exportProgress, setExportProgress] = useState<{
    stage: 'preparing' | 'terrain' | 'route' | 'base' | 'text' | 'merging' | 'exporting';
    percent: number;
    elapsedSeconds: number;
  } | null>(null);
  const exportStartTimeRef = useRef<number | null>(null);

  // Export quality - always 'high' for paid exports
  const exportQuality: ExportQuality = 'high';
  const qualityPreset = EXPORT_QUALITY_PRESETS[exportQuality];
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

  // Helper to update progress with elapsed time
  const updateProgress = useCallback((stage: typeof exportProgress extends null ? never : NonNullable<typeof exportProgress>['stage'], percent: number) => {
    const elapsed = exportStartTimeRef.current
      ? Math.floor((Date.now() - exportStartTimeRef.current) / 1000)
      : 0;
    setExportProgress({ stage, percent, elapsedSeconds: elapsed });
  }, []);

  // Internal export function that can be called from both button click and auto-trigger
  const handleExportInternal = useCallback(async () => {
    if (!routeData) {
      setExportError('No route data available for export');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportStats(null);
    exportStartTimeRef.current = Date.now();
    updateProgress('preparing', 0);

    // Small delay to allow UI to update and show loading state before heavy computation
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // Get quality params for high-quality export
      const qualityParams = getExportQualityParams(exportQuality);

      // Debug: Log export parameters
      console.log('[STL Export] Starting HIGH QUALITY export with:', {
        hasElevationGrid: !!elevationGrid,
        elevationGridSize: elevationGrid ? `${elevationGrid.length}x${elevationGrid[0]?.length}` : 'null',
        routePoints: routeData.points.length,
        qualityParams,
      });

      // Use quality preset terrain resolution (256 for high quality)
      const exportConfig = {
        ...config,
        terrainResolution: qualityParams.terrainResolution,
        terrainSmoothing: qualityParams.smoothingPasses,
      };

      console.log('[STL Export] Using high-quality config:', {
        terrainResolution: exportConfig.terrainResolution,
        routeRadialSegments: qualityParams.routeRadialSegments,
        maxRoutePoints: qualityParams.maxRoutePoints,
      });

      updateProgress('terrain', 15);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Allow UI update

      // Generate meshes with quality params
      const meshes = generateSculptureMeshes(routeData, exportConfig, elevationGrid, qualityParams);

      updateProgress('merging', 70);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Allow UI update

      // Create a scene with the combined mesh
      const THREE = await import('three');
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(meshes.combined, material);

      // Apply terrain rotation to match preview
      // If terrainRotation is -1 (auto), calculate based on start point position
      const terrainRotation = exportConfig.terrainRotation ?? -1;
      let finalRotation = 0;

      if (terrainRotation === -1 && routeData.points.length > 0) {
        // Calculate auto-rotation based on start point position (match SculpturePreview.tsx)
        const meshSize = exportConfig.size / 10;
        const [[minLng, minLat], [maxLng, maxLat]] = routeData.bounds;
        const lngRange = maxLng - minLng || 0.001;
        const latRange = maxLat - minLat || 0.001;
        const startPoint = routeData.points[0];
        const normalizedX = (startPoint.lng - minLng) / lngRange;
        const normalizedZ = (startPoint.lat - minLat) / latRange;
        const startX = (normalizedX - 0.5) * meshSize;
        const startZ = (normalizedZ - 0.5) * meshSize;
        // Angle from center to start point, then rotate so start faces front
        const angleToStart = Math.atan2(startX, startZ);
        finalRotation = -angleToStart + Math.PI; // Rotate so start point faces front (+Z)
      } else if (terrainRotation !== -1) {
        finalRotation = (terrainRotation * Math.PI) / 180;
      }

      // Apply rotation to the mesh geometry directly (bake into vertices)
      if (finalRotation !== 0) {
        mesh.rotation.y = finalRotation;
        mesh.updateMatrix();
        meshes.combined.applyMatrix4(mesh.matrix);
        mesh.rotation.y = 0; // Reset rotation since it's now baked in
        mesh.updateMatrix();
      }

      const scene = new THREE.Scene();
      scene.add(mesh);

      updateProgress('exporting', 85);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Allow UI update

      // Export to STL
      const filename = generateFilename(config, routeName);
      const result = exportToSTL(scene, {
        filename,
        binary: true,
        scale: 10, // 1 scene unit = 10mm (so 15cm sculpture = 1.5 scene units = 15 * 10 = 150mm)
      });

      updateProgress('exporting', 100);

      if (result.success) {
        setExportStats({
          vertices: result.stats?.vertices ?? 0,
          triangles: result.stats?.triangles ?? 0,
          fileSize: result.fileSize ?? 0,
        });
        // Track sculpture export event with quality info
        posthog.capture('sculpture_exported', {
          shape: config.shape,
          size_cm: config.size,
          material: config.material,
          quality: exportQuality,
          vertices: result.stats?.vertices ?? 0,
          triangles: result.stats?.triangles ?? 0,
          file_size_bytes: result.fileSize ?? 0,
          generation_time_seconds: Math.floor((Date.now() - (exportStartTimeRef.current || Date.now())) / 1000),
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
      setExportProgress(null);
      exportStartTimeRef.current = null;
    }
  }, [routeData, config, elevationGrid, routeName, exportQuality, updateProgress]);

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

          {/* Pre-Export Estimation (shown before export) */}
          {!exportStats && !isExporting && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                High Quality Export
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <div className="text-base font-bold text-amber-700 dark:text-amber-300">
                    ~{Math.round(qualityPreset.estimatedTriangles / 1000)}K
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Triangles
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold text-amber-700 dark:text-amber-300">
                    ~{qualityPreset.estimatedFileSizeMB} MB
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    File Size
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold text-amber-700 dark:text-amber-300">
                    {qualityPreset.estimatedTimeSeconds[0]}-{qualityPreset.estimatedTimeSeconds[1]}s
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Generation
                  </div>
                </div>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                ⚠️ Keep this tab open during generation. Your file downloads automatically.
              </p>
            </div>
          )}

          {/* Export Progress (shown during export) */}
          {isExporting && exportProgress && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                Generating Your Sculpture...
              </h3>

              {/* Progress bar */}
              <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>

              {/* Stage indicator */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {exportProgress.stage === 'preparing' && 'Preparing...'}
                  {exportProgress.stage === 'terrain' && 'Building terrain mesh...'}
                  {exportProgress.stage === 'route' && 'Creating route tube...'}
                  {exportProgress.stage === 'base' && 'Generating base platform...'}
                  {exportProgress.stage === 'text' && 'Engraving text...'}
                  {exportProgress.stage === 'merging' && 'Combining meshes...'}
                  {exportProgress.stage === 'exporting' && 'Creating STL file...'}
                </span>
                <span className="text-blue-500 dark:text-blue-500">
                  {exportProgress.elapsedSeconds}s elapsed
                </span>
              </div>

              {/* Progress steps */}
              <div className="mt-3 space-y-1">
                {[
                  { key: 'terrain', label: 'Terrain mesh' },
                  { key: 'merging', label: 'Combine geometry' },
                  { key: 'exporting', label: 'Export STL' },
                ].map((step) => {
                  const stages = ['preparing', 'terrain', 'route', 'base', 'text', 'merging', 'exporting'];
                  const currentIndex = stages.indexOf(exportProgress.stage);
                  const stepIndex = stages.indexOf(step.key);
                  const isComplete = currentIndex > stepIndex;
                  const isCurrent = currentIndex === stepIndex;

                  return (
                    <div key={step.key} className="flex items-center gap-2 text-xs">
                      {isComplete ? (
                        <span className="text-blue-500">✓</span>
                      ) : isCurrent ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-blue-300 dark:border-blue-600" />
                      )}
                      <span className={cn(
                        isComplete ? 'text-blue-600 dark:text-blue-400' :
                        isCurrent ? 'text-blue-700 dark:text-blue-300 font-medium' :
                        'text-blue-400 dark:text-blue-600'
                      )}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
