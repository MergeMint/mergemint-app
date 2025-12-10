import { MetadataRoute } from 'next';

import appConfig from '~/config/app.config';
import { DEFAULT_LOCALE, LOCALES } from '~/lib/i18n/locales.config';
import { getLocalizedPath, MARKETING_PATHS } from '~/lib/i18n/slug-translations';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = appConfig.url;
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Define canonical marketing paths with their priorities
  const pathPriorities: Record<string, { priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }> = {
    '': { priority: 1.0, changeFrequency: 'weekly' },
    features: { priority: 0.9, changeFrequency: 'weekly' },
    pricing: { priority: 0.9, changeFrequency: 'weekly' },
    'how-it-works': { priority: 0.9, changeFrequency: 'weekly' },
    faq: { priority: 0.9, changeFrequency: 'weekly' },
    contact: { priority: 0.9, changeFrequency: 'weekly' },
    compare: { priority: 0.8, changeFrequency: 'monthly' },
    'compare/linearb': { priority: 0.8, changeFrequency: 'monthly' },
    'compare/jellyfish': { priority: 0.8, changeFrequency: 'monthly' },
    'compare/gitclear': { priority: 0.8, changeFrequency: 'monthly' },
    alternatives: { priority: 0.8, changeFrequency: 'monthly' },
    'alternatives/linearb': { priority: 0.8, changeFrequency: 'monthly' },
    'alternatives/jellyfish': { priority: 0.8, changeFrequency: 'monthly' },
    'terms-of-service': { priority: 0.5, changeFrequency: 'yearly' },
    'privacy-policy': { priority: 0.5, changeFrequency: 'yearly' },
    'cookie-policy': { priority: 0.5, changeFrequency: 'yearly' },
  };

  // Generate sitemap entries for each canonical path with all language variants
  Object.entries(pathPriorities).forEach(([canonicalPath, config]) => {
    // Generate entry for each locale
    LOCALES.forEach((locale) => {
      const localizedPath = getLocalizedPath(canonicalPath, locale);
      const url = `${baseUrl}${localizedPath}`;

      // Build alternates object for this URL (hreflang)
      const alternates: Record<string, string> = {};
      LOCALES.forEach((altLocale) => {
        const altPath = getLocalizedPath(canonicalPath, altLocale);
        // Use locale code as key, with x-default for default locale
        alternates[altLocale] = `${baseUrl}${altPath}`;
      });
      // Add x-default pointing to default locale
      alternates['x-default'] = `${baseUrl}${getLocalizedPath(canonicalPath, DEFAULT_LOCALE)}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: config.changeFrequency,
        priority: config.priority,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // Auth pages (no localization, lower priority)
  const authPages = ['/auth/sign-in', '/auth/sign-up'];
  authPages.forEach((path) => {
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    });
  });

  return sitemapEntries;
}
