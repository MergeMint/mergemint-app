/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { columns, type PREvaluation } from './_components/columns';
import { PRsDataTable } from './_components/prs-data-table';

export default async function EvaluatedPRsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
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
        .order('created_at', { ascending: false }),
    ]);

  const componentMap = new Map(components?.map((c) => [c.id, c]));
  const severityMap = new Map(severities?.map((s) => [s.id, s]));

  // Transform data for the table
  const tableData: PREvaluation[] =
    evaluations?.map((row) => {
      const pr = (row as any).pull_requests;
      const component = componentMap.get(row.primary_component_id!);
      const severity = severityMap.get(row.severity_id!);

      return {
        id: row.id,
        pr_id: row.pr_id,
        final_score: row.final_score,
        is_eligible: row.is_eligible,
        impact_summary: row.impact_summary,
        created_at: row.created_at,
        merged_at: pr?.merged_at_gh ?? null,
        pr_number: pr?.number ?? 0,
        pr_title: pr?.title ?? 'Unknown',
        pr_url: pr?.url ?? null,
        component_key: component?.key ?? null,
        severity_key: severity?.key ?? null,
        org_slug: org.slug,
      };
    }) ?? [];

  return (
    <PageBody className="space-y-6">
      <PageHeader
        title="Pull Requests"
        description={`View and track MergeMint evaluations for ${org.name}.`}
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pull Requests</CardTitle>
            <span className="text-muted-foreground text-sm">
              {tableData.length} evaluation{tableData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <PRsDataTable columns={columns} data={tableData} />
        </CardContent>
      </Card>
    </PageBody>
  );
}
