/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

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

    // Calculate date range
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - months);

    // Fetch evaluations with PR and author details
    const { data: evaluations, error } = await admin
      .from('pr_evaluations')
      .select(`
        id,
        base_points,
        multiplier,
        final_score,
        eligibility_issue,
        eligibility_fix_implementation,
        eligibility_pr_linked,
        eligibility_tests,
        is_eligible,
        justification_component,
        justification_severity,
        impact_summary,
        eligibility_notes,
        review_notes,
        created_at,
        pull_requests!inner (
          id,
          github_pr_id,
          number,
          title,
          body,
          url,
          additions,
          deletions,
          changed_files_count,
          merged_at_gh,
          created_at_gh,
          github_author_id,
          repositories!inner (
            id,
            full_name
          ),
          github_identities (
            id,
            github_user_id,
            github_login,
            avatar_url
          )
        ),
        raw_response,
        severity_levels (
          id,
          key,
          name,
          base_points
        )
      `)
      .eq('org_id', orgId)
      .gte('pull_requests.merged_at_gh', sinceDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch evaluations' },
        { status: 500 },
      );
    }

    // Transform data for frontend
    const transformed = (evaluations ?? []).map((eval_: any) => ({
      id: eval_.id,
      pr_id: eval_.pull_requests?.id,
      repo_id: eval_.pull_requests?.repositories?.id,
      repo_full_name: eval_.pull_requests?.repositories?.full_name,
      pr: {
        id: eval_.pull_requests?.github_pr_id,
        number: eval_.pull_requests?.number,
        title: eval_.pull_requests?.title,
        body: eval_.pull_requests?.body,
        html_url: eval_.pull_requests?.url,
        merged_at: eval_.pull_requests?.merged_at_gh,
        created_at: eval_.pull_requests?.created_at_gh,
        additions: eval_.pull_requests?.additions,
        deletions: eval_.pull_requests?.deletions,
        changed_files: eval_.pull_requests?.changed_files_count,
        user: {
          id: eval_.pull_requests?.github_identities?.github_user_id,
          login: eval_.pull_requests?.github_identities?.github_login ?? 'unknown',
          avatar_url: eval_.pull_requests?.github_identities?.avatar_url,
        },
      },
      evaluation: {
        id: eval_.id,
        component: eval_.raw_response ? {
          key: eval_.raw_response.component_key ?? eval_.raw_response.primary_component_key ?? 'OTHER',
          name: eval_.raw_response.component_name ?? eval_.raw_response.primary_component_key ?? 'Other',
          multiplier: eval_.raw_response?.component_multiplier ?? eval_.multiplier ?? 1,
        } : null,
        severity: eval_.severity_levels ? {
          key: eval_.severity_levels.key,
          name: eval_.severity_levels.name,
          base_points: eval_.severity_levels.base_points,
        } : null,
        eligibility: {
          issue: eval_.eligibility_issue,
          fix_implementation: eval_.eligibility_fix_implementation,
          pr_linked: eval_.eligibility_pr_linked,
          tests: eval_.eligibility_tests,
        },
        is_eligible: eval_.is_eligible,
        base_points: eval_.base_points,
        multiplier: eval_.multiplier,
        final_score: eval_.final_score,
        justification_component: eval_.justification_component,
        justification_severity: eval_.justification_severity,
        impact_summary: eval_.impact_summary,
        eligibility_notes: eval_.eligibility_notes,
        author: eval_.pull_requests?.github_identities?.github_login ?? 'unknown',
      },
      status: 'completed' as const,
    }));

    // Calculate leaderboard
    const leaderboard = Object.values(
      transformed.reduce(
        (acc, item) => {
          const author = item.evaluation.author;
          if (!acc[author]) {
            acc[author] = {
              author,
              avatar_url: item.pr.user.avatar_url,
              total_score: 0,
              pr_count: 0,
              eligible_count: 0,
              p0_count: 0,
              p1_count: 0,
              p2_count: 0,
              p3_count: 0,
            };
          }
          acc[author].pr_count++;
          if (item.evaluation.is_eligible) {
            acc[author].total_score += item.evaluation.final_score ?? 0;
            acc[author].eligible_count++;
          }
          const severity = item.evaluation.severity?.key;
          if (severity === 'P0') acc[author].p0_count++;
          else if (severity === 'P1') acc[author].p1_count++;
          else if (severity === 'P2') acc[author].p2_count++;
          else if (severity === 'P3') acc[author].p3_count++;
          return acc;
        },
        {} as Record<string, {
          author: string;
          avatar_url?: string;
          total_score: number;
          pr_count: number;
          eligible_count: number;
          p0_count: number;
          p1_count: number;
          p2_count: number;
          p3_count: number;
        }>,
      ),
    ).sort((a, b) => b.total_score - a.total_score);

    return NextResponse.json({
      evaluations: transformed,
      leaderboard,
      total: transformed.length,
      eligible_count: transformed.filter((e) => e.evaluation.is_eligible).length,
      ineligible_count: transformed.filter((e) => !e.evaluation.is_eligible).length,
    });
  } catch (err) {
    console.error('Error in evaluations API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

