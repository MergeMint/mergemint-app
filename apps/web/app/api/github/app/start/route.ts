import { NextRequest, NextResponse } from 'next/server';

const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;

export async function GET(request: NextRequest) {
  if (!appSlug) {
    return NextResponse.json(
      { error: 'GitHub App not configured. Set NEXT_PUBLIC_GITHUB_APP_SLUG.' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const orgSlug = searchParams.get('orgSlug');
  const returnTo = searchParams.get('returnTo') ?? '/home/onboarding';

  const state = Buffer.from(
    JSON.stringify({
      orgId,
      orgSlug,
      returnTo,
    }),
  ).toString('base64url');

  const installUrl = new URL(
    `https://github.com/apps/${appSlug}/installations/new`,
  );
  installUrl.searchParams.set('state', state);

  return NextResponse.redirect(installUrl.toString(), { status: 302 });
}
