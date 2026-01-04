/**
 * Material configurations for 3D sculpture preview.
 * Different materials have different visual properties.
 */

import type { SculptureMaterial } from '@/types/sculpture';

export interface MaterialProperties {
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  envMapIntensity?: number;
}

/**
 * Get material properties based on selected material type.
 * These properties affect how the mesh appears in the 3D preview.
 */
export function getMaterialProperties(material: SculptureMaterial): MaterialProperties {
  switch (material) {
    case 'pla':
      // PLA: Matte plastic, slight sheen
      return {
        roughness: 0.6,
        metalness: 0.05,
        envMapIntensity: 0.3,
      };

    case 'wood':
      // Wood PLA: More matte, organic texture
      return {
        roughness: 0.9,
        metalness: 0.0,
        envMapIntensity: 0.1,
      };

    case 'resin':
      // Resin: Smooth, glossy, almost glass-like
      return {
        roughness: 0.15,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.8,
      };

    default:
      return {
        roughness: 0.7,
        metalness: 0.1,
      };
  }
}

/**
 * Get rim material properties (slightly different from base)
 */
export function getRimMaterialProperties(material: SculptureMaterial): MaterialProperties {
  const base = getMaterialProperties(material);
  return {
    ...base,
    roughness: Math.max(0.1, base.roughness - 0.1),
    metalness: base.metalness + 0.05,
  };
}
