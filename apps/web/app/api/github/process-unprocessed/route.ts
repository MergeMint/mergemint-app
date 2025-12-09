/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  getInstallationAccessToken,
} from '~/lib/mergemint/github';

/**
 * Process PRs that exist in the database but don't have evaluations.
 * This will NOT overwrite existing evaluations.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, repoId, limit = 50 } = body;

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    console.log(`[ProcessUnprocessed] Starting for org ${orgId}, limit: ${limit}`);

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

    // Build query for PRs without evaluations
    let query = admin
      .from('pull_requests')
      .select(`
        id,
        org_id,
        repo_id,
        github_pr_id,
        number,
        title,
        body,
        github_author_id,
        merged_at_gh,
        created_at_gh,
        additions,
        deletions,
        changed_files_count,
        head_sha,
        base_sha,
        url,
        repositories!inner(full_name),
        github_identities(github_login, avatar_url, github_user_id)
      `)
      .eq('org_id', orgId)
      .not('merged_at_gh', 'is', null) // Use merged_at_gh as indicator
      .is('pr_evaluations.id', null) // LEFT JOIN where no evaluation exists
      .order('merged_at_gh', { ascending: false })
      .limit(limit);

    // Filter by repo if specified
    if (repoId) {
      query = query.eq('repo_id', repoId);
    }

    // Unfortunately Supabase doesn't support LEFT JOIN IS NULL easily
    // So we need to fetch PRs and then check for missing evaluations
    const { data: allPRs, error: prError } = await admin
      .from('pull_requests')
      .select(`
        id,
        org_id,
        repo_id,
        github_pr_id,
        number,
        title,
        body,
        github_author_id,
        merged_at_gh,
        created_at_gh,
        additions,
        deletions,
        changed_files_count,
        head_sha,
        base_sha,
        url,
        repositories(full_name),
        github_identities(github_login, avatar_url, github_user_id)
      `)
      .eq('org_id', orgId)
      .not('merged_at_gh', 'is', null) // Use merged_at_gh as indicator
      .order('merged_at_gh', { ascending: false });

    if (prError) {
      console.error('[ProcessUnprocessed] Failed to fetch PRs:', prError);
      return NextResponse.json(
        { error: 'Failed to fetch PRs', details: prError.message },
        { status: 500 },
      );
    }

    // Get all existing evaluations for this org
    const { data: existingEvals } = await admin
      .from('pr_evaluations')
      .select('pr_id')
      .eq('org_id', orgId);

    const evaluatedPrIds = new Set((existingEvals ?? []).map((e: any) => e.pr_id));

    // Filter to only PRs without evaluations
    let unprocessedPRs = (allPRs ?? []).filter((pr: any) => !evaluatedPrIds.has(pr.id));

    // Apply repo filter if specified
    if (repoId) {
      unprocessedPRs = unprocessedPRs.filter((pr: any) => pr.repo_id === repoId);
    }

    // Apply limit
    unprocessedPRs = unprocessedPRs.slice(0, limit);

    console.log(`[ProcessUnprocessed] Found ${unprocessedPRs.length} unprocessed PRs`);

    if (unprocessedPRs.length === 0) {
      return NextResponse.json({
        message: 'No unprocessed PRs found',
        results: { total: 0, processed: 0, errors: 0 },
      });
    }

    // Get installation token
    const tokenData = await getInstallationAccessToken(connection.github_installation_id);
    const client = new GithubClient(tokenData.token);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const results = {
      total: unprocessedPRs.length,
      processed: 0,
      errors: 0,
      details: [] as { prNumber: number; status: string; error?: string }[],
    };

    for (const pr of unprocessedPRs) {
      // Handle Supabase relation which may be object or array
      const repo = Array.isArray(pr.repositories) ? pr.repositories[0] : pr.repositories;
      const identity = Array.isArray(pr.github_identities) ? pr.github_identities[0] : pr.github_identities;

      const repoFullName = repo?.full_name;
      if (!repoFullName) {
        results.errors++;
        results.details.push({ prNumber: pr.number, status: 'error', error: 'Missing repo name' });
        continue;
      }

      try {
        const processResponse = await fetch(`${baseUrl}/api/github/process-pr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orgId,
            repoId: pr.repo_id,
            repoFullName,
            prNumber: pr.number,
            prId: pr.github_pr_id,
            prTitle: pr.title,
            prBody: pr.body,
            prAuthor: identity?.github_login,
            prAuthorId: identity?.github_user_id,
            prAuthorAvatar: identity?.avatar_url,
            prUrl: pr.url,
            mergedAt: pr.merged_at_gh,
            createdAt: pr.created_at_gh,
            additions: pr.additions,
            deletions: pr.deletions,
            changedFiles: pr.changed_files_count,
            headSha: pr.head_sha,
            baseSha: pr.base_sha,
            // Don't post comments for batch processing
            skipComment: true,
          }),
        });

        if (processResponse.ok) {
          results.processed++;
          results.details.push({ prNumber: pr.number, status: 'processed' });
        } else {
          const errData = await processResponse.json().catch(() => ({}));
          results.errors++;
          results.details.push({
            prNumber: pr.number,
            status: 'error',
            error: errData.error || 'Unknown error'
          });
          console.error(`[ProcessUnprocessed] Failed to process PR #${pr.number}:`, errData);
        }
      } catch (err) {
        results.errors++;
        results.details.push({
          prNumber: pr.number,
          status: 'error',
          error: (err as Error).message
        });
        console.error(`[ProcessUnprocessed] Error processing PR #${pr.number}:`, err);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log(`[ProcessUnprocessed] Completed: ${results.processed} processed, ${results.errors} errors`);

    return NextResponse.json({
      message: 'Processing completed',
      results,
    });
  } catch (err) {
    console.error('[ProcessUnprocessed] Error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to check how many unprocessed PRs exist
 * Add ?list=true to get the full list of unprocessed PRs for individual processing
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const returnList = searchParams.get('list') === 'true';

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    const admin = getSupabaseServerAdminClient<any>();

    // Get all merged PRs for this org (use merged_at_gh as indicator, not is_merged flag)
    const { data: allPRs, count: totalPRs } = await admin
      .from('pull_requests')
      .select(`
        id,
        repo_id,
        github_pr_id,
        number,
        title,
        body,
        merged_at_gh,
        created_at_gh,
        additions,
        deletions,
        changed_files_count,
        head_sha,
        base_sha,
        url,
        repositories(full_name),
        github_identities(github_login, avatar_url, github_user_id)
      `, { count: 'exact' })
      .eq('org_id', orgId)
      .not('merged_at_gh', 'is', null)
      .order('merged_at_gh', { ascending: false });

    // Get all evaluations for this org
    const { data: existingEvals } = await admin
      .from('pr_evaluations')
      .select('pr_id')
      .eq('org_id', orgId);

    const evaluatedPrIds = new Set((existingEvals ?? []).map((e: any) => e.pr_id));
    const unprocessedPRs = (allPRs ?? []).filter((pr: any) => !evaluatedPrIds.has(pr.id));

    // If list requested, return full PR details for individual processing
    if (returnList) {
      const prList = unprocessedPRs.map((pr: any) => {
        const repo = Array.isArray(pr.repositories) ? pr.repositories[0] : pr.repositories;
        const identity = Array.isArray(pr.github_identities) ? pr.github_identities[0] : pr.github_identities;
        return {
          id: pr.id,
          repoId: pr.repo_id,
          repoFullName: repo?.full_name,
          prNumber: pr.number,
          prId: pr.github_pr_id,
          prTitle: pr.title,
          prBody: pr.body,
          prAuthor: identity?.github_login,
          prAuthorId: identity?.github_user_id,
          prAuthorAvatar: identity?.avatar_url,
          prUrl: pr.url,
          mergedAt: pr.merged_at_gh,
          createdAt: pr.created_at_gh,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files_count,
          headSha: pr.head_sha,
          baseSha: pr.base_sha,
        };
      });

      return NextResponse.json({
        totalPRs: totalPRs ?? 0,
        evaluatedPRs: evaluatedPrIds.size,
        unprocessedPRs: unprocessedPRs.length,
        list: prList,
      });
    }

    return NextResponse.json({
      totalPRs: totalPRs ?? 0,
      evaluatedPRs: evaluatedPrIds.size,
      unprocessedPRs: unprocessedPRs.length,
      // Debug info
      debug: {
        prsWithMergedAt: allPRs?.length ?? 0,
        evalsFound: existingEvals?.length ?? 0,
        samplePrIds: allPRs?.slice(0, 3).map((p: any) => p.id),
        sampleEvalPrIds: existingEvals?.slice(0, 3).map((e: any) => e.pr_id),
      },
    });
  } catch (err) {
    console.error('[ProcessUnprocessed] GET Error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
