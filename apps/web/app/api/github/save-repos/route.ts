import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.orgId as string;
    const repos = body.repos as {
      github_repo_id: number;
      name: string;
      full_name: string;
      default_branch?: string | null;
      is_active: boolean;
    }[];

    if (!orgId || !Array.isArray(repos)) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    const admin = getSupabaseServerAdminClient<any>();
    const upserts = repos.map((repo) => ({
      org_id: orgId,
      github_repo_id: repo.github_repo_id,
      name: repo.name,
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      is_active: repo.is_active,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await admin.from('repositories').upsert(upserts, {
      onConflict: 'org_id,github_repo_id',
    });
    if (error) throw error;

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
