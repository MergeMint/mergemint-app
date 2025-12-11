/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
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

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();
  const { data: org, error } = await admin
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (error) throw error;
  if (!org) redirect('/home/mergemint');

  const { data: leaderboard } = await admin
    .from('view_leaderboard_last_30_days')
    .select('*')
    .eq('org_id', org.id)
    .order('total_score', { ascending: false });

  // Fetch active bounty programs
  const { data: activeBountyPrograms } = await admin
    .from('bounty_programs')
    .select('id, name, program_type, end_date')
    .eq('org_id', org.id)
    .eq('status', 'active')
    .order('end_date', { ascending: true });

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title="Leaderboard"
        description={'Top contributors over the last 30 days.'}
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      />

      {/* Active Bounty Programs Notice */}
      {activeBountyPrograms && activeBountyPrograms.length > 0 && (
        <Card className={'border-primary bg-primary/5'}>
          <CardHeader className={'pb-3'}>
            <div className={'flex items-center justify-between'}>
              <div>
                <CardTitle className={'text-lg'}>
                  🏆 Active Bug Bounty Programs
                </CardTitle>
                <p className={'text-sm text-muted-foreground mt-1'}>
                  {activeBountyPrograms.length} active program
                  {activeBountyPrograms.length > 1 ? 's' : ''} with rewards!
                </p>
              </div>
              <Link href={`/${orgSlug}/bounty`}>
                <Button>View Programs</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className={'flex flex-wrap gap-2'}>
              {activeBountyPrograms.map((program: any) => (
                <Badge key={program.id} variant={'secondary'}>
                  {program.name} • Ends{' '}
                  {new Date(program.end_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Developer</TableHead>
                <TableHead className={'text-right'}>Score</TableHead>
                <TableHead className={'text-right'}>PRs</TableHead>
                <TableHead className={'text-right'}>P0</TableHead>
                <TableHead className={'text-right'}>P1</TableHead>
                <TableHead className={'text-right'}>P2</TableHead>
                <TableHead className={'text-right'}>P3</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard?.map((row: any, idx: number) => (
                <TableRow key={`${row.github_login}-${idx}`}>
                  <TableCell className={'font-medium'}>
                    {row.github_login ?? 'Unknown'}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {row.total_score?.toFixed?.(0) ?? 0}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {row.pr_count ?? 0}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {row.p0_count ?? 0}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {row.p1_count ?? 0}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {row.p2_count ?? 0}
                  </TableCell>
                  <TableCell className={'text-right'}>
                    {row.p3_count ?? 0}
                  </TableCell>
                </TableRow>
              ))}
              {!leaderboard?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className={'text-center text-sm'}>
                    No evaluations yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageBody>
  );
}
