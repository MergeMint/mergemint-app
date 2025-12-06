import { notFound, redirect } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export default async function PrDetailPage({
  params,
}: {
  params: { orgSlug: string; prId: string };
}) {
  const client = getSupabaseServerClient<any>();
  const { data: org, error } = await client
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', params.orgSlug)
    .maybeSingle();

  if (error) throw error;
  if (!org) redirect('/home/mergemint');

  const { data: pr } = await client
    .from('pull_requests')
    .select('*')
    .eq('org_id', org.id)
    .eq('id', params.prId)
    .maybeSingle();

  if (!pr) notFound();

  const { data: evaluation } = await client
    .from('pr_evaluations')
    .select('*')
    .eq('org_id', org.id)
    .eq('pr_id', pr.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: component } = evaluation?.primary_component_id
    ? await client
        .from('product_components')
        .select('name, key, description')
        .eq('id', evaluation.primary_component_id)
        .maybeSingle()
    : { data: null };

  const { data: severity } = evaluation?.severity_id
    ? await client
        .from('severity_levels')
        .select('name, key, base_points')
        .eq('id', evaluation.severity_id)
        .maybeSingle()
    : { data: null };

  const { data: files } = await client
    .from('pr_files')
    .select('filename, status')
    .eq('pr_id', pr.id);

  return (
    <div className={'space-y-6'}>
      <PageHeader
        title={`PR #${pr.number} · ${pr.title}`}
        description={pr.url ?? ''}
      />

      {evaluation ? (
        <Card>
          <CardHeader>
            <CardTitle>Score</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-3'}>
            <div className={'flex gap-3'}>
              <Badge variant={evaluation.is_eligible ? 'default' : 'outline'}>
                {evaluation.final_score ?? 0} pts
              </Badge>
              {component ? (
                <Badge variant={'secondary'}>
                  {component.key} · {component.name}
                </Badge>
              ) : null}
              {severity ? (
                <Badge>
                  {severity.key} ({severity.base_points} pts)
                </Badge>
              ) : null}
            </div>
            <div className={'text-sm text-muted-foreground'}>
              {evaluation.impact_summary ?? 'No summary provided.'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No evaluation found</CardTitle>
          </CardHeader>
        </Card>
      )}

      {evaluation ? (
        <Card>
          <CardHeader>
            <CardTitle>Eligibility</CardTitle>
          </CardHeader>
          <CardContent className={'space-y-2'}>
            <EligibilityRow
              label="Issue exists"
              value={evaluation.eligibility_issue}
            />
            <EligibilityRow
              label="Fix implemented"
              value={evaluation.eligibility_fix_implementation}
            />
            <EligibilityRow
              label="PR links to issue"
              value={evaluation.eligibility_pr_linked}
            />
            <EligibilityRow
              label="Tests included"
              value={evaluation.eligibility_tests}
            />
            <Separator />
            <div className={'text-sm text-muted-foreground'}>
              {evaluation.eligibility_notes}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent className={'space-y-1'}>
          {files?.map((file) => (
            <div
              key={file.filename}
              className={'flex items-center justify-between rounded-md border p-2 text-sm'}
            >
              <span>{file.filename}</span>
              <Badge variant={'secondary'}>{file.status ?? 'changed'}</Badge>
            </div>
          ))}
          {!files?.length ? (
            <p className={'text-sm text-muted-foreground'}>No files recorded.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function EligibilityRow({ label, value }: { label: string; value: boolean | null }) {
  return (
    <div className={'flex items-center justify-between rounded-md border p-2'}>
      <span>{label}</span>
      <Badge variant={value ? 'default' : 'destructive'}>
        {value ? 'Yes' : 'No'}
      </Badge>
    </div>
  );
}
