/**
 * Input sanitization utilities
 * Sanitizes user-generated content to prevent XSS and other security issues
 */

/**
 * Sanitize text input by removing HTML tags and dangerous content
 * Uses a simple regex approach that works on both client and server
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Re-escape < and > to prevent injection after entity decoding
  sanitized = sanitized
    .replace(/</g, '')
    .replace(/>/g, '');

  return sanitized.trim();
}

/**
 * Normalize comment content
 * - Normalizes Unicode (NFC)
 * - Removes zero-width characters
 * - Trims whitespace
 * @param content - Comment content to normalize
 * @returns Normalized content
 */
export function normalizeComment(content: string): string {
  // Normalize Unicode to NFC form
  let normalized = content.normalize('NFC');
  
  // Remove zero-width characters (zero-width space, zero-width non-joiner, etc.)
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  return normalized.trim();
}

