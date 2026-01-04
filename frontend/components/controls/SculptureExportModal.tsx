'use client';

import { useState, useCallback } from 'react';
import { X, Download, Loader2, Box, Ruler, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RouteData } from '@/types/poster';
import type { SculptureConfig } from '@/types/sculpture';
import { SCULPTURE_SIZES, SCULPTURE_MATERIALS, SCULPTURE_SHAPES } from '@/types/sculpture';
import {
  generateSculptureMeshes,
  exportToSTL,
  generateFilename,
  calculatePrintDimensions,
} from '@/lib/sculpture';

interface SculptureExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData | null;
  config: SculptureConfig;
  elevationGrid?: number[][];
  routeName?: string;
}

export function SculptureExportModal({
  isOpen,
  onClose,
  routeData,
  config,
  elevationGrid,
  routeName,
}: SculptureExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportStats, setExportStats] = useState<{
    vertices: number;
    triangles: number;
    fileSize: number;
  } | null>(null);

  const handleExport = useCallback(async () => {
    if (!routeData) {
      setExportError('No route data available for export');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportStats(null);

    try {
      // Generate meshes
      const meshes = generateSculptureMeshes(routeData, config, elevationGrid);

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
      } else {
        setExportError(result.error ?? 'Export failed');
      }
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : 'Unknown export error'
      );
    } finally {
      setIsExporting(false);
    }
  }, [routeData, config, elevationGrid, routeName]);

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
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Export 3D Sculpture
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
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Printing Tips:</strong> Use 0.2mm layer height, 20% infill.
              Support material may be needed for overhangs. PLA or PETG recommended.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-800/80 dark:to-transparent border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleExport}
            disabled={isExporting || !routeData}
            className={cn(
              'w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all',
              'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
              'hover:shadow-lg hover:shadow-emerald-500/20',
              'active:scale-[0.98]',
              'disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none'
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating STL...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download STL</span>
              </>
            )}
          </button>

          {/* Future: Order printed sculpture */}
          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            Want us to print it for you?{' '}
            <span className="text-gray-400">Coming soon!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
