/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// POST - Unpublish a changelog entry (make it draft again)
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

  // Fetch the entry to get org_id
  const { data: existing, error: fetchError } = await admin
    .from('changelog_entries')
    .select('org_id, is_draft')
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
    return NextResponse.json({ error: 'Only admins can unpublish changelog entries' }, { status: 403 });
  }

  if (existing.is_draft) {
    return NextResponse.json({ error: 'Entry is already a draft' }, { status: 400 });
  }

  // Unpublish entry
  const { data: entry, error } = await admin
    .from('changelog_entries')
    .update({
      is_draft: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error unpublishing changelog entry:', error);
    return NextResponse.json({ error: 'Failed to unpublish entry' }, { status: 500 });
  }

  return NextResponse.json({ entry });
}
