/**
 * Randomization utilities for making seeded content look organic
 */

import type { PosterTemplate } from '../types';
import { cyclingTemplates } from '../templates/cycling';
import { hikingTemplates } from '../templates/hiking';
import { runningTemplates } from '../templates/running';

/**
 * Seed users for distributing content
 * These should be created in Supabase before running the seed script
 */
export interface SeedUser {
  id: string;
  name: string;
  personality: 'cyclist' | 'hiker' | 'runner' | 'all-rounder';
}

// Placeholder UUIDs - replace with actual user IDs from Supabase
// Names are randomized email-style identifiers for organic appearance
export const seedUsers: SeedUser[] = [
  { id: 'SEED_USER_1', name: 'alex.m.94@gmail.com', personality: 'runner' },
  { id: 'SEED_USER_2', name: 'sarah.hiking@outlook.com', personality: 'hiker' },
  { id: 'SEED_USER_3', name: 'markus.jensen@gmail.com', personality: 'cyclist' },
  { id: 'SEED_USER_4', name: 'emma.karlsson@yahoo.com', personality: 'all-rounder' },
  { id: 'SEED_USER_5', name: 'david.chen.runs@gmail.com', personality: 'runner' },
  { id: 'SEED_USER_6', name: 'lisa.outdoor@hotmail.com', personality: 'hiker' },
  { id: 'SEED_USER_7', name: 'tom.cyclist22@gmail.com', personality: 'cyclist' },
  { id: 'SEED_USER_8', name: 'marie.bernard@outlook.com', personality: 'all-rounder' },
];

/**
 * Get a random seed user based on route category
 */
export function getRandomUser(
  category: 'cycling' | 'hiking' | 'running' | 'ultra' | 'city'
): SeedUser {
  // Filter users by matching personality
  let matchingUsers: SeedUser[];

  switch (category) {
    case 'cycling':
      matchingUsers = seedUsers.filter(
        (u) => u.personality === 'cyclist' || u.personality === 'all-rounder'
      );
      break;
    case 'hiking':
      matchingUsers = seedUsers.filter(
        (u) => u.personality === 'hiker' || u.personality === 'all-rounder'
      );
      break;
    case 'running':
    case 'ultra':
      matchingUsers = seedUsers.filter(
        (u) => u.personality === 'runner' || u.personality === 'all-rounder'
      );
      break;
    case 'city':
      matchingUsers = seedUsers.filter((u) => u.personality === 'all-rounder');
      break;
    default:
      matchingUsers = seedUsers;
  }

  // If no matching users, use all users
  if (matchingUsers.length === 0) {
    matchingUsers = seedUsers;
  }

  return matchingUsers[Math.floor(Math.random() * matchingUsers.length)];
}

/**
 * Get available templates for a category
 */
function getTemplatesForCategory(
  category: 'cycling' | 'hiking' | 'running' | 'ultra' | 'city'
): PosterTemplate[] {
  switch (category) {
    case 'cycling':
      return Object.values(cyclingTemplates);
    case 'hiking':
      return Object.values(hikingTemplates);
    case 'running':
    case 'city':
      return Object.values(runningTemplates);
    case 'ultra':
      return Object.values(runningTemplates).filter(
        (t) => t.id.includes('ultra') || t.id.includes('terrain')
      );
    default:
      return Object.values(cyclingTemplates);
  }
}

/**
 * Get a random template for a category
 */
export function getRandomTemplate(
  category: 'cycling' | 'hiking' | 'running' | 'ultra' | 'city',
  preferredTemplateId?: string
): PosterTemplate {
  const templates = getTemplatesForCategory(category);

  // 60% chance to use preferred template if provided
  if (preferredTemplateId && Math.random() < 0.6) {
    const preferred = templates.find((t) => t.id === preferredTemplateId);
    if (preferred) return preferred;
  }

  // Random selection
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Randomize template properties slightly for variation
 */
export function addTemplateVariation(template: PosterTemplate): PosterTemplate {
  // Create a copy to avoid mutating original
  const varied = JSON.parse(JSON.stringify(template)) as PosterTemplate;

  // Randomly adjust some properties within small ranges

  // Route width variation (±1)
  varied.route.width = Math.max(
    2,
    Math.min(6, varied.route.width + randomInt(-1, 1))
  );

  // Route opacity variation (±0.1)
  varied.route.opacity = Math.max(
    0.7,
    Math.min(1, varied.route.opacity + randomFloat(-0.1, 0.1))
  );

  // Title size variation (±0.5 on scale 0-15)
  varied.typography.titleSize = Math.max(
    8,
    Math.min(15, varied.typography.titleSize + randomFloat(-0.5, 0.5))
  );

  // Subtitle size variation (±0.25 on scale 0-8)
  if (varied.typography.subtitleSize) {
    varied.typography.subtitleSize = Math.max(
      2,
      Math.min(8, varied.typography.subtitleSize + randomFloat(-0.25, 0.25))
    );
  }

  // Margin variation (±2)
  varied.format.margin = Math.max(
    0,
    Math.min(10, varied.format.margin + randomInt(-2, 2))
  );

  // Backdrop alpha variation (±0.1)
  if (varied.typography.backdropAlpha) {
    varied.typography.backdropAlpha = Math.max(
      0.5,
      Math.min(1, varied.typography.backdropAlpha + randomFloat(-0.1, 0.1))
    );
  }

  // 3D terrain exaggeration variation (±0.3)
  if (varied.layers.terrain3dExaggeration) {
    varied.layers.terrain3dExaggeration = Math.max(
      1.0,
      Math.min(
        2.5,
        varied.layers.terrain3dExaggeration + randomFloat(-0.3, 0.3)
      )
    );
  }

  return varied;
}

/**
 * Randomize route color within a color family
 */
export function getRandomRouteColor(baseColor: string): string {
  // 70% chance to keep original color
  if (Math.random() < 0.7) return baseColor;

  // Color families for routes
  const colorFamilies = {
    red: ['#FF4444', '#E74C3C', '#DC2626', '#EF4444', '#FF6B6B'],
    orange: ['#FF6B35', '#F97316', '#EA580C', '#FB923C', '#FDBA74'],
    blue: ['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA', '#00BFFF'],
    green: ['#22C55E', '#16A34A', '#15803D', '#4ADE80', '#2E7D32'],
    purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#A855F7', '#C084FC'],
    yellow: ['#FFD700', '#FACC15', '#EAB308', '#FDE047', '#FCD34D'],
    pink: ['#E91E8C', '#EC4899', '#DB2777', '#F472B6', '#FDA4AF'],
  };

  // Find which family the base color belongs to
  for (const [, colors] of Object.entries(colorFamilies)) {
    if (colors.includes(baseColor.toUpperCase())) {
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }

  // Default: return from orange family (common for routes)
  const orange = colorFamilies.orange;
  return orange[Math.floor(Math.random() * orange.length)];
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Randomize the order of entries for natural-looking feed
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate random past dates for created_at to spread content over time
 */
export function getRandomPastDate(
  daysBack: number = 30,
  hoursVariation: number = 8
): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const randomHours = Math.floor(Math.random() * hoursVariation);
  const randomMinutes = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(date.getHours() - randomHours);
  date.setMinutes(date.getMinutes() - randomMinutes);

  return date;
}
