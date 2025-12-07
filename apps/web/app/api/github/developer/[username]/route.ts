import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { 
  calculateDeveloperTitle, 
  calculateDeveloperBadges,
  getTitleFlavorText,
  type DeveloperStats,
} from '~/lib/mergemint/developer-titles';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const days = parseInt(searchParams.get('days') ?? '90', 10);
    const username = params.username;

    if (!orgId || !username) {
      return NextResponse.json(
        { error: 'orgId and username are required' },
        { status: 400 },
      );
    }

    const admin = getSupabaseServerAdminClient<any>();
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const since = sinceDate.toISOString();

    // Find the github identity (global, not org-specific)
    // Try exact match first
    let identity = null as { id: string; github_user_id: number; github_login: string; avatar_url?: string } | null;
    
    const { data: exactMatch } = await admin
      .from('github_identities')
      .select('id, github_user_id, github_login, avatar_url')
      .eq('github_login', username)
      .maybeSingle();

    identity = exactMatch;

    // If not found, try case-insensitive search
    if (!identity) {
      const { data: caseInsensitiveMatch } = await admin
        .from('github_identities')
        .select('id, github_user_id, github_login, avatar_url')
        .ilike('github_login', username)
        .maybeSingle();
      
      identity = caseInsensitiveMatch;
    }

    // If still not found, list available developers for debugging
    if (!identity) {
      const { data: allIdentities } = await admin
        .from('github_identities')
        .select('github_login')
        .limit(50);
      
      const availableLogins = (allIdentities ?? []).map((i: any) => i.github_login);
      
      return NextResponse.json(
        { 
          error: 'Developer not found',
          requestedUsername: username,
          availableDevelopers: availableLogins,
        },
        { status: 404 },
      );
    }

    // Fetch all evaluations for this developer
    // github_author_id in pull_requests references github_identities.id (UUID)
    const { data: evaluations, error } = await admin
      .from('pr_evaluations')
      .select(`
        id,
        base_points,
        multiplier,
        final_score,
        is_eligible,
        created_at,
        raw_response,
        eligibility_issue,
        eligibility_fix_implementation,
        eligibility_pr_linked,
        eligibility_tests,
        justification_component,
        justification_severity,
        impact_summary,
        severity_levels (key, name, base_points),
        pull_requests!inner (
          id,
          number,
          title,
          url,
          additions,
          deletions,
          merged_at_gh,
          created_at_gh,
          github_author_id,
          repositories (full_name, name)
        )
      `)
      .eq('org_id', orgId)
      .eq('pull_requests.github_author_id', identity.id)
      .gte('pull_requests.merged_at_gh', since)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching developer data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch developer data' },
        { status: 500 },
      );
    }

    const evals = evaluations ?? [];
    const eligibleEvals = evals.filter((e: any) => e.is_eligible);

    // Summary stats
    const totalScore = eligibleEvals.reduce((sum: number, e: any) => sum + (e.final_score ?? 0), 0);
    const avgScore = eligibleEvals.length > 0 ? Math.round(totalScore / eligibleEvals.length) : 0;
    const eligibilityRate = evals.length > 0 ? Math.round((eligibleEvals.length / evals.length) * 100) : 0;

    // Severity breakdown
    const severityBreakdown = evals.reduce((acc: Record<string, { count: number; score: number }>, e: any) => {
      const severity = e.severity_levels?.key ?? 'Unknown';
      if (!acc[severity]) {
        acc[severity] = { count: 0, score: 0 };
      }
      acc[severity].count += 1;
      if (e.is_eligible) {
        acc[severity].score += e.final_score ?? 0;
      }
      return acc;
    }, {});

    // Component breakdown
    const componentBreakdown = evals.reduce((acc: Record<string, { count: number; score: number; name: string }>, e: any) => {
      const key = e.raw_response?.component_key ?? 'OTHER';
      const name = e.raw_response?.component_name ?? key;
      if (!acc[key]) {
        acc[key] = { count: 0, score: 0, name };
      }
      acc[key].count += 1;
      if (e.is_eligible) {
        acc[key].score += e.final_score ?? 0;
      }
      return acc;
    }, {});

    // Repository breakdown
    const repoBreakdown = evals.reduce((acc: Record<string, { count: number; score: number }>, e: any) => {
      const repo = e.pull_requests?.repositories?.name ?? 'Unknown';
      if (!acc[repo]) {
        acc[repo] = { count: 0, score: 0 };
      }
      acc[repo].count += 1;
      if (e.is_eligible) {
        acc[repo].score += e.final_score ?? 0;
      }
      return acc;
    }, {});

    // Weekly score trend
    const weeklyData = evals.reduce((acc: Record<string, { score: number; prs: number; eligible: number }>, e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0]!;
      if (!acc[weekKey]) {
        acc[weekKey] = { score: 0, prs: 0, eligible: 0 };
      }
      acc[weekKey]!.prs += 1;
      if (e.is_eligible) {
        acc[weekKey]!.score += e.final_score ?? 0;
        acc[weekKey]!.eligible += 1;
      }
      return acc;
    }, {});

    const scoreTrend = Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        label: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...data,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12);

    // Eligibility breakdown (why PRs were ineligible)
    const eligibilityIssues = {
      missing_issue: evals.filter((e: any) => !e.eligibility_issue).length,
      missing_fix: evals.filter((e: any) => !e.eligibility_fix_implementation).length,
      missing_link: evals.filter((e: any) => !e.eligibility_pr_linked).length,
      missing_tests: evals.filter((e: any) => !e.eligibility_tests).length,
    };

    // Best PR
    const bestPr = eligibleEvals.length > 0
      ? eligibleEvals.reduce((max: any, e: any) => 
          (e.final_score ?? 0) > (max?.final_score ?? 0) ? e : max
        , null)
      : null;

    // Recent PRs
    const recentPrs = evals.slice(0, 15).map((e: any) => ({
      id: e.id,
      title: e.pull_requests?.title ?? 'Unknown PR',
      number: e.pull_requests?.number,
      url: e.pull_requests?.url,
      repo: e.pull_requests?.repositories?.name,
      component: e.raw_response?.component_name ?? 'Other',
      severity: e.severity_levels?.key ?? 'P3',
      score: e.final_score ?? 0,
      eligible: e.is_eligible ?? false,
      merged_at: e.pull_requests?.merged_at_gh,
      additions: e.pull_requests?.additions ?? 0,
      deletions: e.pull_requests?.deletions ?? 0,
      impact_summary: e.impact_summary,
      eligibility: {
        issue: e.eligibility_issue,
        fix: e.eligibility_fix_implementation,
        link: e.eligibility_pr_linked,
        tests: e.eligibility_tests,
      },
    }));

    // Code stats
    const totalAdditions = evals.reduce((sum: number, e: any) => sum + (e.pull_requests?.additions ?? 0), 0);
    const totalDeletions = evals.reduce((sum: number, e: any) => sum + (e.pull_requests?.deletions ?? 0), 0);
    const avgPrSize = evals.length > 0
      ? Math.round((totalAdditions + totalDeletions) / evals.length)
      : 0;

    // Rank calculation (fetch all developers for this org)
    const { data: allEvals } = await admin
      .from('pr_evaluations')
      .select(`
        final_score,
        is_eligible,
        pull_requests!inner (
          github_author_id,
          merged_at_gh
        )
      `)
      .eq('org_id', orgId)
      .gte('pull_requests.merged_at_gh', since);

    const allScores = (allEvals ?? []).reduce((acc: Record<string, number>, e: any) => {
      const authorId = e.pull_requests?.github_author_id;
      if (authorId && e.is_eligible) {
        acc[authorId] = (acc[authorId] ?? 0) + (e.final_score ?? 0);
      }
      return acc;
    }, {});

    const sortedScores = Object.entries(allScores)
      .sort((a, b) => b[1] - a[1]);
    
    const rank = sortedScores.findIndex(([id]) => id === identity.id) + 1;
    const totalDevs = sortedScores.length;

    // Calculate severity counts
    const p0Count = severityBreakdown['P0']?.count ?? 0;
    const p1Count = severityBreakdown['P1']?.count ?? 0;
    const p2Count = severityBreakdown['P2']?.count ?? 0;
    const p3Count = severityBreakdown['P3']?.count ?? 0;

    // Calculate component stats for title
    const componentEntries = Object.entries(componentBreakdown);
    const componentCount = componentEntries.length;
    const topComponentCount = componentEntries[0]?.[1]?.count ?? 0;
    const topComponentPercentage = evals.length > 0 
      ? Math.round((topComponentCount / evals.length) * 100) 
      : 0;

    // Calculate developer title
    const titleStats: DeveloperStats = {
      totalScore,
      totalPrs: evals.length,
      eligiblePrs: eligibleEvals.length,
      eligibilityRate,
      avgScore,
      rank: rank || totalDevs + 1,
      totalDevs,
      p0Count,
      p1Count,
      p2Count,
      p3Count,
      componentCount,
      topComponentPercentage,
      totalAdditions,
      totalDeletions,
      streak: 0, // TODO: Calculate streak from scoreTrend
    };

    const title = calculateDeveloperTitle(titleStats);
    const badges = calculateDeveloperBadges(titleStats);
    const flavorText = getTitleFlavorText(title);

    return NextResponse.json({
      developer: {
        username: identity.github_login,
        avatar_url: identity.avatar_url,
        github_user_id: identity.github_user_id,
      },
      title: {
        ...title,
        flavorText,
        badges,
      },
      summary: {
        totalScore,
        totalPrs: evals.length,
        eligiblePrs: eligibleEvals.length,
        avgScore,
        eligibilityRate,
        rank: rank || totalDevs + 1,
        totalDevs,
        totalAdditions,
        totalDeletions,
        avgPrSize,
      },
      bestPr: bestPr ? {
        title: bestPr.pull_requests?.title,
        number: bestPr.pull_requests?.number,
        url: bestPr.pull_requests?.url,
        score: bestPr.final_score,
        severity: bestPr.severity_levels?.key,
        component: bestPr.raw_response?.component_name,
      } : null,
      severityBreakdown: Object.entries(severityBreakdown)
        .map(([severity, data]) => ({ severity, ...data }))
        .sort((a, b) => {
          const order = ['P0', 'P1', 'P2', 'P3'];
          return order.indexOf(a.severity) - order.indexOf(b.severity);
        }),
      componentBreakdown: Object.entries(componentBreakdown)
        .map(([key, data]) => ({ key, ...data }))
        .sort((a, b) => b.score - a.score),
      repoBreakdown: Object.entries(repoBreakdown)
        .map(([repo, data]) => ({ repo, ...data }))
        .sort((a, b) => b.score - a.score),
      scoreTrend,
      eligibilityIssues,
      recentPrs,
      period: { days, since },
    });
  } catch (err) {
    console.error('Error in developer API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
