// Export resolution constants

export interface BaseExportResolution {
  name: string;
  longEdge: number;
  dpi: number;
  description?: string;
}

export const EXPORT_RESOLUTIONS = {
  // Print & Physical
  SMALL: {
    name: 'Small (12×18")',
    longEdge: 5400, // 18" at 300 DPI
    dpi: 300,
    description: 'Good for small prints and frames'
  },
  MEDIUM: {
    name: 'Medium (18×24")',
    longEdge: 7200, // 24" at 300 DPI
    dpi: 300,
    description: 'Ideal for most wall art'
  },
  LARGE: {
    name: 'Large (24×36")',
    longEdge: 10800, // 36" at 300 DPI
    dpi: 300,
    description: 'Maximum quality for professional printing'
  },
  // Digital & Wallpaper
  THUMBNAIL: {
    name: 'Thumbnail',
    longEdge: 1024,
    dpi: 72,
    description: 'Small preview for web use'
  },
  PHONE_WALLPAPER: {
    name: 'Phone Wallpaper',
    longEdge: 2532,
    dpi: 72,
    description: 'Ideal resolution for modern smartphones'
  },
  LAPTOP_WALLPAPER: {
    name: 'Laptop Wallpaper',
    longEdge: 2880,
    dpi: 72,
    description: 'High-quality wallpaper for Retina displays'
  },
  DESKTOP_4K: {
    name: '4K Desktop',
    longEdge: 3840,
    dpi: 72,
    description: 'Ultra HD resolution for 4K monitors'
  }
} as const;

export type ExportResolutionKey = keyof typeof EXPORT_RESOLUTIONS;

// Default export resolution for MVP
export const DEFAULT_EXPORT_RESOLUTION = EXPORT_RESOLUTIONS.SMALL;
