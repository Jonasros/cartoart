/**
 * Layout limit calculations
 * 
 * These utilities calculate safe maximum values for typography and margins
 * to prevent text from overflowing the canvas boundaries.
 * 
 * All calculations use container query width (cqw) units, where the poster
 * canvas height varies based on aspect ratio and orientation.
 */

import { LAYOUT } from '@/lib/constants/limits';
import type { PosterConfig } from '@/types/poster';
import { getNumericRatio } from '@/lib/styles/dimensions';

/**
 * Get the canvas height as a ratio of width (1 = square, 1.5 = portrait 2:3)
 */
function getHeightRatio(
  aspectRatio: PosterConfig['format']['aspectRatio'],
  orientation: PosterConfig['format']['orientation']
): number {
  const ratio = getNumericRatio(aspectRatio, orientation);
  // ratio is width/height, so for height/width we invert
  return 1 / ratio;
}

/**
 * Calculate the available height for text content (in cqw units)
 * 
 * Available height = (canvas height - margins on top & bottom)
 * Since we use cqw, canvas height depends on aspect ratio
 */
function getAvailableHeightCqw(
  margin: number,
  aspectRatio: PosterConfig['format']['aspectRatio'],
  orientation: PosterConfig['format']['orientation']
): number {
  const heightRatio = getHeightRatio(aspectRatio, orientation);
  // Canvas height in cqw = 100 * heightRatio
  // Margins take up 2 * margin from the height (top + bottom)
  const canvasHeightCqw = 100 * heightRatio;
  const marginsHeightCqw = 2 * margin * heightRatio;
  return canvasHeightCqw - marginsHeightCqw;
}

/**
 * Estimate the total height used by text elements (in cqw units)
 */
function estimateTextHeightCqw(
  titleSize: number,
  subtitleSize: number,
  showTitle: boolean,
  showSubtitle: boolean,
  showCoordinates: boolean
): number {
  let totalHeight = 0;
  
  if (showTitle) {
    totalHeight += titleSize * LAYOUT.TITLE_HEIGHT_MULTIPLIER;
  }
  if (showSubtitle) {
    totalHeight += subtitleSize * LAYOUT.SUBTITLE_HEIGHT_MULTIPLIER;
    totalHeight += 1; // Gap between title and subtitle
  }
  if (showCoordinates) {
    totalHeight += LAYOUT.COORDS_HEIGHT_ESTIMATE;
  }
  
  // Add padding (text position padding)
  totalHeight += 4;
  
  return totalHeight;
}

/**
 * Calculate the maximum safe title size given current config
 * 
 * This considers BOTH:
 * 1. Vertical space (height) - so text doesn't overflow bottom
 * 2. Horizontal space (width) - so text doesn't overflow sides
 */
export function getMaxTitleSize(config: PosterConfig): number {
  const { format, typography, location } = config;
  
  // === HEIGHT-BASED LIMIT ===
  const availableHeight = getAvailableHeightCqw(
    format.margin,
    format.aspectRatio,
    format.orientation
  );
  
  // Calculate how much height the title can use
  // We want text to use at most MAX_TEXT_HEIGHT_PERCENT of the available canvas
  const maxTextHeight = (availableHeight * LAYOUT.MAX_TEXT_HEIGHT_PERCENT) / 100;
  
  // Subtract space for subtitle and coordinates
  let reservedHeight = 0;
  if (typography.showSubtitle !== false) {
    reservedHeight += typography.subtitleSize * LAYOUT.SUBTITLE_HEIGHT_MULTIPLIER;
    reservedHeight += 1; // Gap
  }
  if (typography.showCoordinates !== false) {
    reservedHeight += LAYOUT.COORDS_HEIGHT_ESTIMATE;
  }
  reservedHeight += 4; // Padding
  
  const availableForTitle = maxTextHeight - reservedHeight;
  const maxFromHeight = availableForTitle / LAYOUT.TITLE_HEIGHT_MULTIPLIER;
  
  // === WIDTH-BASED LIMIT ===
  // Available width is 100cqw minus margins on both sides, with some padding
  const availableWidth = 100 - (2 * format.margin) - 4; // 4cqw padding on sides
  
  // Estimate title width based on character count and letter spacing
  // Average character width is approximately 0.6 * fontSize for most fonts
  // But with letter spacing and ALL CAPS, it can be wider
  const titleText = location.name || '';
  const charCount = titleText.length || 1;
  const letterSpacing = typography.titleLetterSpacing || 0;
  
  // Character width factor: ~0.55 for average, higher for ALL CAPS wide fonts
  // Add letter spacing contribution (letterSpacing is in em units, so multiply by fontSize)
  const charWidthFactor = typography.titleAllCaps ? 0.65 : 0.55;
  
  // Title width ≈ charCount * fontSize * charWidthFactor + (charCount - 1) * fontSize * letterSpacing
  // We want: titleWidth <= availableWidth
  // charCount * fontSize * charWidthFactor + (charCount - 1) * fontSize * letterSpacing <= availableWidth
  // fontSize * (charCount * charWidthFactor + (charCount - 1) * letterSpacing) <= availableWidth
  // fontSize <= availableWidth / (charCount * charWidthFactor + (charCount - 1) * letterSpacing)
  
  const effectiveLetterSpacing = Math.max(0, letterSpacing); // Only positive spacing adds width
  const widthDivisor = (charCount * charWidthFactor) + ((charCount - 1) * effectiveLetterSpacing);
  const maxFromWidth = widthDivisor > 0 ? availableWidth / widthDivisor : LAYOUT.TITLE_SIZE_MAX;
  
  // Take the minimum of height-based and width-based limits
  const maxTitleSize = Math.min(maxFromHeight, maxFromWidth);
  
  // Clamp to absolute limits
  return Math.max(LAYOUT.TITLE_SIZE_MIN, Math.min(LAYOUT.TITLE_SIZE_MAX, maxTitleSize));
}

/**
 * Calculate the maximum safe subtitle size given current config
 */
export function getMaxSubtitleSize(config: PosterConfig): number {
  const { format, typography } = config;
  const availableHeight = getAvailableHeightCqw(
    format.margin,
    format.aspectRatio,
    format.orientation
  );
  
  const maxTextHeight = (availableHeight * LAYOUT.MAX_TEXT_HEIGHT_PERCENT) / 100;
  
  // Subtract space for title and coordinates
  let reservedHeight = 0;
  if (typography.showTitle !== false) {
    reservedHeight += typography.titleSize * LAYOUT.TITLE_HEIGHT_MULTIPLIER;
  }
  if (typography.showCoordinates !== false) {
    reservedHeight += LAYOUT.COORDS_HEIGHT_ESTIMATE;
  }
  reservedHeight += 5; // Gaps and padding
  
  const availableForSubtitle = maxTextHeight - reservedHeight;
  const maxSubtitleSize = availableForSubtitle / LAYOUT.SUBTITLE_HEIGHT_MULTIPLIER;
  
  return Math.max(LAYOUT.SUBTITLE_SIZE_MIN, Math.min(LAYOUT.SUBTITLE_SIZE_MAX, maxSubtitleSize));
}

/**
 * Calculate the maximum safe margin given current config
 */
export function getMaxMargin(config: PosterConfig): number {
  const { format, typography } = config;
  const heightRatio = getHeightRatio(format.aspectRatio, format.orientation);
  const canvasHeightCqw = 100 * heightRatio;
  
  // Calculate current text height
  const textHeight = estimateTextHeightCqw(
    typography.titleSize,
    typography.subtitleSize,
    typography.showTitle !== false,
    typography.showSubtitle !== false,
    typography.showCoordinates !== false
  );
  
  // We need: textHeight <= (canvasHeight - 2*margin) * MAX_TEXT_HEIGHT_PERCENT / 100
  // Solving for margin:
  // textHeight * 100 / MAX_TEXT_HEIGHT_PERCENT <= canvasHeight - 2*margin
  // 2*margin <= canvasHeight - textHeight * 100 / MAX_TEXT_HEIGHT_PERCENT
  // margin <= (canvasHeight - textHeight * 100 / MAX_TEXT_HEIGHT_PERCENT) / 2
  
  const minRequiredHeight = (textHeight * 100) / LAYOUT.MAX_TEXT_HEIGHT_PERCENT;
  const maxMarginFromHeight = (canvasHeightCqw - minRequiredHeight) / (2 * heightRatio);
  
  // Clamp to absolute limits
  return Math.max(LAYOUT.MARGIN_MIN, Math.min(LAYOUT.MARGIN_MAX, maxMarginFromHeight));
}

/**
 * Check if current layout configuration might overflow
 * Returns warnings if values are near their limits
 */
export function getLayoutWarnings(config: PosterConfig): string[] {
  const warnings: string[] = [];
  
  const maxTitle = getMaxTitleSize(config);
  const maxSubtitle = getMaxSubtitleSize(config);
  const maxMargin = getMaxMargin(config);
  
  if (config.typography.titleSize > maxTitle * 0.9) {
    warnings.push('Title size is near the safe limit');
  }
  
  if (config.typography.subtitleSize > maxSubtitle * 0.9) {
    warnings.push('Subtitle size is near the safe limit');
  }
  
  if (config.format.margin > maxMargin * 0.9) {
    warnings.push('Margin is near the safe limit');
  }
  
  return warnings;
}

/**
 * Clamp current values to safe limits
 * Returns a partial config with any values that need adjustment
 */
export function clampToSafeLimits(config: PosterConfig): Partial<{
  typography: Partial<PosterConfig['typography']>;
  format: Partial<PosterConfig['format']>;
}> {
  const result: ReturnType<typeof clampToSafeLimits> = {};
  
  const maxTitle = getMaxTitleSize(config);
  const maxSubtitle = getMaxSubtitleSize(config);
  const maxMargin = getMaxMargin(config);
  
  if (config.typography.titleSize > maxTitle) {
    result.typography = { ...result.typography, titleSize: maxTitle };
  }
  
  if (config.typography.subtitleSize > maxSubtitle) {
    result.typography = { ...result.typography, subtitleSize: maxSubtitle };
  }
  
  if (config.format.margin > maxMargin) {
    result.format = { ...result.format, margin: maxMargin };
  }
  
  return result;
}

