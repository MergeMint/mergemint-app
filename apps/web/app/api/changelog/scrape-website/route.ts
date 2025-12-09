/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// POST - Scrape website content for product context
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient<any>();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { orgId: string; url: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { orgId, url } = body;

  if (!orgId || !url) {
    return NextResponse.json({ error: 'orgId and url are required' }, { status: 400 });
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
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
    return NextResponse.json({ error: 'Only admins can scrape websites' }, { status: 403 });
  }

  try {
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MergeMint Changelog Bot/1.0 (https://mergemint.dev)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer, and other non-content elements
    $('script, style, nav, footer, header, aside, iframe, noscript, svg, form').remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    $('.nav, .navbar, .footer, .sidebar, .menu, .cookie, .popup, .modal').remove();

    // Extract useful content
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
    const h1 = $('h1').first().text().trim();

    // Get main content area if exists
    const mainContent = $('main, [role="main"], article, .content, .main-content, #content, #main')
      .first()
      .text()
      .trim();

    // Fallback to body if no main content found
    const bodyText = mainContent || $('body').text().trim();

    // Clean up whitespace
    const cleanedText = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Truncate to reasonable length (about 4000 tokens worth)
    const maxLength = 15000;
    const truncatedText = cleanedText.length > maxLength
      ? cleanedText.slice(0, maxLength) + '...'
      : cleanedText;

    // Build structured content
    const scrapedContent = [
      title && `Title: ${title}`,
      metaDescription && `Description: ${metaDescription}`,
      h1 && h1 !== title && `Headline: ${h1}`,
      truncatedText && `Content:\n${truncatedText}`,
    ].filter(Boolean).join('\n\n');

    // Update product_info with scraped content
    const { error: updateError } = await admin
      .from('product_info')
      .upsert(
        {
          org_id: orgId,
          website_url: url,
          scraped_content: scrapedContent,
          scraped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id' }
      );

    if (updateError) {
      console.error('Error saving scraped content:', updateError);
      return NextResponse.json({ error: 'Failed to save scraped content' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      preview: {
        title,
        description: metaDescription,
        headline: h1,
        contentLength: truncatedText.length,
      },
    });
  } catch (err) {
    console.error('Error scraping website:', err);

    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to scrape website' },
      { status: 500 }
    );
  }
}
