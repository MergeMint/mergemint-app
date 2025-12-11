/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * GET /api/bounty/programs/[id]/rewards
 * Get all rewards for a specific program
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: programId } = await params;
    const client = getSupabaseServerClient<any>();

    // Verify user is authenticated
    const { data: authData } = await client.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get program to verify access
    const { data: program } = await client
      .from('bounty_programs')
      .select('org_id')
      .eq('id', programId)
      .single();

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

    // Fetch rewards with GitHub user details
    const { data: rewards, error } = await client
      .from('bounty_rewards')
      .select(
        `
        *,
        github_identities (
          github_login,
          github_name,
          github_avatar_url
        )
      `,
      )
      .eq('program_id', programId)
      .order('final_score', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ rewards: rewards || [] });
  } catch (error: any) {
    console.error('Error fetching program rewards:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
