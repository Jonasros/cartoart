/**
 * Template system exports
 */

export * from './cycling';
export * from './hiking';
export * from './running';

import { cyclingTemplates } from './cycling';
import { hikingTemplates } from './hiking';
import { runningTemplates } from './running';
import type { PosterTemplate } from '../types';

// Combined template registry
export const allTemplates: Record<string, PosterTemplate> = {
  ...cyclingTemplates,
  ...hikingTemplates,
  ...runningTemplates,
};

/**
 * Get a template by ID
 */
export function getTemplateById(templateId: string): PosterTemplate | undefined {
  return allTemplates[templateId];
}

/**
 * Get default template for a category
 */
export function getDefaultTemplate(
  category: 'cycling' | 'hiking' | 'running' | 'ultra' | 'city'
): PosterTemplate {
  switch (category) {
    case 'cycling':
      return cyclingTemplates['cycling-classic'];
    case 'hiking':
      return hikingTemplates['hiking-explorer'];
    case 'running':
      return runningTemplates['running-marathon-city'];
    case 'ultra':
      return runningTemplates['running-ultra-terrain'];
    case 'city':
      return runningTemplates['running-neon'];
    default:
      return cyclingTemplates['cycling-classic'];
  }
}
