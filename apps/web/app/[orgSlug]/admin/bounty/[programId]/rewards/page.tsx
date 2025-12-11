/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { RewardActions } from '../../_components/reward-actions.client';

export default async function ProgramRewardsPage({
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

  const { data: membership } = await client
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
  const { data: program } = await admin
    .from('bounty_programs')
    .select('id, name, program_type')
    .eq('id', programId)
    .single();

  if (!program) redirect(`/${orgSlug}/admin/bounty`);

  // Fetch rewards with GitHub user details
  const { data: rewards } = await admin
    .from('bounty_rewards')
    .select(
      `
      *,
      github_identities (
        github_login,
        github_name,
        github_avatar_url
      )
    `,
    )
    .eq('program_id', programId)
    .order('final_score', { ascending: false });

  const getStatusBadge = (status: string) => {
    const variantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'secondary',
      approved: 'default',
      paid: 'outline',
      rejected: 'destructive',
    };

    return (
      <Badge variant={variantMap[status] || 'secondary'} className={'capitalize'}>
        {status}
      </Badge>
    );
  };

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title={`Rewards: ${program.name}`}
        description={'Manage payouts for this bounty program'}
        breadcrumbs={
          <AppBreadcrumbs
            values={{
              [orgSlug]: org.name,
              'admin/bounty': 'Bounty Programs',
              [programId]: program.name,
            }}
          />
        }
      />

      {!rewards || rewards.length === 0 ? (
        <Card>
          <CardContent className={'py-12 text-center'}>
            <p className={'text-muted-foreground'}>
              No rewards calculated yet. Go to the program details page to
              calculate rewards.
            </p>
            <Link
              href={`/${orgSlug}/admin/bounty/${programId}`}
              className={'text-primary hover:underline'}
            >
              Back to Program Details
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Developer Rewards ({rewards.length})</CardTitle>
            <CardDescription>
              Review and manage reward payouts
            </CardDescription>
          </CardHeader>
          <CardContent className={'p-0'}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Developer</TableHead>
                  <TableHead className={'text-right'}>Score</TableHead>
                  <TableHead className={'text-right'}>
                    {program.program_type === 'ranking' ? 'Rank' : 'Tier'}
                  </TableHead>
                  <TableHead className={'text-right'}>Reward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payout Details</TableHead>
                  <TableHead className={'text-right'}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward: any) => (
                  <TableRow key={reward.id}>
                    <TableCell className={'font-medium'}>
                      <div className={'flex items-center gap-2'}>
                        {reward.github_identities?.github_avatar_url && (
                          <img
                            src={reward.github_identities.github_avatar_url}
                            alt={reward.github_identities.github_login}
                            className={'w-6 h-6 rounded-full'}
                          />
                        )}
                        <span>
                          {reward.github_identities?.github_name ||
                            reward.github_identities?.github_login ||
                            'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={'text-right'}>
                      {reward.final_score?.toFixed(2) || 0}
                    </TableCell>
                    <TableCell className={'text-right'}>
                      {program.program_type === 'ranking' ? (
                        <Badge>#{reward.rank_position}</Badge>
                      ) : (
                        <Badge variant={'outline'}>{reward.tier_name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className={'text-right font-semibold'}>
                      {reward.reward_currency} {reward.reward_amount}
                    </TableCell>
                    <TableCell>{getStatusBadge(reward.payout_status)}</TableCell>
                    <TableCell>
                      {reward.payout_status === 'paid' && (
                        <div className={'text-sm'}>
                          <p className={'text-muted-foreground'}>
                            {reward.payout_method}
                          </p>
                          <p className={'text-muted-foreground'}>
                            Ref: {reward.payout_reference}
                          </p>
                        </div>
                      )}
                      {reward.payout_status === 'approved' && (
                        <p className={'text-sm text-muted-foreground'}>
                          Approved, pending payment
                        </p>
                      )}
                      {reward.payout_notes && (
                        <p className={'text-sm text-muted-foreground'}>
                          {reward.payout_notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className={'text-right'}>
                      <RewardActions
                        rewardId={reward.id}
                        orgId={org.id}
                        orgSlug={orgSlug}
                        currentStatus={reward.payout_status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageBody>
  );
}
