/**
 * Database insertion utility for seeded routes
 * Supports randomization for organic-looking content
 */

import { supabaseAdmin, getAdminUserId, log } from '../config';
import type { PosterConfig } from '../../../types/poster';
import type { RouteEntry, SeedResult } from '../types';
import {
  getRandomUser,
  getRandomPastDate,
  type SeedUser,
} from './randomization';

// Cache for resolved user IDs
const userIdCache: Map<string, string> = new Map();

/**
 * Get or create a seed user ID
 * Falls back to admin user if seed users aren't set up
 */
export async function getSeedUserId(seedUser: SeedUser): Promise<string> {
  // Check cache first
  if (userIdCache.has(seedUser.id)) {
    return userIdCache.get(seedUser.id)!;
  }

  // If it's a placeholder, fall back to admin
  if (seedUser.id.startsWith('SEED_USER_')) {
    const adminId = getAdminUserId();
    userIdCache.set(seedUser.id, adminId);
    return adminId;
  }

  userIdCache.set(seedUser.id, seedUser.id);
  return seedUser.id;
}

/**
 * Check if a route already exists in the database
 */
export async function routeExists(routeId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('maps')
    .select('id')
    .eq('title', routeId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    log('error', `Error checking route existence: ${error.message}`);
    throw error;
  }

  return !!data;
}

export interface InsertOptions {
  dryRun?: boolean;
  useRandomUser?: boolean;
  useRandomDate?: boolean;
  daysBackRange?: number;
}

/**
 * Insert a seeded route into the database
 */
export async function insertRoute(
  entry: RouteEntry,
  config: PosterConfig,
  mapTitle: string,
  options: InsertOptions = {}
): Promise<SeedResult> {
  const {
    dryRun = false,
    useRandomUser = true,
    useRandomDate = true,
    daysBackRange = 60,
  } = options;

  if (dryRun) {
    log('info', `[DRY RUN] Would insert: ${entry.id}`);
    return {
      routeId: entry.id,
      success: true,
      mapId: 'dry-run-id',
    };
  }

  try {
    // Get user ID - either random or admin
    let userId: string;
    if (useRandomUser) {
      const randomUser = getRandomUser(entry.category);
      userId = await getSeedUserId(randomUser);
    } else {
      userId = getAdminUserId();
    }

    // Check if already exists
    const exists = await routeExists(entry.id);
    if (exists) {
      log('warning', `Route already exists: ${entry.id}`);
      return {
        routeId: entry.id,
        success: false,
        error: 'Route already exists',
      };
    }

    // Generate dates
    const createdAt = useRandomDate
      ? getRandomPastDate(daysBackRange)
      : new Date();
    const updatedAt = new Date(createdAt);
    // Add 0-2 hours to updated_at to simulate some edits
    updatedAt.setHours(
      updatedAt.getHours() + Math.floor(Math.random() * 3)
    );

    // Prepare the map record
    const mapRecord = {
      user_id: userId,
      title: entry.id, // Use route ID as title for uniqueness
      config: config,
      is_published: true,
      is_featured: true, // Mark as featured for SEO pages
      published_at: updatedAt.toISOString(), // Required for feed visibility
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
    };

    // Insert into maps table
    const { data, error } = await supabaseAdmin
      .from('maps')
      .insert(mapRecord)
      .select('id')
      .single();

    if (error) {
      log('error', `Failed to insert route: ${error.message}`);
      return {
        routeId: entry.id,
        success: false,
        error: error.message,
      };
    }

    log('success', `Inserted route: ${entry.id} (map ID: ${data.id})`);

    return {
      routeId: entry.id,
      success: true,
      mapId: data.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', `Error inserting route ${entry.id}: ${message}`);
    return {
      routeId: entry.id,
      success: false,
      error: message,
    };
  }
}

/**
 * Batch insert multiple routes
 */
export async function insertRoutes(
  entries: Array<{
    entry: RouteEntry;
    config: PosterConfig;
    mapTitle: string;
  }>,
  options: InsertOptions & { skipExisting?: boolean } = {}
): Promise<SeedResult[]> {
  const { skipExisting = true, ...insertOptions } = options;
  const results: SeedResult[] = [];

  for (const { entry, config, mapTitle } of entries) {
    // Add delay between inserts to avoid rate limiting
    if (results.length > 0) {
      await delay(100);
    }

    if (skipExisting) {
      const exists = await routeExists(entry.id);
      if (exists) {
        log('info', `Skipping existing route: ${entry.id}`);
        results.push({
          routeId: entry.id,
          success: false,
          error: 'Skipped - already exists',
        });
        continue;
      }
    }

    const result = await insertRoute(entry, config, mapTitle, insertOptions);
    results.push(result);
  }

  return results;
}

/**
 * Get seed statistics
 */
export async function getSeedStats(): Promise<{
  totalMaps: number;
  featuredMaps: number;
  publishedMaps: number;
}> {
  const { count: totalMaps } = await supabaseAdmin
    .from('maps')
    .select('*', { count: 'exact', head: true });

  const { count: featuredMaps } = await supabaseAdmin
    .from('maps')
    .select('*', { count: 'exact', head: true })
    .eq('is_featured', true);

  const { count: publishedMaps } = await supabaseAdmin
    .from('maps')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  return {
    totalMaps: totalMaps || 0,
    featuredMaps: featuredMaps || 0,
    publishedMaps: publishedMaps || 0,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
