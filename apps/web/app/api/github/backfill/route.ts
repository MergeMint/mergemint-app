import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  getInstallationAccessToken,
} from '~/lib/mergemint/github';

/**
 * Trigger initial backfill of PRs for a repository.
 * This fetches the last 3 months of merged PRs and processes them.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, repoId, repoFullName, months = 3 } = body;

    if (!orgId || !repoFullName) {
      return NextResponse.json(
        { error: 'orgId and repoFullName are required' },
        { status: 400 },
      );
    }

    console.log(`[Backfill] Starting backfill for ${repoFullName} (${months} months)`);

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

    // Get or create repo record
    let dbRepoId = repoId;
    if (!dbRepoId) {
      const { data: repoRecord } = await admin
        .from('repositories')
        .select('id')
        .eq('org_id', orgId)
        .eq('full_name', repoFullName)
        .maybeSingle();
      dbRepoId = repoRecord?.id;
    }

    if (!dbRepoId) {
      return NextResponse.json(
        { error: 'Repository not found in database' },
        { status: 400 },
      );
    }

    // Get installation token
    const tokenData = await getInstallationAccessToken(connection.github_installation_id);
    const client = new GithubClient(tokenData.token);

    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Invalid repository name format' },
        { status: 400 },
      );
    }

    // Fetch merged PRs
    console.log(`[Backfill] Fetching merged PRs from ${repoFullName}`);
    const mergedPRs = await client.fetchAllMergedPRs(owner, repo, months);
    console.log(`[Backfill] Found ${mergedPRs.length} merged PRs`);

    // Process each PR (without blocking - queue them)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const results = {
      total: mergedPRs.length,
      processed: 0,
      errors: 0,
      skipped: 0,
    };

    // Check which PRs are already processed
    const { data: existingPRs } = await admin
      .from('pull_requests')
      .select('github_pr_id')
      .eq('org_id', orgId)
      .eq('repo_id', dbRepoId);

    const existingPRIds = new Set((existingPRs ?? []).map((p: any) => p.github_pr_id));

    for (const pr of mergedPRs) {
      // Skip if already processed
      if (existingPRIds.has(pr.id)) {
        results.skipped++;
        continue;
      }

      try {
        const processResponse = await fetch(`${baseUrl}/api/github/process-pr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId,
            repoId: dbRepoId,
            repoFullName,
            prNumber: pr.number,
            prId: pr.id,
            prTitle: pr.title,
            prBody: pr.body,
            prAuthor: pr.user?.login,
            prAuthorId: pr.user?.id,
            prAuthorAvatar: pr.user?.avatar_url,
            prUrl: pr.html_url,
            mergedAt: pr.merged_at,
            createdAt: pr.created_at,
            additions: pr.additions,
            deletions: pr.deletions,
            changedFiles: pr.changed_files,
            headSha: pr.head?.sha,
            baseSha: pr.base?.sha,
            // Don't post comments for backfill
            skipComment: true,
          }),
        });

        if (processResponse.ok) {
          results.processed++;
        } else {
          results.errors++;
          console.error(`[Backfill] Failed to process PR #${pr.number}`);
        }
      } catch (err) {
        results.errors++;
        console.error(`[Backfill] Error processing PR #${pr.number}:`, err);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`[Backfill] Completed: ${results.processed} processed, ${results.skipped} skipped, ${results.errors} errors`);

    // Mark repo as synced
    await admin
      .from('repositories')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', dbRepoId);

    return NextResponse.json({
      message: 'Backfill completed',
      results,
    });
  } catch (err) {
    console.error('[Backfill] Error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

