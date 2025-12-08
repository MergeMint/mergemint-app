'use client';

import { useTranslation } from 'react-i18next';

export function Trans({
  i18nKey,
  defaults,
}: {
  i18nKey?: string;
  defaults?: string;
  [key: string]: unknown;
}) {
  const { t, ready } = useTranslation();

  if (!i18nKey) {
    return defaults || null;
  }

  if (!ready) {
    return defaults || i18nKey;
  }

  const translated = t(
    i18nKey,
    defaults ? { defaultValue: defaults } : undefined,
  );

  return <>{translated}</>;
}
