/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET - Fetch product info for an organization
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

  // Fetch product info
  const { data: productInfo, error } = await admin
    .from('product_info')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product info:', error);
    return NextResponse.json({ error: 'Failed to fetch product info' }, { status: 500 });
  }

  return NextResponse.json({ productInfo });
}

// POST - Create or update product info
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    orgId: string;
    websiteUrl?: string;
    productName?: string;
    productDescription?: string;
    targetAudience?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, websiteUrl, productName, productDescription, targetAudience } = body;

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
    return NextResponse.json({ error: 'Only admins can update product info' }, { status: 403 });
  }

  // Upsert product info
  const { data: productInfo, error } = await admin
    .from('product_info')
    .upsert(
      {
        org_id: orgId,
        website_url: websiteUrl || null,
        product_name: productName || null,
        product_description: productDescription || null,
        target_audience: targetAudience || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving product info:', error);
    return NextResponse.json({ error: 'Failed to save product info' }, { status: 500 });
  }

  return NextResponse.json({ productInfo });
}
