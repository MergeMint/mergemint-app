/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ProgramCard } from './_components/program-card';
import { MyRewards } from './_components/my-rewards';

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
  if (!org) redirect('/home/mergemint');

  // Verify user is org member
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) redirect('/auth/sign-in');

  const { data: membership } = await client
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!membership) {
    redirect(`/home`);
  }

  // Get user's GitHub identity
  const { data: githubIdentity } = await admin
    .from('github_identities')
    .select('id, github_login')
    .eq('user_id', userId)
    .maybeSingle();

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
      />

      {!githubIdentity && (
        <Card className={'border-warning bg-warning/5'}>
          <CardContent className={'py-4'}>
            <p className={'text-sm text-warning-foreground'}>
              You don't have a GitHub account linked yet. Connect your GitHub
              account to participate in bounty programs.
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
          <CardContent className={'py-12 text-center text-muted-foreground'}>
            No active bounty programs at this time.
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
