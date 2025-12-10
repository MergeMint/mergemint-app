'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { Globe } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  LOCALES,
  isValidLocale,
  type Locale,
} from '~/lib/i18n/locales.config';
import {
  getCanonicalSlug,
  getLocalizedPath,
} from '~/lib/i18n/slug-translations';

interface LanguageSwitcherProps {
  /**
   * Current locale (from route params or context)
   */
  currentLocale?: Locale;

  /**
   * Optional className for the trigger button
   */
  className?: string;
}

/**
 * Language switcher dropdown for marketing pages.
 * Detects current page and locale, then navigates to the
 * equivalent page in the selected language.
 */
export function LanguageSwitcher({
  currentLocale,
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();

  // Determine current locale from pathname or prop
  const locale = useMemo(() => {
    if (currentLocale) return currentLocale;

    // Extract locale from pathname
    const segments = pathname.split('/').filter(Boolean);
    const potentialLocale = segments[0];

    if (potentialLocale && isValidLocale(potentialLocale)) {
      return potentialLocale;
    }

    return DEFAULT_LOCALE;
  }, [currentLocale, pathname]);

  // Get canonical path from current pathname
  const canonicalPath = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    // If starts with a non-default locale, extract the slug
    if (segments[0] && isValidLocale(segments[0]) && segments[0] !== DEFAULT_LOCALE) {
      const translatedSlug = segments.slice(1).join('/');
      if (translatedSlug === '') return ''; // Home page

      const canonical = getCanonicalSlug(translatedSlug, segments[0] as Locale);
      return canonical ?? translatedSlug;
    }

    // Default locale - path is already canonical
    return segments.join('/');
  }, [pathname]);

  // Handle language change
  const handleLanguageChange = useCallback(
    (targetLocale: Locale) => {
      if (targetLocale === locale) return;

      // Set language cookie (must match I18N_COOKIE_NAME in i18n.settings.ts)
      document.cookie = `lang=${targetLocale}; path=/; max-age=31536000`;

      // Navigate to the localized path with a full page reload
      // This is necessary because i18n translations are loaded server-side
      const newPath = getLocalizedPath(canonicalPath, targetLocale);
      window.location.href = newPath;
    },
    [locale, canonicalPath],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={loc === locale ? 'bg-muted' : ''}
          >
            <span className="flex-1">{LOCALE_LABELS[loc]}</span>
            {loc === locale && (
              <span className="text-xs text-muted-foreground ml-2">
                (current)
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
