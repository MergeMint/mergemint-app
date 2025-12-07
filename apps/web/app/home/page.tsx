import { redirect } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { MergeMintDashboard } from '~/home/_components/mergemint-dashboard';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get user's first org
  const admin = getSupabaseServerAdminClient<any>();
  const { data: membership } = await admin
    .from('organization_members')
    .select('org_id, organizations(name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect('/home/onboarding');
  }

  const orgId = membership.org_id;
  const orgName = membership.organizations?.name ?? 'Your Organization';

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`PR analytics for ${orgName}`}
      />

      <PageBody>
        <MergeMintDashboard orgId={orgId} orgName={orgName} />
      </PageBody>
    </>
  );
}
