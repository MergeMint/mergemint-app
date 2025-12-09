/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { generateChangelogEntry, type PRInfo, type ProductContext } from '~/lib/changelog/generate';

// POST - Generate changelog entries from PRs
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    orgId: string;
    prIds: string[];
    saveAsDraft?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, prIds, saveAsDraft = true } = body;

  if (!orgId || !prIds || !Array.isArray(prIds) || prIds.length === 0) {
    return NextResponse.json(
      { error: 'orgId and prIds are required' },
      { status: 400 }
    );
  }

  // Allow up to 100 PRs per batch (with 300ms delay, ~30 seconds total)
  if (prIds.length > 100) {
    return NextResponse.json(
      { error: 'Maximum 100 PRs can be processed at once' },
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

  // Fetch PRs with their files
  const { data: prs, error: prError } = await admin
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
    .eq('org_id', orgId)
    .in('id', prIds);

  if (prError) {
    console.error('Error fetching PRs:', prError);
    return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 });
  }

  if (!prs || prs.length === 0) {
    return NextResponse.json({ error: 'No PRs found' }, { status: 404 });
  }

  // Check for existing changelog entries for these PRs
  const { data: existingEntries } = await admin
    .from('changelog_entries')
    .select('pr_id')
    .eq('org_id', orgId)
    .in('pr_id', prIds);

  const existingPrIds = new Set(existingEntries?.map(e => e.pr_id) || []);

  const results: Array<{
    prId: string;
    prNumber: number;
    entry?: any;
    error?: string;
    skipped?: boolean;
  }> = [];

  for (const pr of prs) {
    // Skip if already has a changelog entry
    if (existingPrIds.has(pr.id)) {
      results.push({
        prId: pr.id,
        prNumber: pr.number,
        skipped: true,
        error: 'Already has a changelog entry',
      });
      continue;
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
          results.push({
            prId: pr.id,
            prNumber: pr.number,
            error: 'Failed to save entry',
          });
        } else {
          results.push({
            prId: pr.id,
            prNumber: pr.number,
            entry,
          });
        }
      } else {
        results.push({
          prId: pr.id,
          prNumber: pr.number,
          entry: {
            ...generated,
            pr_id: pr.id,
          },
        });
      }
    } catch (error) {
      console.error(`Error generating changelog for PR #${pr.number}:`, error);
      results.push({
        prId: pr.id,
        prNumber: pr.number,
        error: (error as Error).message,
      });
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return NextResponse.json({
    results,
    summary: {
      total: prs.length,
      generated: results.filter(r => r.entry && !r.skipped).length,
      skipped: results.filter(r => r.skipped).length,
      errors: results.filter(r => r.error && !r.skipped).length,
    },
  });
}
