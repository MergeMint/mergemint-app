import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.orgId as string;
    const components = body.components as {
      repo_full_name: string;
      key: string;
      name: string;
      description?: string;
      multiplier?: number;
      importance?: 'critical' | 'high' | 'normal' | 'low';
    }[];

    if (!orgId || !Array.isArray(components)) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    const admin = getSupabaseServerAdminClient<any>();
    for (const comp of components) {
      const { data: repoRow, error: repoError } = await admin
        .from('repositories')
        .select('id')
        .eq('org_id', orgId)
        .eq('full_name', comp.repo_full_name)
        .maybeSingle();
      if (repoError || !repoRow) {
        throw new Error(`Repo not found for ${comp.repo_full_name}`);
      }

      const { error } = await admin
        .from('repo_components')
        .upsert(
          {
            org_id: orgId,
            repo_id: repoRow.id,
            key: comp.key,
            name: comp.name,
            description: comp.description ?? null,
            multiplier: comp.multiplier ?? 1,
            importance: comp.importance ?? 'normal',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'repo_id,key' },
        );

      if (error) throw error;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
