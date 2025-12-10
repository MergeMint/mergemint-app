/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export default async function MePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const user = await requireUserInServerComponent();
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();
  const { data: org, error } = await admin
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (error) throw error;
  if (!org) redirect('/home/mergemint');

  const { data: identities } = await admin
    .from('github_identities')
    .select('id, github_login')
    .eq('linked_user_id', user.id);
  const identityIds = identities?.map((i) => i.id) ?? [];

  const { data: stats } = identityIds.length
    ? await admin
        .from('developer_daily_stats')
        .select('*')
        .eq('org_id', org.id)
        .in('github_user_id', identityIds)
        .order('date', { ascending: false })
        .limit(30)
    : { data: [] };

  const { data: prs } = identityIds.length
    ? await admin
        .from('pull_requests')
        .select('id, title, number, url, merged_at_gh')
        .eq('org_id', org.id)
        .in('github_author_id', identityIds)
        .order('merged_at_gh', { ascending: false })
        .limit(15)
    : { data: [] };

  const prIds = prs?.map((p) => p.id) ?? [];
  const { data: evaluations } = prIds.length
    ? await admin
        .from('pr_evaluations')
        .select(
          'pr_id, final_score, impact_summary, is_eligible, justification_severity, justification_component',
        )
        .eq('org_id', org.id)
        .in('pr_id', prIds)
    : { data: [] };

  const scoreTotal =
    stats?.reduce((acc, curr) => acc + (curr.total_score ?? 0), 0) ?? 0;

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title="My Performance"
        description={
          identities?.length
            ? `GitHub: ${identities.map((i) => i.github_login).join(', ')}`
            : 'Link your GitHub account to see stats.'
        }
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      />

      <div className={'grid gap-4 lg:grid-cols-3'}>
        <Card>
          <CardHeader>
            <CardTitle>Total score (30d)</CardTitle>
          </CardHeader>
          <CardContent className={'text-3xl font-semibold'}>
            {scoreTotal.toFixed(0)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PRs evaluated</CardTitle>
          </CardHeader>
          <CardContent className={'text-3xl font-semibold'}>
            {evaluations?.length ?? 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Days active</CardTitle>
          </CardHeader>
          <CardContent className={'text-3xl font-semibold'}>
            {new Set(stats?.map((s) => s.date)).size}
          </CardContent>
        </Card>
      </div>

      <div className={'grid gap-4 lg:grid-cols-2'}>
        <Card>
          <CardHeader>
            <CardTitle>Recent daily stats</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-3'}>
            {stats?.map((stat) => (
              <div
                key={stat.date + stat.github_user_id}
                className={'rounded-md border p-3'}
              >
                <div className={'flex items-center justify-between'}>
                  <div className={'font-medium'}>{stat.date}</div>
                  <Badge>{stat.total_score?.toFixed?.(0) ?? 0} pts</Badge>
                </div>
                <div className={'mt-1 text-sm text-muted-foreground'}>
                  PRs: {stat.pr_count ?? 0} • P0:{' '}
                  {stat.p0_count ?? 0} · P1:{stat.p1_count ?? 0} · P2:{' '}
                  {stat.p2_count ?? 0} · P3:{stat.p3_count ?? 0}
                </div>
              </div>
            ))}

            {!stats?.length ? (
              <p className={'text-sm text-muted-foreground'}>
                No stats yet. Link your GitHub identity and run evaluations.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent evaluated PRs</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-3'}>
            {prs?.map((pr) => {
              const evaluation = evaluations?.find((e) => e.pr_id === pr.id);
              return (
                <div
                  key={pr.id}
                  className={'rounded-md border p-3 space-y-1'}
                >
                  <div className={'flex items-center justify-between'}>
                    <a
                      className={'font-medium hover:underline'}
                      href={pr.url ?? '#'}
                      target={'_blank'}
                      rel={'noreferrer'}
                    >
                      #{pr.number} · {pr.title}
                    </a>
                    {evaluation ? (
                      <Badge variant={evaluation.is_eligible ? 'default' : 'outline'}>
                        {evaluation.final_score ?? 0} pts
                      </Badge>
                    ) : (
                      <Badge variant={'secondary'}>Pending</Badge>
                    )}
                  </div>
                  <div className={'text-sm text-muted-foreground'}>
                    {evaluation?.impact_summary ??
                      evaluation?.justification_component ??
                      'Waiting for evaluation.'}
                  </div>
                </div>
              );
            })}

            {!prs?.length ? (
              <p className={'text-sm text-muted-foreground'}>
                No pull requests found for your linked GitHub account.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageBody>
  );
}
