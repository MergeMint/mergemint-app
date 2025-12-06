import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

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
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId ?? '')
    .maybeSingle();

  if (error || !membership) {
    return NextResponse.json({ error: 'not authorized for org' }, { status: 403 });
  }

  const { data: connection } = await supabase
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

    const repos =
      (connection?.installation_type ?? null) === 'app'
        ? await client.listInstallationRepos()
        : await client.listRepos(orgSlug ?? connection?.github_org_name ?? '');

    const simplified = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      default_branch: repo.default_branch,
    }));

    return NextResponse.json({ repos: simplified, source });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
