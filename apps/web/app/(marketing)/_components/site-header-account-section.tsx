'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import type { JwtPayload } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { LanguageSwitcher } from '~/components/language-switcher';
import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import type { Locale } from '~/lib/i18n/locales.config';

const ModeToggle = dynamic(
  () =>
    import('@kit/ui/mode-toggle').then((mod) => ({
      default: mod.ModeToggle,
    })),
  {
    ssr: false,
  },
);

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

interface SiteHeaderAccountSectionProps {
  user: JwtPayload | null;
  locale?: Locale;
}

export function SiteHeaderAccountSection({
  user,
  locale,
}: SiteHeaderAccountSectionProps) {
  if (!user) {
    return <AuthButtons locale={locale} />;
  }

  return <SuspendedPersonalAccountDropdown user={user} locale={locale} />;
}

function SuspendedPersonalAccountDropdown(props: {
  user: JwtPayload | null;
  locale?: Locale;
}) {
  const signOut = useSignOut();
  const user = useUser(props.user);
  const userData = user.data ?? props.user ?? null;

  if (userData) {
    return (
      <div className="flex items-center gap-2">
        <LanguageSwitcher currentLocale={props.locale} />
        <PersonalAccountDropdown
          showProfileName={false}
          paths={paths}
          features={features}
          user={userData}
          signOutRequested={() => signOut.mutateAsync()}
        />
      </div>
    );
  }

  return <AuthButtons locale={props.locale} />;
}

function AuthButtons({ locale }: { locale?: Locale }) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-0.5">
        <LanguageSwitcher currentLocale={locale} />

        <If condition={features.enableThemeToggle}>
          <ModeToggle />
        </If>

        <Button asChild variant="ghost">
          <Link href={pathsConfig.auth.signIn}>
            <Trans i18nKey="auth:signIn" />
          </Link>
        </Button>
      </div>

      <div className="flex md:hidden">
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <Button asChild className="group" variant="default">
        <Link href={pathsConfig.auth.signUp}>
          <Trans i18nKey="auth:signUp" />
        </Link>
      </Button>
    </div>
  );
}
