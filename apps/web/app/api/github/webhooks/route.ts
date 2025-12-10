/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'node:crypto';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

// Verify webhook signature from GitHub
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    const deliveryId = request.headers.get('x-github-delivery');

    console.log(`[Webhook] Received event: ${event}, delivery: ${deliveryId}`);

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifyWebhookSignature(payload, signature)) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(payload);

    // Handle different event types
    if (event === 'ping') {
      console.log('[Webhook] Ping received, webhook is configured correctly');
      return NextResponse.json({ message: 'pong' });
    }

    // Handle pull_request event
    if (event === 'pull_request') {
      const action = body.action;
      const pr = body.pull_request;
      const repo = body.repository;
      const installation = body.installation;

      console.log(`[Webhook] PR #${pr?.number} action: ${action}, merged: ${pr?.merged}`);

      // Only process merged PRs
      if (action === 'closed' && pr?.merged === true) {
        console.log(`[Webhook] Processing merged PR #${pr.number} in ${repo.full_name}`);

        const admin = getSupabaseServerAdminClient<any>();

        // Find the org associated with this installation
        const { data: connection } = await admin
          .from('github_connections')
          .select('org_id')
          .eq('github_installation_id', installation?.id)
          .eq('is_active', true)
          .maybeSingle();

        if (!connection) {
          console.log(`[Webhook] No active connection found for installation ${installation?.id}`);
          return NextResponse.json({ message: 'Installation not found' });
        }

        const orgId = connection.org_id;

        // Find the repo in our database
        const { data: repoRecord } = await admin
          .from('repositories')
          .select('id')
          .eq('org_id', orgId)
          .eq('github_repo_id', repo.id)
          .maybeSingle();

        if (!repoRecord) {
          console.log(`[Webhook] Repository ${repo.full_name} not tracked for org ${orgId}`);
          return NextResponse.json({ message: 'Repository not tracked' });
        }

        // Trigger async processing using Cloudflare's waitUntil
        // This keeps the worker alive to complete the request after responding to GitHub
        const processPayload = {
          orgId,
          repoId: repoRecord.id,
          repoFullName: repo.full_name,
          prNumber: pr.number,
          prId: pr.id,
          prTitle: pr.title,
          prBody: pr.body,
          prAuthor: pr.user?.login,
          prAuthorId: pr.user?.id,
          prAuthorAvatar: pr.user?.avatar_url,
          prUrl: pr.html_url,
          mergedAt: pr.merged_at,
          createdAt: pr.created_at,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files,
          headSha: pr.head?.sha,
          baseSha: pr.base?.sha,
          installationId: installation.id,
          postComment: true, // Tell process-pr to post the comment
        };

        // Use Cloudflare's waitUntil to process in background after responding
        const processPromise = fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/github/process-pr`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(processPayload),
          },
        ).then(async (res) => {
          if (!res.ok) {
            const err = await res.text();
            console.error(`[Webhook] Background process-pr failed: ${err}`);
          } else {
            const result = await res.json();
            console.log(`[Webhook] PR #${pr.number} processed: score=${result.evaluation?.final_score}`);
          }
        }).catch((err) => {
          console.error('[Webhook] Background process-pr error:', err);
        });

        // Use Cloudflare's waitUntil to keep worker alive for background processing
        try {
          const { ctx } = await getCloudflareContext();
          ctx.waitUntil(processPromise);
          console.log(`[Webhook] Queued PR #${pr.number} for async processing (waitUntil)`);
        } catch {
          // Fallback for local dev where Cloudflare context isn't available
          console.log(`[Webhook] Queued PR #${pr.number} for async processing (no waitUntil)`);
        }

        // Respond immediately to GitHub (within 10s timeout)
        return NextResponse.json({
          message: 'PR queued for processing',
          pr_number: pr.number,
        });
      }

      return NextResponse.json({ message: 'PR event ignored (not a merge)' });
    }

    // Handle installation events (for initial setup)
    if (event === 'installation' || event === 'installation_repositories') {
      console.log(`[Webhook] Installation event: ${body.action}`);
      return NextResponse.json({ message: 'Installation event received' });
    }

    console.log(`[Webhook] Unhandled event type: ${event}`);
    return NextResponse.json({ message: 'Event type not handled' });
  } catch (err) {
    console.error('[Webhook] Error processing webhook:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

// GitHub sends GET request to verify webhook URL
export async function GET() {
  return NextResponse.json({ message: 'GitHub webhook endpoint active' });
}

