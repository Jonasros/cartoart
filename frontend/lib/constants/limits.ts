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

// Rate limiting (requests per time window)
export const RATE_LIMITS = {
  VOTES_PER_MINUTE: 10,
  COMMENTS_PER_MINUTE: 5,
  PUBLISH_PER_HOUR: 3,
  FEED_PER_MINUTE: 60,
} as const;

// Layout limits for typography and margins
// These prevent text from overflowing the canvas
export const LAYOUT = {
  // Margin limits (percentage of container width)
  MARGIN_MIN: 0,
  MARGIN_MAX: 20,
  
  // Title size limits (cqw - container query width units)
  TITLE_SIZE_MIN: 0.5,
  TITLE_SIZE_MAX: 15,
  
  // Subtitle size limits (cqw)
  SUBTITLE_SIZE_MIN: 0.2,
  SUBTITLE_SIZE_MAX: 8,
  
  // Maximum percentage of canvas height that text should occupy
  MAX_TEXT_HEIGHT_PERCENT: 40,
  
  // Approximate height multipliers for text (line-height factor)
  TITLE_HEIGHT_MULTIPLIER: 1.3,
  SUBTITLE_HEIGHT_MULTIPLIER: 1.2,
  
  // Estimated coordinate text height in cqw
  COORDS_HEIGHT_ESTIMATE: 2,
} as const;
