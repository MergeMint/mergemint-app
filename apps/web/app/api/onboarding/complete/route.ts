/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { sendInvitationEmail, sendWelcomeEmail } from '~/lib/email/mailgun';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 40);
}

type InviteEntry = {
  email: string;
  role: 'admin' | 'pm' | 'developer' | 'viewer';
};

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseServerAdminClient<any>();

  let body: {
    displayName?: string;
    occupation?: string;
    orgName?: string;
    teamSize?: string;
    invites?: InviteEntry[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { displayName, occupation, orgName, teamSize, invites = [] } = body;

  if (!displayName?.trim()) {
    return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
  }

  // Check if user already has a membership (e.g., invited user)
  // If so, they should not be creating a new organization
  const { data: existingMembership } = await admin
    .from('organization_members')
    .select('id, org_id, organizations(name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    // User already belongs to an organization - just complete their profile
    // and redirect them to their existing org (don't create a new one)
    const existingOrg = existingMembership.organizations as unknown as { name: string; slug: string } | null;

    // Update profile with onboarding_completed_at
    await admin
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: displayName.trim(),
        occupation: occupation || null,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    // Update user metadata
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        onboarding_completed_at: new Date().toISOString(),
        display_name: displayName.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      alreadyMember: true,
      org: existingOrg ? {
        id: existingMembership.org_id,
        name: existingOrg.name,
        slug: existingOrg.slug,
      } : null,
      invitations: [],
    });
  }

  if (!orgName?.trim()) {
    return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
  }

  try {
    // 1. Update or create profile - check if exists first
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let profileError;
    if (existingProfile) {
      // Update existing profile
      const result = await admin
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          occupation: occupation || null,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      profileError = result.error;
    } else {
      // Insert new profile
      const result = await admin
        .from('profiles')
        .insert({
          id: user.id,
          display_name: displayName.trim(),
          occupation: occupation || null,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      profileError = result.error;
    }

    if (profileError) {
      console.error('Profile update/insert error:', profileError);
      return NextResponse.json(
        { error: `Failed to update profile: ${profileError.message}` },
        { status: 400 }
      );
    }

    // 1b. Update user metadata to mark onboarding as complete
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        onboarding_completed_at: new Date().toISOString(),
        display_name: displayName.trim(),
      },
    });

    // 2. Update or create account (upsert to handle case where account doesn't exist)
    const { error: accountError } = await admin
      .from('accounts')
      .upsert({
        id: user.id,
        name: displayName.trim(),
        email: user.email,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (accountError) {
      console.error('Account upsert error:', accountError);
      // Non-fatal, continue
    }

    // 3. Create organization
    const baseSlug = slugify(orgName);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: orgName.trim(),
        slug: uniqueSlug,
        team_size: teamSize || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (orgError || !org) {
      console.error('Organization create error:', orgError);
      return NextResponse.json(
        { error: `Failed to create organization: ${orgError?.message || 'Unknown error'}` },
        { status: 400 }
      );
    }

    // 4. Add user as admin member (use upsert since trigger may have already created it)
    const { error: memberError } = await admin
      .from('organization_members')
      .upsert({
        org_id: org.id,
        user_id: user.id,
        role: 'admin',
      }, {
        onConflict: 'org_id,user_id',
        ignoreDuplicates: true,
      });

    if (memberError) {
      console.error('Membership create error:', memberError);
      return NextResponse.json(
        { error: `Failed to create membership: ${memberError.message}` },
        { status: 400 }
      );
    }

    // 5. Create invitations and send emails
    const invitationResults: { email: string; status: string }[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mergemint.dev';

    if (invites.length > 0) {
      const validInvites = invites.filter(
        (inv) => inv.email?.includes('@') && ['admin', 'pm', 'developer', 'viewer'].includes(inv.role)
      );

      for (const invite of validInvites) {
        try {
          const { data: invitation, error: inviteError } = await admin
            .from('organization_invitations')
            .insert({
              org_id: org.id,
              email: invite.email.toLowerCase().trim(),
              role: invite.role,
              invited_by: user.id,
            })
            .select('token')
            .single();

          if (inviteError || !invitation) {
            console.error(`Invitation error for ${invite.email}:`, inviteError);
            invitationResults.push({ email: invite.email, status: 'failed' });
          } else {
            // Send invitation email
            const emailResult = await sendInvitationEmail({
              to: invite.email,
              inviterName: displayName.trim(),
              orgName: orgName.trim(),
              role: invite.role,
              inviteToken: invitation.token,
              baseUrl,
            });

            if (emailResult.success) {
              invitationResults.push({ email: invite.email, status: 'sent' });
            } else {
              console.error(`Email send error for ${invite.email}:`, emailResult.error);
              invitationResults.push({ email: invite.email, status: 'created_no_email' });
            }
          }
        } catch (err) {
          console.error(`Invitation exception for ${invite.email}:`, err);
          invitationResults.push({ email: invite.email, status: 'failed' });
        }
      }
    }

    // 6. Send welcome email to the user
    if (user.email) {
      await sendWelcomeEmail({
        to: user.email,
        name: displayName.trim(),
        orgName: orgName.trim(),
        baseUrl,
      }).catch((err) => {
        console.error('Failed to send welcome email:', err);
      });
    }

    return NextResponse.json({
      success: true,
      org: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
      invitations: invitationResults,
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during onboarding' },
      { status: 500 }
    );
  }
}

