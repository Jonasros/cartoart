/**
 * Wood PLA Material Texture Generator
 * Creates procedural wood grain textures to simulate wood-filled PLA filament.
 * These textures are for preview-only and don't affect STL export.
 */

import * as THREE from 'three';

export interface WoodTextureOptions {
  /** Texture resolution (default: 512) */
  resolution?: number;
  /** Base color of wood (default: #8B7355 - light brown) */
  baseColor?: string;
  /** Grain color - darker lines (default: #654321 - dark brown) */
  grainColor?: string;
  /** Number of grain lines (default: 12) */
  grainCount?: number;
  /** Grain waviness factor (0-1, default: 0.3) */
  waviness?: number;
  /** Grain intensity for normal map (0-1, default: 0.4) */
  intensity?: number;
}

export interface WoodTextures {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  colorMap: THREE.CanvasTexture;
}

// Cache for generated textures
const textureCache = new Map<string, WoodTextures>();

/**
 * Simple 2D noise function for organic variation.
 * Uses a deterministic approach for consistency.
 */
function noise2D(x: number, y: number, seed: number = 0): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Smoothed noise for more organic patterns.
 */
function smoothNoise(x: number, y: number, seed: number = 0): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;

  // Smooth interpolation
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  // Sample corners
  const n00 = noise2D(x0, y0, seed);
  const n10 = noise2D(x0 + 1, y0, seed);
  const n01 = noise2D(x0, y0 + 1, seed);
  const n11 = noise2D(x0 + 1, y0 + 1, seed);

  // Bilinear interpolation
  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;

  return nx0 * (1 - sy) + nx1 * sy;
}

/**
 * Fractal brownian motion for complex natural patterns.
 */
function fbm(x: number, y: number, octaves: number = 4, seed: number = 0): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, seed + i * 100);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Parse hex color to RGB values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 139, g: 115, b: 85 }; // Default brown
}

/**
 * Generates procedural wood grain textures for Wood PLA material.
 * Creates color map (grain pattern), normal map (surface detail), and roughness map.
 */
export function generateWoodTextures(options: WoodTextureOptions = {}): WoodTextures {
  const {
    resolution = 512,
    baseColor = '#8B7355',
    grainColor = '#654321',
    grainCount = 12,
    waviness = 0.3,
    intensity = 0.4,
  } = options;

  // Create cache key
  const cacheKey = `${resolution}-${baseColor}-${grainColor}-${grainCount}-${waviness}-${intensity}`;

  // Return cached textures if available
  const cached = textureCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Parse colors
  const base = hexToRgb(baseColor);
  const grain = hexToRgb(grainColor);

  // Create canvases
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = resolution;
  colorCanvas.height = resolution;
  const colorCtx = colorCanvas.getContext('2d')!;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = resolution;
  normalCanvas.height = resolution;
  const normalCtx = normalCanvas.getContext('2d')!;

  const roughnessCanvas = document.createElement('canvas');
  roughnessCanvas.width = resolution;
  roughnessCanvas.height = resolution;
  const roughnessCtx = roughnessCanvas.getContext('2d')!;

  const colorImageData = colorCtx.createImageData(resolution, resolution);
  const normalImageData = normalCtx.createImageData(resolution, resolution);
  const roughnessImageData = roughnessCtx.createImageData(resolution, resolution);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;

      // Normalized coordinates
      const nx = x / resolution;
      const ny = y / resolution;

      // Wood grain pattern - elongated in Y direction (vertical grain)
      // Add waviness using noise
      const waveOffset = fbm(nx * 3, ny * 0.5, 3) * waviness;
      const grainX = nx + waveOffset;

      // Calculate grain lines using sine waves at different frequencies
      let grainValue = 0;
      for (let g = 1; g <= 3; g++) {
        const freq = grainCount * g * 0.7;
        const amp = 1 / g;
        grainValue += Math.sin(grainX * Math.PI * freq) * amp;
      }
      grainValue = (grainValue + 1.5) / 3; // Normalize to 0-1

      // Add organic variation
      const variation = fbm(nx * 5, ny * 2, 4, 42) * 0.3;
      grainValue = Math.max(0, Math.min(1, grainValue + variation - 0.15));

      // Apply threshold for distinct grain lines
      const grainThreshold = Math.pow(grainValue, 1.5);

      // Color interpolation
      const r = Math.round(base.r * (1 - grainThreshold) + grain.r * grainThreshold);
      const g = Math.round(base.g * (1 - grainThreshold) + grain.g * grainThreshold);
      const b = Math.round(base.b * (1 - grainThreshold) + grain.b * grainThreshold);

      // Add subtle random variation
      const colorNoise = (fbm(nx * 20, ny * 20, 2) - 0.5) * 20;

      colorImageData.data[idx] = Math.max(0, Math.min(255, r + colorNoise));
      colorImageData.data[idx + 1] = Math.max(0, Math.min(255, g + colorNoise));
      colorImageData.data[idx + 2] = Math.max(0, Math.min(255, b + colorNoise));
      colorImageData.data[idx + 3] = 255;

      // Normal map - grain creates subtle grooves
      // Calculate gradient for normal
      const dx = (grainValue - smoothNoise((x + 1) / resolution + waveOffset, ny * grainCount, 1)) * intensity;
      const dy = (grainValue - smoothNoise(grainX, ((y + 1) / resolution) * grainCount, 1)) * intensity * 0.3;

      normalImageData.data[idx] = Math.round(128 + dx * 127);
      normalImageData.data[idx + 1] = Math.round(128 + dy * 127);
      normalImageData.data[idx + 2] = 255;
      normalImageData.data[idx + 3] = 255;

      // Roughness map - grain lines are slightly rougher
      const roughnessValue = Math.round(200 + grainThreshold * 40 + (Math.random() - 0.5) * 15);
      roughnessImageData.data[idx] = Math.max(0, Math.min(255, roughnessValue));
      roughnessImageData.data[idx + 1] = Math.max(0, Math.min(255, roughnessValue));
      roughnessImageData.data[idx + 2] = Math.max(0, Math.min(255, roughnessValue));
      roughnessImageData.data[idx + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImageData, 0, 0);
  normalCtx.putImageData(normalImageData, 0, 0);
  roughnessCtx.putImageData(roughnessImageData, 0, 0);

  // Create Three.js textures
  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  const textures: WoodTextures = { colorMap, normalMap, roughnessMap };

  // Cache the textures
  textureCache.set(cacheKey, textures);

  return textures;
}

/**
 * Clears the texture cache to free memory.
 */
export function clearWoodTextureCache(): void {
  textureCache.forEach((textures) => {
    textures.colorMap.dispose();
    textures.normalMap.dispose();
    textures.roughnessMap.dispose();
  });
  textureCache.clear();
}

/**
 * Default wood texture settings for standard sculpture preview.
 */
export const DEFAULT_WOOD_TEXTURE_OPTIONS: WoodTextureOptions = {
  resolution: 512,
  baseColor: '#8B7355',
  grainColor: '#654321',
  grainCount: 12,
  waviness: 0.3,
  intensity: 0.4,
};
