import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  getInstallationAccessToken,
} from '~/lib/mergemint/github';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const months = parseInt(searchParams.get('months') ?? '3', 10);

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    const admin = getSupabaseServerAdminClient<any>();

    // Get GitHub connection for this org
    const { data: connection, error: connError } = await admin
      .from('github_connections')
      .select('github_installation_id, installation_type, github_org_name')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .maybeSingle();

    if (connError || !connection) {
      return NextResponse.json(
        { error: 'No active GitHub connection found' },
        { status: 400 },
      );
    }

    // Get active repositories for this org
    const { data: repos, error: repoError } = await admin
      .from('repositories')
      .select('id, github_repo_id, name, full_name, default_branch')
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (repoError || !repos?.length) {
      return NextResponse.json(
        { error: 'No active repositories found' },
        { status: 400 },
      );
    }

    // Get installation token
    if (!connection.github_installation_id) {
      return NextResponse.json(
        { error: 'Missing GitHub installation ID' },
        { status: 400 },
      );
    }

    const tokenData = await getInstallationAccessToken(connection.github_installation_id);
    const client = new GithubClient(tokenData.token);

    // Fetch merged PRs from all repos
    const allPRs: Array<{
      repo_id: string;
      repo_full_name: string;
      pr: {
        id: number;
        number: number;
        title: string;
        body: string | null;
        merged_at: string | null;
        created_at: string;
        html_url: string;
        additions: number;
        deletions: number;
        changed_files: number;
        user: { id: number; login: string; avatar_url?: string };
        head: { sha: string };
        base: { sha: string };
      };
    }> = [];

    for (const repo of repos) {
      const [owner, repoName] = (repo.full_name || repo.name).split('/');
      if (!owner || !repoName) continue;

      try {
        const prs = await client.fetchAllMergedPRs(owner, repoName, months);
        for (const pr of prs) {
          allPRs.push({
            repo_id: repo.id,
            repo_full_name: repo.full_name,
            pr: {
              id: pr.id,
              number: pr.number,
              title: pr.title,
              body: pr.body,
              merged_at: pr.merged_at,
              created_at: pr.created_at,
              html_url: pr.html_url,
              additions: pr.additions,
              deletions: pr.deletions,
              changed_files: pr.changed_files,
              user: {
                id: pr.user.id,
                login: pr.user.login,
                avatar_url: pr.user.avatar_url,
              },
              head: pr.head,
              base: pr.base,
            },
          });
        }
      } catch (err) {
        console.error(`Failed to fetch PRs for ${repo.full_name}:`, err);
        // Continue with other repos
      }
    }

    // Sort by merged_at descending
    allPRs.sort((a, b) => {
      const aDate = a.pr.merged_at ? new Date(a.pr.merged_at).getTime() : 0;
      const bDate = b.pr.merged_at ? new Date(b.pr.merged_at).getTime() : 0;
      return bDate - aDate;
    });

    return NextResponse.json({
      prs: allPRs,
      total: allPRs.length,
      repos: repos.map((r) => ({ id: r.id, full_name: r.full_name })),
    });
  } catch (err) {
    console.error('Error fetching merged PRs:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

