/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token } = body;

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const admin = getSupabaseServerAdminClient<any>();

  try {
    // Find the invitation
    const { data: invitation, error: inviteError } = await admin
      .from('organization_invitations')
      .select('*, organizations(name, slug)')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await admin
        .from('organization_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    // Check if email matches (optional - can allow any authenticated user)
    if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const { data: existingMembership } = await admin
      .from('organization_members')
      .select('id')
      .eq('org_id', invitation.org_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMembership) {
      // Mark invitation as accepted anyway
      await admin
        .from('organization_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      return NextResponse.json({
        success: true,
        message: 'You are already a member of this organization',
        org: invitation.organizations,
      });
    }

    // Add user as member
    const { error: memberError } = await admin
      .from('organization_members')
      .insert({
        org_id: invitation.org_id,
        user_id: user.id,
        role: invitation.role,
      });

    if (memberError) {
      console.error('Failed to add member:', memberError);
      return NextResponse.json(
        { error: `Failed to join organization: ${memberError.message}` },
        { status: 400 }
      );
    }

    // Mark invitation as accepted
    await admin
      .from('organization_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the organization',
      org: invitation.organizations,
      role: invitation.role,
    });
  } catch (err) {
    console.error('Invitation acceptance error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// GET to verify invitation details (for the UI)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const admin = getSupabaseServerAdminClient<any>();

  const { data: invitation, error } = await admin
    .from('organization_invitations')
    .select('email, role, expires_at, status, organizations(name, slug)')
    .eq('token', token)
    .maybeSingle();

  if (error || !invitation) {
    return NextResponse.json(
      { error: 'Invalid invitation' },
      { status: 404 }
    );
  }

  if (invitation.status !== 'pending') {
    return NextResponse.json(
      { error: `This invitation has already been ${invitation.status}` },
      { status: 410 }
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'This invitation has expired' },
      { status: 410 }
    );
  }

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    org: invitation.organizations,
    expiresAt: invitation.expires_at,
  });
}

