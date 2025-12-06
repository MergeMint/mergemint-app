/**
 * Resolves the translation file for a given language and namespace.
 *
 */
export async function i18nResolver(language: string, namespace: string) {
  const data = await import(
    `../../public/locales/${language}/${namespace}.json`
  );

  // Next.js dynamic import wraps JSON under `default`
  return (data.default ?? data) as Record<string, string>;
}
