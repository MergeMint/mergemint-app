/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ProgramStatusBadge } from '../_components/program-status-badge';
import { ProgramActions } from '../_components/program-actions.client';

export default async function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; programId: string }>;
}) {
  const { orgSlug, programId } = await params;
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) redirect('/home/mergemint');

  // Verify user is admin
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) redirect('/auth/sign-in');

  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .maybeSingle();

  const isAdmin = membership?.role === 'admin';

  if (!isAdmin) {
    redirect(`/${orgSlug}/bounty`);
  }

  // Fetch program details
  const { data: program, error: programError } = await admin
    .from('view_active_bounty_programs')
    .select('*')
    .eq('id', programId)
    .single();

  if (programError) throw programError;
  if (!program) redirect(`/${orgSlug}/admin/bounty`);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title={program.name}
        description={program.description || 'Bug bounty program details'}
        breadcrumbs={
          <AppBreadcrumbs
            values={{
              [orgSlug]: org.name,
              'admin/bounty': 'Bounty Programs',
            }}
          />
        }
      />

      <div className={'grid gap-6 lg:grid-cols-3'}>
        {/* Main Details */}
        <div className={'lg:col-span-2 space-y-6'}>
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div className={'grid gap-4 md:grid-cols-2'}>
                <div>
                  <p className={'text-sm text-muted-foreground'}>Status</p>
                  <ProgramStatusBadge status={program.status} />
                </div>
                <div>
                  <p className={'text-sm text-muted-foreground'}>Type</p>
                  <Badge variant={'outline'}>
                    {program.program_type === 'ranking'
                      ? 'Ranking'
                      : 'Tier-based'}
                  </Badge>
                </div>
                <div>
                  <p className={'text-sm text-muted-foreground'}>Period</p>
                  <p className={'font-medium capitalize'}>
                    {program.period_type}
                  </p>
                </div>
                <div>
                  <p className={'text-sm text-muted-foreground'}>
                    Auto Notify
                  </p>
                  <p className={'font-medium'}>
                    {program.auto_notify ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className={'grid gap-4 md:grid-cols-2'}>
                <div>
                  <p className={'text-sm text-muted-foreground'}>Start Date</p>
                  <p className={'font-medium'}>{formatDate(program.start_date)}</p>
                </div>
                <div>
                  <p className={'text-sm text-muted-foreground'}>End Date</p>
                  <p className={'font-medium'}>{formatDate(program.end_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Reward Structure</CardTitle>
            </CardHeader>
            <CardContent>
              {program.program_type === 'ranking' && (
                <div className={'space-y-2'}>
                  <p className={'text-sm font-medium'}>Ranking Rewards:</p>
                  <div className={'space-y-1'}>
                    {(program.ranking_rewards as any[])?.map((reward: any) => (
                      <div
                        key={reward.rank}
                        className={'flex justify-between items-center p-2 border rounded-md'}
                      >
                        <span className={'font-medium'}>Rank #{reward.rank}</span>
                        <Badge>
                          {reward.currency} {reward.amount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {program.program_type === 'tier' && (
                <div className={'space-y-2'}>
                  <p className={'text-sm font-medium'}>Tier Rewards:</p>
                  <div className={'space-y-1'}>
                    {(program.tier_rewards as any[])?.map((tier: any) => (
                      <div
                        key={tier.tier}
                        className={'space-y-1 p-3 border rounded-md'}
                      >
                        <div className={'flex justify-between items-center'}>
                          <span className={'font-medium'}>{tier.tier}</span>
                          <Badge>
                            {tier.currency} {tier.amount}
                          </Badge>
                        </div>
                        <p className={'text-sm text-muted-foreground'}>
                          Score: {tier.min_score}
                          {tier.max_score ? ` - ${tier.max_score}` : '+'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className={'space-y-6'}>
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className={'space-y-4'}>
              <div>
                <p className={'text-sm text-muted-foreground'}>
                  Total Rewards
                </p>
                <p className={'text-2xl font-bold'}>
                  {program.rewards_count || 0}
                </p>
              </div>
              <div>
                <p className={'text-sm text-muted-foreground'}>
                  Total Amount
                </p>
                <p className={'text-2xl font-bold'}>
                  ${(program.total_reward_amount || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className={'text-sm text-muted-foreground'}>Pending</p>
                <p className={'text-xl font-semibold'}>
                  {program.pending_rewards_count || 0}
                </p>
              </div>
              <div>
                <p className={'text-sm text-muted-foreground'}>Approved</p>
                <p className={'text-xl font-semibold'}>
                  {program.approved_rewards_count || 0}
                </p>
              </div>
              <div>
                <p className={'text-sm text-muted-foreground'}>Paid</p>
                <p className={'text-xl font-semibold'}>
                  {program.paid_rewards_count || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className={'space-y-2'}>
              <ProgramActions
                programId={programId}
                orgId={org.id}
                orgSlug={orgSlug}
                currentStatus={program.status}
                hasRewards={program.rewards_count > 0}
              />

              <Link href={`/${orgSlug}/admin/bounty/${programId}/rewards`}>
                <Button variant={'outline'} className={'w-full'}>
                  Manage Rewards
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageBody>
  );
}
