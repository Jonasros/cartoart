import { THUMBNAIL_MAX_DIMENSION, THUMBNAIL_QUALITY } from '@/lib/constants/limits';

/**
 * Capture a screenshot from an R3F canvas element
 * Returns a WebP blob for efficient storage
 */
export async function captureSculptureThumbnail(
  canvas: HTMLCanvasElement
): Promise<Blob> {
  // Create a new canvas at thumbnail size
  const thumbCanvas = document.createElement('canvas');
  const ctx = thumbCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  // Calculate dimensions to fit within THUMBNAIL_MAX_DIMENSION while maintaining aspect ratio
  const aspectRatio = canvas.width / canvas.height;
  let thumbWidth: number;
  let thumbHeight: number;

  if (aspectRatio >= 1) {
    // Landscape or square
    thumbWidth = Math.min(canvas.width, THUMBNAIL_MAX_DIMENSION);
    thumbHeight = thumbWidth / aspectRatio;
  } else {
    // Portrait
    thumbHeight = Math.min(canvas.height, THUMBNAIL_MAX_DIMENSION);
    thumbWidth = thumbHeight * aspectRatio;
  }

  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;

  // Draw the source canvas onto the thumbnail canvas
  ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);

  // Convert to WebP blob
  return new Promise((resolve, reject) => {
    thumbCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback to PNG if WebP is not supported
          thumbCanvas.toBlob(
            (pngBlob) => {
              if (pngBlob) {
                resolve(pngBlob);
              } else {
                reject(new Error('Failed to create thumbnail blob'));
              }
            },
            'image/png'
          );
        }
      },
      'image/webp',
      THUMBNAIL_QUALITY
    );
  });
}
