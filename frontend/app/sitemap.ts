import { MetadataRoute } from 'next';
import { getRouteSlugs } from '@/lib/seo/routes';

const BASE_URL = 'https://waymarker.eu';

/**
 * Format date as YYYY-MM-DD for sitemap compatibility.
 * Google's sitemap parser doesn't handle milliseconds well,
 * so we use the simple date format instead of full ISO 8601.
 */
function formatSitemapDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Use a fixed date for static content (updated when content actually changes)
  const staticContentDate = formatSitemapDate(new Date('2025-01-20'));
  const routeContentDate = formatSitemapDate(new Date('2025-01-15'));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: staticContentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/create`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/feed`,
      lastModified: staticContentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: staticContentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: staticContentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: staticContentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: staticContentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Race landing pages (marathons)
  const raceSlugs = getRouteSlugs('race');
  const racePages: MetadataRoute.Sitemap = raceSlugs.map((slug) => ({
    url: `${BASE_URL}/race/${slug}`,
    lastModified: routeContentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Trail landing pages (hiking trails)
  const trailSlugs = getRouteSlugs('trail');
  const trailPages: MetadataRoute.Sitemap = trailSlugs.map((slug) => ({
    url: `${BASE_URL}/trail/${slug}`,
    lastModified: routeContentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Cycling landing pages (Tour de France stages, etc.)
  const cyclingSlugs = getRouteSlugs('cycling');
  const cyclingPages: MetadataRoute.Sitemap = cyclingSlugs.map((slug) => ({
    url: `${BASE_URL}/cycling/${slug}`,
    lastModified: routeContentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...racePages, ...trailPages, ...cyclingPages];
}
