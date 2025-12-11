/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * GET /api/bounty/programs
 * List all bounty programs for an organization
 * Query params: orgId (required), status (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    const status = searchParams.get('status');

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId is required' },
        { status: 400 },
      );
    }

    const client = getSupabaseServerClient<any>();

    // Verify user is org member
    const { data: authData } = await client.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: membership } = await client
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Fetch programs with details using the view
    let query = client
      .from('view_active_bounty_programs')
      .select('*')
      .eq('org_id', orgId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: programs, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json({ programs: programs || [] });
  } catch (error: any) {
    console.error('Error fetching bounty programs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
