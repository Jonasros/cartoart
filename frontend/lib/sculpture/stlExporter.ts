/**
 * STL Exporter for 3D Sculpture
 *
 * Exports Three.js meshes to STL format for 3D printing.
 * Uses Three.js STLExporter for binary STL generation.
 */

import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { SculptureConfig } from '@/types/sculpture';

export interface ExportOptions {
  /** Filename for the exported STL */
  filename?: string;
  /** Whether to export as binary STL (smaller, faster) or ASCII (human-readable) */
  binary?: boolean;
  /** Scale factor to convert from scene units to mm */
  scale?: number;
}

export interface ExportResult {
  /** Whether the export was successful */
  success: boolean;
  /** Error message if export failed */
  error?: string;
  /** File size in bytes */
  fileSize?: number;
  /** Statistics about the exported mesh */
  stats?: {
    vertices: number;
    triangles: number;
  };
}

/**
 * Export a Three.js scene or mesh to STL format
 */
export function exportToSTL(
  scene: THREE.Object3D,
  options: ExportOptions = {}
): ExportResult {
  const {
    filename = 'sculpture.stl',
    binary = true,
    scale = 10, // Default: 1 scene unit = 10mm (for 10cm sculpture at size=1)
  } = options;

  try {
    // Clone the scene so we don't modify the original
    const exportScene = scene.clone();

    // Apply scale transformation for mm conversion
    exportScene.scale.multiplyScalar(scale);
    exportScene.updateMatrixWorld(true);

    const exporter = new STLExporter();

    // Export to STL
    const result = exporter.parse(exportScene, { binary });

    // Calculate stats from the result
    let fileSize = 0;
    let blob: Blob;

    if (binary) {
      // STLExporter returns DataView for binary mode
      const dataView = result as DataView;
      fileSize = dataView.byteLength;
      // Copy data to a new ArrayBuffer to avoid SharedArrayBuffer issues
      const buffer = new ArrayBuffer(dataView.byteLength);
      const view = new Uint8Array(buffer);
      const source = new Uint8Array(
        dataView.buffer as ArrayBuffer,
        dataView.byteOffset,
        dataView.byteLength
      );
      view.set(source);
      blob = new Blob([buffer], { type: 'application/octet-stream' });
    } else {
      const text = result as string;
      fileSize = new Blob([text]).size;
      blob = new Blob([text], { type: 'text/plain' });
    }

    // Count vertices and triangles from the scene
    let vertices = 0;
    let triangles = 0;
    exportScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geo = child.geometry;
        const posAttr = geo.getAttribute('position');
        if (posAttr) {
          vertices += posAttr.count;
          if (geo.index) {
            triangles += geo.index.count / 3;
          } else {
            triangles += posAttr.count / 3;
          }
        }
      }
    });

    // Trigger download
    downloadBlob(blob, filename);

    return {
      success: true,
      fileSize,
      stats: {
        vertices,
        triangles: Math.round(triangles),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown export error',
    };
  }
}

/**
 * Export multiple geometries as a single combined STL
 */
export function exportCombinedGeometries(
  geometries: THREE.BufferGeometry[],
  options: ExportOptions = {}
): ExportResult {
  if (geometries.length === 0) {
    return {
      success: false,
      error: 'No geometries to export',
    };
  }

  try {
    // Merge all geometries into one
    const merged = mergeGeometries(geometries, false);

    if (!merged) {
      return {
        success: false,
        error: 'Failed to merge geometries',
      };
    }

    // Create a mesh and scene for export
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(merged, material);
    const scene = new THREE.Scene();
    scene.add(mesh);

    return exportToSTL(scene, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown merge error',
    };
  }
}

/**
 * Generate filename based on sculpture config
 */
export function generateFilename(config: SculptureConfig, routeName?: string): string {
  const sanitizedName = routeName
    ? routeName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
    : 'sculpture';

  const shape = config.shape;
  const size = config.size;

  return `${sanitizedName}-${shape}-${size}cm.stl`;
}

/**
 * Calculate approximate print dimensions in mm
 */
export function calculatePrintDimensions(
  config: SculptureConfig
): { width: number; depth: number; height: number } {
  const sizeInMm = config.size * 10; // cm to mm

  // Base dimensions
  const width = sizeInMm;
  const depth = sizeInMm;

  // Height includes base + terrain + route elevation
  const baseHeightMm = config.baseHeight;
  const rimHeightMm = config.rimHeight;
  const terrainHeightMm = config.elevationScale * 10; // Approximate max terrain height

  const height = baseHeightMm + rimHeightMm + terrainHeightMm;

  return { width, depth, height };
}

/**
 * Validate mesh for 3D printing
 */
export function validateMeshForPrinting(
  scene: THREE.Object3D
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geo = child.geometry;

      // Check for non-manifold geometry (simplified check)
      if (!geo.index) {
        warnings.push('Geometry is not indexed - may have duplicate vertices');
      }

      // Check for very small triangles
      const posAttr = geo.getAttribute('position');
      if (posAttr && posAttr.count < 12) {
        warnings.push('Geometry has very few vertices');
      }

      // Check for NaN values
      if (posAttr) {
        for (let i = 0; i < posAttr.count; i++) {
          if (
            isNaN(posAttr.getX(i)) ||
            isNaN(posAttr.getY(i)) ||
            isNaN(posAttr.getZ(i))
          ) {
            warnings.push('Geometry contains NaN values');
            break;
          }
        }
      }
    }
  });

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Helper to trigger file download
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
