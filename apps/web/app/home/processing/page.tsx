import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ProcessingClient } from './processing.client';

export const metadata = {
  title: 'Processing PRs - MergeMint',
};

export default async function ProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  const params = await searchParams;
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get orgId from search params or find the first org
  let orgId = params.orgId;
  let orgSlug = '';
  let orgName = '';

  const admin = getSupabaseServerAdminClient<any>();

  if (!orgId) {
    // Find the first org the user is a member of
    const { data: membership } = await admin
      .from('organization_members')
      .select('org_id, organizations(name, slug)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      redirect('/home/onboarding');
    }

    orgId = membership.org_id;
    orgSlug = membership.organizations?.slug ?? '';
    orgName = membership.organizations?.name ?? '';
  } else {
    const { data: org } = await admin
      .from('organizations')
      .select('name, slug')
      .eq('id', orgId)
      .maybeSingle();
    
    orgSlug = org?.slug ?? '';
    orgName = org?.name ?? '';
  }

  // Fetch components and severity levels
  const [{ data: components }, { data: severityLevels }] = await Promise.all([
    admin
      .from('product_components')
      .select('id, key, name, multiplier')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('sort_order'),
    admin
      .from('severity_levels')
      .select('id, key, name, base_points')
      .eq('org_id', orgId)
      .order('sort_order'),
  ]);

  // Check if GitHub is connected
  const { data: connection } = await admin
    .from('github_connections')
    .select('github_installation_id')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .maybeSingle();

  if (!connection?.github_installation_id) {
    redirect('/home/onboarding');
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <ProcessingClient
        orgId={orgId}
        orgSlug={orgSlug}
        orgName={orgName}
        components={components ?? []}
        severityLevels={severityLevels ?? []}
      />
    </div>
  );
}

