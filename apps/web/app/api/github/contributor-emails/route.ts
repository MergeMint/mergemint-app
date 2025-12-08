/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  GithubClient,
  getInstallationAccessToken,
} from '~/lib/mergemint/github';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { orgId: string; usernames: string[]; repos?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, usernames, repos } = body;

  if (!orgId || !usernames?.length) {
    return NextResponse.json(
      { error: 'orgId and usernames are required' },
      { status: 400 }
    );
  }

  const admin = getSupabaseServerAdminClient<any>();

  // Verify user is a member of the org
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

  // Get GitHub connection
  const { data: connection } = await admin
    .from('github_connections')
    .select('github_installation_id')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .maybeSingle();

  if (!connection?.github_installation_id) {
    return NextResponse.json(
      { error: 'No active GitHub connection found' },
      { status: 400 }
    );
  }

  try {
    const tokenData = await getInstallationAccessToken(connection.github_installation_id);
    const client = new GithubClient(tokenData.token);

    // Start with profile emails (may be null/empty for most users)
    const emails: Record<string, string | null> = {};
    usernames.forEach(u => emails[u] = null);

    // Try to get emails from GitHub profiles first
    const profileEmails = await client.getUserEmails(usernames);
    Object.entries(profileEmails).forEach(([username, email]) => {
      if (email) emails[username] = email;
    });

    // For users without profile emails, try to get from commit data
    const usersWithoutEmails = usernames.filter(u => !emails[u]);
    if (usersWithoutEmails.length > 0 && repos?.length) {
      // Try each repo until we find emails
      for (const repoFullName of repos) {
        const [owner, repo] = repoFullName.split('/');
        if (!owner || !repo) continue;

        try {
          const commitEmails = await client.getContributorEmailsFromCommits(
            owner,
            repo,
            usersWithoutEmails,
          );

          Object.entries(commitEmails).forEach(([username, email]) => {
            if (email && !emails[username]) {
              emails[username] = email;
            }
          });

          // If we found all emails, stop looking
          if (usernames.every(u => emails[u])) break;
        } catch (err) {
          console.warn(`Failed to fetch commits from ${repoFullName}:`, err);
        }
      }
    }

    return NextResponse.json({ emails });
  } catch (err) {
    console.error('Error fetching contributor emails:', err);
    return NextResponse.json(
      { error: 'Failed to fetch contributor emails' },
      { status: 500 }
    );
  }
}
