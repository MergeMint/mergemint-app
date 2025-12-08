/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const admin = getSupabaseServerAdminClient<any>();
    
    // Get all components for this org with their repo info
    const { data: components, error } = await admin
      .from('repo_components')
      .select(`
        id,
        key,
        name,
        description,
        multiplier,
        importance,
        repo_id,
        repositories!inner (
          full_name
        )
      `)
      .eq('org_id', orgId);

    if (error) throw error;

    // Transform to match the client format
    const formatted = (components ?? []).map((c: any) => ({
      repo_full_name: c.repositories?.full_name,
      key: c.key,
      name: c.name,
      description: c.description ?? '',
      multiplier: c.multiplier,
      importance: c.importance,
    }));

    return NextResponse.json({ components: formatted });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

