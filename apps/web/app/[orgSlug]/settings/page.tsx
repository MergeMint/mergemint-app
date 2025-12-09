/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';

import { PRSyncCard } from './_components/pr-sync-card';
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
import { Separator } from '@kit/ui/separator';
import { PageBody, PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

async function updateOrganizationAction(formData: FormData) {
  'use server';
  
  const orgId = formData.get('orgId') as string;
  const slug = formData.get('slug') as string;
  const name = formData.get('name') as string;
  const teamSize = formData.get('teamSize') as string;
  const industry = formData.get('industry') as string;

  const admin = getSupabaseServerAdminClient<any>();
  
  const { error } = await admin
    .from('organizations')
    .update({
      name: name.trim(),
      team_size: teamSize || null,
      industry: industry?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId);

  if (error) {
    console.error('Failed to update organization:', error);
    throw new Error('Failed to update organization');
  }

  revalidatePath(`/${slug}/settings`);
}

export default async function OrgSettingsPage({
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
    .select('id, name, slug, team_size, industry, created_at')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) redirect('/home');

  // Check if user is admin
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', user.id)
    .single();

  const isAdmin = membership?.role === 'admin';

  // Get member count
  const { count: memberCount } = await admin
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id);

  // Get repo count
  const { count: repoCount } = await admin
    .from('repositories')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org.id);

  const teamSizes = [
    { value: 'just_me', label: 'Just me' },
    { value: '2-5', label: '2-5 people' },
    { value: '6-10', label: '6-10 people' },
    { value: '11-25', label: '11-25 people' },
    { value: '26-50', label: '26-50 people' },
    { value: '51-100', label: '51-100 people' },
    { value: '100+', label: '100+ people' },
  ];

  return (
    <PageBody className="space-y-6">
      <PageHeader
        title="Organization Settings"
        description={`Manage settings for ${org.name}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team Members</CardDescription>
            <CardTitle className="text-3xl">{memberCount ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <a href={`/${org.slug}/members`} className="text-sm text-primary hover:underline">
              Manage members →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Connected Repos</CardDescription>
            <CardTitle className="text-3xl">{repoCount ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <a href={`/${org.slug}/admin`} className="text-sm text-primary hover:underline">
              Manage repos →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Role</CardDescription>
            <CardTitle className="text-3xl capitalize">{membership?.role ?? 'Member'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isAdmin ? 'default' : 'secondary'}>
              {isAdmin ? 'Full access' : 'Limited access'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Update your organization&apos;s basic information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateOrganizationAction} className="space-y-4">
            <input type="hidden" name="orgId" value={org.id} />
            <input type="hidden" name="slug" value={org.slug} />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={org.name}
                  disabled={!isAdmin}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={org.slug}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Slug cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Select name="teamSize" defaultValue={org.team_size || ''} disabled={!isAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  defaultValue={org.industry || ''}
                  placeholder="e.g., Technology, Healthcare"
                  disabled={!isAdmin}
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* PR Sync - Admin Only */}
      {isAdmin && <PRSyncCard orgId={org.id} />}

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions and shortcuts for managing your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={`/${org.slug}/members`}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted"
            >
              <span className="text-2xl">👥</span>
              <span className="font-medium">Team Members</span>
              <span className="text-xs text-muted-foreground">Invite &amp; manage</span>
            </a>
            
            <a
              href={`/${org.slug}/admin`}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted"
            >
              <span className="text-2xl">⚙️</span>
              <span className="font-medium">Admin Panel</span>
              <span className="text-xs text-muted-foreground">Components &amp; rules</span>
            </a>
            
            <a
              href={`/${org.slug}/leaderboard`}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted"
            >
              <span className="text-2xl">🏆</span>
              <span className="font-medium">Leaderboard</span>
              <span className="text-xs text-muted-foreground">View rankings</span>
            </a>
            
            <a
              href={`/${org.slug}/prs`}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted"
            >
              <span className="text-2xl">📋</span>
              <span className="font-medium">Pull Requests</span>
              <span className="text-xs text-muted-foreground">Browse PRs</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isAdmin && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Organization</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all its data.
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Organization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageBody>
  );
}

