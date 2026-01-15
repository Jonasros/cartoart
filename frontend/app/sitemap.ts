import { MetadataRoute } from 'next';
import { getRouteSlugs } from '@/lib/seo/routes';

const BASE_URL = 'https://waymarker.eu';

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/feed`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Race landing pages (marathons)
  const raceSlugs = getRouteSlugs('race');
  const racePages: MetadataRoute.Sitemap = raceSlugs.map((slug) => ({
    url: `${BASE_URL}/race/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Trail landing pages (hiking trails)
  const trailSlugs = getRouteSlugs('trail');
  const trailPages: MetadataRoute.Sitemap = trailSlugs.map((slug) => ({
    url: `${BASE_URL}/trail/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Cycling landing pages (Tour de France stages, etc.)
  const cyclingSlugs = getRouteSlugs('cycling');
  const cyclingPages: MetadataRoute.Sitemap = cyclingSlugs.map((slug) => ({
    url: `${BASE_URL}/cycling/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...racePages, ...trailPages, ...cyclingPages];
}
