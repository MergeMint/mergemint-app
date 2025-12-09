/* eslint-disable @typescript-eslint/no-explicit-any */
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
      console.error('Error fetching PM dashboard data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch PM dashboard data' },
        { status: 500 },
      );
    }

    const evals = evaluations ?? [];
    const eligibleEvals = evals.filter((e: any) => e.is_eligible);

    // ============ TIME PERIOD CALCULATIONS ============
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastPeriodStart = new Date(sinceDate);
    lastPeriodStart.setDate(lastPeriodStart.getDate() - days);

    // ============ COMPONENT ANALYSIS ============

    // Component breakdown with detailed metrics
    const componentData = evals.reduce((acc: Record<string, any>, e: any) => {
      const key = e.raw_response?.component_key ?? 'OTHER';
      const name = e.raw_response?.component_name ?? key;
      const severity = e.severity_levels?.key ?? 'P3';
      const author = e.pull_requests?.github_identities?.github_login ?? 'unknown';

      if (!acc[key]) {
        acc[key] = {
          key,
          name,
          totalPrs: 0,
          eligiblePrs: 0,
          totalScore: 0,
          p0Count: 0,
          p1Count: 0,
          p2Count: 0,
          p3Count: 0,
          contributors: new Set(),
          additions: 0,
          deletions: 0,
          avgScore: 0,
          eligibilityRate: 0,
        };
      }

      acc[key].totalPrs += 1;
      acc[key].contributors.add(author);
      acc[key].additions += e.pull_requests?.additions ?? 0;
      acc[key].deletions += e.pull_requests?.deletions ?? 0;

      if (e.is_eligible) {
        acc[key].eligiblePrs += 1;
        acc[key].totalScore += e.final_score ?? 0;
      }

      if (severity === 'P0') acc[key].p0Count += 1;
      else if (severity === 'P1') acc[key].p1Count += 1;
      else if (severity === 'P2') acc[key].p2Count += 1;
      else if (severity === 'P3') acc[key].p3Count += 1;

      return acc;
    }, {});

    // Calculate derived metrics and convert Sets to counts
    const components = Object.values(componentData)
      .map((c: any) => ({
        ...c,
        contributorCount: c.contributors.size,
        contributors: undefined, // Remove the Set
        avgScore: c.eligiblePrs > 0 ? Math.round(c.totalScore / c.eligiblePrs) : 0,
        eligibilityRate: c.totalPrs > 0 ? Math.round((c.eligiblePrs / c.totalPrs) * 100) : 0,
        bugCount: c.p0Count + c.p1Count,
        linesChanged: c.additions + c.deletions,
      }))
      .sort((a: any, b: any) => b.totalPrs - a.totalPrs);

    // ============ BUG HOTSPOTS ============

    // Components with most bugs (P0 + P1)
    const bugHotspots = [...components]
      .filter((c: any) => c.bugCount > 0)
      .sort((a: any, b: any) => b.bugCount - a.bugCount)
      .slice(0, 10);

    // ============ SEVERITY TRENDS ============

    // Weekly severity breakdown
    const weeklyData: Record<string, any> = {};
    evals.forEach((e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0]!;
      const severity = e.severity_levels?.key ?? 'P3';

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { week: weekKey, P0: 0, P1: 0, P2: 0, P3: 0, total: 0 };
      }
      weeklyData[weekKey][severity] = (weeklyData[weekKey][severity] ?? 0) + 1;
      weeklyData[weekKey].total += 1;
    });

    const severityTrend = Object.values(weeklyData)
      .sort((a: any, b: any) => a.week.localeCompare(b.week))
      .slice(-8)
      .map((w: any) => ({
        ...w,
        label: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));

    // ============ COMPONENT TRENDS ============

    // Get top 5 components and track their activity over time
    const topComponentKeys = components.slice(0, 5).map((c: any) => c.key);
    const componentTrendData: Record<string, Record<string, number>> = {};

    evals.forEach((e: any) => {
      const componentKey = e.raw_response?.component_key ?? 'OTHER';
      if (!topComponentKeys.includes(componentKey)) return;

      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0]!;

      if (!componentTrendData[weekKey]) {
        componentTrendData[weekKey] = {};
      }
      componentTrendData[weekKey][componentKey] = (componentTrendData[weekKey][componentKey] ?? 0) + 1;
    });

    const componentTrend = Object.entries(componentTrendData)
      .map(([week, data]) => ({
        week,
        label: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...data,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);

    // ============ QUALITY METRICS ============

    // Overall quality metrics
    const totalPrs = evals.length;
    const eligiblePrs = eligibleEvals.length;
    const eligibilityRate = totalPrs > 0 ? Math.round((eligiblePrs / totalPrs) * 100) : 0;

    // Bug vs Feature ratio (P0/P1 = bugs, P2/P3 = features/improvements)
    const bugCount = evals.filter((e: any) => ['P0', 'P1'].includes(e.severity_levels?.key)).length;
    const featureCount = evals.filter((e: any) => ['P2', 'P3'].includes(e.severity_levels?.key)).length;
    const bugToFeatureRatio = featureCount > 0 ? (bugCount / featureCount).toFixed(2) : bugCount > 0 ? 'All bugs' : '0';

    // ============ AT-RISK COMPONENTS ============

    // Components that might need attention (high bugs + low eligibility)
    const atRiskComponents = [...components]
      .filter((c: any) => c.totalPrs >= 2) // At least 2 PRs to be considered
      .map((c: any) => ({
        ...c,
        riskScore: (c.bugCount * 2) + (100 - c.eligibilityRate), // Higher = more at risk
      }))
      .sort((a: any, b: any) => b.riskScore - a.riskScore)
      .slice(0, 5);

    // ============ KNOWLEDGE SILOS ============

    // Components with only 1 contributor (potential knowledge silos)
    const knowledgeSilos = components
      .filter((c: any) => c.contributorCount === 1 && c.totalPrs >= 2)
      .slice(0, 5);

    // ============ NEGLECTED AREAS ============

    // Components with low recent activity compared to historical
    // For now, just show components with least activity in period
    const neglectedComponents = [...components]
      .filter((c: any) => c.totalPrs > 0)
      .sort((a: any, b: any) => a.totalPrs - b.totalPrs)
      .slice(0, 5);

    // ============ DEVELOPMENT FOCUS ============

    // Feature vs Bug fix breakdown over time
    const focusTrend = Object.values(weeklyData)
      .sort((a: any, b: any) => a.week.localeCompare(b.week))
      .slice(-8)
      .map((w: any) => ({
        week: w.week,
        label: new Date(w.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bugs: w.P0 + w.P1,
        features: w.P2 + w.P3,
        total: w.total,
      }));

    // ============ CONTRIBUTOR DISTRIBUTION ============

    // How work is distributed across contributors
    const contributorWork = evals.reduce((acc: Record<string, any>, e: any) => {
      const author = e.pull_requests?.github_identities?.github_login ?? 'unknown';
      const avatar = e.pull_requests?.github_identities?.avatar_url;
      const component = e.raw_response?.component_key ?? 'OTHER';

      if (!acc[author]) {
        acc[author] = {
          author,
          avatar_url: avatar,
          prCount: 0,
          components: new Set(),
          score: 0,
        };
      }

      acc[author].prCount += 1;
      acc[author].components.add(component);
      if (e.is_eligible) {
        acc[author].score += e.final_score ?? 0;
      }

      return acc;
    }, {});

    const contributorDistribution = Object.values(contributorWork)
      .map((c: any) => ({
        ...c,
        componentCount: c.components.size,
        components: undefined,
      }))
      .sort((a: any, b: any) => b.prCount - a.prCount)
      .slice(0, 10);

    // ============ COMPONENT EXPERTS ============

    // Track who contributes most to each component
    const componentContributors: Record<string, Record<string, any>> = {};
    evals.forEach((e: any) => {
      const componentKey = e.raw_response?.component_key ?? 'OTHER';
      const componentName = e.raw_response?.component_name ?? componentKey;
      const author = e.pull_requests?.github_identities?.github_login ?? 'unknown';
      const avatar = e.pull_requests?.github_identities?.avatar_url;

      if (!componentContributors[componentKey]) {
        componentContributors[componentKey] = {};
      }
      if (!componentContributors[componentKey][author]) {
        componentContributors[componentKey][author] = {
          author,
          avatar_url: avatar,
          prCount: 0,
          score: 0,
          bugFixes: 0,
        };
      }

      componentContributors[componentKey][author].prCount += 1;
      if (e.is_eligible) {
        componentContributors[componentKey][author].score += e.final_score ?? 0;
      }
      if (['P0', 'P1'].includes(e.severity_levels?.key)) {
        componentContributors[componentKey][author].bugFixes += 1;
      }
    });

    // Build component experts list - top contributors per component
    const componentExperts = components.slice(0, 10).map((comp: any) => {
      const contributors = componentContributors[comp.key] ?? {};
      const sortedContributors = Object.values(contributors)
        .sort((a: any, b: any) => b.prCount - a.prCount)
        .slice(0, 3);

      const topContributor = sortedContributors[0] as any;
      const ownership = topContributor && comp.totalPrs > 0
        ? Math.round((topContributor.prCount / comp.totalPrs) * 100)
        : 0;

      return {
        componentKey: comp.key,
        componentName: comp.name,
        totalPrs: comp.totalPrs,
        topContributors: sortedContributors,
        primaryOwner: topContributor ?? null,
        ownershipPercent: ownership,
      };
    });

    // ============ RECENT HIGH-IMPACT PRs ============

    // PRs that fixed critical bugs
    const recentCriticalFixes = evals
      .filter((e: any) => ['P0', 'P1'].includes(e.severity_levels?.key))
      .slice(0, 10)
      .map((e: any) => ({
        id: e.id,
        title: e.pull_requests?.title ?? 'Unknown PR',
        number: e.pull_requests?.number,
        url: e.pull_requests?.url,
        repo: e.pull_requests?.repositories?.full_name,
        author: e.pull_requests?.github_identities?.github_login ?? 'unknown',
        avatar_url: e.pull_requests?.github_identities?.avatar_url,
        component: e.raw_response?.component_name ?? 'Other',
        componentKey: e.raw_response?.component_key ?? 'OTHER',
        severity: e.severity_levels?.key ?? 'P3',
        score: e.final_score ?? 0,
        mergedAt: e.pull_requests?.merged_at_gh,
      }));

    // ============ SUMMARY METRICS ============

    const totalScore = eligibleEvals.reduce((sum: number, e: any) => sum + (e.final_score ?? 0), 0);
    const uniqueContributors = new Set(evals.map((e: any) => e.pull_requests?.github_identities?.github_login).filter(Boolean));
    const uniqueComponents = new Set(evals.map((e: any) => e.raw_response?.component_key).filter(Boolean));

    // Calculate week-over-week changes
    const thisWeekEvals = evals.filter((e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      return date >= thisWeekStart;
    });
    const lastWeekEvals = evals.filter((e: any) => {
      const date = new Date(e.pull_requests?.merged_at_gh ?? e.created_at);
      return date >= lastWeekStart && date < thisWeekStart;
    });

    const thisWeekBugs = thisWeekEvals.filter((e: any) => ['P0', 'P1'].includes(e.severity_levels?.key)).length;
    const lastWeekBugs = lastWeekEvals.filter((e: any) => ['P0', 'P1'].includes(e.severity_levels?.key)).length;
    const bugChange = lastWeekBugs > 0
      ? Math.round(((thisWeekBugs - lastWeekBugs) / lastWeekBugs) * 100)
      : thisWeekBugs > 0 ? 100 : 0;

    return NextResponse.json({
      // Summary metrics
      summary: {
        totalPrs,
        eligiblePrs,
        eligibilityRate,
        totalScore,
        bugCount,
        featureCount,
        bugToFeatureRatio,
        activeContributors: uniqueContributors.size,
        activeComponents: uniqueComponents.size,
        thisWeekBugs,
        bugChange,
      },
      // Component data
      components,
      bugHotspots,
      atRiskComponents,
      knowledgeSilos,
      neglectedComponents,
      // Trends
      severityTrend,
      componentTrend,
      focusTrend,
      topComponentKeys: topComponentKeys.map(key => {
        const comp = components.find((c: any) => c.key === key);
        return { key, name: comp?.name ?? key };
      }),
      // Contributors
      contributorDistribution,
      componentExperts,
      // Recent activity
      recentCriticalFixes,
      // Meta
      period: { days, since },
    });
  } catch (err) {
    console.error('Error in PM dashboard API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
