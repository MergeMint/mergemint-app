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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ProgramStatusBadge } from './_components/program-status-badge';
import { DeleteProgramButton } from './_components/delete-program-button';

export default async function BountyAdminPage({
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

  // Fetch all programs using the view
  const { data: programs } = await admin
    .from('view_active_bounty_programs')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false });

  // Calculate summary stats
  const activePrograms = programs?.filter((p) => p.status === 'active') || [];
  const draftPrograms = programs?.filter((p) => p.status === 'draft') || [];
  const completedPrograms =
    programs?.filter((p) => p.status === 'completed') || [];

  const totalRewardsIssued =
    programs?.reduce((sum, p) => sum + (p.rewards_count || 0), 0) || 0;

  const totalPendingApprovals =
    programs?.reduce((sum, p) => sum + (p.pending_rewards_count || 0), 0) || 0;

  const totalPaidOut =
    programs
      ?.filter((p) => p.paid_rewards_count && p.paid_rewards_count > 0)
      .reduce((sum, p) => sum + (p.total_reward_amount || 0), 0) || 0;

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title="Bug Bounty Programs"
        description={'Manage reward programs for top-performing developers.'}
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      />

      {/* Summary Stats */}
      <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
        <Card>
          <CardHeader className={'pb-3'}>
            <CardDescription>Active Programs</CardDescription>
            <CardTitle className={'text-3xl'}>
              {activePrograms.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className={'pb-3'}>
            <CardDescription>Total Rewards Issued</CardDescription>
            <CardTitle className={'text-3xl'}>{totalRewardsIssued}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className={'pb-3'}>
            <CardDescription>Pending Approvals</CardDescription>
            <CardTitle className={'text-3xl'}>
              {totalPendingApprovals}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className={'pb-3'}>
            <CardDescription>Total Paid Out</CardDescription>
            <CardTitle className={'text-3xl'}>
              ${totalPaidOut.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Create New Program Button */}
      <div className={'flex justify-end'}>
        <Link href={`/${orgSlug}/admin/bounty/new`}>
          <Button>Create New Program</Button>
        </Link>
      </div>

      {/* Programs List with Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="draft">
            Draft ({draftPrograms.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activePrograms.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedPrograms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draft" className={'mt-4'}>
          <ProgramsTable programs={draftPrograms} orgSlug={orgSlug} />
        </TabsContent>

        <TabsContent value="active" className={'mt-4'}>
          <ProgramsTable programs={activePrograms} orgSlug={orgSlug} />
        </TabsContent>

        <TabsContent value="completed" className={'mt-4'}>
          <ProgramsTable programs={completedPrograms} orgSlug={orgSlug} />
        </TabsContent>
      </Tabs>
    </PageBody>
  );
}

function ProgramsTable({
  programs,
  orgSlug,
}: {
  programs: any[];
  orgSlug: string;
}) {
  if (!programs || programs.length === 0) {
    return (
      <Card>
        <CardContent className={'py-8 text-center text-sm text-muted-foreground'}>
          No programs found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className={'p-0'}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className={'text-right'}>Rewards</TableHead>
              <TableHead className={'text-right'}>Total Amount</TableHead>
              <TableHead className={'text-right'}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell className={'font-medium'}>
                  <Link
                    href={`/${orgSlug}/admin/bounty/${program.id}`}
                    className={'hover:underline'}
                  >
                    {program.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={'outline'}>
                    {program.program_type === 'ranking'
                      ? 'Ranking'
                      : 'Tier-based'}
                  </Badge>
                </TableCell>
                <TableCell className={'capitalize'}>
                  {program.period_type}
                </TableCell>
                <TableCell>
                  <ProgramStatusBadge status={program.status} />
                </TableCell>
                <TableCell className={'text-right'}>
                  {program.rewards_count || 0}
                </TableCell>
                <TableCell className={'text-right'}>
                  ${(program.total_reward_amount || 0).toFixed(2)}
                </TableCell>
                <TableCell className={'text-right space-x-2'}>
                  <Link href={`/${orgSlug}/admin/bounty/${program.id}`}>
                    <Button variant={'ghost'} size={'sm'}>
                      View
                    </Button>
                  </Link>
                  {program.status === 'draft' && (
                    <DeleteProgramButton
                      programId={program.id}
                      orgId={program.org_id}
                      orgSlug={orgSlug}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
