/**
 * PLA Material Texture Generator
 * Creates procedural layer lines texture to simulate FDM 3D printing appearance.
 * These textures are for preview-only and don't affect STL export.
 */

import * as THREE from 'three';

export interface PLATextureOptions {
  /** Texture resolution (default: 512) */
  resolution?: number;
  /** Layer height in mm (default: 0.2) */
  layerHeight?: number;
  /** Model height in mm - determines number of visible layers */
  modelHeight?: number;
  /** Intensity of the layer lines effect (0-1, default: 0.3) */
  intensity?: number;
}

export interface PLATextures {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

// Cache for generated textures to avoid regeneration
const textureCache = new Map<string, PLATextures>();

/**
 * Generates procedural layer lines textures for PLA material.
 * Creates both a normal map (for surface detail) and roughness map (for subtle variation).
 */
export function generatePLATextures(options: PLATextureOptions = {}): PLATextures {
  const {
    resolution = 512,
    layerHeight = 0.2,
    modelHeight = 50,
    intensity = 0.3,
  } = options;

  // Create cache key
  const cacheKey = `${resolution}-${layerHeight}-${modelHeight}-${intensity}`;

  // Return cached textures if available
  const cached = textureCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Calculate number of layer lines based on model height
  const numLayers = Math.floor(modelHeight / layerHeight);
  const linesPerPixel = numLayers / resolution;

  // Create normal map canvas
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = resolution;
  normalCanvas.height = resolution;
  const normalCtx = normalCanvas.getContext('2d')!;

  // Create roughness map canvas
  const roughnessCanvas = document.createElement('canvas');
  roughnessCanvas.width = resolution;
  roughnessCanvas.height = resolution;
  const roughnessCtx = roughnessCanvas.getContext('2d')!;

  // Generate layer lines pattern
  // Normal map: RGB encodes surface normal direction
  // For horizontal layers, we create subtle bumps in the Y direction (green channel)

  const normalImageData = normalCtx.createImageData(resolution, resolution);
  const roughnessImageData = roughnessCtx.createImageData(resolution, resolution);

  for (let y = 0; y < resolution; y++) {
    // Calculate position within layer cycle
    const layerPosition = (y * linesPerPixel) % 1;

    // Create smooth wave pattern for layer edges
    // Using sine wave to create rounded layer edges
    const layerWave = Math.sin(layerPosition * Math.PI * 2);

    // Normal map value: perturb Y-normal based on layer position
    // Neutral normal is (128, 128, 255) in RGB = (0, 0, 1) in normal space
    const normalY = 128 + Math.round(layerWave * 30 * intensity);

    // Roughness variation: slightly rougher at layer boundaries
    const roughnessValue = Math.round(150 + Math.abs(layerWave) * 25 * intensity);

    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;

      // Add subtle horizontal noise for realism
      const noise = (Math.random() - 0.5) * 10 * intensity;

      // Normal map (tangent space)
      normalImageData.data[idx] = 128; // R: X-normal (neutral)
      normalImageData.data[idx + 1] = Math.max(0, Math.min(255, normalY + noise)); // G: Y-normal
      normalImageData.data[idx + 2] = 255; // B: Z-normal (pointing out)
      normalImageData.data[idx + 3] = 255; // A: opaque

      // Roughness map (grayscale)
      const roughness = Math.max(0, Math.min(255, roughnessValue + noise));
      roughnessImageData.data[idx] = roughness;
      roughnessImageData.data[idx + 1] = roughness;
      roughnessImageData.data[idx + 2] = roughness;
      roughnessImageData.data[idx + 3] = 255;
    }
  }

  normalCtx.putImageData(normalImageData, 0, 0);
  roughnessCtx.putImageData(roughnessImageData, 0, 0);

  // Create Three.js textures
  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(1, 1);

  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(1, 1);

  const textures: PLATextures = { normalMap, roughnessMap };

  // Cache the textures
  textureCache.set(cacheKey, textures);

  return textures;
}

/**
 * Clears the texture cache to free memory.
 * Call this when switching materials or unmounting components.
 */
export function clearPLATextureCache(): void {
  textureCache.forEach((textures) => {
    textures.normalMap.dispose();
    textures.roughnessMap.dispose();
  });
  textureCache.clear();
}

/**
 * Default PLA texture settings for standard sculpture preview.
 */
export const DEFAULT_PLA_TEXTURE_OPTIONS: PLATextureOptions = {
  resolution: 512,
  layerHeight: 0.2,
  modelHeight: 50,
  intensity: 0.3,
};
