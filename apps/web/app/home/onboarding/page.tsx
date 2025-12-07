import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';

import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { OnboardingClient } from './onboarding.client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 40);
}

export default async function OnboardingPage() {
  const user = await requireUserInServerComponent();

  const admin = getSupabaseServerAdminClient<any>();
  const { data } = await admin
    .from('organization_members')
    .select('org_id, organizations(name, slug)')
    .eq('user_id', user.id);
  
  type OrgRow = { org_id: string; organizations: { name: string; slug: string } | null };
  const orgs: OrgRow[] = (data ?? []).map((row: any) => {
    const org =
      Array.isArray(row.organizations) && row.organizations.length > 0
        ? row.organizations[0]
        : row.organizations;
    return {
      org_id: String(row.org_id),
      organizations: org
        ? { name: String(org.name), slug: String(org.slug) }
        : null,
    };
  });

  // Find orgs that have GitHub connections and prioritize them
  const { data: connections } = await admin
    .from('github_connections')
    .select('org_id, github_installation_id')
    .eq('is_active', true);
  const connectedOrgIds = new Set((connections ?? []).map((c: any) => c.org_id));
  const connectionMap: Record<string, number> = {};
  (connections ?? []).forEach((c: any) => {
    connectionMap[c.org_id] = c.github_installation_id;
  });
  
  // Sort: orgs with github connections first
  orgs.sort((a, b) => {
    const aConnected = connectedOrgIds.has(a.org_id) ? 0 : 1;
    const bConnected = connectedOrgIds.has(b.org_id) ? 0 : 1;
    return aConnected - bConnected;
  });

  // Auto-create a personal org for first-time users
  let orgList = orgs;
  if (!orgList.length) {
    const baseName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email ??
      'My MergeMint Org';
    const baseSlug = slugify(baseName || 'mergemint');
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: createdOrg } = await admin
      .from('organizations')
      .insert({ name: baseName, slug: uniqueSlug })
      .select()
      .single();

    if (createdOrg) {
      await admin.from('organization_members').insert({
        org_id: createdOrg.id,
        user_id: user.id,
        role: 'admin',
      });

      orgList = [
        {
          org_id: createdOrg.id,
          organizations: { name: createdOrg.name, slug: createdOrg.slug },
        },
      ];
    }
  }

  const githubAppSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;

  return (
    <>
      <PageHeader
        title="MergeMint Onboarding"
        description="Connect GitHub, pick a repo, let MergeMint analyze your codebase, and define the components that matter most."
      />
      <PageBody className={'space-y-4'}>
        <Card>
          <CardHeader>
            <CardTitle>First-time setup</CardTitle>
          <CardDescription>
            Connect GitHub, pick repositories, and define the components that matter most before we start syncing PRs.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <OnboardingClient 
              orgs={orgList ?? []} 
              githubAppSlug={githubAppSlug}
              connectedOrgs={connectionMap}
            />
        </CardContent>
      </Card>
    </PageBody>
  </>
);
}
