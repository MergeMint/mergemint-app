/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Separator } from '@kit/ui/separator';
import { Textarea } from '@kit/ui/textarea';
import { PageBody, PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  savePromptTemplateAction,
  saveSeverityAction,
  triggerEvaluationRunAction,
  triggerGithubSyncAction,
} from '~/lib/server/mergemint-actions';
import { AdminComponentsEditor } from './admin-components.client';

export default async function AdminPage({
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

  const [{ data: repoComponents }, { data: severities }, { data: ruleSet }] =
    await Promise.all([
      admin
        .from('repo_components')
        .select('*, repositories!inner(full_name)')
        .eq('org_id', org.id)
        .order('name', { ascending: true }),
      admin
        .from('severity_levels')
        .select('*')
        .eq('org_id', org.id)
        .order('sort_order', { ascending: true }),
      admin
        .from('scoring_rule_sets')
        .select('id, name')
        .eq('org_id', org.id)
        .order('is_default', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const { data: promptTemplate } = ruleSet
    ? await admin
        .from('prompt_templates')
        .select('*')
        .eq('rule_set_id', ruleSet.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: connection } = await admin
    .from('github_connections')
    .select('*')
    .eq('org_id', org.id)
    .maybeSingle();

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title={`Admin · ${org.name}`}
        description={
          'Configure scoring rules, prompts, and GitHub connection for this organization.'
        }
      />

      <div className={'grid gap-4 lg:grid-cols-2'}>
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
            <CardDescription>
              Repository components and their importance multipliers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminComponentsEditor
              orgId={org.id}
              initialComponents={(repoComponents || []).map((c: any) => ({
                id: c.id,
                repo_full_name: c.repositories?.full_name,
                repo_id: c.repo_id,
                key: c.key,
                name: c.name,
                importance: c.importance || 'normal',
                description: c.description || '',
                multiplier: c.multiplier,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Levels</CardTitle>
            <CardDescription>Base points per severity.</CardDescription>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div className={'space-y-2'}>
              {severities?.map((severity) => (
                <div
                  key={severity.id}
                  className={
                    'flex items-center justify-between rounded-md border p-3'
                  }
                >
                  <div>
                    <p className={'font-medium'}>
                      {severity.name}{' '}
                      <Badge variant={'secondary'}>{severity.key}</Badge>
                    </p>
                    <p className={'text-sm text-muted-foreground'}>
                      {severity.description ?? 'No description'}
                    </p>
                  </div>
                  <Badge>{severity.base_points} pts</Badge>
                </div>
              ))}
            </div>

            <Separator />
            <form action={saveSeverityAction} className={'space-y-3'}>
              <input type="hidden" name="orgId" value={org.id} />
              <input type="hidden" name="slug" value={org.slug} />
              <div className={'grid gap-2'}>
                <Label htmlFor="severity-key">Key</Label>
                <Input
                  id="severity-key"
                  name="key"
                  placeholder="P1"
                  required
                />
              </div>
              <div className={'grid gap-2'}>
                <Label htmlFor="severity-name">Name</Label>
                <Input
                  id="severity-name"
                  name="name"
                  placeholder="High"
                  required
                />
              </div>
              <div className={'grid gap-2'}>
                <Label htmlFor="severity-description">Description</Label>
                <Textarea
                  id="severity-description"
                  name="description"
                  placeholder="Describe the severity scope"
                />
              </div>
              <div className={'grid gap-2'}>
                <Label htmlFor="base_points">Base points</Label>
                <Input
                  id="base_points"
                  name="base_points"
                  type="number"
                  min={0}
                  defaultValue={10}
                  required
                />
              </div>
              <Button type="submit">Add / update severity</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className={'grid gap-4 lg:grid-cols-2'}>
        <Card>
          <CardHeader>
            <CardTitle>Prompt Template</CardTitle>
            <CardDescription>
              Controls the LLM evaluation output. Keep placeholders intact.
            </CardDescription>
          </CardHeader>
          <CardContent className={'space-y-3'}>
            {ruleSet ? (
              <form action={savePromptTemplateAction} className={'space-y-3'}>
                <input type="hidden" name="orgId" value={org.id} />
                <input type="hidden" name="ruleSetId" value={ruleSet.id} />
                <input type="hidden" name="slug" value={org.slug} />
                <Textarea
                  name="template"
                  defaultValue={promptTemplate?.template ?? ''}
                  rows={12}
                />
                <Button type="submit">Save template</Button>
              </form>
            ) : (
              <CardDescription>
                No rule set found. Create a scoring rule set in the database.
              </CardDescription>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation</CardTitle>
            <CardDescription>
              Trigger data syncs and evaluations or review GitHub connection
              metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div className={'flex gap-2'}>
              <form action={triggerGithubSyncAction}>
                <input type="hidden" name="orgId" value={org.id} />
                <input type="hidden" name="slug" value={org.slug} />
                <Button variant={'outline'}>Sync GitHub</Button>
              </form>
              <form action={triggerEvaluationRunAction}>
                <input type="hidden" name="orgId" value={org.id} />
                <input type="hidden" name="slug" value={org.slug} />
                <Button variant={'outline'}>Run evaluations</Button>
              </form>
            </div>
            <Separator />
            {connection ? (
              <div className={'space-y-2 text-sm'}>
                <p>
                  Installation: <strong>{connection.installation_type}</strong>
                </p>
                <p>GitHub org: {connection.github_org_name ?? 'N/A'}</p>
                <p>Token last 4: {connection.token_last_4 ?? 'N/A'}</p>
                <p className={'text-muted-foreground'}>
                  Raw tokens live in environment variables or Supabase secrets.
                </p>
              </div>
            ) : (
              <CardDescription>
                No GitHub connection stored. Insert a row in
                github_connections and set the token in your Vercel/Supabase
                secrets.
              </CardDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </PageBody>
  );
}
