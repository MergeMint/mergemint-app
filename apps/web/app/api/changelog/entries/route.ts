/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET - List changelog entries for an organization
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  const status = searchParams.get('status'); // 'draft', 'published', 'all'
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  const admin = getSupabaseServerAdminClient<any>();

  // Verify user is member of the org
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
  }

  // Build query
  let query = admin
    .from('changelog_entries')
    .select('*, pull_requests(number, title, github_pr_id)', { count: 'exact' })
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (status === 'draft') {
    query = query.eq('is_draft', true);
  } else if (status === 'published') {
    query = query.eq('is_draft', false);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data: entries, count, error } = await query;

  if (error) {
    console.error('Error fetching changelog entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }

  return NextResponse.json({ entries, total: count });
}

// POST - Create a new changelog entry
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    orgId: string;
    title: string;
    description: string;
    category?: 'new_feature' | 'improvement' | 'bug_fix' | 'breaking_change';
    prId?: string;
    version?: string;
    isDraft?: boolean;
    generatedByLlm?: boolean;
    rawLlmResponse?: object;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    orgId,
    title,
    description,
    category = 'improvement',
    prId,
    version,
    isDraft = true,
    generatedByLlm = false,
    rawLlmResponse,
  } = body;

  if (!orgId || !title || !description) {
    return NextResponse.json(
      { error: 'orgId, title, and description are required' },
      { status: 400 }
    );
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
    return NextResponse.json({ error: 'Only admins can create changelog entries' }, { status: 403 });
  }

  // Create entry
  const { data: entry, error } = await admin
    .from('changelog_entries')
    .insert({
      org_id: orgId,
      title,
      description,
      category,
      pr_id: prId || null,
      version: version || null,
      is_draft: isDraft,
      published_at: isDraft ? null : new Date().toISOString(),
      generated_by_llm: generatedByLlm,
      raw_llm_response: rawLlmResponse || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating changelog entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }

  return NextResponse.json({ entry });
}
