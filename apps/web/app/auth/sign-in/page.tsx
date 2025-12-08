import Link from 'next/link';

import { SignInMethodsContainer } from '@kit/auth/sign-in';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signIn'),
  };
};

async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  const paths = {
    callback: pathsConfig.auth.callback,
    home: next || pathsConfig.app.home,
  };

  // Preserve the next parameter when linking to sign-up
  const signUpHref = next 
    ? `${pathsConfig.auth.signUp}?next=${encodeURIComponent(next)}`
    : pathsConfig.auth.signUp;

  return (
    <>
      <Heading level={5} className={'tracking-tight'}>
        <Trans i18nKey={'auth:signInHeading'} />
      </Heading>

      <SignInMethodsContainer paths={paths} providers={authConfig.providers} />

      <div className={'flex justify-center'}>
        <Button asChild variant={'link'} size={'sm'}>
          <Link href={signUpHref}>
            <Trans i18nKey={'auth:doNotHaveAccountYet'} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default withI18n(SignInPage);
