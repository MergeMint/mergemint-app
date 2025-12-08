/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export default async function EvaluatedPRsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();
  const { data: org, error } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (error) throw error;
  if (!org) redirect('/home/mergemint');

  const [{ data: components }, { data: severities }, { data: evaluations }] =
    await Promise.all([
      admin
        .from('product_components')
        .select('id, key, name')
        .eq('org_id', org.id),
      admin
        .from('severity_levels')
        .select('id, key')
        .eq('org_id', org.id),
      admin
        .from('pr_evaluations')
        .select(
          'id, pr_id, final_score, is_eligible, impact_summary, created_at, primary_component_id, severity_id, pull_requests!inner(number, title, url, merged_at_gh)',
        )
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

  const componentMap = new Map(components?.map((c) => [c.id, c]));
  const severityMap = new Map(severities?.map((s) => [s.id, s]));

  return (
    <div className={'space-y-6'}>
      <PageHeader
        title={`Evaluated PRs · ${org.name}`}
        description={'Latest MergeMint evaluations.'}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pull requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className={'text-right'}>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations?.map((row) => {
                const component = componentMap.get(row.primary_component_id!);
                const severity = severityMap.get(row.severity_id!);
                const pr = (row as any).pull_requests;

                return (
                  <TableRow key={row.id}>
                    <TableCell className={'font-medium'}>
                      <Link
                        href={`/${org.slug}/prs/${row.pr_id}`}
                        className={'hover:underline'}
                      >
                        #{pr?.number} · {pr?.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={'secondary'}>
                        {component?.key ?? 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{severity?.key ?? 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className={'text-right'}>
                      <Badge variant={row.is_eligible ? 'default' : 'outline'}>
                        {row.final_score ?? 0} pts
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!evaluations?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className={'text-center text-sm'}>
                    No evaluations found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
