/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * GET /api/bounty/programs/[id]
 * Get a single bounty program by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = getSupabaseServerClient<any>();

    // Verify user is authenticated
    const { data: authData } = await client.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch program with details
    const { data: program, error } = await client
      .from('view_active_bounty_programs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Verify user is org member
    const { data: membership } = await client
      .from('organization_members')
      .select('role')
      .eq('org_id', program.org_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ program });
  } catch (error: any) {
    console.error('Error fetching bounty program:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bounty/programs/[id]
 * Delete a bounty program (only if draft)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const client = getSupabaseServerClient<any>();

    // Verify user is authenticated
    const { data: authData } = await client.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch program to verify it exists and get org_id
    const { data: program } = await client
      .from('bounty_programs')
      .select('org_id, status')
      .eq('id', id)
      .single();

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Verify user is org admin
    const { data: membership } = await client
      .from('organization_members')
      .select('role')
      .eq('org_id', program.org_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    // Only allow deleting draft programs
    if (program.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft programs can be deleted' },
        { status: 400 },
      );
    }

    const { error } = await client
      .from('bounty_programs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bounty program:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
