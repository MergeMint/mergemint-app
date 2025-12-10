import { Metadata } from 'next';

import appConfig from '~/config/app.config';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_OG,
  type Locale,
} from '~/lib/i18n/locales.config';
import { getAllAlternateUrls, getLocalizedPath } from '~/lib/i18n/slug-translations';

interface LocalizedMetadataOptions {
  /**
   * The canonical (English) path without leading slash.
   * e.g., 'features', 'pricing', 'compare/linearb'
   */
  canonicalPath: string;

  /**
   * Current locale for this page
   */
  locale: Locale;

  /**
   * Page title (will be appended with site name via template)
   */
  title: string;

  /**
   * Page description for SEO
   */
  description: string;

  /**
   * Optional keywords for the page
   */
  keywords?: string[];

  /**
   * Optional OpenGraph customization
   */
  openGraph?: {
    title?: string;
    description?: string;
    type?: 'website' | 'article';
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
}

/**
 * Generate SEO-optimized metadata with proper hreflang and canonical URLs.
 * Use this for all marketing pages to ensure consistent SEO implementation.
 */
export function generateLocalizedMetadata({
  canonicalPath,
  locale,
  title,
  description,
  keywords,
  openGraph,
}: LocalizedMetadataOptions): Metadata {
  const alternates = getAllAlternateUrls(canonicalPath, appConfig.url);
  const currentUrl = alternates.find((a) => a.locale === locale)?.url;
  const defaultUrl = alternates.find(
    (a) => a.locale === DEFAULT_LOCALE,
  )?.url;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: currentUrl,
      languages: {
        ...Object.fromEntries(alternates.map((a) => [a.hreflang, a.url])),
        'x-default': defaultUrl,
      },
    },
    openGraph: {
      title: openGraph?.title ?? title,
      description: openGraph?.description ?? description,
      type: openGraph?.type ?? 'website',
      url: currentUrl,
      siteName: appConfig.name,
      locale: LOCALE_OG[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => LOCALE_OG[l],
      ),
      images: openGraph?.images ?? [
        {
          url: `${appConfig.url}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: appConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: openGraph?.title ?? title,
      description: openGraph?.description ?? description,
    },
  };
}

/**
 * Generate hreflang link data for a canonical path.
 * Useful for injecting into <head> via Next.js metadata.
 */
export function getHreflangLinks(
  canonicalPath: string,
  baseUrl: string = appConfig.url,
): Array<{
  hreflang: string;
  href: string;
}> {
  const alternates = getAllAlternateUrls(canonicalPath, baseUrl);
  const defaultUrl = alternates.find(
    (a) => a.locale === DEFAULT_LOCALE,
  )?.url;

  return [
    ...alternates.map((a) => ({
      hreflang: a.hreflang,
      href: a.url,
    })),
    {
      hreflang: 'x-default',
      href: defaultUrl ?? `${baseUrl}/${canonicalPath}`,
    },
  ];
}

/**
 * Get the URL for switching to a different locale on the current page.
 */
export function getLocaleSwitch(
  canonicalPath: string,
  targetLocale: Locale,
  baseUrl: string = appConfig.url,
): string {
  const localizedPath = getLocalizedPath(canonicalPath, targetLocale);
  return `${baseUrl}${localizedPath}`;
}
