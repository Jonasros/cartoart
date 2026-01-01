import { NextRequest, NextResponse } from 'next/server';
import { SPACEPORTS_CACHE } from '@/lib/constants';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// Use require for lru-cache to work around Next.js/Turbopack ESM module resolution issues
import type { LRUCache } from 'lru-cache';
const LRUCacheConstructor = require('lru-cache').LRUCache as new <K, V>(options?: any) => LRUCache<K, V>;

// Use LRU cache for spaceports data (7-day TTL since spaceports change infrequently)
const cache = new LRUCacheConstructor<string, unknown>({
  max: 10, // Only need to cache one response
  ttl: SPACEPORTS_CACHE.TTL_MS,
});

const CACHE_KEY = 'spaceports-geojson';
const LAUNCH_LIBRARY_API_BASE = 'https://lldev.thespacedevs.com/2.3.0/pads/';
const MAX_RESULTS_PER_PAGE = 100;

interface LaunchLibraryPad {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  active: boolean;
  location: {
    name: string;
  };
  country: {
    name: string;
    alpha_2_code: string;
  };
  total_launch_count: number;
  orbital_launch_attempt_count: number;
}

interface LaunchLibraryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LaunchLibraryPad[];
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    id: number;
    name: string;
    location: string;
    country: string;
    countryCode: string;
    active: boolean;
    totalLaunchCount: number;
    orbitalLaunchCount: number;
  };
}

interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Fetches all pads from Launch Library 2 API with pagination support
 */
async function fetchAllPads(): Promise<LaunchLibraryPad[]> {
  const allPads: LaunchLibraryPad[] = [];
  let nextUrl: string | null = `${LAUNCH_LIBRARY_API_BASE}?limit=${MAX_RESULTS_PER_PAGE}&format=json`;

  while (nextUrl) {
    try {
      const response = await fetch(nextUrl, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Launch Library API returned ${response.status}: ${response.statusText}`);
      }

      const data: LaunchLibraryResponse = await response.json();
      
      // Filter out pads with invalid coordinates
      const validPads = data.results.filter(
        (pad) => 
          pad.latitude != null && 
          pad.longitude != null &&
          !isNaN(pad.latitude) &&
          !isNaN(pad.longitude) &&
          pad.latitude >= -90 && pad.latitude <= 90 &&
          pad.longitude >= -180 && pad.longitude <= 180
      );

      allPads.push(...validPads);
      
      nextUrl = data.next;
      
      // Small delay between paginated requests to be respectful
      if (data.next) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      logger.error('Error fetching pads from Launch Library API:', error);
      throw error;
    }
  }

  return allPads;
}

/**
 * Converts Launch Library API pad data to GeoJSON format
 */
function convertToGeoJSON(pads: LaunchLibraryPad[]): GeoJSONResponse {
  const features: GeoJSONFeature[] = pads.map((pad) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [pad.longitude, pad.latitude], // GeoJSON uses [lon, lat]
    },
    properties: {
      id: pad.id,
      name: pad.name,
      location: pad.location?.name || '',
      country: pad.country?.name || '',
      countryCode: pad.country?.alpha_2_code || '',
      active: pad.active ?? true,
      totalLaunchCount: pad.total_launch_count || 0,
      orbitalLaunchCount: pad.orbital_launch_attempt_count || 0,
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      logger.debug('Returning cached spaceports GeoJSON');
      return NextResponse.json(cached, {
        headers: {
          'Content-Type': 'application/geo+json',
          'Cache-Control': 'public, max-age=604800', // 7 days in seconds
        },
      });
    }

    // Fetch all pads from API
    logger.info('Fetching spaceports data from Launch Library API...');
    const pads = await fetchAllPads();
    
    if (pads.length === 0) {
      logger.warn('No valid pads found in Launch Library API response');
      // Return empty GeoJSON instead of error
      const emptyGeoJSON: GeoJSONResponse = {
        type: 'FeatureCollection',
        features: [],
      };
      return NextResponse.json(emptyGeoJSON, {
        headers: {
          'Content-Type': 'application/geo+json',
          'Cache-Control': 'public, max-age=300', // Short cache for errors
        },
      });
    }

    // Convert to GeoJSON
    const geoJSON = convertToGeoJSON(pads);
    
    // Cache the result
    cache.set(CACHE_KEY, geoJSON);
    logger.info(`Successfully fetched and cached ${pads.length} spaceport pads`);

    return NextResponse.json(geoJSON, {
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': 'public, max-age=604800', // 7 days in seconds
      },
    });
  } catch (error) {
    logger.error('Unhandled spaceports API error:', error);
    
    // Try to return cached data even if expired, as fallback
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      logger.warn('API error, returning stale cached data');
      return NextResponse.json(cached, {
        headers: {
          'Content-Type': 'application/geo+json',
          'Cache-Control': 'public, max-age=300', // Short cache for stale data
        },
      });
    }
    
    // If no cache, return empty GeoJSON
    const emptyGeoJSON: GeoJSONResponse = {
      type: 'FeatureCollection',
      features: [],
    };
    
    return NextResponse.json(emptyGeoJSON, {
      status: 500,
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': 'no-store',
      },
    });
  }
}

