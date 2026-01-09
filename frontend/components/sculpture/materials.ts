/**
 * Material configurations for 3D sculpture preview.
 * Different materials have different visual properties.
 *
 * Enhanced materials include procedural textures for realistic rendering:
 * - PLA: Layer lines normal map simulating FDM printing
 * - Wood PLA: Wood grain texture with organic variation
 * - Resin: High-gloss with subsurface scattering
 */

import * as THREE from 'three';
import type { SculptureMaterial } from '@/types/sculpture';
import {
  generatePLATextures,
  generateWoodTextures,
  clearAllMaterialCaches,
  type PLATextures,
  type WoodTextures,
} from '@/lib/sculpture/materials';

export interface MaterialProperties {
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  envMapIntensity?: number;
  // Enhanced material properties
  normalMap?: THREE.Texture;
  normalScale?: THREE.Vector2;
  roughnessMap?: THREE.Texture;
  map?: THREE.Texture;
  // Resin-specific SSS properties
  transmission?: number;
  thickness?: number;
  ior?: number;
  sheen?: number;
  sheenRoughness?: number;
  sheenColor?: THREE.Color;
}

// Cached texture instances
let cachedPLATextures: PLATextures | null = null;
let cachedWoodTextures: WoodTextures | null = null;

/**
 * Get or generate PLA textures (with caching).
 */
function getPLATextures(): PLATextures {
  if (!cachedPLATextures) {
    cachedPLATextures = generatePLATextures({
      resolution: 512,
      layerHeight: 0.2,
      modelHeight: 50,
      intensity: 0.25,
    });
  }
  return cachedPLATextures;
}

/**
 * Get or generate Wood textures (with caching).
 */
function getWoodTextures(): WoodTextures {
  if (!cachedWoodTextures) {
    cachedWoodTextures = generateWoodTextures({
      resolution: 512,
      baseColor: '#8B7355',
      grainColor: '#654321',
      grainCount: 10,
      waviness: 0.25,
      intensity: 0.35,
    });
  }
  return cachedWoodTextures;
}

/**
 * Get basic material properties (without textures) for simpler use cases.
 * Note: envMapIntensity values kept low to avoid overexposure with studio lighting
 */
export function getBasicMaterialProperties(material: SculptureMaterial): MaterialProperties {
  switch (material) {
    case 'pla':
      return {
        roughness: 0.6,
        metalness: 0.05,
        envMapIntensity: 0.15,
      };

    case 'wood':
      return {
        roughness: 0.9,
        metalness: 0.0,
        envMapIntensity: 0.05,
      };

    case 'resin':
      return {
        roughness: 0.15,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.4,
      };

    default:
      return {
        roughness: 0.7,
        metalness: 0.1,
        envMapIntensity: 0.1,
      };
  }
}

/**
 * Get enhanced material properties with procedural textures.
 * These provide more realistic preview rendering.
 *
 * @param material - The material type
 * @param enableTextures - Whether to include procedural textures (default: false for now - textures need refinement)
 */
export function getMaterialProperties(
  material: SculptureMaterial,
  enableTextures: boolean = false // Temporarily disabled - textures need refinement
): MaterialProperties {
  if (!enableTextures) {
    return getBasicMaterialProperties(material);
  }

  switch (material) {
    case 'pla': {
      // PLA: Matte plastic with subtle layer lines
      const textures = getPLATextures();
      return {
        roughness: 0.6,
        metalness: 0.05,
        envMapIntensity: 0.3,
        normalMap: textures.normalMap,
        normalScale: new THREE.Vector2(0.15, 0.15),
        roughnessMap: textures.roughnessMap,
      };
    }

    case 'wood': {
      // Wood PLA: Organic wood grain texture
      const textures = getWoodTextures();
      return {
        roughness: 0.85,
        metalness: 0.0,
        envMapIntensity: 0.15,
        map: textures.colorMap,
        normalMap: textures.normalMap,
        normalScale: new THREE.Vector2(0.25, 0.25),
        roughnessMap: textures.roughnessMap,
      };
    }

    case 'resin':
      // Resin: High-gloss with subsurface scattering
      return {
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.0,
        // SSS properties for translucent resin look
        transmission: 0.15,
        thickness: 0.5,
        ior: 1.5,
        // Subtle sheen for "wet" look
        sheen: 0.3,
        sheenRoughness: 0.2,
        sheenColor: new THREE.Color('#ffffff'),
      };

    default:
      return {
        roughness: 0.7,
        metalness: 0.1,
      };
  }
}

/**
 * Get rim material properties (slightly different from base for visual distinction).
 */
export function getRimMaterialProperties(
  material: SculptureMaterial,
  enableTextures: boolean = false // Temporarily disabled
): MaterialProperties {
  const base = getMaterialProperties(material, enableTextures);
  return {
    ...base,
    roughness: Math.max(0.1, base.roughness - 0.1),
    metalness: base.metalness + 0.05,
  };
}

/**
 * Get route material properties (slightly shinier to stand out).
 */
export function getRouteMaterialProperties(
  material: SculptureMaterial,
  enableTextures: boolean = false // Temporarily disabled
): MaterialProperties {
  const base = getMaterialProperties(material, enableTextures);
  return {
    ...base,
    // Routes are slightly more reflective to stand out
    roughness: Math.max(0.1, base.roughness * 0.7),
    metalness: Math.min(0.3, base.metalness + 0.1),
    envMapIntensity: (base.envMapIntensity || 0.3) * 1.5,
  };
}

/**
 * Clean up cached textures to free GPU memory.
 * Call this when unmounting the sculpture preview component.
 */
export function cleanupMaterialTextures(): void {
  clearAllMaterialCaches();
  cachedPLATextures = null;
  cachedWoodTextures = null;
}
