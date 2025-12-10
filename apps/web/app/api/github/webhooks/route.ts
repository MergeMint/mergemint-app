/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'node:crypto';

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

        // Save the PR to the database immediately (no AI evaluation yet)
        // The AI evaluation will be triggered by a separate process

        // Ensure GitHub identity exists
        let githubIdentityId = null;
        if (pr.user?.login) {
          const { data: existingIdentity } = await admin
            .from('github_identities')
            .select('id')
            .eq('github_login', pr.user.login)
            .maybeSingle();

          if (existingIdentity) {
            githubIdentityId = existingIdentity.id;
          } else {
            const { data: newIdentity } = await admin
              .from('github_identities')
              .insert({
                github_user_id: pr.user.id,
                github_login: pr.user.login,
                avatar_url: pr.user.avatar_url,
              })
              .select('id')
              .single();
            githubIdentityId = newIdentity?.id;
          }
        }

        // Upsert PR record - it will be processed by /api/github/process-unprocessed
        const { data: prRecord, error: prError } = await admin
          .from('pull_requests')
          .upsert(
            {
              org_id: orgId,
              repo_id: repoRecord.id,
              github_pr_id: pr.id,
              number: pr.number,
              title: pr.title,
              body: pr.body,
              state: 'closed',
              is_merged: true,
              merged_at_gh: pr.merged_at,
              github_author_id: githubIdentityId,
              head_sha: pr.head?.sha,
              base_sha: pr.base?.sha,
              url: pr.html_url,
              additions: pr.additions,
              deletions: pr.deletions,
              changed_files_count: pr.changed_files,
              created_at_gh: pr.created_at,
              updated_at_gh: new Date().toISOString(),
              last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'org_id,github_pr_id' },
          )
          .select('id')
          .single();

        if (prError) {
          console.error('[Webhook] Failed to save PR:', prError);
          return NextResponse.json(
            { error: 'Failed to save PR', details: prError.message },
            { status: 500 },
          );
        }

        console.log(`[Webhook] Saved PR #${pr.number} (id: ${prRecord.id}) - pending evaluation`);

        // Respond immediately to GitHub (within 10s timeout)
        return NextResponse.json({
          message: 'PR saved for processing',
          pr_number: pr.number,
          pr_id: prRecord.id,
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

