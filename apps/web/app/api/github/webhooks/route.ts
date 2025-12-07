import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  getInstallationAccessToken,
} from '~/lib/mergemint/github';

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

// Format evaluation result as a GitHub comment
function formatEvaluationComment(evaluation: {
  component: { key: string; name: string; multiplier: number };
  severity: { key: string; name: string; base_points: number };
  eligibility: { issue: boolean; fix_implementation: boolean; pr_linked: boolean; tests: boolean };
  is_eligible: boolean;
  final_score: number;
  impact_summary: string;
  justification_component: string;
  justification_severity: string;
  eligibility_notes: string;
}): string {
  const eligibilityIcon = (passed: boolean) => passed ? '✅' : '❌';
  
  const scoreEmoji = evaluation.is_eligible 
    ? (evaluation.final_score >= 100 ? '🏆' : evaluation.final_score >= 50 ? '⭐' : '👍')
    : '📋';

  return `## ${scoreEmoji} MergeMint PR Analysis

### Score: **${evaluation.final_score} points**${evaluation.is_eligible ? '' : ' (ineligible)'}

| Metric | Value |
|--------|-------|
| **Component** | ${evaluation.component.name} (${evaluation.component.multiplier}× multiplier) |
| **Severity** | ${evaluation.severity.key} - ${evaluation.severity.name} (${evaluation.severity.base_points} base pts) |
| **Final Score** | ${evaluation.severity.base_points} × ${evaluation.component.multiplier} = **${evaluation.final_score}** |

### Eligibility Checks

| Check | Status |
|-------|--------|
| Issue/Bug Fix | ${eligibilityIcon(evaluation.eligibility.issue)} |
| Fix Implementation | ${eligibilityIcon(evaluation.eligibility.fix_implementation)} |
| PR Documented | ${eligibilityIcon(evaluation.eligibility.pr_linked)} |
| Tests Included | ${eligibilityIcon(evaluation.eligibility.tests)} |

### Impact Summary
${evaluation.impact_summary}

<details>
<summary>Analysis Details</summary>

**Component Classification:** ${evaluation.justification_component}

**Severity Justification:** ${evaluation.justification_severity}

**Eligibility Notes:** ${evaluation.eligibility_notes}

</details>

---
*Analyzed by [MergeMint](https://mergemint.dev) 🤖*`;
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

        // Get installation token
        const tokenData = await getInstallationAccessToken(installation.id);
        const client = new GithubClient(tokenData.token);

        // Process the PR
        const processResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/github/process-pr`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
            }),
          },
        );

        if (!processResponse.ok) {
          const err = await processResponse.json();
          console.error('[Webhook] Failed to process PR:', err);
          return NextResponse.json({ error: 'Failed to process PR' }, { status: 500 });
        }

        const result = await processResponse.json();
        console.log(`[Webhook] PR #${pr.number} processed: score=${result.evaluation?.final_score}`);

        // Post comment on the PR with the analysis results
        if (result.evaluation) {
          try {
            const [owner, repoName] = repo.full_name.split('/');
            const comment = formatEvaluationComment(result.evaluation);
            const commentResult = await client.postPRComment(owner, repoName, pr.number, comment);
            console.log(`[Webhook] Posted comment on PR #${pr.number}: ${commentResult.html_url}`);
          } catch (commentErr) {
            console.error('[Webhook] Failed to post comment:', commentErr);
            // Don't fail the webhook if comment fails
          }
        }

        return NextResponse.json({
          message: 'PR processed successfully',
          pr_number: pr.number,
          score: result.evaluation?.final_score,
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

