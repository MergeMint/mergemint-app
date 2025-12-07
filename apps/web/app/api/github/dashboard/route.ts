import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const days = parseInt(searchParams.get('days') ?? '30', 10);

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    const admin = getSupabaseServerAdminClient<any>();
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const since = sinceDate.toISOString();

    // Fetch all evaluations with PR and author data
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
          repositories (full_name),
          github_identities (github_login, avatar_url)
        )
      `)
      .eq('org_id', orgId)
      .gte('pull_requests.merged_at_gh', since)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dashboard data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 },
      );
    }

    const evals = evaluations ?? [];
    const eligibleEvals = evals.filter((e: any) => e.is_eligible);

    // ============ HERO METRICS ============

    // This week's data
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekEvals = evals.filter((e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      return date >= thisWeekStart;
    });

    const lastWeekEvals = evals.filter((e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      return date >= lastWeekStart && date < thisWeekStart;
    });

    // Weekly MVP (top contributor this week)
    const weeklyScores = thisWeekEvals.reduce((acc: Record<string, any>, e: any) => {
      const author = e.pull_requests?.github_identities?.github_login ?? 'unknown';
      const avatar = e.pull_requests?.github_identities?.avatar_url;
      if (!acc[author]) {
        acc[author] = { author, avatar_url: avatar, score: 0, pr_count: 0 };
      }
      if (e.is_eligible) {
        acc[author].score += e.final_score ?? 0;
      }
      acc[author].pr_count += 1;
      return acc;
    }, {});

    const sortedWeekly = Object.values(weeklyScores).sort((a: any, b: any) => b.score - a.score);
    const thisWeekMvp = sortedWeekly[0] ?? null;

    // Last week's MVP (fallback when no activity this week)
    const lastWeekScores = lastWeekEvals.reduce((acc: Record<string, any>, e: any) => {
      const author = e.pull_requests?.github_identities?.github_login ?? 'unknown';
      const avatar = e.pull_requests?.github_identities?.avatar_url;
      if (!acc[author]) {
        acc[author] = { author, avatar_url: avatar, score: 0, pr_count: 0 };
      }
      if (e.is_eligible) {
        acc[author].score += e.final_score ?? 0;
      }
      acc[author].pr_count += 1;
      return acc;
    }, {});

    const sortedLastWeek = Object.values(lastWeekScores).sort((a: any, b: any) => b.score - a.score);
    const lastWeekMvp = sortedLastWeek[0] ?? null;

    // Use this week's MVP if available, otherwise fall back to last week
    const weeklyMvp = thisWeekMvp ?? lastWeekMvp;
    const isLastWeekMvp = !thisWeekMvp && !!lastWeekMvp;

    // Highest scoring PR
    const highestScoringPr = eligibleEvals.length > 0
      ? eligibleEvals.reduce((max: any, e: any) => 
          (e.final_score ?? 0) > (max?.final_score ?? 0) ? e : max
        , null)
      : null;

    // Week-over-week comparison
    const thisWeekScore = thisWeekEvals
      .filter((e: any) => e.is_eligible)
      .reduce((sum: number, e: any) => sum + (e.final_score ?? 0), 0);

    const lastWeekScore = lastWeekEvals
      .filter((e: any) => e.is_eligible)
      .reduce((sum: number, e: any) => sum + (e.final_score ?? 0), 0);

    const weekOverWeekChange = lastWeekScore > 0
      ? Math.round(((thisWeekScore - lastWeekScore) / lastWeekScore) * 100)
      : thisWeekScore > 0 ? 100 : 0;

    // Active contributors (unique devs who contributed)
    const uniqueContributors = new Set(
      evals.map((e: any) => e.pull_requests?.github_identities?.github_login).filter(Boolean)
    );

    // Critical bugs (P0 + P1)
    const criticalBugs = evals.filter((e: any) => 
      ['P0', 'P1'].includes(e.severity_levels?.key)
    ).length;

    const lastWeekCritical = lastWeekEvals.filter((e: any) => 
      ['P0', 'P1'].includes(e.severity_levels?.key)
    ).length;

    // Quality index (eligibility rate)
    const qualityIndex = evals.length > 0
      ? Math.round((eligibleEvals.length / evals.length) * 100)
      : 0;

    // Hottest component (most activity)
    const componentActivity = evals.reduce((acc: Record<string, number>, e: any) => {
      const component = e.raw_response?.component_name ?? 
        e.raw_response?.component_key ?? 
        'Other';
      acc[component] = (acc[component] ?? 0) + 1;
      return acc;
    }, {});

    const hottestComponent = Object.entries(componentActivity)
      .sort((a, b) => b[1] - a[1])[0];

    // Streak (consecutive days with eligible PRs)
    const prDates = eligibleEvals
      .map((e: any) => new Date(e.pull_requests?.merged_at_gh ?? e.created_at).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    let checkDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toDateString();
      if (prDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today hasn't had a PR yet, check from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // ============ CHARTS DATA ============

    // Daily scores for trend
    const dailyData = evals.reduce((acc: Record<string, { score: number; eligible: number; total: number }>, e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { score: 0, eligible: 0, total: 0 };
      }
      acc[date].total += 1;
      if (e.is_eligible) {
        acc[date].score += e.final_score ?? 0;
        acc[date].eligible += 1;
      }
      return acc;
    }, {});

    const scoreTrend = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        ...data,
        avg: data.eligible > 0 ? Math.round(data.score / data.eligible) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    // Weekly velocity
    const weeklyVelocity = evals.reduce((acc: Record<string, { total: number; eligible: number; score: number }>, e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!acc[weekKey]) {
        acc[weekKey] = { total: 0, eligible: 0, score: 0 };
      }
      acc[weekKey].total += 1;
      if (e.is_eligible) {
        acc[weekKey].eligible += 1;
        acc[weekKey].score += e.final_score ?? 0;
      }
      return acc;
    }, {});

    const velocityTrend = Object.entries(weeklyVelocity)
      .map(([week, data]) => ({
        week,
        label: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...data,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);

    // Severity distribution
    const severityCounts = evals.reduce((acc: Record<string, number>, e: any) => {
      const severity = e.severity_levels?.key ?? 'Unknown';
      acc[severity] = (acc[severity] ?? 0) + 1;
      return acc;
    }, {});

    // Component scores
    const componentScores = Object.entries(
      evals.reduce((acc: Record<string, { score: number; count: number; name: string }>, e: any) => {
        const key = e.raw_response?.component_key ?? 'OTHER';
        const name = e.raw_response?.component_name ?? key;
        if (!acc[key]) {
          acc[key] = { score: 0, count: 0, name };
        }
        acc[key].score += e.final_score ?? 0;
        acc[key].count += 1;
        return acc;
      }, {})
    ).map(([key, data]) => ({
      component: data.name,
      key,
      score: data.score,
      count: data.count,
    })).sort((a, b) => b.score - a.score);

    // Leaderboard
    const leaderboard = Object.values(
      evals.reduce((acc: Record<string, any>, e: any) => {
        const author = e.pull_requests?.github_identities?.github_login ?? 'unknown';
        const avatar = e.pull_requests?.github_identities?.avatar_url;
        if (!acc[author]) {
          acc[author] = {
            author,
            avatar_url: avatar,
            total_score: 0,
            pr_count: 0,
            eligible_count: 0,
            p0_count: 0,
            p1_count: 0,
            p2_count: 0,
            p3_count: 0,
            avg_score: 0,
          };
        }
        acc[author].pr_count += 1;
        if (e.is_eligible) {
          acc[author].total_score += e.final_score ?? 0;
          acc[author].eligible_count += 1;
        }
        const severity = e.severity_levels?.key;
        if (severity === 'P0') acc[author].p0_count += 1;
        else if (severity === 'P1') acc[author].p1_count += 1;
        else if (severity === 'P2') acc[author].p2_count += 1;
        else if (severity === 'P3') acc[author].p3_count += 1;
        return acc;
      }, {}),
    ).map((dev: any) => ({
      ...dev,
      avg_score: dev.eligible_count > 0 ? Math.round(dev.total_score / dev.eligible_count) : 0,
    })).sort((a: any, b: any) => b.total_score - a.total_score);

    // Top PRs (highest scoring)
    const topPrs = eligibleEvals
      .sort((a: any, b: any) => (b.final_score ?? 0) - (a.final_score ?? 0))
      .slice(0, 5)
      .map((e: any) => ({
        id: e.id,
        title: e.pull_requests?.title ?? 'Unknown PR',
        number: e.pull_requests?.number,
        url: e.pull_requests?.url,
        repo: e.pull_requests?.repositories?.full_name,
        author: e.pull_requests?.github_identities?.github_login ?? 'unknown',
        avatar_url: e.pull_requests?.github_identities?.avatar_url,
        component: e.raw_response?.component_name ?? 'Other',
        severity: e.severity_levels?.key ?? 'P3',
        score: e.final_score ?? 0,
        merged_at: e.pull_requests?.merged_at_gh,
      }));

    // Recent evaluations
    const recentEvaluations = evals.slice(0, 10).map((e: any) => ({
      id: e.id,
      title: e.pull_requests?.title ?? 'Unknown PR',
      number: e.pull_requests?.number,
      url: e.pull_requests?.url,
      repo: e.pull_requests?.repositories?.full_name,
      author: e.pull_requests?.github_identities?.github_login ?? 'unknown',
      avatar_url: e.pull_requests?.github_identities?.avatar_url,
      component: e.raw_response?.component_key ?? 'OTHER',
      component_name: e.raw_response?.component_name ?? 'Other',
      severity: e.severity_levels?.key ?? 'P3',
      score: e.final_score ?? 0,
      eligible: e.is_eligible ?? false,
      merged_at: e.pull_requests?.merged_at_gh,
      additions: e.pull_requests?.additions ?? 0,
      deletions: e.pull_requests?.deletions ?? 0,
    }));

    // Contributors trend (new vs returning)
    const contributorsByWeek = Object.entries(weeklyVelocity).reduce((acc: Record<string, Set<string>>, [week]) => {
      acc[week] = new Set();
      return acc;
    }, {});

    evals.forEach((e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      const author = e.pull_requests?.github_identities?.github_login;
      if (author && contributorsByWeek[weekKey]) {
        contributorsByWeek[weekKey].add(author);
      }
    });

    const contributorTrend = Object.entries(contributorsByWeek)
      .map(([week, authors]) => ({
        week,
        label: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        contributors: authors.size,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);

    // Summary stats
    const totalScore = eligibleEvals.reduce((sum: number, e: any) => sum + (e.final_score ?? 0), 0);
    const avgScorePerPr = eligibleEvals.length > 0 ? Math.round(totalScore / eligibleEvals.length) : 0;
    const avgScorePerDev = uniqueContributors.size > 0 ? Math.round(totalScore / uniqueContributors.size) : 0;

    return NextResponse.json({
      // Hero metrics
      hero: {
        weeklyMvp,
        isLastWeekMvp,
        highestScoringPr: highestScoringPr ? {
          title: highestScoringPr.pull_requests?.title,
          number: highestScoringPr.pull_requests?.number,
          url: highestScoringPr.pull_requests?.url,
          author: highestScoringPr.pull_requests?.github_identities?.github_login,
          avatar_url: highestScoringPr.pull_requests?.github_identities?.avatar_url,
          score: highestScoringPr.final_score,
          severity: highestScoringPr.severity_levels?.key,
        } : null,
        thisWeekScore,
        weekOverWeekChange,
        criticalBugs,
        criticalBugsChange: criticalBugs - lastWeekCritical,
        qualityIndex,
        activeContributors: uniqueContributors.size,
        hottestComponent: hottestComponent ? { name: hottestComponent[0], count: hottestComponent[1] } : null,
        streak,
        totalScore,
        totalPrs: evals.length,
        eligiblePrs: eligibleEvals.length,
        avgScorePerPr,
        avgScorePerDev,
      },
      // Charts
      scoreTrend,
      velocityTrend,
      contributorTrend,
      severityCounts: Object.entries(severityCounts)
        .map(([severity, count]) => ({ severity, count }))
        .sort((a, b) => {
          const order = ['P0', 'P1', 'P2', 'P3'];
          return order.indexOf(a.severity) - order.indexOf(b.severity);
        }),
      componentScores,
      // Tables
      leaderboard: leaderboard.slice(0, 15),
      topPrs,
      recentEvaluations,
      // Meta
      period: { days, since },
    });
  } catch (err) {
    console.error('Error in dashboard API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
