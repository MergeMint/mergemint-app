/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';

import Link from 'next/link';
import { Plus, Settings } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ProgramCard } from './_components/program-card';
import { MyRewards } from './_components/my-rewards';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';

export default async function BountyPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) notFound();

  // Get current user and their GitHub login from auth metadata
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;

  // Find GitHub provider identity
  const githubProvider = (user?.identities as any[])?.find(
    (i) => i.provider === 'github',
  );

  // Get GitHub login - prefer from GitHub identity, fallback to user_metadata
  const userGithubLogin =
    githubProvider?.identity_data?.user_name ||
    githubProvider?.identity_data?.preferred_username ||
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username;

  // Get GitHub user ID (numeric ID used by GitHub API)
  const githubUserId = githubProvider?.provider_id || githubProvider?.id;

  // Get user's GitHub identity by their GitHub login
  // If not found, create one so the user can participate in bounty programs
  let githubIdentity = null;
  if (userGithubLogin) {
    const { data: existingIdentity } = await admin
      .from('github_identities')
      .select('id, github_login, linked_user_id')
      .ilike('github_login', userGithubLogin)
      .maybeSingle();

    if (existingIdentity) {
      githubIdentity = existingIdentity;
      // Also link the user if not already linked
      if (!existingIdentity.linked_user_id && user?.id) {
        await admin
          .from('github_identities')
          .update({ linked_user_id: user.id })
          .eq('id', existingIdentity.id);
      }
    } else if (githubUserId) {
      // Create the github_identities entry
      const { data: newIdentity } = await admin
        .from('github_identities')
        .insert({
          github_user_id: parseInt(githubUserId, 10),
          github_login: userGithubLogin,
          avatar_url: githubProvider?.identity_data?.avatar_url || user?.user_metadata?.avatar_url,
          linked_user_id: user?.id,
        })
        .select('id, github_login')
        .single();

      githubIdentity = newIdentity;
    }
  }

  // Fetch active and completed programs
  const { data: programs, error: programsError } = await admin
    .from('view_active_bounty_programs')
    .select('*')
    .eq('org_id', org.id)
    .in('status', ['active', 'completed'])
    .order('created_at', { ascending: false });

  if (programsError) {
    console.error('Error fetching bounty programs:', programsError);
    // If view doesn't exist, show empty state instead of crashing
  }

  // Check if user is an admin
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user?.id)
    .maybeSingle();

  const isAdmin = membership?.role === 'admin';

  // Fetch user's rewards (if they have a GitHub identity)
  const { data: myRewards } = githubIdentity
    ? await admin
        .from('bounty_rewards')
        .select(
          `
        *,
        bounty_programs!inner(name, start_date, end_date)
      `,
        )
        .eq('org_id', org.id)
        .eq('github_user_id', githubIdentity.id)
        .order('created_at', { ascending: false })
    : { data: null };

  // Calculate user's current standing in active programs
  const userStandings = githubIdentity
    ? await Promise.all(
        (programs || [])
          .filter((p) => p.status === 'active')
          .map(async (program) => {
            try {
              // Calculate user's current score for this program
              const { data: userScore, error: scoreError } = await admin.rpc(
                'calculate_bounty_rewards',
                {
                  program_uuid: program.id,
                },
              );

              if (scoreError) {
                console.error('Error calculating rewards for program:', program.id, scoreError);
                return {
                  programId: program.id,
                  score: 0,
                  rank: undefined,
                  tier: undefined,
                  potentialReward: undefined,
                };
              }

              const userResult = (userScore as any[])?.find(
                (s: any) => s.github_user_id === githubIdentity.id,
              );

              return {
                programId: program.id,
                score: userResult?.final_score || 0,
                rank: userResult?.rank_position,
                tier: userResult?.tier_name,
                potentialReward: userResult?.reward_amount,
              };
            } catch (err) {
              console.error('Error calculating standings:', err);
              return {
                programId: program.id,
                score: 0,
                rank: undefined,
                tier: undefined,
                potentialReward: undefined,
              };
            }
          }),
      )
    : [];

  const standingsMap = Object.fromEntries(
    userStandings.map((s) => [s.programId, s]),
  );

  const activePrograms =
    programs?.filter((p) => p.status === 'active') || [];
  const completedPrograms =
    programs?.filter((p) => p.status === 'completed') || [];

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title="Bug Bounty Programs"
        description={'Active reward programs and your standings'}
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      >
        {isAdmin && (
          <Button asChild variant="outline">
            <Link href={`/${orgSlug}/admin/bounty`}>
              <Settings className={'mr-2 h-4 w-4'} />
              Manage Programs
            </Link>
          </Button>
        )}
      </PageHeader>

      {!githubIdentity && (
        <Card className={'border-warning bg-warning/5'}>
          <CardContent className={'py-4'}>
            <p className={'text-sm text-warning-foreground'}>
              {!userGithubLogin ? (
                <>
                  You're not signed in with GitHub. Sign in with your GitHub
                  account to participate in bounty programs.
                </>
              ) : (
                <>
                  Your GitHub account (@{userGithubLogin}) hasn't authored any
                  PRs in this organization yet. Submit a PR to appear on the
                  leaderboard and participate in bounty programs.
                </>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Programs */}
      {activePrograms.length > 0 && (
        <div className={'space-y-4'}>
          <h2 className={'text-2xl font-bold'}>Active Programs</h2>
          <div className={'grid gap-4'}>
            {activePrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                userStanding={standingsMap[program.id]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Programs */}
      {completedPrograms.length > 0 && (
        <div className={'space-y-4'}>
          <h2 className={'text-2xl font-bold'}>Completed Programs</h2>
          <div className={'grid gap-4'}>
            {completedPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                userStanding={standingsMap[program.id]}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Programs */}
      {(!programs || programs.length === 0) && (
        <Card>
          <CardContent className={'py-12 text-center'}>
            <p className={'text-muted-foreground'}>
              No active bounty programs at this time.
            </p>
            {isAdmin && (
              <Button asChild className={'mt-4'}>
                <Link href={`/${orgSlug}/admin/bounty/new`}>
                  <Plus className={'mr-2 h-4 w-4'} />
                  Create Bounty Program
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Rewards */}
      {myRewards && myRewards.length > 0 && (
        <div className={'space-y-4'}>
          <h2 className={'text-2xl font-bold'}>My Rewards</h2>
          <MyRewards rewards={myRewards} />
        </div>
      )}
    </PageBody>
  );
}
