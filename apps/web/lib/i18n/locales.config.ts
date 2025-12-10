/**
 * Locale configuration for SEO-optimized multilingual support.
 * Defines all supported languages and utility functions.
 */

export const LOCALES = [
  'en',
  'de',
  'es',
  'fr',
  'it',
  'nl',
  'sv',
  'tr',
  'pl',
  'ko',
  'ja',
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Human-readable labels for each locale (in their native language)
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  nl: 'Nederlands',
  sv: 'Svenska',
  tr: 'Türkçe',
  pl: 'Polski',
  ko: '한국어',
  ja: '日本語',
};

/**
 * ISO language codes for hreflang tags
 */
export const LOCALE_HREFLANG: Record<Locale, string> = {
  en: 'en',
  de: 'de',
  es: 'es',
  fr: 'fr',
  it: 'it',
  nl: 'nl',
  sv: 'sv',
  tr: 'tr',
  pl: 'pl',
  ko: 'ko',
  ja: 'ja',
};

/**
 * OpenGraph locale codes (language_TERRITORY format)
 */
export const LOCALE_OG: Record<Locale, string> = {
  en: 'en_US',
  de: 'de_DE',
  es: 'es_ES',
  fr: 'fr_FR',
  it: 'it_IT',
  nl: 'nl_NL',
  sv: 'sv_SE',
  tr: 'tr_TR',
  pl: 'pl_PL',
  ko: 'ko_KR',
  ja: 'ja_JP',
};

/**
 * Type guard to check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Get all non-default locales (for routing)
 */
export function getNonDefaultLocales(): Locale[] {
  return LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
}
