/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

/**
 * Cron endpoint to process ONE unprocessed PR at a time.
 *
 * Design for handling thousands of PRs without timeout:
 * - Each cron invocation processes exactly 1 PR
 * - Runs every 1 minute = ~60 PRs/hour = ~1440 PRs/day
 * - Queue naturally drains over time
 * - No timeout risk (single Claude API call ~30-60s)
 *
 * Security: Protected via optional CRON_SECRET header.
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret if set
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('Authorization');
      const providedSecret = authHeader?.replace('Bearer ', '');
      if (providedSecret !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const postComment = searchParams.get('postComment') !== 'false';

    console.log(`[Cron] Looking for unprocessed PRs...`);

    const admin = getSupabaseServerAdminClient<any>();

    // Get all merged PRs across all orgs, ordered by merged_at (oldest first to clear backlog)
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
        repositories (full_name),
        github_identities (github_login, avatar_url, github_user_id)
      `)
      .not('merged_at_gh', 'is', null)
      .order('merged_at_gh', { ascending: true }) // Process oldest first (FIFO)
      .limit(100); // Fetch a batch to find unprocessed ones

    if (prError) {
      console.error('[Cron] Failed to fetch PRs:', prError);
      return NextResponse.json({ error: prError.message }, { status: 500 });
    }

    if (!allPRs?.length) {
      console.log('[Cron] No merged PRs found');
      return NextResponse.json({ message: 'No merged PRs found', processed: 0 });
    }

    // Get all existing evaluations
    const prIds = allPRs.map((pr: any) => pr.id);
    const { data: existingEvals } = await admin
      .from('pr_evaluations')
      .select('pr_id')
      .in('pr_id', prIds);

    const evaluatedPrIds = new Set((existingEvals ?? []).map((e: any) => e.pr_id));

    // Find the first unprocessed PR
    const unprocessedPR = allPRs.find((pr: any) => !evaluatedPrIds.has(pr.id));

    if (!unprocessedPR) {
      console.log('[Cron] All PRs are processed');
      return NextResponse.json({
        message: 'All PRs are processed',
        processed: 0,
        queueEmpty: true,
      });
    }

    // Process this single PR
    const pr = unprocessedPR;
    const repo = Array.isArray(pr.repositories) ? pr.repositories[0] : pr.repositories;
    const identity = Array.isArray(pr.github_identities) ? pr.github_identities[0] : pr.github_identities;

    console.log(`[Cron] Processing PR #${pr.number} in ${repo?.full_name}`);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Add timeout to prevent Cloudflare 522 errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28000); // 28s timeout

    try {
      const response = await fetch(`${baseUrl}/api/github/process-pr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          orgId: pr.org_id,
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
          postComment,
        }),
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        console.log(`[Cron] PR #${pr.number} processed: score=${result.evaluation?.final_score}`);

        // Count remaining unprocessed PRs (approximate)
        const remainingCount = allPRs.filter((p: any) => !evaluatedPrIds.has(p.id)).length - 1;

        return NextResponse.json({
          message: 'PR processed successfully',
          processed: 1,
          pr: {
            number: pr.number,
            repo: repo?.full_name,
            score: result.evaluation?.final_score,
          },
          remainingEstimate: Math.max(0, remainingCount),
        });
      } else {
        const errText = await response.text();
        console.error(`[Cron] PR #${pr.number} failed: ${errText}`);
        return NextResponse.json({
          message: 'PR processing failed',
          processed: 0,
          error: errText.slice(0, 200),
          pr: { number: pr.number, repo: repo?.full_name },
        }, { status: 500 });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = (err as Error).name === 'AbortError';
      console.error(`[Cron] PR #${pr.number} ${isTimeout ? 'timeout' : 'error'}:`, err);
      return NextResponse.json({
        message: isTimeout ? 'PR processing timeout' : 'PR processing error',
        processed: 0,
        error: isTimeout ? 'Request timed out after 28s' : (err as Error).message,
        pr: { number: pr.number, repo: repo?.full_name },
      }, { status: isTimeout ? 504 : 500 });
    }
  } catch (err) {
    console.error('[Cron] Error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

/**
 * POST endpoint - same as GET, for flexibility
 */
export async function POST(request: Request) {
  return GET(request);
}
