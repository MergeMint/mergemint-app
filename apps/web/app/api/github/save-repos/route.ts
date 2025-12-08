/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.orgId as string;
    const repos = body.repos as {
      github_repo_id: number;
      name: string;
      full_name: string;
      default_branch?: string | null;
      is_active: boolean;
    }[];
    const triggerBackfill = body.triggerBackfill !== false; // Default to true

    if (!orgId || !Array.isArray(repos)) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    const admin = getSupabaseServerAdminClient<any>();

    // Check which repos are new (not yet in database)
    const { data: existingRepos } = await admin
      .from('repositories')
      .select('github_repo_id, last_synced_at')
      .eq('org_id', orgId);

    const existingRepoMap = new Map(
      (existingRepos ?? []).map((r: any) => [r.github_repo_id, r.last_synced_at])
    );

    // Find repos that need backfill (new or never synced)
    const reposNeedingBackfill = repos.filter(
      (repo) => !existingRepoMap.has(repo.github_repo_id) || !existingRepoMap.get(repo.github_repo_id)
    );

    const upserts = repos.map((repo) => ({
      org_id: orgId,
      github_repo_id: repo.github_repo_id,
      name: repo.name,
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      is_active: repo.is_active,
      updated_at: new Date().toISOString(),
    }));

    const { data: upsertedRepos, error } = await admin
      .from('repositories')
      .upsert(upserts, { onConflict: 'org_id,github_repo_id' })
      .select('id, full_name, github_repo_id');

    if (error) throw error;

    // Trigger backfill for new repos (in background, don't wait)
    if (triggerBackfill && reposNeedingBackfill.length > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      // Find the repo IDs for repos needing backfill
      const repoIdMap = new Map(
        (upsertedRepos ?? []).map((r: any) => [r.github_repo_id, r.id])
      );

      // Trigger backfill in background (fire and forget)
      for (const repo of reposNeedingBackfill) {
        const repoId = repoIdMap.get(repo.github_repo_id);
        if (repoId) {
          console.log(`[SaveRepos] Triggering backfill for ${repo.full_name}`);
          
          // Don't await - let it run in background
          fetch(`${baseUrl}/api/github/backfill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orgId,
              repoId,
              repoFullName: repo.full_name,
              months: 3,
            }),
          }).catch((err) => {
            console.error(`[SaveRepos] Failed to trigger backfill for ${repo.full_name}:`, err);
          });
        }
      }
    }

    return NextResponse.json({
      status: 'ok',
      backfillTriggered: reposNeedingBackfill.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
