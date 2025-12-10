import { createI18nSettings } from '@kit/i18n';

import {
  DEFAULT_LOCALE,
  LOCALES,
  isValidLocale,
} from './locales.config';

/**
 * The default language of the application.
 * This is used as a fallback language when the selected language is not supported.
 */
const defaultLanguage = DEFAULT_LOCALE;

/**
 * The list of supported languages.
 * Imported from locales.config.ts for centralized management.
 */
export const languages: string[] = [...LOCALES];

/**
 * The name of the cookie that stores the selected language.
 */
export const I18N_COOKIE_NAME = 'lang';

/**
 * The default array of Internationalization (i18n) namespaces.
 * These namespaces are commonly used in the application for translation purposes.
 *
 * Add your own namespaces here
 **/
export const defaultI18nNamespaces = [
  'common',
  'auth',
  'account',
  'teams',
  'billing',
  'marketing',
];

/**
 * Get the i18n settings for the given language and namespaces.
 * If the language is not supported, it will fall back to the default language.
 * @param language
 * @param ns
 */
export function getI18nSettings(
  language: string | undefined,
  ns: string | string[] = defaultI18nNamespaces,
) {
  let lng = language ?? defaultLanguage;

  if (!isValidLocale(lng)) {
    console.warn(
      `Language "${lng}" is not supported. Falling back to "${defaultLanguage}"`,
    );

    lng = defaultLanguage;
  }

  return createI18nSettings({
    language: lng,
    namespaces: ns,
    languages,
  });
}
