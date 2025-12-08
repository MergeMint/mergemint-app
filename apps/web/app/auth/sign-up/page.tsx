import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
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
    title: i18n.t('auth:signUp'),
  };
};

// Helper to extract invite token from next URL (e.g., /invite/abc123)
function extractInviteToken(next: string | undefined): string | null {
  if (!next) return null;
  const match = next.match(/^\/invite\/([a-f0-9]+)$/i);
  return match ? match[1] : null;
}

// Fetch invitation email by token
async function getInvitationEmail(token: string): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = getSupabaseServerAdminClient<any>();
    const { data: invitation } = await admin
      .from('organization_invitations')
      .select('email, status, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (!invitation || invitation.status !== 'pending') return null;
    if (new Date(invitation.expires_at) < new Date()) return null;

    return invitation.email;
  } catch {
    return null;
  }
}

async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { next, email: emailFromParams } = await searchParams;
  
  // If this is an invite flow, try to get the email from the invitation
  let inviteEmail: string | null = null;
  const inviteToken = extractInviteToken(next);
  
  if (inviteToken && !emailFromParams) {
    inviteEmail = await getInvitationEmail(inviteToken);
    
    // Redirect with email in URL so the client-side form can pick it up
    if (inviteEmail) {
      const redirectUrl = new URL(pathsConfig.auth.signUp, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
      redirectUrl.searchParams.set('next', next!);
      redirectUrl.searchParams.set('email', inviteEmail);
      redirect(redirectUrl.pathname + redirectUrl.search);
    }
  }

  const paths = {
    callback: pathsConfig.auth.callback,
    appHome: next || pathsConfig.app.home,
  };

  // Preserve the next parameter when linking to sign-in
  const signInHref = next 
    ? `${pathsConfig.auth.signIn}?next=${encodeURIComponent(next)}`
    : pathsConfig.auth.signIn;

  return (
    <>
      <Heading level={5} className={'tracking-tight'}>
        <Trans i18nKey={'auth:signUpHeading'} />
      </Heading>

      <SignUpMethodsContainer
        providers={authConfig.providers}
        displayTermsCheckbox={authConfig.displayTermsCheckbox}
        paths={paths}
      />

      <div className={'flex justify-center'}>
        <Button asChild variant={'link'} size={'sm'}>
          <Link href={signInHref}>
            <Trans i18nKey={'auth:alreadyHaveAnAccount'} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default withI18n(SignUpPage);
