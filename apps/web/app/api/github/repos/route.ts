import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  resolveGithubTokenForOrg,
  type GithubConnectionInfo,
} from '~/lib/mergemint/github';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const orgSlug = searchParams.get('orgSlug') ?? undefined;

  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  let membership = null as { role: string } | null;
  if (userId) {
    const { data } = await admin
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .maybeSingle();
    membership = data ?? null;

    // Auto-add the current user as admin if org has no members (development convenience)
    if (!membership) {
      const { count } = await admin
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId);
      if ((count ?? 0) === 0) {
        await admin.from('organization_members').insert({
          org_id: orgId,
          user_id: userId,
          role: 'admin',
        });
        const { data: inserted } = await admin
          .from('organization_members')
          .select('role')
          .eq('org_id', orgId)
          .eq('user_id', userId)
          .maybeSingle();
        membership = inserted ?? null;
      }
    }
  }

  if (!membership) {
    return NextResponse.json({ error: 'not authorized for org' }, { status: 403 });
  }

  const { data: connection } = await admin
    .from('github_connections')
    .select('installation_type, github_installation_id, github_org_name')
    .eq('org_id', orgId)
    .maybeSingle();

  try {
    const { token, source } = await resolveGithubTokenForOrg(
      orgId,
      orgSlug,
      (connection ?? undefined) as GithubConnectionInfo | undefined,
    );
    const client = new GithubClient(token);

    let repos =
      (connection?.installation_type ?? null) === 'app'
        ? await client.listInstallationRepos()
        : await client.listRepos(orgSlug ?? connection?.github_org_name ?? '');

    // Sort by most recently pushed (last commit)
    repos = repos.sort((a, b) => {
      const aDate = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
      const bDate = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
      return bDate - aDate; // Most recent first
    });

    const simplified = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      pushed_at: repo.pushed_at,
    }));

    return NextResponse.json({ repos: simplified, source });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
