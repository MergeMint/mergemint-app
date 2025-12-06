import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 40);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseServerAdminClient<any>();
  const body = await request.json().catch(() => ({}));
  const name: string = body.name || 'My MergeMint Org';
  const slugInput: string = body.slug || name;
  const baseSlug = slugify(slugInput) || `org-${userId.slice(0, 6)}`;
  const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name, slug: uniqueSlug })
    .select()
    .single();

  if (orgError || !org) {
    return NextResponse.json(
      { error: orgError?.message || 'Failed to create organization' },
      { status: 400 },
    );
  }

  const { error: memberError } = await admin.from('organization_members').insert({
    org_id: org.id,
    user_id: userId,
    role: 'admin',
  });

  if (memberError) {
    return NextResponse.json(
      { error: memberError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({
    org_id: org.id,
    organizations: { name: org.name, slug: org.slug },
    role: 'admin',
  });
}
