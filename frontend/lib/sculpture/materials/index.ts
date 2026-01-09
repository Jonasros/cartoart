/**
 * Enhanced Material Textures for 3D Sculpture Preview
 *
 * This module provides procedurally generated textures for different
 * 3D printing materials. These enhance the visual realism of the preview
 * but do not affect STL export (which is geometry-only).
 *
 * Materials supported:
 * - PLA: Layer lines texture simulating FDM printing
 * - Wood PLA: Wood grain texture with organic variation
 * - Resin: Enhanced through material properties (no textures needed)
 */

export {
  generatePLATextures,
  clearPLATextureCache,
  DEFAULT_PLA_TEXTURE_OPTIONS,
} from './plaTexture';

export type { PLATextureOptions, PLATextures } from './plaTexture';

export {
  generateWoodTextures,
  clearWoodTextureCache,
  DEFAULT_WOOD_TEXTURE_OPTIONS,
} from './woodTexture';

export type { WoodTextureOptions, WoodTextures } from './woodTexture';

// Import for clearAllMaterialCaches
import { clearPLATextureCache } from './plaTexture';
import { clearWoodTextureCache } from './woodTexture';

/**
 * Clears all material texture caches.
 * Call this when unmounting the sculpture preview to free GPU memory.
 */
export function clearAllMaterialCaches(): void {
  clearPLATextureCache();
  clearWoodTextureCache();
}
