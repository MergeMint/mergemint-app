/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';

import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { OnboardingClient } from './onboarding.client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export default async function OnboardingPage() {
  const user = await requireUserInServerComponent();

  const admin = getSupabaseServerAdminClient<any>();
  
  // Check if user has completed welcome onboarding
  const { data: profile } = await admin
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  // If user hasn't completed welcome onboarding, redirect to home to show the dialog
  if (!profile?.onboarding_completed_at) {
    redirect('/home');
  }

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

  // User should already have an org from welcome onboarding
  // If not, redirect back to home to fix
  if (!orgs.length) {
    redirect('/home');
  }

  const githubAppSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;

  return (
    <>
      <PageHeader
        title="Connect Your Repositories"
        description="Connect GitHub to start tracking your team's PR contributions."
      />
      <PageBody className={'space-y-4'}>
        <Card>
          <CardHeader>
            <CardTitle>GitHub Setup</CardTitle>
          <CardDescription>
            Connect GitHub, pick repositories, and define the components that matter most before we start syncing PRs.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <OnboardingClient 
              orgs={orgs} 
              githubAppSlug={githubAppSlug}
              connectedOrgs={connectionMap}
            />
        </CardContent>
      </Card>
    </PageBody>
  </>
);
}
