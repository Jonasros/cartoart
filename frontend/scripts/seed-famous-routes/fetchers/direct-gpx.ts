/**
 * Direct GPX fetcher for URLs that provide direct download links
 * Used for: cyclingstage.com CDN, hardrock100.com, etc.
 */

import { fetcherConfig, log } from '../config';
import type { FetchResult } from '../types';

/**
 * Fetch GPX content from a direct URL
 */
export async function fetchDirectGPX(url: string): Promise<FetchResult> {
  try {
    log('info', `Fetching GPX from: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fetcherConfig.timeout);

    const response = await fetch(url, {
      headers: {
        'User-Agent': fetcherConfig.userAgent,
        Accept: 'application/gpx+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        source: url,
      };
    }

    const gpxContent = await response.text();

    // Basic validation that it looks like GPX
    if (!gpxContent.includes('<gpx') && !gpxContent.includes('<GPX')) {
      return {
        success: false,
        error: 'Response does not appear to be GPX format',
        source: url,
      };
    }

    log('success', `Successfully fetched GPX (${(gpxContent.length / 1024).toFixed(1)}KB)`);

    return {
      success: true,
      gpxContent,
      source: url,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', `Failed to fetch GPX: ${message}`);
    return {
      success: false,
      error: message,
      source: url,
    };
  }
}

/**
 * Fetch GPX with retry logic
 */
export async function fetchDirectGPXWithRetry(
  url: string,
  fallbackUrl?: string
): Promise<FetchResult> {
  let lastError = '';

  // Try primary URL with retries
  for (let attempt = 1; attempt <= fetcherConfig.maxRetries; attempt++) {
    const result = await fetchDirectGPX(url);
    if (result.success) {
      return result;
    }
    lastError = result.error || 'Unknown error';
    log('warning', `Attempt ${attempt}/${fetcherConfig.maxRetries} failed: ${lastError}`);

    if (attempt < fetcherConfig.maxRetries) {
      await delay(fetcherConfig.requestDelay * attempt);
    }
  }

  // Try fallback URL if provided
  if (fallbackUrl) {
    log('info', 'Trying fallback URL...');
    const fallbackResult = await fetchDirectGPX(fallbackUrl);
    if (fallbackResult.success) {
      return fallbackResult;
    }
    lastError = fallbackResult.error || lastError;
  }

  return {
    success: false,
    error: `All attempts failed. Last error: ${lastError}`,
    source: url,
  };
}

/**
 * Build Tour de France GPX URL
 */
export function buildTdFGpxUrl(year: number, stage: number): string {
  return `https://cdn.cyclingstage.com/images/tour-de-france/${year}/stage-${stage}-route.gpx`;
}

/**
 * Build Giro d'Italia GPX URL
 */
export function buildGiroGpxUrl(year: number, stage: number): string {
  return `https://cdn.cyclingstage.com/images/giro-${year}/stage-${stage}-route.gpx`;
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
