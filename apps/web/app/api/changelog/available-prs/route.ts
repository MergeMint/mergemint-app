/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET - List merged PRs that don't have changelog entries yet
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  const admin = getSupabaseServerAdminClient<any>();

  // Verify user is admin of the org
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Get existing PR IDs that already have changelog entries
  const { data: existingEntries } = await admin
    .from('changelog_entries')
    .select('pr_id')
    .eq('org_id', orgId)
    .not('pr_id', 'is', null);

  const existingPrIds = existingEntries?.map(e => e.pr_id) || [];

  // Build query for available PRs
  let query = admin
    .from('pull_requests')
    .select('id, number, title, merged_at_gh, additions, deletions', { count: 'exact' })
    .eq('org_id', orgId)
    .eq('is_merged', true)
    .order('merged_at_gh', { ascending: false })
    .range(offset, offset + limit - 1);

  if (existingPrIds.length > 0) {
    query = query.not('id', 'in', `(${existingPrIds.join(',')})`);
  }

  const { data: prs, count, error } = await query;

  if (error) {
    console.error('Error fetching available PRs:', error);
    return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 });
  }

  return NextResponse.json({
    prs: prs || [],
    total: count || 0,
    hasMore: (offset + limit) < (count || 0),
  });
}
