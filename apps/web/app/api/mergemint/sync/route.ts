import { NextResponse } from 'next/server';

import { syncOrgFromGithub } from '~/lib/mergemint/github-sync';

function assertCronSecret(request: Request) {
  const header = request.headers.get('x-api-key');
  const secret = process.env.MERGEMINT_CRON_SECRET;

  if (!secret || header !== secret) {
    throw new Error('Unauthorized');
  }
}

export async function POST(request: Request) {
  try {
    assertCronSecret(request);
    const body = await request.json();
    const orgId = body.orgId as string;

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    await syncOrgFromGithub(orgId);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Sync failed', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
