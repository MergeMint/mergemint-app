'use client';

import { useTranslation } from 'react-i18next';

export function Trans({ 
  i18nKey, 
  defaults, 
  ...props 
}: {
  i18nKey?: string;
  defaults?: string;
  [key: string]: any;
}) {
  try {
    const { t, ready } = useTranslation();
    
    if (!i18nKey) {
      return defaults || null;
    }
    
    if (!ready) {
      return defaults || i18nKey;
    }
    
    const translated = t(i18nKey, defaults);
    
    return <>{translated}</>;
  } catch (error) {
    // Fallback if i18n is not initialized
    return defaults || i18nKey || null;
  }
}
