'use server';

import { createClient } from '@/lib/supabase/server';
import { serializeMapConfig, deserializeMapConfig } from '@/lib/supabase/maps';
import type { PosterConfig } from '@/types/poster';
import type { SculptureConfig, ProductMode } from '@/types/sculpture';
import type { Database } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { createError } from '@/lib/errors/ServerActionError';
import { logger } from '@/lib/logger';
import { validatePosterConfig, PosterConfigSchema } from '@/lib/validation/posterConfig';
import { checkRateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMITS } from '@/lib/constants/limits';
import { z } from 'zod';
import { sanitizeText } from '@/lib/utils/sanitize';

export interface SavedMap {
  id: string;
  title: string;
  subtitle: string | null;
  config: PosterConfig;
  is_published: boolean;
  thumbnail_url: string | null;
  vote_score: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Sculpture-related fields (Phase 4.6)
  product_type: ProductMode;
  sculpture_config: SculptureConfig | null;
  sculpture_thumbnail_url: string | null;
}

// Alias for backward compatibility
// JSONB representation of PosterConfig - inferred from Zod schema
export type MapConfig = z.infer<typeof PosterConfigSchema>;

/**
 * Save a new map to the database
 * @param config - The poster/map configuration
 * @param title - The title of the map
 * @param options - Optional parameters for sculpture mode
 */
export async function saveMap(
  config: PosterConfig,
  title: string,
  options?: {
    productType?: ProductMode;
    sculptureConfig?: SculptureConfig;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to save maps');
  }

  // Ensure location name is set (required for validation)
  if (!config.location.name || config.location.name.trim().length === 0) {
    // Generate a default name from coordinates if name is missing
    const [lng, lat] = config.location.center;
    config = {
      ...config,
      location: {
        ...config.location,
        name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      },
    };
  }

  // Validate config before saving
  try {
    validatePosterConfig(config);
  } catch (error: any) {
    logger.error('Invalid poster config:', error);
    throw createError.validationError(`Invalid map configuration: ${error.message}`);
  }

  // Sanitize and validate title
  title = sanitizeText(title);
  if (!title || title.length === 0) {
    throw createError.validationError('Map title is required');
  }

  const serializedConfig = serializeMapConfig(config);

  // Build insert data - only include sculpture fields if they have values
  // This maintains backward compatibility with databases that don't have the migration yet
  const insertData: Record<string, any> = {
    user_id: user.id,
    title,
    config: serializedConfig,
    is_published: false,
  };

  // Only add sculpture fields if the product type is sculpture or if sculpture config exists
  // This prevents errors on databases that don't have these columns yet
  if (options?.productType === 'sculpture') {
    insertData.product_type = options.productType;
  }
  if (options?.sculptureConfig) {
    insertData.sculpture_config = JSON.parse(JSON.stringify(options.sculptureConfig));
  }

  const { data, error } = await (supabase as any)
    .from('maps')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save map: ${error.message}`);
  }

  revalidatePath('/profile');
  return {
    ...data,
    config: deserializeMapConfig(data.config),
    sculpture_config: data.sculpture_config as SculptureConfig | null,
  } as SavedMap;
}

/**
 * Save a new map with a thumbnail
 * @param config - The poster/map configuration
 * @param title - The title of the map
 * @param thumbnailUrl - URL of the thumbnail image
 * @param options - Optional parameters for sculpture mode
 */
export async function saveMapWithThumbnail(
  config: PosterConfig,
  title: string,
  thumbnailUrl: string,
  options?: {
    productType?: ProductMode;
    sculptureConfig?: SculptureConfig;
    sculptureThumbnailUrl?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to save maps');
  }

  // Ensure location name is set (required for validation)
  if (!config.location.name || config.location.name.trim().length === 0) {
    // Generate a default name from coordinates if name is missing
    const [lng, lat] = config.location.center;
    config = {
      ...config,
      location: {
        ...config.location,
        name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      },
    };
  }

  // Validate config before saving
  try {
    validatePosterConfig(config);
  } catch (error: any) {
    logger.error('Invalid poster config:', error);
    throw createError.validationError(`Invalid map configuration: ${error.message}`);
  }

  // Sanitize and validate title
  title = sanitizeText(title);
  if (!title || title.length === 0) {
    throw createError.validationError('Map title is required');
  }

  if (!thumbnailUrl || thumbnailUrl.trim().length === 0) {
    throw createError.validationError('Thumbnail URL is required');
  }

  const serializedConfig = serializeMapConfig(config);
  const productType = options?.productType ?? 'poster';

  const insertData: Database['public']['Tables']['maps']['Insert'] = {
    user_id: user.id,
    title,
    config: serializedConfig,
    is_published: false,
    thumbnail_url: thumbnailUrl,
    product_type: productType,
    sculpture_config: options?.sculptureConfig ? JSON.parse(JSON.stringify(options.sculptureConfig)) : null,
    sculpture_thumbnail_url: options?.sculptureThumbnailUrl ?? null,
  };

  const { data, error } = await (supabase as any)
    .from('maps')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    logger.error('Failed to save map with thumbnail:', { error, userId: user.id });
    throw createError.databaseError(`Failed to save map: ${error.message}`);
  }

  revalidatePath('/profile');
  return {
    ...data,
    config: deserializeMapConfig(data.config),
    sculpture_config: data.sculpture_config as SculptureConfig | null,
  } as SavedMap;
}

/**
 * Update an existing map
 * @param id - The map ID
 * @param config - The poster/map configuration
 * @param title - Optional new title
 * @param options - Optional parameters for sculpture mode
 */
export async function updateMap(
  id: string,
  config: PosterConfig,
  title?: string,
  options?: {
    productType?: ProductMode;
    sculptureConfig?: SculptureConfig;
    sculptureThumbnailUrl?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to update maps');
  }

  // Ensure location name is set (required for validation)
  if (!config.location.name || config.location.name.trim().length === 0) {
    // Generate a default name from coordinates if name is missing
    const [lng, lat] = config.location.center;
    config = {
      ...config,
      location: {
        ...config.location,
        name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      },
    };
  }

  // Validate config before updating
  try {
    validatePosterConfig(config);
  } catch (error: any) {
    logger.error('Invalid poster config:', error);
    throw createError.validationError(`Invalid map configuration: ${error.message}`);
  }

  // Sanitize title if provided
  if (title !== undefined) {
    title = sanitizeText(title);
    if (!title || title.length === 0) {
      throw createError.validationError('Map title cannot be empty');
    }
  }

  const serializedConfig = serializeMapConfig(config);
  const updateData: Database['public']['Tables']['maps']['Update'] = {
    config: serializedConfig,
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    updateData.title = title;
  }

  // Handle sculpture-related updates
  if (options?.productType !== undefined) {
    updateData.product_type = options.productType;
  }
  if (options?.sculptureConfig !== undefined) {
    updateData.sculpture_config = options.sculptureConfig ? JSON.parse(JSON.stringify(options.sculptureConfig)) : null;
  }
  if (options?.sculptureThumbnailUrl !== undefined) {
    updateData.sculpture_thumbnail_url = options.sculptureThumbnailUrl;
  }

  const { data, error } = await (supabase as any)
    .from('maps')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the map
    .select()
    .single();

  if (error) {
    logger.error('Failed to update map:', { error, mapId: id, userId: user.id });
    throw createError.databaseError(`Failed to update map: ${error.message}`);
  }

  if (!data) {
    throw createError.notFound('Map');
  }

  logger.info('Map updated successfully', { mapId: id, userId: user.id });
  revalidatePath('/profile');
  revalidatePath(`/map/${id}`);
  return {
    ...data,
    config: deserializeMapConfig(data.config),
    sculpture_config: data.sculpture_config as SculptureConfig | null,
  } as SavedMap;
}

/**
 * Update map's thumbnail URL
 */
export async function updateMapThumbnail(
  id: string,
  thumbnailUrl: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to update maps');
  }

  if (!thumbnailUrl || thumbnailUrl.trim().length === 0) {
    throw createError.validationError('Thumbnail URL is required');
  }

  const updateData: Database['public']['Tables']['maps']['Update'] = {
    thumbnail_url: thumbnailUrl,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('maps')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the map
    .select()
    .single();

  if (error) {
    logger.error('Failed to update thumbnail:', { error, mapId: id, userId: user.id });
    throw createError.databaseError(`Failed to update thumbnail: ${error.message}`);
  }

  if (!data) {
    throw createError.notFound('Map');
  }

  logger.info('Thumbnail updated successfully', { mapId: id, userId: user.id });
  revalidatePath('/profile');
  revalidatePath(`/map/${id}`);
  return data as SavedMap;
}

/**
 * Update map's sculpture thumbnail URL
 */
export async function updateMapSculptureThumbnail(
  id: string,
  sculptureThumbnailUrl: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to update maps');
  }

  if (!sculptureThumbnailUrl || sculptureThumbnailUrl.trim().length === 0) {
    throw createError.validationError('Sculpture thumbnail URL is required');
  }

  const updateData: Database['public']['Tables']['maps']['Update'] = {
    sculpture_thumbnail_url: sculptureThumbnailUrl,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('maps')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    logger.error('Failed to update sculpture thumbnail:', { error, mapId: id, userId: user.id });
    throw createError.databaseError(`Failed to update sculpture thumbnail: ${error.message}`);
  }

  if (!data) {
    throw createError.notFound('Map');
  }

  logger.info('Sculpture thumbnail updated successfully', { mapId: id, userId: user.id });
  revalidatePath('/profile');
  revalidatePath(`/map/${id}`);
  revalidatePath('/feed');
  return data as SavedMap;
}

/**
 * Delete a map
 */
export async function deleteMap(id: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to delete maps');
  }

  const { error } = await supabase
    .from('maps')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user owns the map

  if (error) {
    logger.error('Failed to delete map:', { error, mapId: id, userId: user.id });
    throw createError.databaseError(`Failed to delete map: ${error.message}`);
  }

  logger.info('Map deleted successfully', { mapId: id, userId: user.id });
  revalidatePath('/profile');
}

/**
 * Publish a map (make it visible to everyone)
 * @param id - Map ID
 * @param subtitle - Optional subtitle
 * @param thumbnailUrl - Optional thumbnail URL (if provided, will be set in same operation)
 */
export async function publishMap(
  id: string,
  subtitle?: string,
  thumbnailUrl?: string
) {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to publish maps');
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(
    user.id,
    'publish',
    RATE_LIMITS.PUBLISH_PER_HOUR,
    60 * 60 * 1000 // 1 hour window
  );
  if (!rateLimit.allowed) {
    throw createError.rateLimitExceeded(
      `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`
    );
  }

  const updateData: Database['public']['Tables']['maps']['Update'] = {
    is_published: true,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (subtitle !== undefined) {
    updateData.subtitle = sanitizeText(subtitle);
  }

  // Include thumbnail URL in the same update operation to avoid race condition
  if (thumbnailUrl !== undefined) {
    updateData.thumbnail_url = thumbnailUrl;
  }

  const { data, error } = await (supabase as any)
    .from('maps')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the map
    .select()
    .single();

  if (error) {
    logger.error('Failed to publish map:', { error, mapId: id, userId: user.id });
    throw createError.databaseError(`Failed to publish map: ${error.message}`);
  }

  if (!data) {
    throw createError.notFound('Map');
  }

  logger.info('Map published successfully', { mapId: id, userId: user.id, hasThumbnail: !!thumbnailUrl });
  revalidatePath('/profile');
  revalidatePath('/feed');
  revalidatePath(`/map/${id}`);
  return {
    ...data,
    config: deserializeMapConfig(data.config),
    sculpture_config: data.sculpture_config as SculptureConfig | null,
  } as SavedMap;
}

/**
 * Unpublish a map
 */
export async function unpublishMap(id: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to unpublish maps');
  }

  const updateData: Database['public']['Tables']['maps']['Update'] = {
    is_published: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase as any)
    .from('maps')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the map
    .select()
    .single();

  if (error) {
    logger.error('Failed to unpublish map:', { error, mapId: id, userId: user.id });
    throw createError.databaseError(`Failed to unpublish map: ${error.message}`);
  }

  if (!data) {
    throw createError.notFound('Map');
  }

  logger.info('Map unpublished successfully', { mapId: id, userId: user.id });
  revalidatePath('/profile');
  revalidatePath('/feed');
  revalidatePath(`/map/${id}`);
  return {
    ...data,
    config: deserializeMapConfig(data.config),
    sculpture_config: data.sculpture_config as SculptureConfig | null,
  } as SavedMap;
}

/**
 * Get all maps for the current user
 */
export async function getUserMaps(): Promise<SavedMap[]> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data, error } = await (supabase as any)
    .from('maps')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch user maps:', { error, userId: user.id });
    throw createError.databaseError(`Failed to fetch maps: ${error.message}`);
  }

  return ((data || []) as any[]).map((map: any) => ({
    ...map,
    config: deserializeMapConfig(map.config),
    sculpture_config: map.sculpture_config as SculptureConfig | null,
  })) as SavedMap[];
}

/**
 * Duplicate a map to the current user's library
 * This allows users to copy someone else's published map and make it their own
 */
export async function duplicateMap(sourceMapId: string): Promise<SavedMap> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createError.authRequired('You must be signed in to duplicate maps');
  }

  // Fetch the source map
  const { data: sourceMap, error: fetchError } = await (supabase as any)
    .from('maps')
    .select('*')
    .eq('id', sourceMapId)
    .single();

  if (fetchError || !sourceMap) {
    throw createError.notFound('Map');
  }

  // Check if the source map is published (anyone can duplicate published maps)
  // Or if the user owns it (can duplicate their own maps)
  if (!sourceMap.is_published && sourceMap.user_id !== user.id) {
    throw createError.permissionDenied('You can only duplicate published maps');
  }

  // Create a new map with the same config but owned by the current user
  const insertData: Database['public']['Tables']['maps']['Insert'] = {
    user_id: user.id,
    title: `${sourceMap.title} (Copy)`,
    subtitle: sourceMap.subtitle,
    config: sourceMap.config, // Already serialized
    is_published: false, // Duplicates start as unpublished
    thumbnail_url: sourceMap.thumbnail_url,
    // Copy sculpture fields if present
    product_type: sourceMap.product_type ?? 'poster',
    sculpture_config: sourceMap.sculpture_config,
    sculpture_thumbnail_url: sourceMap.sculpture_thumbnail_url,
  };

  const { data, error } = await (supabase as any)
    .from('maps')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    logger.error('Failed to duplicate map:', { error, sourceMapId, userId: user.id });
    throw createError.databaseError(`Failed to duplicate map: ${error.message}`);
  }

  logger.info('Map duplicated successfully', {
    sourceMapId,
    newMapId: data.id,
    userId: user.id
  });

  revalidatePath('/profile');
  return {
    ...data,
    config: deserializeMapConfig(data.config),
    sculpture_config: data.sculpture_config as SculptureConfig | null,
  } as SavedMap;
}

/**
 * Get a single map by ID (checks permissions)
 */
export async function getMapById(id: string): Promise<SavedMap | null> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await (supabase as any)
    .from('maps')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    logger.error('Failed to fetch map:', { error, mapId: id });
    throw createError.databaseError(`Failed to fetch map: ${error.message}`);
  }

  const mapData = data as any;

  // Check if user has access (owner or published)
  if (mapData.user_id !== user?.id && !mapData.is_published) {
    return null; // Not accessible
  }

  return {
    ...mapData,
    config: deserializeMapConfig(mapData.config),
    sculpture_config: mapData.sculpture_config as SculptureConfig | null,
  } as SavedMap;
}

