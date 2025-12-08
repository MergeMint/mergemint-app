/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  GithubPullRequest,
  GithubPullRequestFile,
  GithubRepository,
  getGithubTokenForOrg,
} from './github';

export async function syncOrgFromGithub(orgId: string) {
  const admin = getSupabaseServerAdminClient<any>();
  const connection = await loadConnection(admin, orgId);
  const org = await loadOrg(admin, orgId);
  const token = getGithubTokenForOrg(orgId, org?.slug ?? connection.github_org_name ?? undefined);
  const client = new GithubClient(token);
  const repositories = await client.listRepos(
    connection.github_org_name ?? org?.slug ?? '',
  );

  for (const repo of repositories) {
    const repoId = await upsertRepository(admin, orgId, repo);
    await syncIssues(admin, client, orgId, repoId, repo);
    await syncPullRequests(admin, client, orgId, repoId, repo);
    await admin
      .from('repositories')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', repoId);
  }
}

async function loadConnection(
  client: SupabaseClient<any>,
  orgId: string,
) {
  const { data, error } = await client
    .from('github_connections')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('GitHub connection not configured for org.');
  return data;
}

async function loadOrg(
  client: SupabaseClient<any>,
  orgId: string,
) {
  const { data, error } = await client
    .from('organizations')
    .select('id, slug, name')
    .eq('id', orgId)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

async function upsertRepository(
  client: SupabaseClient<any>,
  orgId: string,
  repo: GithubRepository,
) {
  const { data, error } = await client
    .from('repositories')
    .upsert(
      {
        org_id: orgId,
        github_repo_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        default_branch: repo.default_branch,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,github_repo_id' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function syncIssues(
  client: SupabaseClient<any>,
  github: GithubClient,
  orgId: string,
  repoId: string,
  repo: GithubRepository,
) {
  const { data: repoRow } = await client
    .from('repositories')
    .select('last_synced_at')
    .eq('id', repoId)
    .maybeSingle();

  const since = repoRow?.last_synced_at ?? undefined;
  const [owner = '', repoName = ''] = repo.full_name.split('/');
  const issues = await github.listIssues(owner, repoName, since ?? undefined);

  for (const issue of issues) {
    // Skip PR pseudo-issues
    // @ts-expect-error GitHub API adds pull_request object for PRs
    if (issue.pull_request) continue;
    const authorId = await upsertIdentity(client, issue.user);
    await client.from('issues').upsert(
      {
        org_id: orgId,
        repo_id: repoId,
        github_issue_id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: (issue.labels ?? []).map((l) => l.name),
        created_at_gh: issue.created_at,
        closed_at_gh: issue.closed_at,
        github_author_id: authorId,
        url: issue.html_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,github_issue_id' },
    );
  }
}

async function syncPullRequests(
  client: SupabaseClient<any>,
  github: GithubClient,
  orgId: string,
  repoId: string,
  repo: GithubRepository,
) {
  const { data: repoRow } = await client
    .from('repositories')
    .select('last_synced_at')
    .eq('id', repoId)
    .maybeSingle();
  const since = repoRow?.last_synced_at ?? undefined;
  const [owner = '', repoName = ''] = repo.full_name.split('/');
  const pulls = await github.listPulls(owner, repoName, since ?? undefined);

  for (const pr of pulls) {
    const authorId = await upsertIdentity(client, pr.user);
    const prId = await upsertPullRequest(
      client,
      orgId,
      repoId,
      pr,
      authorId,
    );

    const files = await github.listPullFiles(owner, repoName, pr.number);
    await replacePrFiles(client, prId, files);

    const issueNumbers = parseLinkedIssues(pr.body ?? '');
    if (issueNumbers.length) {
      const { data: issues } = await client
        .from('issues')
        .select('id, number')
        .eq('org_id', orgId)
        .eq('repo_id', repoId)
        .in('number', issueNumbers);

      await client.from('pr_issue_links').delete().eq('pr_id', prId);

      for (const issue of issues ?? []) {
        await client.from('pr_issue_links').upsert(
          {
            org_id: orgId,
            pr_id: prId,
            issue_id: issue.id,
            link_type: 'referenced',
          },
          { onConflict: 'pr_id,issue_id' },
        );
      }
    }
  }
}

async function upsertIdentity(
  client: SupabaseClient<any>,
  user: { id: number; login: string; avatar_url?: string },
) {
  const { data, error } = await client
    .from('github_identities')
    .upsert(
      {
        github_user_id: user.id,
        github_login: user.login,
        avatar_url: user.avatar_url ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'github_user_id' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertPullRequest(
  client: SupabaseClient<any>,
  orgId: string,
  repoId: string,
  pr: GithubPullRequest,
  authorId: string,
) {
  const { data, error } = await client
    .from('pull_requests')
    .upsert(
      {
        org_id: orgId,
        repo_id: repoId,
        github_pr_id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        is_merged: Boolean(pr.merged_at),
        merged_at_gh: pr.merged_at,
        github_author_id: authorId,
        head_sha: pr.head.sha,
        base_sha: pr.base.sha,
        url: pr.html_url,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files_count: pr.changed_files,
        created_at_gh: pr.created_at,
        updated_at_gh: pr.updated_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,github_pr_id' },
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function replacePrFiles(
  client: SupabaseClient<any>,
  prId: string,
  files: GithubPullRequestFile[],
) {
  await client.from('pr_files').delete().eq('pr_id', prId);

  if (!files.length) return;

  await client.from('pr_files').insert(
    files.map((file) => ({
      pr_id: prId,
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
      created_at: new Date().toISOString(),
    })),
  );
}

function parseLinkedIssues(body: string) {
  const regex = /(?:fixes|closes|resolves)\s+#(\d+)/gi;
  const matches: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    matches.push(Number(match[1]));
  }
  return Array.from(new Set(matches));
}
