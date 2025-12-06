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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const stateParam = searchParams.get('state');
  const state = parseState(stateParam);
  const redirectBase = state?.returnTo ?? '/home/onboarding';

  if (!installationId) {
    return NextResponse.redirect(
      `${redirectBase}?github=error&reason=missing_installation_id`,
      { status: 302 },
    );
  }

  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const orgId = state?.orgId;
  if (!orgId) {
    return NextResponse.redirect(
      `${redirectBase}?github=error&reason=missing_org_context`,
      { status: 302 },
    );
  }

  // Ensure the user belongs to the org (basic guard)
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId ?? '')
    .maybeSingle();

  if (!membership) {
    return NextResponse.redirect(
      `${redirectBase}?github=error&reason=not_authorized`,
      { status: 302 },
    );
  }

  // Persist connection metadata (token created per-request via app JWT)
  const admin = getSupabaseServerAdminClient<any>();
  await admin.from('github_connections').upsert({
    org_id: orgId,
    installation_type: 'app',
    github_installation_id: Number(installationId),
    github_org_name: state?.orgSlug ?? null,
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.redirect(
    `${redirectBase}?github=success&installation=${installationId}`,
    { status: 302 },
  );
}
