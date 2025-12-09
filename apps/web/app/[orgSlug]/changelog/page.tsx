/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { ChangelogDashboardClient } from './changelog.client';

export default async function ChangelogPage({
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

  // Check membership
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    redirect('/home');
  }

  const isAdmin = membership.role === 'admin';

  // Fetch changelog entries
  const { data: entries } = await admin
    .from('changelog_entries')
    .select(`
      *,
      pull_requests(number, title)
    `)
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch merged PRs that don't have changelog entries yet (for generation)
  const existingPrIds = entries?.filter(e => e.pr_id).map(e => e.pr_id) || [];

  let availablePrs: any[] = [];
  if (isAdmin) {
    const query = admin
      .from('pull_requests')
      .select('id, number, title, merged_at_gh, additions, deletions')
      .eq('org_id', org.id)
      .eq('is_merged', true)
      .order('merged_at_gh', { ascending: false })
      .limit(500);

    if (existingPrIds.length > 0) {
      query.not('id', 'in', `(${existingPrIds.join(',')})`);
    }

    const { data } = await query;
    availablePrs = data || [];
  }

  // Get stats
  const publishedCount = entries?.filter(e => !e.is_draft).length || 0;
  const draftCount = entries?.filter(e => e.is_draft).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Changelog"
        description="Manage user-friendly product updates generated from your PRs."
      >
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${orgSlug}/changelog/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/changelog/${orgSlug}`} target="_blank" rel="noopener">
                View Public Page
              </a>
            </Button>
          </div>
        )}
      </PageHeader>

      <ChangelogDashboardClient
        orgId={org.id}
        orgSlug={orgSlug}
        isAdmin={isAdmin}
        initialEntries={entries || []}
        availablePrs={availablePrs}
        stats={{ published: publishedCount, drafts: draftCount }}
      />
    </div>
  );
}
