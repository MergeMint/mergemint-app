/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { sendInvitationEmail } from '~/lib/email/mailgun';
import { InviteSubmitButton } from './invite-submit-button';

async function inviteMemberAction(formData: FormData) {
  'use server';

  try {
    const orgId = formData.get('orgId') as string;
    const orgName = formData.get('orgName') as string;
    const slug = formData.get('slug') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const inviterName = formData.get('inviterName') as string;

    if (!email?.includes('@') || !['admin', 'developer', 'pm', 'viewer'].includes(role)) {
      throw new Error('Invalid email or role');
    }

    const admin = getSupabaseServerAdminClient<any>();
    const client = getSupabaseServerClient<any>();
    const { data: userData } = await client.auth.getUser();

    // Create invitation
    const { data: invitation, error } = await admin
      .from('organization_invitations')
      .insert({
        org_id: orgId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: userData?.user?.id,
      })
      .select('token')
      .single();

    if (error) {
      console.error('Failed to create invitation:', error);
      throw new Error('Failed to create invitation: ' + error.message);
    }

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mergemint.dev';
    const emailResult = await sendInvitationEmail({
      to: email,
      inviterName: inviterName || 'A team member',
      orgName,
      role,
      inviteToken: invitation.token,
      baseUrl,
    });

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      throw new Error('Failed to send invitation email: ' + emailResult.error);
    }

    revalidatePath(`/${slug}/members`);
  } catch (error) {
    console.error('Error in inviteMemberAction:', error);
    throw error;
  }
}

async function updateMemberRoleAction(formData: FormData) {
  'use server';
  
  const memberId = formData.get('memberId') as string;
  const role = formData.get('role') as string;
  const slug = formData.get('slug') as string;

  const admin = getSupabaseServerAdminClient<any>();
  
  const { error } = await admin
    .from('organization_members')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', memberId);

  if (error) {
    console.error('Failed to update member role:', error);
    throw new Error('Failed to update member role');
  }

  revalidatePath(`/${slug}/members`);
}

async function removeMemberAction(formData: FormData) {
  'use server';
  
  const memberId = formData.get('memberId') as string;
  const slug = formData.get('slug') as string;

  const admin = getSupabaseServerAdminClient<any>();
  
  const { error } = await admin
    .from('organization_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Failed to remove member:', error);
    throw new Error('Failed to remove member');
  }

  revalidatePath(`/${slug}/members`);
}

async function cancelInvitationAction(formData: FormData) {
  'use server';

  const invitationId = formData.get('invitationId') as string;
  const slug = formData.get('slug') as string;

  const admin = getSupabaseServerAdminClient<any>();

  // Delete the invitation instead of updating status to avoid unique constraint issues
  // (org_id, email, status) - can't have multiple cancelled invites for same email
  const { error } = await admin
    .from('organization_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) {
    console.error('Failed to cancel invitation:', error);
    throw new Error('Failed to cancel invitation');
  }

  revalidatePath(`/${slug}/members`);
}

async function resendInvitationAction(formData: FormData) {
  'use server';

  try {
    const invitationId = formData.get('invitationId') as string;
    const slug = formData.get('slug') as string;
    const orgName = formData.get('orgName') as string;
    const inviterName = formData.get('inviterName') as string;

    const admin = getSupabaseServerAdminClient<any>();

    // Get invitation details
    const { data: invitation, error } = await admin
      .from('organization_invitations')
      .select('email, role, token')
      .eq('id', invitationId)
      .single();

    if (error || !invitation) {
      throw new Error('Invitation not found');
    }

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mergemint.dev';
    const emailResult = await sendInvitationEmail({
      to: invitation.email,
      inviterName: inviterName || 'A team member',
      orgName,
      role: invitation.role,
      inviteToken: invitation.token,
      baseUrl,
    });

    if (!emailResult.success) {
      console.error('Failed to resend invitation email:', emailResult.error);
      throw new Error('Failed to send invitation email: ' + emailResult.error);
    }

    revalidatePath(`/${slug}/members`);
  } catch (error) {
    console.error('Error in resendInvitationAction:', error);
    throw error;
  }
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();
  const { data: userData } = await client.auth.getUser();
  const user = userData?.user;

  if (!user) redirect('/auth/sign-in');

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) redirect('/home');

  // Check if user is admin
  const { data: currentMembership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .single();

  const isAdmin = currentMembership?.role === 'admin';

  // Get current user's profile for inviter name
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  const inviterName = profile?.display_name || user.email?.split('@')[0] || 'Team member';

  // Get all members with their user info
  const { data: members } = await admin
    .from('organization_members')
    .select(`
      id,
      role,
      created_at,
      user_id
    `)
    .eq('org_id', org.id)
    .order('created_at', { ascending: true });

  // Get user details for members
  const memberDetails = await Promise.all(
    (members || []).map(async (member) => {
      const { data: account } = await admin
        .from('accounts')
        .select('name, email, picture_url')
        .eq('id', member.user_id)
        .single();
      
      return {
        ...member,
        name: account?.name || 'Unknown',
        email: account?.email || 'No email',
        picture_url: account?.picture_url,
      };
    })
  );

  // Get pending invitations
  const { data: invitations } = await admin
    .from('organization_invitations')
    .select('id, email, role, status, created_at, expires_at')
    .eq('org_id', org.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full access to all settings' },
    { value: 'developer', label: 'Developer', description: 'Can view and contribute' },
    { value: 'pm', label: 'Product Manager', description: 'Can view analytics' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  ];

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'developer': return 'secondary';
      case 'pm': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <PageBody className="space-y-6">
      <PageHeader
        title="Team Members"
        description={`Manage who has access to ${org.name}`}
        breadcrumbs={<AppBreadcrumbs values={{ [orgSlug]: org.name }} />}
      />

      {/* Invite New Member */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite New Member</CardTitle>
            <CardDescription>
              Send an invitation email to add someone to your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={inviteMemberAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <input type="hidden" name="orgId" value={org.id} />
              <input type="hidden" name="orgName" value={org.name} />
              <input type="hidden" name="slug" value={org.slug} />
              <input type="hidden" name="inviterName" value={inviterName} />
              
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="colleague@company.com"
                  required
                />
              </div>
              
              <div className="w-full sm:w-48 space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="developer">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span>{role.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <InviteSubmitButton />
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle>Current Members ({memberDetails.length})</CardTitle>
          <CardDescription>
            People who have access to this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberDetails.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.picture_url ? (
                        <img
                          src={member.picture_url}
                          alt={member.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {member.user_id === user.id && (
                        <Badge variant="outline" className="ml-2">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isAdmin && member.user_id !== user.id ? (
                      <form action={updateMemberRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="memberId" value={member.id} />
                        <input type="hidden" name="slug" value={org.slug} />
                        <Select name="role" defaultValue={member.role}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="submit" variant="ghost" size="sm">
                          Update
                        </Button>
                      </form>
                    ) : (
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {member.user_id !== user.id && (
                        <form action={removeMemberAction}>
                          <input type="hidden" name="memberId" value={member.id} />
                          <input type="hidden" name="slug" value={org.slug} />
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Remove
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
            <CardDescription>
              Invitations that haven&apos;t been accepted yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(invitation.role)}>
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <form action={resendInvitationAction}>
                            <input type="hidden" name="invitationId" value={invitation.id} />
                            <input type="hidden" name="slug" value={org.slug} />
                            <input type="hidden" name="orgName" value={org.name} />
                            <input type="hidden" name="inviterName" value={inviterName} />
                            <Button type="submit" variant="ghost" size="sm">
                              Resend
                            </Button>
                          </form>
                          <form action={cancelInvitationAction}>
                            <input type="hidden" name="invitationId" value={invitation.id} />
                            <input type="hidden" name="slug" value={org.slug} />
                            <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              Cancel
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
              <div key={role.value} className="rounded-lg border p-4">
                <Badge variant={getRoleBadgeVariant(role.value)} className="mb-2">
                  {role.label}
                </Badge>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageBody>
  );
}

