/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ProgramForm } from '../_components/program-form.client';

export default async function NewBountyProgramPage({
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

  // Verify user is admin
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) redirect('/auth/sign-in');

  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .maybeSingle();

  const isAdmin = membership?.role === 'admin';

  if (!isAdmin) {
    redirect(`/${orgSlug}/bounty`);
  }

  return (
    <PageBody className={'space-y-6'}>
      <PageHeader
        title="Create Bounty Program"
        description={'Set up a new bug bounty program to reward developers.'}
        breadcrumbs={
          <AppBreadcrumbs
            values={{
              [orgSlug]: org.name,
              'admin/bounty': 'Bounty Programs',
            }}
          />
        }
      />

      <ProgramForm orgId={org.id} orgSlug={orgSlug} />
    </PageBody>
  );
}
