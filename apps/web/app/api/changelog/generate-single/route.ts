/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { generateChangelogEntry, type PRInfo, type ProductContext } from '~/lib/changelog/generate';

// POST - Generate changelog entry for a single PR
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    orgId: string;
    prId: string;
    saveAsDraft?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, prId, saveAsDraft = true } = body;

  if (!orgId || !prId) {
    return NextResponse.json(
      { error: 'orgId and prId are required' },
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
    return NextResponse.json({ error: 'Only admins can generate changelog entries' }, { status: 403 });
  }

  // Check if PR already has a changelog entry
  const { data: existingEntry } = await admin
    .from('changelog_entries')
    .select('id')
    .eq('org_id', orgId)
    .eq('pr_id', prId)
    .maybeSingle();

  if (existingEntry) {
    return NextResponse.json({
      skipped: true,
      reason: 'Already has a changelog entry',
      prId,
    });
  }

  // Fetch product context
  const { data: productInfo } = await admin
    .from('product_info')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();

  const productContext: ProductContext = {
    productName: productInfo?.product_name,
    productDescription: productInfo?.product_description,
    targetAudience: productInfo?.target_audience,
    scrapedContent: productInfo?.scraped_content,
  };

  // Fetch PR with files
  const { data: pr, error: prError } = await admin
    .from('pull_requests')
    .select(`
      id,
      number,
      title,
      body,
      additions,
      deletions,
      pr_files(filename)
    `)
    .eq('id', prId)
    .eq('org_id', orgId)
    .single();

  if (prError || !pr) {
    console.error('Error fetching PR:', prError);
    return NextResponse.json({ error: 'PR not found' }, { status: 404 });
  }

  const prInfo: PRInfo = {
    number: pr.number,
    title: pr.title,
    body: pr.body,
    filesChanged: (pr.pr_files || []).map((f: any) => f.filename),
    additions: pr.additions || 0,
    deletions: pr.deletions || 0,
    componentName: null,
  };

  try {
    const generated = await generateChangelogEntry(productContext, prInfo);

    // If AI decided to skip this PR
    if (generated.skip) {
      return NextResponse.json({
        skipped: true,
        reason: generated.skipReason || 'Not user-facing',
        prId,
        prNumber: pr.number,
        prTitle: pr.title,
      });
    }

    // Save to database if requested
    if (saveAsDraft) {
      const { data: entry, error: saveError } = await admin
        .from('changelog_entries')
        .insert({
          org_id: orgId,
          pr_id: pr.id,
          title: generated.title,
          description: generated.description,
          category: generated.category,
          is_draft: true,
          generated_by_llm: true,
          raw_llm_response: generated,
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving changelog entry:', saveError);
        return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        entry,
        prId,
        prNumber: pr.number,
        prTitle: pr.title,
      });
    }

    return NextResponse.json({
      success: true,
      entry: {
        ...generated,
        pr_id: pr.id,
      },
      prId,
      prNumber: pr.number,
      prTitle: pr.title,
    });
  } catch (error) {
    console.error(`Error generating changelog for PR #${pr.number}:`, error);
    return NextResponse.json({
      error: (error as Error).message,
      prId,
      prNumber: pr.number,
      prTitle: pr.title,
    }, { status: 500 });
  }
}
