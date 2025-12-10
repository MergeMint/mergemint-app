import { MetadataRoute } from 'next';

import appConfig from '~/config/app.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = appConfig.url;

  // Static marketing pages
  const marketingPages = [
    '',
    '/features',
    '/pricing',
    '/how-it-works',
    '/faq',
    '/contact',
    '/terms-of-service',
    '/privacy-policy',
  ];

  // Comparison pages (high SEO value)
  const comparisonPages = [
    '/compare',
    '/compare/linearb',
    '/compare/jellyfish',
    '/compare/gitclear',
  ];

  // Alternatives pages (high SEO value)
  const alternativesPages = [
    '/alternatives',
    '/alternatives/linearb',
    '/alternatives/jellyfish',
  ];

  // Auth pages (lower priority)
  const authPages = ['/auth/sign-in', '/auth/sign-up'];

  const allRoutes: MetadataRoute.Sitemap = [
    // Marketing pages - highest priority
    ...marketingPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.9,
    })),

    // Comparison pages - high priority for SEO
    ...comparisonPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // Alternatives pages - high priority for SEO
    ...alternativesPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // Auth pages - lower priority
    ...authPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];

  return allRoutes;
}
