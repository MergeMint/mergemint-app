/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { MergeMintDashboard } from '~/home/_components/mergemint-dashboard';

interface DashboardPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgSlug } = await params;
  const admin = getSupabaseServerAdminClient<any>();

  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`PR analytics for ${org.name}`}
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      />

      <PageBody>
        <MergeMintDashboard orgId={org.id} orgName={org.name} />
      </PageBody>
    </>
  );
}
