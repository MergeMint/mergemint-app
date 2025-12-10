/**
 * Slug translation system for SEO-optimized multilingual URLs.
 * Maps English slugs to their translations in each supported locale.
 */

import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
} from './locales.config';

/**
 * Marketing page slug translations.
 * Key = canonical (English) slug
 * Value = object mapping each locale to its translated slug
 */
export const SLUG_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  // Main marketing pages
  features: {
    en: 'features',
    de: 'funktionen',
    es: 'caracteristicas',
    fr: 'fonctionnalites',
    it: 'funzionalita',
    nl: 'functies',
    sv: 'funktioner',
    tr: 'ozellikler',
    pl: 'funkcje',
    ko: '기능',
    ja: '機能',
  },
  pricing: {
    en: 'pricing',
    de: 'preise',
    es: 'precios',
    fr: 'tarifs',
    it: 'prezzi',
    nl: 'prijzen',
    sv: 'priser',
    tr: 'fiyatlar',
    pl: 'cennik',
    ko: '가격',
    ja: '料金',
  },
  'how-it-works': {
    en: 'how-it-works',
    de: 'so-funktioniert-es',
    es: 'como-funciona',
    fr: 'comment-ca-marche',
    it: 'come-funziona',
    nl: 'hoe-het-werkt',
    sv: 'hur-det-fungerar',
    tr: 'nasil-calisir',
    pl: 'jak-to-dziala',
    ko: '사용-방법',
    ja: '使い方',
  },
  faq: {
    en: 'faq',
    de: 'haeufige-fragen',
    es: 'preguntas-frecuentes',
    fr: 'foire-aux-questions',
    it: 'domande-frequenti',
    nl: 'veelgestelde-vragen',
    sv: 'vanliga-fragor',
    tr: 'sikca-sorulan-sorular',
    pl: 'czesto-zadawane-pytania',
    ko: '자주-묻는-질문',
    ja: 'よくある質問',
  },
  contact: {
    en: 'contact',
    de: 'kontakt',
    es: 'contacto',
    fr: 'contact',
    it: 'contatti',
    nl: 'contact',
    sv: 'kontakt',
    tr: 'iletisim',
    pl: 'kontakt',
    ko: '문의',
    ja: 'お問い合わせ',
  },

  // Comparison pages
  compare: {
    en: 'compare',
    de: 'vergleich',
    es: 'comparar',
    fr: 'comparer',
    it: 'confronta',
    nl: 'vergelijken',
    sv: 'jamfor',
    tr: 'karsilastir',
    pl: 'porownaj',
    ko: '비교',
    ja: '比較',
  },
  'mergemint-vs-linearb': {
    en: 'mergemint-vs-linearb',
    de: 'mergemint-vs-linearb',
    es: 'mergemint-vs-linearb',
    fr: 'mergemint-vs-linearb',
    it: 'mergemint-vs-linearb',
    nl: 'mergemint-vs-linearb',
    sv: 'mergemint-vs-linearb',
    tr: 'mergemint-vs-linearb',
    pl: 'mergemint-vs-linearb',
    ko: 'mergemint-vs-linearb',
    ja: 'mergemint-vs-linearb',
  },
  'mergemint-vs-jellyfish': {
    en: 'mergemint-vs-jellyfish',
    de: 'mergemint-vs-jellyfish',
    es: 'mergemint-vs-jellyfish',
    fr: 'mergemint-vs-jellyfish',
    it: 'mergemint-vs-jellyfish',
    nl: 'mergemint-vs-jellyfish',
    sv: 'mergemint-vs-jellyfish',
    tr: 'mergemint-vs-jellyfish',
    pl: 'mergemint-vs-jellyfish',
    ko: 'mergemint-vs-jellyfish',
    ja: 'mergemint-vs-jellyfish',
  },
  'mergemint-vs-gitclear': {
    en: 'mergemint-vs-gitclear',
    de: 'mergemint-vs-gitclear',
    es: 'mergemint-vs-gitclear',
    fr: 'mergemint-vs-gitclear',
    it: 'mergemint-vs-gitclear',
    nl: 'mergemint-vs-gitclear',
    sv: 'mergemint-vs-gitclear',
    tr: 'mergemint-vs-gitclear',
    pl: 'mergemint-vs-gitclear',
    ko: 'mergemint-vs-gitclear',
    ja: 'mergemint-vs-gitclear',
  },

  // Alternatives pages
  alternatives: {
    en: 'alternatives',
    de: 'alternativen',
    es: 'alternativas',
    fr: 'alternatives',
    it: 'alternative',
    nl: 'alternatieven',
    sv: 'alternativ',
    tr: 'alternatifler',
    pl: 'alternatywy',
    ko: '대안',
    ja: '代替',
  },
  'best-linearb-alternatives': {
    en: 'best-linearb-alternatives',
    de: 'beste-linearb-alternativen',
    es: 'mejores-alternativas-linearb',
    fr: 'meilleures-alternatives-linearb',
    it: 'migliori-alternative-linearb',
    nl: 'beste-linearb-alternatieven',
    sv: 'basta-linearb-alternativ',
    tr: 'en-iyi-linearb-alternatifleri',
    pl: 'najlepsze-alternatywy-linearb',
    ko: '최고의-linearb-대안',
    ja: '最高のlinearb代替',
  },
  'best-jellyfish-alternatives': {
    en: 'best-jellyfish-alternatives',
    de: 'beste-jellyfish-alternativen',
    es: 'mejores-alternativas-jellyfish',
    fr: 'meilleures-alternatives-jellyfish',
    it: 'migliori-alternative-jellyfish',
    nl: 'beste-jellyfish-alternatieven',
    sv: 'basta-jellyfish-alternativ',
    tr: 'en-iyi-jellyfish-alternatifleri',
    pl: 'najlepsze-alternatywy-jellyfish',
    ko: '최고의-jellyfish-대안',
    ja: '最高のjellyfish代替',
  },

  // Legal pages
  'terms-of-service': {
    en: 'terms-of-service',
    de: 'nutzungsbedingungen',
    es: 'terminos-de-servicio',
    fr: 'conditions-utilisation',
    it: 'termini-di-servizio',
    nl: 'servicevoorwaarden',
    sv: 'anvandarvillkor',
    tr: 'kullanim-kosullari',
    pl: 'warunki-korzystania',
    ko: '이용약관',
    ja: '利用規約',
  },
  'privacy-policy': {
    en: 'privacy-policy',
    de: 'datenschutz',
    es: 'politica-de-privacidad',
    fr: 'politique-de-confidentialite',
    it: 'informativa-sulla-privacy',
    nl: 'privacybeleid',
    sv: 'integritetspolicy',
    tr: 'gizlilik-politikasi',
    pl: 'polityka-prywatnosci',
    ko: '개인정보처리방침',
    ja: 'プライバシーポリシー',
  },
  'cookie-policy': {
    en: 'cookie-policy',
    de: 'cookie-richtlinie',
    es: 'politica-de-cookies',
    fr: 'politique-cookies',
    it: 'politica-sui-cookie',
    nl: 'cookiebeleid',
    sv: 'cookiepolicy',
    tr: 'cerez-politikasi',
    pl: 'polityka-cookies',
    ko: '쿠키-정책',
    ja: 'クッキーポリシー',
  },
};

/**
 * List of all canonical marketing paths (for sitemap and static generation)
 */
export const MARKETING_PATHS = Object.keys(SLUG_TRANSLATIONS);

/**
 * Build reverse lookup map for URL parsing.
 * Maps "locale:translatedSlug" -> { locale, canonicalSlug }
 */
const REVERSE_SLUG_MAP = new Map<
  string,
  { locale: Locale; canonicalSlug: string }
>();

// Populate reverse map on module load
Object.entries(SLUG_TRANSLATIONS).forEach(([canonicalSlug, translations]) => {
  Object.entries(translations).forEach(([locale, translatedSlug]) => {
    if (locale !== DEFAULT_LOCALE) {
      REVERSE_SLUG_MAP.set(`${locale}:${translatedSlug}`, {
        locale: locale as Locale,
        canonicalSlug,
      });
    }
  });
});

/**
 * Get translated slug for a given canonical slug and locale.
 * @param canonicalSlug - The English (canonical) slug
 * @param locale - Target locale
 * @returns Translated slug or original if no translation exists
 */
export function getTranslatedSlug(
  canonicalSlug: string,
  locale: Locale,
): string {
  return SLUG_TRANSLATIONS[canonicalSlug]?.[locale] ?? canonicalSlug;
}

/**
 * Get canonical (English) slug from a translated slug.
 * @param translatedSlug - The translated slug
 * @param locale - The locale of the translated slug
 * @returns Canonical slug or null if not found
 */
export function getCanonicalSlug(
  translatedSlug: string,
  locale: Locale,
): string | null {
  // For default locale, the slug IS the canonical slug
  if (locale === DEFAULT_LOCALE) {
    return SLUG_TRANSLATIONS[translatedSlug] ? translatedSlug : null;
  }

  const key = `${locale}:${translatedSlug}`;
  const result = REVERSE_SLUG_MAP.get(key);
  return result?.canonicalSlug ?? null;
}

/**
 * Get full localized path for a canonical path.
 * @param canonicalPath - The English path (without leading slash)
 * @param locale - Target locale
 * @returns Full localized path with leading slash
 */
export function getLocalizedPath(
  canonicalPath: string,
  locale: Locale,
): string {
  // Remove leading slash if present
  const pathWithoutSlash = canonicalPath.startsWith('/')
    ? canonicalPath.slice(1)
    : canonicalPath;

  // Home page
  if (pathWithoutSlash === '') {
    return locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
  }

  // For default locale, return path as-is
  if (locale === DEFAULT_LOCALE) {
    return `/${pathWithoutSlash}`;
  }

  // Get translated slug
  const translatedSlug = getTranslatedSlug(pathWithoutSlash, locale);
  return `/${locale}/${translatedSlug}`;
}

/**
 * Get all alternate URLs for a canonical path (for hreflang tags).
 * @param canonicalPath - The English path (without leading slash)
 * @param baseUrl - Base URL of the site
 * @returns Array of locale, url, and hreflang code
 */
export function getAllAlternateUrls(
  canonicalPath: string,
  baseUrl: string,
): Array<{ locale: Locale; url: string; hreflang: string }> {
  // Remove trailing slash from baseUrl
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return LOCALES.map((locale) => ({
    locale,
    url: `${base}${getLocalizedPath(canonicalPath, locale)}`,
    hreflang: locale,
  }));
}

/**
 * Check if a path is a valid marketing page for a locale.
 * @param slug - The slug to check (can be translated)
 * @param locale - The locale context
 * @returns True if valid marketing page
 */
export function isValidMarketingSlug(slug: string, locale: Locale): boolean {
  if (locale === DEFAULT_LOCALE) {
    return MARKETING_PATHS.includes(slug);
  }
  return getCanonicalSlug(slug, locale) !== null;
}
