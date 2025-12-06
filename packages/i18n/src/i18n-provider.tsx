'use client';

import { use, useMemo } from 'react';
import type { InitOptions, i18n } from 'i18next';

import { initializeI18nClient } from './i18n.client';

const i18nInstancesCache = new Map<string, Promise<i18n>>();

type Resolver = (
  lang: string,
  namespace: string,
) => Promise<Record<string, string>>;

export function I18nProvider({
  settings,
  children,
  resolver,
}: React.PropsWithChildren<{
  settings: InitOptions;
  resolver: Resolver;
}>) {
  const cacheKey = useMemo(
    () => `${settings.lng}-${JSON.stringify(settings.ns)}`,
    [settings.lng, settings.ns],
  );

  const i18nPromise = useMemo(() => {
    if (!i18nInstancesCache.has(cacheKey)) {
      i18nInstancesCache.set(cacheKey, initializeI18nClient(settings, resolver));
    }
    return i18nInstancesCache.get(cacheKey)!;
  }, [cacheKey, settings, resolver]);

  // Use React's use() hook to suspend until i18n is ready
  use(i18nPromise);

  return children;
}
