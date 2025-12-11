/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * POST /api/bounty/rewards/[id]/approve
 * Approve a reward for payout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rewardId } = await params;
    const body = await request.json();
    const { notes } = body;

    const client = getSupabaseServerClient<any>();

    // Verify user is authenticated
    const { data: authData } = await client.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get reward to verify access
    const { data: reward } = await client
      .from('bounty_rewards')
      .select('org_id')
      .eq('id', rewardId)
      .single();

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    }

    // Verify user is org admin
    const { data: membership } = await client
      .from('organization_members')
      .select('role')
      .eq('org_id', reward.org_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 },
      );
    }

    // Update reward status
    const { error } = await client
      .from('bounty_rewards')
      .update({
        payout_status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        payout_notes: notes,
      })
      .eq('id', rewardId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error approving reward:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
