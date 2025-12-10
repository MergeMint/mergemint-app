import type { JwtPayload } from '@supabase/supabase-js';

import { Header } from '@kit/ui/marketing';

import { AppLogo } from '~/components/app-logo';
import type { Locale } from '~/lib/i18n/locales.config';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';

interface SiteHeaderProps {
  user?: JwtPayload | null;
  locale?: Locale;
}

export function SiteHeader({ user, locale }: SiteHeaderProps) {
  return (
    <Header
      logo={<AppLogo />}
      navigation={<SiteNavigation locale={locale} />}
      actions={<SiteHeaderAccountSection user={user ?? null} locale={locale} />}
    />
  );
}
