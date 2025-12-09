/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// POST - Publish a changelog entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseServerAdminClient<any>();

  // Fetch the entry to get org_id and pr_id
  const { data: existing, error: fetchError } = await admin
    .from('changelog_entries')
    .select('org_id, is_draft, pr_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  // Verify user is admin of the org
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', existing.org_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can publish changelog entries' }, { status: 403 });
  }

  if (!existing.is_draft) {
    return NextResponse.json({ error: 'Entry is already published' }, { status: 400 });
  }

  // Get PR merged date if entry has a linked PR
  let publishedAt = new Date().toISOString();
  if (existing.pr_id) {
    const { data: pr } = await admin
      .from('pull_requests')
      .select('merged_at_gh')
      .eq('id', existing.pr_id)
      .maybeSingle();

    if (pr?.merged_at_gh) {
      publishedAt = pr.merged_at_gh;
    }
  }

  // Publish entry
  const { data: entry, error } = await admin
    .from('changelog_entries')
    .update({
      is_draft: false,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error publishing changelog entry:', error);
    return NextResponse.json({ error: 'Failed to publish entry' }, { status: 500 });
  }

  return NextResponse.json({ entry });
}
