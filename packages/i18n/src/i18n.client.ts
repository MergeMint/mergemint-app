import i18next, { type InitOptions, i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

/**
 * Initialize the i18n instance on the client.
 * @param settings - the i18n settings
 * @param resolver - a function that resolves the i18n resources
 */
export async function initializeI18nClient(
  settings: InitOptions,
  resolver: (lang: string, namespace: string) => Promise<object>,
): Promise<i18n> {
  const loadedLanguages: string[] = [];
  const loadedNamespaces: string[] = [];

  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(
      resourcesToBackend(async (language, namespace, callback) => {
        try {
          console.log(`Loading i18n: ${language}/${namespace}`);
          const data = await resolver(language, namespace);
          console.log(`Loaded i18n: ${language}/${namespace}`, Object.keys(data).length, 'keys');

          if (!loadedLanguages.includes(language)) {
            loadedLanguages.push(language);
          }

          if (!loadedNamespaces.includes(namespace)) {
            loadedNamespaces.push(namespace);
          }

          return callback(null, data);
        } catch (error) {
          console.error(`Error loading translation: ${language}/${namespace}`, error);
          return callback(error as Error, {});
        }
      }),
    )
    .init(
      {
        ...settings,
        detection: {
          order: ['htmlTag', 'cookie', 'navigator'],
          caches: ['cookie'],
          lookupCookie: 'lang',
        },
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      },
      (err) => {
        if (err) {
          console.error('Error initializing i18n client', err);
        } else {
          console.log('i18n client initialized successfully');
        }
      },
    );

  console.log(`i18n initialized with ${loadedLanguages.length} languages and ${loadedNamespaces.length} namespaces`);

  return i18next;
}
