/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orgId, repoFullName, componentKey } = body as {
      orgId: string;
      repoFullName: string;
      componentKey: string;
    };

    if (!orgId || !repoFullName || !componentKey) {
      return NextResponse.json(
        { error: 'orgId, repoFullName, and componentKey are required' },
        { status: 400 }
      );
    }

    const admin = getSupabaseServerAdminClient<any>();

    // Verify user is admin of the org
    const { data: membership } = await admin
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete components' },
        { status: 403 }
      );
    }

    // Find the repo
    const { data: repoRow, error: repoError } = await admin
      .from('repositories')
      .select('id')
      .eq('org_id', orgId)
      .eq('full_name', repoFullName)
      .maybeSingle();

    if (repoError || !repoRow) {
      return NextResponse.json(
        { error: `Repository not found: ${repoFullName}` },
        { status: 404 }
      );
    }

    // Delete the component
    const { error: deleteError } = await admin
      .from('repo_components')
      .delete()
      .eq('repo_id', repoRow.id)
      .eq('key', componentKey);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to delete component:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
