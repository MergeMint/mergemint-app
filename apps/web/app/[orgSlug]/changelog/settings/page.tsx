/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

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
import { Textarea } from '@kit/ui/textarea';
import { PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ChangelogSettingsClient } from './settings.client';

export default async function ChangelogSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();

  // Get current user
  const { data: userData } = await client.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    redirect('/auth/sign-in');
  }

  // Get organization
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) redirect('/home');

  // Check if user is admin
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership || membership.role !== 'admin') {
    redirect(`/${orgSlug}/changelog`);
  }

  // Fetch product info and settings
  const [{ data: productInfo }, { data: settings }] = await Promise.all([
    admin
      .from('product_info')
      .select('*')
      .eq('org_id', org.id)
      .maybeSingle(),
    admin
      .from('changelog_settings')
      .select('*')
      .eq('org_id', org.id)
      .maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Changelog Settings"
        description="Configure your product information and changelog display settings."
      />

      <ChangelogSettingsClient
        orgId={org.id}
        orgSlug={org.slug}
        initialProductInfo={productInfo}
        initialSettings={settings}
      />
    </div>
  );
}
