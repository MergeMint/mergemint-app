'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';

import {
  DEFAULT_LOCALE,
  isValidLocale,
  type Locale,
} from '~/lib/i18n/locales.config';
import { getLocalizedPath } from '~/lib/i18n/slug-translations';

interface LocalizedLinkProps extends Omit<LinkProps, 'href'> {
  /**
   * The canonical (English) href path
   */
  href: string;

  /**
   * Link children
   */
  children: ReactNode;

  /**
   * Optional className
   */
  className?: string;

  /**
   * Explicitly set the target locale (overrides auto-detection)
   */
  locale?: Locale;

  /**
   * Target attribute for the link
   */
  target?: string;
}

/**
 * Locale-aware Link component that automatically localizes
 * internal marketing page URLs based on the current locale context.
 *
 * External links, hash links, and non-marketing routes are passed through unchanged.
 */
export function LocalizedLink({
  href,
  children,
  locale: explicitLocale,
  className,
  target,
  ...props
}: LocalizedLinkProps) {
  const pathname = usePathname();

  // Determine current locale from pathname or explicit prop
  const locale = useMemo(() => {
    if (explicitLocale) return explicitLocale;

    const segments = pathname.split('/').filter(Boolean);
    const potentialLocale = segments[0];

    if (potentialLocale && isValidLocale(potentialLocale)) {
      return potentialLocale;
    }

    return DEFAULT_LOCALE;
  }, [explicitLocale, pathname]);

  // Compute the localized href
  const localizedHref = useMemo(() => {
    // Don't localize external links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }

    // Don't localize hash links
    if (href.startsWith('#')) {
      return href;
    }

    // Don't localize non-marketing routes
    if (
      href.startsWith('/home') ||
      href.startsWith('/auth') ||
      href.startsWith('/api') ||
      href.startsWith('/invite') ||
      href.startsWith('/changelog') ||
      href.startsWith('/update-password')
    ) {
      return href;
    }

    // Remove leading slash for processing
    const canonicalPath = href.startsWith('/') ? href.slice(1) : href;

    // Get localized path
    return getLocalizedPath(canonicalPath, locale as Locale);
  }, [href, locale]);

  return (
    <Link href={localizedHref} className={className} target={target} {...props}>
      {children}
    </Link>
  );
}
