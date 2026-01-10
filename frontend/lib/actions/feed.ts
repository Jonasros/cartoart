'use server';

import { createClient } from '@/lib/supabase/server';
import { createError } from '@/lib/errors/ServerActionError';
import { logger } from '@/lib/logger';
import { FEED_PAGE_SIZE, FEED_MAX_PAGE } from '@/lib/constants/limits';
import { checkRateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMITS } from '@/lib/constants/limits';

export type TimeRange = 'all' | 'today' | 'week' | 'month' | 'year';
export type ProductTypeFilter = 'all' | 'poster' | 'sculpture';
export type SortOption = 'fresh' | 'top' | 'discussed';

/**
 * Get date threshold for time range filter
 */
function getTimeRangeDate(range: TimeRange): Date | null {
  if (range === 'all') return null;

  const now = new Date();
  switch (range) {
    case 'today':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export interface FeedMap {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  vote_score: number;
  comment_count: number;
  published_at: string;
  created_at: string;
  author: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  // Sculpture-related fields (Phase 4.6)
  product_type: 'poster' | 'sculpture';
  sculpture_thumbnail_url: string | null;
  // Remix tracking fields (Phase 8)
  remixed_from_id: string | null;
  remix_count: number;
  // User interaction state (Phase 8)
  user_liked: boolean;
}

export interface TopExample {
  id: string;
  title: string;
  thumbnail_url: string | null;
  sculpture_thumbnail_url: string | null;
  vote_score: number;
  product_type: 'poster' | 'sculpture';
  author_username: string;
}

/**
 * Helper to get comment counts for a list of map IDs
 */
async function getCommentCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mapIds: string[]
): Promise<Map<string, number>> {
  if (mapIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('comments')
    .select('map_id')
    .in('map_id', mapIds);

  if (error) {
    logger.warn('Failed to fetch comment counts:', { error });
    return new Map();
  }

  // Count comments per map_id
  const counts = new Map<string, number>();
  for (const row of data || []) {
    const mapId = (row as any).map_id;
    counts.set(mapId, (counts.get(mapId) || 0) + 1);
  }
  return counts;
}

/**
 * Helper to get user's liked maps from a list of map IDs
 */
async function getUserLikes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mapIds: string[],
  userId: string | null
): Promise<Set<string>> {
  if (mapIds.length === 0 || !userId) return new Set();

  const { data, error } = await supabase
    .from('votes')
    .select('map_id')
    .in('map_id', mapIds)
    .eq('user_id', userId)
    .eq('value', 1);

  if (error) {
    logger.warn('Failed to fetch user likes:', { error });
    return new Set();
  }

  return new Set((data || []).map((row: any) => row.map_id));
}

/**
 * Get feed of published maps
 * Uses JOIN to fetch maps and profiles in a single query
 */
export async function getFeed(
  sort: SortOption = 'fresh',
  page: number = 0,
  limit: number = FEED_PAGE_SIZE,
  timeRange: TimeRange = 'all',
  productType: ProductTypeFilter = 'all'
): Promise<FeedMap[]> {
  const supabase = await createClient();
  
  // Validate and clamp pagination parameters
  page = Math.max(0, Math.min(page, FEED_MAX_PAGE));
  limit = Math.max(1, Math.min(limit, 100)); // Max 100 per page
  
  // Check rate limit (use anonymous user ID if not authenticated)
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'anonymous';
  const rateLimit = await checkRateLimit(
    userId,
    'feed',
    RATE_LIMITS.FEED_PER_MINUTE,
    60 * 1000 // 1 minute window
  );
  if (!rateLimit.allowed) {
    throw createError.rateLimitExceeded(
      `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`
    );
  }

  // Calculate time range date threshold
  const timeRangeDate = getTimeRangeDate(timeRange);

  // Try JOIN query first, fallback to two-query approach if foreign key is missing
  try {
    // Build query with JOIN to profiles
    let query = supabase
      .from('maps')
      .select(`
        id,
        title,
        subtitle,
        thumbnail_url,
        vote_score,
        published_at,
        created_at,
        product_type,
        sculpture_thumbnail_url,
        remixed_from_id,
        remix_count,
        profiles!left (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_published', true)
      .not('published_at', 'is', null);

    // Apply time range filter
    if (timeRangeDate) {
      query = query.gte('published_at', timeRangeDate.toISOString());
    }

    // Apply product type filter
    if (productType !== 'all') {
      query = query.eq('product_type', productType);
    }

    // Apply sorting (for 'discussed', we'll sort by comment_count after fetching)
    if (sort === 'fresh' || sort === 'discussed') {
      query = query.order('published_at', { ascending: false });
    } else if (sort === 'top') {
      query = query.order('vote_score', { ascending: false }).order('published_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(page * limit, (page + 1) * limit - 1);

    const { data: maps, error } = await query;

    if (error) {
      // Check if error is due to missing foreign key
      if (error.message?.includes('foreign key') || error.code === 'PGRST116' || error.message?.includes('relation')) {
        logger.warn('JOIN query failed, falling back to two-query approach', { error, sort, page, limit });
        return getFeedFallback(supabase, sort, page, limit, timeRange, productType, user?.id || null);
      }
      logger.error('Failed to fetch feed:', { error, sort, page, limit });
      throw createError.databaseError(`Failed to fetch feed: ${error.message}`);
    }

    if (!maps || maps.length === 0) {
      return [];
    }

    // Fetch comment counts and user likes for all maps
    const mapIds = maps.map((m: any) => m.id);
    const [commentCounts, userLikes] = await Promise.all([
      getCommentCounts(supabase, mapIds),
      getUserLikes(supabase, mapIds, user?.id || null),
    ]);

    // Transform the data to match FeedMap interface
    const results = maps.map((map: any) => {
      const profile = map.profiles;
      return {
        id: map.id,
        title: map.title,
        subtitle: map.subtitle,
        thumbnail_url: map.thumbnail_url,
        vote_score: map.vote_score,
        comment_count: commentCounts.get(map.id) || 0,
        published_at: map.published_at,
        created_at: map.created_at,
        author: profile ? {
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        } : {
          username: 'unknown',
          display_name: null,
          avatar_url: null,
        },
        product_type: map.product_type || 'poster',
        sculpture_thumbnail_url: map.sculpture_thumbnail_url,
        remixed_from_id: map.remixed_from_id || null,
        remix_count: map.remix_count || 0,
        user_liked: userLikes.has(map.id),
      };
    });

    // Sort by comment count for 'discussed' option
    if (sort === 'discussed') {
      results.sort((a, b) => b.comment_count - a.comment_count);
    }

    return results;
  } catch (error: any) {
    // If it's a foreign key error, try fallback
    if (error.message?.includes('foreign key') || error.code === 'PGRST116') {
      logger.warn('JOIN query failed, falling back to two-query approach', { error, sort, page, limit });
      return getFeedFallback(supabase, sort, page, limit, timeRange, productType, user?.id || null);
    }
    throw error;
  }
}

/**
 * Fallback feed query using two separate queries
 * Used when foreign key relationship is not available
 */
async function getFeedFallback(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sort: SortOption,
  page: number,
  limit: number,
  timeRange: TimeRange = 'all',
  productType: ProductTypeFilter = 'all',
  userId: string | null = null
): Promise<FeedMap[]> {
  // Calculate time range date threshold
  const timeRangeDate = getTimeRangeDate(timeRange);

  // First, fetch the maps
  let query = supabase
    .from('maps')
    .select('id, title, subtitle, thumbnail_url, vote_score, published_at, created_at, user_id, product_type, sculpture_thumbnail_url, remixed_from_id, remix_count')
    .eq('is_published', true)
    .not('published_at', 'is', null);

  // Apply time range filter
  if (timeRangeDate) {
    query = query.gte('published_at', timeRangeDate.toISOString());
  }

  // Apply product type filter
  if (productType !== 'all') {
    query = query.eq('product_type', productType);
  }

  // Apply sorting (for 'discussed', we'll sort by comment_count after fetching)
  if (sort === 'fresh' || sort === 'discussed') {
    query = query.order('published_at', { ascending: false });
  } else if (sort === 'top') {
    query = query.order('vote_score', { ascending: false }).order('published_at', { ascending: false });
  }

  query = query.range(page * limit, (page + 1) * limit - 1);

  const { data: maps, error: mapsError } = await query;

  if (mapsError) {
    logger.error('Failed to fetch maps in fallback:', { error: mapsError, sort, page, limit });
    throw createError.databaseError(`Failed to fetch feed: ${mapsError.message}`);
  }

  if (!maps || maps.length === 0) {
    return [];
  }

  // Extract unique user IDs
  const userIds = [...new Set((maps as any[]).map(map => map.user_id))];

  // Fetch profiles for all users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    logger.error('Failed to fetch profiles in fallback:', { error: profilesError });
    throw createError.databaseError(`Failed to fetch profiles: ${profilesError.message}`);
  }

  // Create a map of user_id -> profile for quick lookup
  const profileMap = new Map<string, any>(
    (profiles || []).map((profile: any) => [profile.id, profile])
  );

  // Fetch comment counts and user likes for all maps
  const mapIds = (maps as any[]).map(m => m.id);
  const [commentCounts, userLikes] = await Promise.all([
    getCommentCounts(supabase, mapIds),
    getUserLikes(supabase, mapIds, userId),
  ]);

  // Combine maps with profiles
  const results = (maps as any[]).map((map) => {
    const profile = profileMap.get(map.user_id);
    return {
      id: map.id,
      title: map.title,
      subtitle: map.subtitle,
      thumbnail_url: map.thumbnail_url,
      vote_score: map.vote_score,
      comment_count: commentCounts.get(map.id) || 0,
      published_at: map.published_at,
      created_at: map.created_at,
      author: profile ? {
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      } : {
        username: 'unknown',
        display_name: null,
        avatar_url: null,
      },
      product_type: map.product_type || 'poster',
      sculpture_thumbnail_url: map.sculpture_thumbnail_url,
      remixed_from_id: map.remixed_from_id || null,
      remix_count: map.remix_count || 0,
      user_liked: userLikes.has(map.id),
    };
  });

  // Sort by comment count for 'discussed' option
  if (sort === 'discussed') {
    results.sort((a, b) => b.comment_count - a.comment_count);
  }

  return results;
}

/**
 * Get top 10 voted examples for the inspiration gallery
 * Lightweight query optimized for quick loading
 */
export async function getTopExamples(
  productType: ProductTypeFilter = 'all',
  limit: number = 10
): Promise<TopExample[]> {
  const supabase = await createClient();

  let query = supabase
    .from('maps')
    .select(`
      id,
      title,
      thumbnail_url,
      sculpture_thumbnail_url,
      vote_score,
      product_type,
      profiles!left (
        username
      )
    `)
    .eq('is_published', true)
    .not('published_at', 'is', null)
    .gt('vote_score', 0) // Only show maps with at least 1 vote
    .order('vote_score', { ascending: false })
    .limit(limit);

  // Apply product type filter
  if (productType !== 'all') {
    query = query.eq('product_type', productType);
  }

  const { data: maps, error } = await query;

  if (error) {
    logger.warn('Failed to fetch top examples:', { error });
    return [];
  }

  if (!maps || maps.length === 0) {
    return [];
  }

  return maps.map((map: any) => ({
    id: map.id,
    title: map.title,
    thumbnail_url: map.thumbnail_url,
    sculpture_thumbnail_url: map.sculpture_thumbnail_url,
    vote_score: map.vote_score,
    product_type: map.product_type || 'poster',
    author_username: map.profiles?.username || 'unknown',
  }));
}

