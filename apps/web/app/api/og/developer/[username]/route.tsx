/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element, jsx-a11y/alt-text */
import { ImageResponse } from 'next/og';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { 
  calculateDeveloperTitle, 
  calculateDeveloperBadges,
  type DeveloperStats,
} from '~/lib/mergemint/developer-titles';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const username = params.username;

    if (!orgId || !username) {
      return new Response('Missing orgId or username', { status: 400 });
    }

    const admin = getSupabaseServerAdminClient<any>();
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 90);
    const since = sinceDate.toISOString();

    // Find the github identity
    const { data: identity } = await admin
      .from('github_identities')
      .select('id, github_user_id, github_login, avatar_url')
      .ilike('github_login', username)
      .maybeSingle();

    if (!identity) {
      return new Response('Developer not found', { status: 404 });
    }

    // Fetch evaluations for this developer
    const { data: evaluations } = await admin
      .from('pr_evaluations')
      .select(`
        final_score,
        is_eligible,
        raw_response,
        severity_levels (key),
        pull_requests!inner (
          github_author_id,
          merged_at_gh,
          additions,
          deletions
        )
      `)
      .eq('org_id', orgId)
      .eq('pull_requests.github_author_id', identity.id)
      .gte('pull_requests.merged_at_gh', since);

    const evals = evaluations ?? [];
    const eligibleEvals = evals.filter((e: any) => e.is_eligible);

    // Calculate stats
    const totalScore = eligibleEvals.reduce((sum: number, e: any) => sum + (e.final_score ?? 0), 0);
    const avgScore = eligibleEvals.length > 0 ? Math.round(totalScore / eligibleEvals.length) : 0;
    const eligibilityRate = evals.length > 0 ? Math.round((eligibleEvals.length / evals.length) * 100) : 0;

    // Severity counts
    const severityBreakdown = evals.reduce((acc: Record<string, number>, e: any) => {
      const severity = e.severity_levels?.key ?? 'Unknown';
      acc[severity] = (acc[severity] ?? 0) + 1;
      return acc;
    }, {});

    // Component counts
    const componentBreakdown = evals.reduce((acc: Record<string, number>, e: any) => {
      const key = e.raw_response?.component_key ?? 'OTHER';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const componentEntries = Object.entries(componentBreakdown);
    const componentCount = componentEntries.length;
    const topComponentCount = componentEntries.sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0;
    const topComponentPercentage = evals.length > 0 
      ? Math.round((topComponentCount / evals.length) * 100) 
      : 0;

    // Code stats
    const totalAdditions = evals.reduce((sum: number, e: any) => sum + (e.pull_requests?.additions ?? 0), 0);
    const totalDeletions = evals.reduce((sum: number, e: any) => sum + (e.pull_requests?.deletions ?? 0), 0);

    // Get rank
    const { data: allEvals } = await admin
      .from('pr_evaluations')
      .select(`final_score, is_eligible, pull_requests!inner (github_author_id, merged_at_gh)`)
      .eq('org_id', orgId)
      .gte('pull_requests.merged_at_gh', since);

    const allScores = (allEvals ?? []).reduce((acc: Record<string, number>, e: any) => {
      const authorId = e.pull_requests?.github_author_id;
      if (authorId && e.is_eligible) {
        acc[authorId] = (acc[authorId] ?? 0) + (e.final_score ?? 0);
      }
      return acc;
    }, {});

    const sortedScores = Object.entries(allScores).sort((a, b) => b[1] - a[1]);
    const rank = sortedScores.findIndex(([id]) => id === identity.id) + 1;
    const totalDevs = sortedScores.length;

    // Calculate title
    const titleStats: DeveloperStats = {
      totalScore,
      totalPrs: evals.length,
      eligiblePrs: eligibleEvals.length,
      eligibilityRate,
      avgScore,
      rank: rank || totalDevs + 1,
      totalDevs,
      p0Count: severityBreakdown['P0'] ?? 0,
      p1Count: severityBreakdown['P1'] ?? 0,
      p2Count: severityBreakdown['P2'] ?? 0,
      p3Count: severityBreakdown['P3'] ?? 0,
      componentCount,
      topComponentPercentage,
      totalAdditions,
      totalDeletions,
      streak: 0,
    };

    const title = calculateDeveloperTitle(titleStats);
    const badges = calculateDeveloperBadges(titleStats);

    // Rarity colors
    const defaultColors = { from: '#6b7280', to: '#4b5563', accent: '#9ca3af' };
    const rarityGradients: Record<string, { from: string; to: string; accent: string }> = {
      common: defaultColors,
      uncommon: { from: '#22c55e', to: '#16a34a', accent: '#4ade80' },
      rare: { from: '#3b82f6', to: '#2563eb', accent: '#60a5fa' },
      epic: { from: '#a855f7', to: '#9333ea', accent: '#c084fc' },
      legendary: { from: '#f59e0b', to: '#d97706', accent: '#fbbf24' },
    };

    const colors = rarityGradients[title.rarity] ?? defaultColors;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${colors.from}20 0%, ${colors.to}30 100%)`,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '24px',
              padding: '48px 64px',
              border: `3px solid ${colors.accent}`,
              boxShadow: `0 0 60px ${colors.accent}40`,
              maxWidth: '90%',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
              {/* Avatar */}
              <div
                style={{
                  display: 'flex',
                  width: '120px',
                  height: '120px',
                  borderRadius: '60px',
                  border: `4px solid ${colors.accent}`,
                  overflow: 'hidden',
                  boxShadow: `0 0 30px ${colors.accent}60`,
                }}
              >
                {identity.avatar_url ? (
                  <img
                    src={identity.avatar_url}
                    width={120}
                    height={120}
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      background: colors.from,
                      color: 'white',
                      fontSize: '48px',
                      fontWeight: 'bold',
                    }}
                  >
                    {username[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: colors.accent, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {title.rarity}
                  </span>
                  {rank <= 3 && (
                    <span style={{ color: rank === 1 ? '#fbbf24' : rank === 2 ? '#9ca3af' : '#d97706', fontSize: '16px' }}>
                      #{rank}
                    </span>
                  )}
                </div>
                <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
                  {identity.github_login}
                </span>
                <span style={{ color: colors.accent, fontSize: '42px', fontWeight: 'black', marginTop: '-4px' }}>
                  {title.icon} {title.title}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '18px' }}>
                  {title.subtitle}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: colors.accent, fontSize: '48px', fontWeight: 'black' }}>
                  {totalScore.toLocaleString()}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Total Score</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '48px', fontWeight: 'black' }}>
                  {eligibleEvals.length}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Eligible PRs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '48px', fontWeight: 'black' }}>
                  {avgScore}
                </span>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Avg Score</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: eligibilityRate >= 80 ? '#4ade80' : eligibilityRate >= 50 ? '#fbbf24' : '#f87171', fontSize: '48px', fontWeight: 'black' }}>
                  {eligibilityRate}%
                </span>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Eligibility</span>
              </div>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {badges.map((badge, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <span style={{ color: '#6b7280', fontSize: '16px' }}>
                mergemint.app
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (err) {
    console.error('Error generating OG image:', err);
    return new Response('Failed to generate image', { status: 500 });
  }
}

