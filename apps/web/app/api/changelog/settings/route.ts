/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET - Fetch changelog settings for an organization
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

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

  // Fetch settings
  const { data: settings, error } = await admin
    .from('changelog_settings')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching changelog settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }

  return NextResponse.json({ settings });
}

// POST - Create or update changelog settings
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    orgId: string;
    showPrLinks?: boolean;
    showDates?: boolean;
    groupBy?: string;
    autoGenerate?: boolean;
    requireApproval?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, showPrLinks, showDates, groupBy, autoGenerate, requireApproval } = body;

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
    return NextResponse.json({ error: 'Only admins can update settings' }, { status: 403 });
  }

  // Build update object with only provided fields
  const updateData: Record<string, any> = {
    org_id: orgId,
    updated_at: new Date().toISOString(),
  };

  if (showPrLinks !== undefined) updateData.show_pr_links = showPrLinks;
  if (showDates !== undefined) updateData.show_dates = showDates;
  if (groupBy !== undefined) updateData.group_by = groupBy;
  if (autoGenerate !== undefined) updateData.auto_generate = autoGenerate;
  if (requireApproval !== undefined) updateData.require_approval = requireApproval;

  // Upsert settings
  const { data: settings, error } = await admin
    .from('changelog_settings')
    .upsert(updateData, { onConflict: 'org_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving changelog settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }

  return NextResponse.json({ settings });
}
