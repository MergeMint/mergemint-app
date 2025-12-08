'use client';

import { useTranslation } from 'react-i18next';

export function Trans({
  i18nKey,
  defaults,
  values,
}: {
  i18nKey?: string;
  defaults?: string;
  values?: Record<string, unknown>;
  [key: string]: unknown;
}) {
  const { t, ready } = useTranslation();

  if (!i18nKey) {
    return defaults || null;
  }

  if (!ready) {
    return defaults || i18nKey;
  }

  const options: Record<string, unknown> = {
    ...values,
  };

  if (defaults) {
    options.defaultValue = defaults;
  }

  const translated = t(i18nKey, Object.keys(options).length > 0 ? options : undefined);

  return <>{translated}</>;
}
