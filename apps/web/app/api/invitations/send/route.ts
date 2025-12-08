/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { sendInvitationEmail } from '~/lib/email/mailgun';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    orgId: string;
    email?: string;
    role?: string;
    githubLogin?: string;
    avatarUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, email, role = 'member', githubLogin, avatarUrl } = body;

  // Either email or githubLogin is required
  if (!orgId || (!email && !githubLogin)) {
    return NextResponse.json(
      { error: 'orgId and either email or githubLogin are required' },
      { status: 400 }
    );
  }

  const admin = getSupabaseServerAdminClient<any>();

  // Check if user is an admin of the org
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can send invitations' },
      { status: 403 }
    );
  }

  // Check if already invited (pending) - check by email OR github login
  let existingInviteQuery = admin
    .from('organization_invitations')
    .select('id, token')
    .eq('org_id', orgId)
    .eq('status', 'pending');

  if (email) {
    existingInviteQuery = existingInviteQuery.eq('email', email.toLowerCase());
  } else if (githubLogin) {
    // Check metadata for github_login
    existingInviteQuery = existingInviteQuery.contains('metadata', { github_login: githubLogin });
  }

  const { data: existingInvite } = await existingInviteQuery.maybeSingle();

  if (existingInvite) {
    // Return the existing invite URL instead of error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const inviteUrl = `${baseUrl}/invite?token=${existingInvite.token}`;

    const { data: org } = await admin
      .from('organizations')
      .select('name, slug')
      .eq('id', orgId)
      .single();

    return NextResponse.json({
      success: true,
      existing: true,
      invitation: {
        id: existingInvite.id,
        inviteUrl,
        org,
      },
    });
  }

  // Create invitation
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry for GitHub-based invites

  // Use a placeholder email if only githubLogin provided
  const inviteEmail = email?.toLowerCase() || `${githubLogin}@github.placeholder`;

  const { data: invitation, error } = await admin
    .from('organization_invitations')
    .insert({
      org_id: orgId,
      email: inviteEmail,
      role,
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
      status: 'pending',
      metadata: {
        github_login: githubLogin || null,
        avatar_url: avatarUrl || null,
        invite_type: email ? 'email' : 'github',
      },
    })
    .select('id, token')
    .single();

  if (error) {
    console.error('Failed to create invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }

  // Get org details for the invite link
  const { data: org } = await admin
    .from('organizations')
    .select('name, slug')
    .eq('id', orgId)
    .single();

  // Generate invite URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const inviteUrl = `${baseUrl}/invite?token=${token}`;

  // Send invitation email if we have a real email address
  let emailSent = false;
  if (email && !email.includes('@github.placeholder')) {
    const inviterName = user.user_metadata?.name ||
                        user.user_metadata?.full_name ||
                        user.user_metadata?.user_name ||
                        user.email?.split('@')[0] ||
                        'Your team';

    const emailResult = await sendInvitationEmail({
      to: email,
      inviterName,
      orgName: org?.name || 'your organization',
      role,
      inviteToken: token,
      baseUrl,
    });

    emailSent = emailResult.success;
    if (!emailResult.success) {
      console.warn('Failed to send invitation email:', emailResult.error);
    }
  }

  return NextResponse.json({
    success: true,
    invitation: {
      id: invitation.id,
      inviteUrl,
      org: org,
      githubLogin,
      emailSent,
    },
  });
}

// GET to list pending invitations
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = request.nextUrl.searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  const admin = getSupabaseServerAdminClient<any>();

  // Check if user is a member of the org
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: 'Not a member of this organization' },
      { status: 403 }
    );
  }

  const { data: invitations, error } = await admin
    .from('organization_invitations')
    .select('id, email, role, status, created_at, expires_at, metadata')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }

  return NextResponse.json({ invitations });
}
