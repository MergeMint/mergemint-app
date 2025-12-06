import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';

import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { OnboardingClient } from './onboarding.client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export default async function OnboardingPage() {
  const user = await requireUserInServerComponent();

  const client = getSupabaseServerClient<any>();
  const { data } = await client
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
            <OnboardingClient orgs={orgs ?? []} githubAppSlug={githubAppSlug} />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
