/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  getInstallationAccessToken,
} from '~/lib/mergemint/github';

/**
 * GET: Returns list of repos for an org (for parallel sync UI)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    const admin = getSupabaseServerAdminClient<any>();

    // Get GitHub connection
    const { data: connection } = await admin
      .from('github_connections')
      .select('github_installation_id')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection?.github_installation_id) {
      return NextResponse.json(
        { error: 'No active GitHub connection found' },
        { status: 400 },
      );
    }

    // Get all active repos for this org
    const { data: repos } = await admin
      .from('repositories')
      .select('id, full_name, github_repo_id, last_synced_at')
      .eq('org_id', orgId)
      .eq('is_active', true);

    return NextResponse.json({
      repos: repos ?? [],
      installationId: connection.github_installation_id,
    });
  } catch (err) {
    console.error('[SyncPRs] GET Error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * POST: Sync PRs from GitHub to the database.
 * - If repoId is provided, syncs only that repo (supports pagination with `page` param)
 * - If no repoId, syncs all repos (legacy behavior)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, repoId, repoFullName, months = 3, page = 1 } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    const admin = getSupabaseServerAdminClient<any>();

    // Get GitHub connection
    const { data: connection } = await admin
      .from('github_connections')
      .select('github_installation_id')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection?.github_installation_id) {
      return NextResponse.json(
        { error: 'No active GitHub connection found' },
        { status: 400 },
      );
    }

    // Get installation token
    const tokenData = await getInstallationAccessToken(connection.github_installation_id);
    const client = new GithubClient(tokenData.token);

    // Single repo sync with pagination
    if (repoId && repoFullName) {
      return await syncRepoPage(admin, client, orgId, repoId, repoFullName, months, page);
    }

    // Multi-repo sync (legacy)
    return await syncAllRepos(admin, client, orgId, months);
  } catch (err) {
    console.error('[SyncPRs] Error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * Sync a single page of PRs from a repo.
 * Returns hasMore=true if there are more pages to fetch.
 */
async function syncRepoPage(
  admin: any,
  client: GithubClient,
  orgId: string,
  repoId: string,
  repoFullName: string,
  months: number,
  page: number
) {
  const [owner, repoName] = repoFullName.split('/');
  if (!owner || !repoName) {
    return NextResponse.json(
      { error: 'Invalid repo name format' },
      { status: 400 },
    );
  }

  const sinceDate = new Date();
  sinceDate.setMonth(sinceDate.getMonth() - months);
  const sinceTime = sinceDate.getTime();

  console.log(`[SyncPRs] Syncing ${repoFullName} page ${page}`);

  try {
    // Fetch one page of closed PRs from GitHub
    const rawPrs = await client.request<any[]>(
      `/repos/${owner}/${repoName}/pulls`,
      {
        query: {
          state: 'closed',
          sort: 'updated',
          direction: 'desc',
          per_page: 30,
          page,
        },
      },
    );

    // Filter to merged PRs within our date range
    const mergedPRs = rawPrs.filter(
      (pr) => pr.merged_at && new Date(pr.merged_at).getTime() >= sinceTime,
    );

    let synced = 0;
    let skipped = 0;

    for (const pr of mergedPRs) {
      // Check if PR already exists
      const { data: existing } = await admin
        .from('pull_requests')
        .select('id')
        .eq('org_id', orgId)
        .eq('github_pr_id', pr.id)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Ensure GitHub identity exists
      let githubIdentityId = null;
      if (pr.user?.login) {
        const { data: existingIdentity } = await admin
          .from('github_identities')
          .select('id')
          .eq('github_login', pr.user.login)
          .maybeSingle();

        if (existingIdentity) {
          githubIdentityId = existingIdentity.id;
        } else {
          const { data: newIdentity } = await admin
            .from('github_identities')
            .insert({
              github_user_id: pr.user.id,
              github_login: pr.user.login,
              avatar_url: pr.user.avatar_url,
            })
            .select('id')
            .single();
          githubIdentityId = newIdentity?.id;
        }
      }

      // Insert PR
      const { error: insertError } = await admin
        .from('pull_requests')
        .insert({
          org_id: orgId,
          repo_id: repoId,
          github_pr_id: pr.id,
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: 'closed',
          is_merged: true,
          merged_at_gh: pr.merged_at,
          github_author_id: githubIdentityId,
          head_sha: pr.head?.sha,
          base_sha: pr.base?.sha,
          url: pr.html_url,
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files_count: pr.changed_files,
          created_at_gh: pr.created_at,
          updated_at_gh: pr.updated_at,
          last_synced_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`[SyncPRs] Failed to insert PR #${pr.number}:`, insertError);
      } else {
        synced++;
      }
    }

    // Determine if there are more pages
    // If we got fewer than 30 raw PRs, we're at the end
    // Also stop if we got 0 merged PRs in the date range (past our date window)
    const hasMore = rawPrs.length === 30 && mergedPRs.length > 0 && page < 50;

    // Update repo last_synced_at only when done
    if (!hasMore) {
      await admin
        .from('repositories')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', repoId);
    }

    return NextResponse.json({
      repo: repoFullName,
      page,
      synced,
      skipped,
      fetchedFromGitHub: rawPrs.length,
      mergedInRange: mergedPRs.length,
      hasMore,
    });
  } catch (err) {
    console.error(`[SyncPRs] Error syncing ${repoFullName} page ${page}:`, err);
    return NextResponse.json(
      { error: (err as Error).message, repo: repoFullName },
      { status: 500 },
    );
  }
}

async function syncSingleRepo(
  admin: any,
  client: GithubClient,
  orgId: string,
  repoId: string,
  repoFullName: string,
  months: number
) {
  const [owner, repoName] = repoFullName.split('/');
  if (!owner || !repoName) {
    return NextResponse.json(
      { error: 'Invalid repo name format' },
      { status: 400 },
    );
  }

  console.log(`[SyncPRs] Syncing single repo: ${repoFullName}`);

  try {
    const mergedPRs = await client.fetchAllMergedPRs(owner, repoName, months);
    console.log(`[SyncPRs] Found ${mergedPRs.length} merged PRs in ${repoFullName}`);

    let synced = 0;
    let skipped = 0;

    for (const pr of mergedPRs) {
      // Check if PR already exists
      const { data: existing } = await admin
        .from('pull_requests')
        .select('id')
        .eq('org_id', orgId)
        .eq('github_pr_id', pr.id)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Ensure GitHub identity exists
      let githubIdentityId = null;
      if (pr.user?.login) {
        const { data: existingIdentity } = await admin
          .from('github_identities')
          .select('id')
          .eq('github_login', pr.user.login)
          .maybeSingle();

        if (existingIdentity) {
          githubIdentityId = existingIdentity.id;
        } else {
          const { data: newIdentity } = await admin
            .from('github_identities')
            .insert({
              github_user_id: pr.user.id,
              github_login: pr.user.login,
              avatar_url: pr.user.avatar_url,
            })
            .select('id')
            .single();
          githubIdentityId = newIdentity?.id;
        }
      }

      // Insert PR
      const { error: insertError } = await admin
        .from('pull_requests')
        .insert({
          org_id: orgId,
          repo_id: repoId,
          github_pr_id: pr.id,
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: 'closed',
          is_merged: true,
          merged_at_gh: pr.merged_at,
          github_author_id: githubIdentityId,
          head_sha: pr.head?.sha,
          base_sha: pr.base?.sha,
          url: pr.html_url,
          additions: pr.additions,
          deletions: pr.deletions,
          changed_files_count: pr.changed_files,
          created_at_gh: pr.created_at,
          updated_at_gh: pr.updated_at,
          last_synced_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`[SyncPRs] Failed to insert PR #${pr.number}:`, insertError);
      } else {
        synced++;
      }
    }

    // Update repo last_synced_at
    await admin
      .from('repositories')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', repoId);

    return NextResponse.json({
      repo: repoFullName,
      synced,
      skipped,
      total: mergedPRs.length,
    });
  } catch (err) {
    console.error(`[SyncPRs] Error syncing ${repoFullName}:`, err);
    return NextResponse.json(
      { error: (err as Error).message, repo: repoFullName },
      { status: 500 },
    );
  }
}

async function syncAllRepos(
  admin: any,
  client: GithubClient,
  orgId: string,
  months: number
) {
  // Get all active repos for this org
  const { data: repos } = await admin
    .from('repositories')
    .select('id, full_name, github_repo_id')
    .eq('org_id', orgId)
    .eq('is_active', true);

  if (!repos?.length) {
    return NextResponse.json(
      { error: 'No active repositories found' },
      { status: 400 },
    );
  }

  let totalSynced = 0;
  let totalSkipped = 0;
  const repoResults: { repo: string; synced: number; skipped: number }[] = [];

  for (const repo of repos) {
    const [owner, repoName] = repo.full_name.split('/');
    if (!owner || !repoName) continue;

    try {
      console.log(`[SyncPRs] Fetching PRs from ${repo.full_name}`);
      const mergedPRs = await client.fetchAllMergedPRs(owner, repoName, months);
      console.log(`[SyncPRs] Found ${mergedPRs.length} merged PRs in ${repo.full_name}`);

      let synced = 0;
      let skipped = 0;

      for (const pr of mergedPRs) {
        // Check if PR already exists
        const { data: existing } = await admin
          .from('pull_requests')
          .select('id')
          .eq('org_id', orgId)
          .eq('github_pr_id', pr.id)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        // Ensure GitHub identity exists
        let githubIdentityId = null;
        if (pr.user?.login) {
          const { data: existingIdentity } = await admin
            .from('github_identities')
            .select('id')
            .eq('github_login', pr.user.login)
            .maybeSingle();

          if (existingIdentity) {
            githubIdentityId = existingIdentity.id;
          } else {
            const { data: newIdentity } = await admin
              .from('github_identities')
              .insert({
                github_user_id: pr.user.id,
                github_login: pr.user.login,
                avatar_url: pr.user.avatar_url,
              })
              .select('id')
              .single();
            githubIdentityId = newIdentity?.id;
          }
        }

        // Insert PR
        const { error: insertError } = await admin
          .from('pull_requests')
          .insert({
            org_id: orgId,
            repo_id: repo.id,
            github_pr_id: pr.id,
            number: pr.number,
            title: pr.title,
            body: pr.body,
            state: 'closed',
            is_merged: true,
            merged_at_gh: pr.merged_at,
            github_author_id: githubIdentityId,
            head_sha: pr.head?.sha,
            base_sha: pr.base?.sha,
            url: pr.html_url,
            additions: pr.additions,
            deletions: pr.deletions,
            changed_files_count: pr.changed_files,
            created_at_gh: pr.created_at,
            updated_at_gh: pr.updated_at,
            last_synced_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`[SyncPRs] Failed to insert PR #${pr.number}:`, insertError);
        } else {
          synced++;
        }
      }

      repoResults.push({ repo: repo.full_name, synced, skipped });
      totalSynced += synced;
      totalSkipped += skipped;

      // Update repo last_synced_at
      await admin
        .from('repositories')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', repo.id);

    } catch (err) {
      console.error(`[SyncPRs] Error syncing ${repo.full_name}:`, err);
      repoResults.push({ repo: repo.full_name, synced: 0, skipped: 0 });
    }
  }

  console.log(`[SyncPRs] Completed: ${totalSynced} synced, ${totalSkipped} skipped`);

  return NextResponse.json({
    message: 'Sync completed',
    synced: totalSynced,
    skipped: totalSkipped,
    repos: repoResults,
  });
}
