/**
 * Application limits and constants
 * Centralized location for all magic numbers and limits
 */

// Thumbnail limits
export const THUMBNAIL_MAX_DIMENSION = 800;
export const THUMBNAIL_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const THUMBNAIL_QUALITY = 0.85; // WebP quality (0-1)
export const THUMBNAIL_DPI = 72; // DPI for thumbnail generation

// Feed limits
export const FEED_PAGE_SIZE = 20;
export const FEED_MAX_PAGE = 100; // Prevent excessive pagination

// Comment limits
export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 5000;

// Map title limits
export const MAP_TITLE_MIN_LENGTH = 1;
export const MAP_TITLE_MAX_LENGTH = 200;

// Map subtitle limits
export const MAP_SUBTITLE_MAX_LENGTH = 500;

// Layout constraints (in cqw/percentage units)
export const LAYOUT = {
  // Margin constraints
  MARGIN_MIN: 0,
  MARGIN_MAX: 20,
  MARGIN_DEFAULT: 5,
  
  // Typography size constraints
  TITLE_SIZE_MIN: 0.5,
  TITLE_SIZE_MAX: 15,        // Absolute max (even with no margin)
  TITLE_SIZE_DEFAULT: 5,
  
  SUBTITLE_SIZE_MIN: 0.2,
  SUBTITLE_SIZE_MAX: 8,
  SUBTITLE_SIZE_DEFAULT: 2.5,
  
  // The combined text area (title + subtitle + coords) shouldn't exceed
  // this percentage of the available canvas height
  MAX_TEXT_HEIGHT_PERCENT: 40,
  
  // Estimated height multipliers (cqw to effective height %)
  // These account for line-height, letter-spacing, and stacking
  TITLE_HEIGHT_MULTIPLIER: 1.2,
  SUBTITLE_HEIGHT_MULTIPLIER: 1.0,
  COORDS_HEIGHT_ESTIMATE: 1.5, // Fixed estimate in cqw equivalent
} as const;

// Rate limiting (requests per time window)
export const RATE_LIMITS = {
  VOTES_PER_MINUTE: 10,
  COMMENTS_PER_MINUTE: 5,
  PUBLISH_PER_HOUR: 3,
  FEED_PER_MINUTE: 60,
} as const;

