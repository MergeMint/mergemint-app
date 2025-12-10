/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { PMDashboard } from '~/home/_components/pm-dashboard';

interface ProductPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
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
        title="Product Insights"
        description={`Component analytics and product health for ${org.name}`}
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      />

      <PageBody>
        <PMDashboard orgId={org.id} />
      </PageBody>
    </>
  );
}
