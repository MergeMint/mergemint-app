import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { PageBody, PageHeader } from '@kit/ui/page';

import { DeveloperAnalytics } from './developer-analytics';

export const metadata = {
  title: 'Developer Analytics',
};

export default async function DeveloperPage({
  params,
  searchParams,
}: {
  params: { username: string };
  searchParams: { orgId?: string };
}) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const admin = getSupabaseServerAdminClient<any>();

  // Get orgId from query or user's first org
  let orgId = searchParams.orgId;
  
  if (!orgId) {
    const { data: membership } = await admin
      .from('organization_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      redirect('/home/onboarding');
    }
    orgId = membership.org_id;
  }

  return (
    <>
      <PageHeader
        title="Developer Analytics"
        description={`Performance metrics for @${params.username}`}
      />

      <PageBody>
        <DeveloperAnalytics username={params.username} orgId={orgId} />
      </PageBody>
    </>
  );
}

