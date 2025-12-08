/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

function parseState(state?: string | null) {
  if (!state) return null;
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8');
    return JSON.parse(decoded) as { orgId?: string; orgSlug?: string; returnTo?: string };
  } catch {
    return null;
  }
}

function absoluteRedirect(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  // If already absolute, return as-is
  try {
    return new URL(path).toString();
  } catch {
    return new URL(path, base).toString();
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const stateParam = searchParams.get('state');
  const state = parseState(stateParam);
  const redirectBase = state?.returnTo ?? '/home/onboarding';

  if (!installationId) {
    return NextResponse.redirect(
      absoluteRedirect(`${redirectBase}?github=error&reason=missing_installation_id`),
      { status: 302 },
    );
  }

  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const orgId = state?.orgId;
  if (!orgId) {
    return NextResponse.redirect(
      absoluteRedirect(`${redirectBase}?github=error&reason=missing_org_context`),
      { status: 302 },
    );
  }

  // Ensure the user belongs to the org (basic guard)
  const admin = getSupabaseServerAdminClient<any>();
  
  console.log('[GitHub Callback] userId:', userId, 'orgId:', orgId);
  
  let membership = null as { role: string } | null;
  if (userId) {
    const { data, error: memberError } = await admin
      .from('organization_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .maybeSingle();
    membership = data ?? null;
    console.log('[GitHub Callback] Membership check:', { data, error: memberError });

    // Auto-add the current user as admin if org has no members (development convenience)
    if (!membership) {
      const { count, error: countError } = await admin
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId);
      console.log('[GitHub Callback] Member count for org:', { count, error: countError });
      
      if ((count ?? 0) === 0) {
        const { error: insertError } = await admin.from('organization_members').insert({
          org_id: orgId,
          user_id: userId,
          role: 'admin',
        });
        console.log('[GitHub Callback] Insert membership result:', { error: insertError });
        
        const { data: inserted } = await admin
          .from('organization_members')
          .select('role')
          .eq('org_id', orgId)
          .eq('user_id', userId)
          .maybeSingle();
        membership = inserted ?? null;
      }
    }
  }

  if (!membership) {
    return NextResponse.redirect(
      absoluteRedirect(`${redirectBase}?github=error&reason=not_authorized`),
      { status: 302 },
    );
  }

  // Persist connection metadata (token created per-request via app JWT)
  const { error: upsertError } = await admin.from('github_connections').upsert({
    org_id: orgId,
    installation_type: 'app',
    github_installation_id: Number(installationId),
    github_org_name: state?.orgSlug ?? null,
    is_active: true,
    updated_at: new Date().toISOString(),
  });
  console.log('[GitHub Callback] Upsert github_connections:', { orgId, installationId, error: upsertError });

  return NextResponse.redirect(
    absoluteRedirect(`${redirectBase}?github=success&installation=${installationId}`),
    { status: 302 },
  );
}
