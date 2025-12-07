import { NextResponse } from 'next/server';

import Anthropic from '@anthropic-ai/sdk';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import {
  GithubClient,
  getInstallationAccessToken,
} from '~/lib/mergemint/github';

type EvaluationResult = {
  primary_component_key: string;
  severity_key: string;
  eligibility: {
    issue: boolean;
    fix_implementation: boolean;
    pr_linked: boolean;
    tests: boolean;
  };
  justification_component: string;
  justification_severity: string;
  impact_summary: string;
  eligibility_notes: string;
  review_notes?: string;
};

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
    const body = await request.json();
    const {
      orgId,
      repoId,
      repoFullName,
      prNumber,
      prId: githubPrId,
      prTitle,
      prBody,
      prAuthor,
      mergedAt,
      additions,
      deletions,
      changedFiles,
      headSha,
      baseSha,
      skipComment = false, // Don't post comment for backfill
      postComment = !skipComment, // Allow explicit control
    } = body;

    if (!orgId || !repoFullName || !prNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: orgId, repoFullName, prNumber' },
        { status: 400 },
      );
    }

    const admin = getSupabaseServerAdminClient<any>();

    // Get GitHub connection
    const { data: connection } = await admin
      .from('github_connections')
      .select('github_installation_id')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection?.github_installation_id) {
      return NextResponse.json(
        { error: 'No active GitHub connection found' },
        { status: 400 },
      );
    }

    // Get repo record to look up repo_id
    const { data: repoRecord } = await admin
      .from('repositories')
      .select('id')
      .eq('org_id', orgId)
      .eq('full_name', repoFullName)
      .maybeSingle();

    // Get components from repo_components and severity levels
    const [{ data: repoComponents }, { data: severityLevels }, { data: ruleSet }] = await Promise.all([
      repoRecord?.id
        ? admin
            .from('repo_components')
            .select('id, key, name, description, multiplier, importance')
            .eq('repo_id', repoRecord.id)
        : Promise.resolve({ data: [] }),
      admin
        .from('severity_levels')
        .select('id, key, name, description, base_points')
        .eq('org_id', orgId)
        .order('sort_order'),
      admin
        .from('scoring_rule_sets')
        .select('id, model_name')
        .eq('org_id', orgId)
        .eq('is_default', true)
        .maybeSingle(),
    ]);

    // Create fallback "Other" component for uncategorized PRs
    const otherComponent = {
      id: null as string | null,
      key: 'OTHER',
      name: 'Other',
      description: 'Uncategorized or miscellaneous changes',
      multiplier: 1,
      importance: 'normal',
    };

    // Use repo_components if available, otherwise just use Other
    const components = (repoComponents?.length ? repoComponents : []).concat([otherComponent]);

    if (!severityLevels?.length) {
      return NextResponse.json(
        { error: 'Missing severity levels configuration' },
        { status: 400 },
      );
    }

    // Fetch PR diff from GitHub
    const tokenData = await getInstallationAccessToken(connection.github_installation_id);
    const client = new GithubClient(tokenData.token);
    const [owner, repo] = repoFullName.split('/');

    let diff = '';
    let files: { filename: string; status: string; additions: number; deletions: number; patch?: string }[] = [];

    try {
      // Fetch files first as it's more reliable
      files = await client.listPullFiles(owner, repo, prNumber);
      // Use patches from files as diff if available
      diff = files
        .filter((f) => f.patch)
        .map((f) => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch}`)
        .join('\n\n');
    } catch (err) {
      console.error('Failed to fetch PR files:', err);
      // Continue without diff - Claude can still evaluate based on PR metadata
    }

    // Build the prompt
    const componentsTable = components
      .map((c: any) => `| ${c.key} | ${c.name} | ${c.multiplier}x | ${c.description || '-'} |`)
      .join('\n');

    const severityTable = severityLevels
      .map((s: any) => `| ${s.key} | ${s.name} | ${s.base_points} pts | ${s.description || '-'} |`)
      .join('\n');

    const filesSection = files
      .slice(0, 50) // Limit to 50 files
      .map((f) => `- ${f.filename} (+${f.additions}/-${f.deletions})`)
      .join('\n');

    // Truncate diff if too long (keep under ~100k chars for token limits)
    const maxDiffLength = 80000;
    const truncatedDiff = diff.length > maxDiffLength
      ? diff.slice(0, maxDiffLength) + '\n... [diff truncated]'
      : diff;

    const prompt = `You are an expert engineering manager scoring a merged pull request for a bug bounty/contribution scoring program.

## Components (with multipliers)
| Key | Name | Multiplier | Description |
|-----|------|------------|-------------|
${componentsTable}

## Severity Levels (with base points)
| Key | Name | Base Points | Description |
|-----|------|-------------|-------------|
${severityTable}

## Pull Request Details
- **Title:** ${prTitle}
- **PR #:** ${prNumber}
- **Author:** ${prAuthor}
- **Merged at:** ${mergedAt}
- **Stats:** +${additions} / -${deletions} in ${changedFiles} files

### PR Description:
${prBody || 'No description provided'}

### Files Changed:
${filesSection || 'No files listed'}

### Code Diff (truncated if large):
\`\`\`diff
${truncatedDiff || 'Diff not available'}
\`\`\`

## Scoring Rules
1. **Base Score** = severity base_points × component multiplier
2. **Eligibility checks:**
   - issue: Is this fixing a reported issue/bug? (true if PR mentions issue/bug fix, or is clearly fixing something broken)
   - fix_implementation: Does the PR actually fix/implement what it claims? (true if code changes align with PR title/description)
   - pr_linked: Is the PR properly documented with clear description? (true if has meaningful description)
   - tests: Are there tests included or is the change trivial enough not to need them? (true if has tests OR change is config/docs/trivial)

## Your Task
Analyze this PR and determine:
1. Which component is primarily affected
2. What severity this contribution represents
3. Whether it passes eligibility checks
4. Provide justifications

**Output valid JSON only (no markdown, no prose):**
{
  "primary_component_key": "COMPONENT_KEY_FROM_TABLE",
  "severity_key": "SEVERITY_KEY_FROM_TABLE", 
  "eligibility": {
    "issue": true_or_false,
    "fix_implementation": true_or_false,
    "pr_linked": true_or_false,
    "tests": true_or_false
  },
  "justification_component": "1-2 sentences explaining component choice",
  "justification_severity": "1-2 sentences explaining severity choice",
  "impact_summary": "2-3 sentences summarizing the PR impact",
  "eligibility_notes": "Brief notes on eligibility decisions",
  "review_notes": "Optional additional review feedback"
}`;

    // Call Anthropic Claude API
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 },
      );
    }

    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    // Always use Claude model (ignore legacy OpenAI model names from database)
    const defaultModel = 'claude-haiku-4-5-20251001';
    const dbModel = ruleSet?.model_name;
    const modelName = dbModel?.startsWith('claude-') ? dbModel : defaultModel;
    
    let claudeResponse;
    try {
      claudeResponse = await anthropic.messages.create({
        model: modelName,
        max_tokens: 2000,
        temperature: 0.3,
        system: 'You are a technical PR evaluator. Output only valid JSON, no markdown code fences, no explanations.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    } catch (err) {
      console.error('Anthropic API error:', err);
      return NextResponse.json(
        { error: 'AI evaluation failed', details: (err as Error).message },
        { status: 500 },
      );
    }

    const aiContent = claudeResponse.content[0]?.type === 'text' 
      ? claudeResponse.content[0].text 
      : null;

    if (!aiContent) {
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 500 },
      );
    }

    // Parse AI response
    let evaluation: EvaluationResult;
    try {
      // Clean up the response (remove markdown fences if present)
      const cleanedContent = aiContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      evaluation = JSON.parse(cleanedContent);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', aiContent);
      return NextResponse.json(
        { error: 'Failed to parse AI evaluation', raw: aiContent },
        { status: 500 },
      );
    }

    // Look up component and severity
    const componentMatch = components.find((c: any) => c.key === evaluation.primary_component_key);
    const severityMatch = severityLevels.find((s: any) => s.key === evaluation.severity_key);

    // Default to "Other" component if not matched, or lowest severity
    const otherComp = components.find((c: any) => c.key === 'OTHER');
    const component = componentMatch ?? otherComp ?? components[0];
    const severity = severityMatch ?? severityLevels[severityLevels.length - 1]; // Default to lowest

    if (!component || !severity) {
      return NextResponse.json(
        { error: 'No components or severity levels configured' },
        { status: 400 },
      );
    }

    // Calculate score
    const basePoints = severity.base_points;
    const multiplier = component.multiplier;
    const isEligible = 
      evaluation.eligibility.issue &&
      evaluation.eligibility.fix_implementation &&
      evaluation.eligibility.pr_linked &&
      evaluation.eligibility.tests;
    const finalScore = isEligible ? basePoints * multiplier : 0;

    // Ensure GitHub identity exists
    let githubIdentityId = null;
    if (prAuthor) {
      const { data: existingIdentity } = await admin
        .from('github_identities')
        .select('id')
        .eq('github_login', prAuthor)
        .maybeSingle();

      if (existingIdentity) {
        githubIdentityId = existingIdentity.id;
      } else {
        const { data: newIdentity } = await admin
          .from('github_identities')
          .insert({
            github_user_id: body.prAuthorId || Math.floor(Math.random() * 1000000000),
            github_login: prAuthor,
            avatar_url: body.prAuthorAvatar,
          })
          .select('id')
          .single();
        githubIdentityId = newIdentity?.id;
      }
    }

    // Upsert PR record
    const { data: prRecord, error: prError } = await admin
      .from('pull_requests')
      .upsert(
        {
          org_id: orgId,
          repo_id: repoId,
          github_pr_id: githubPrId,
          number: prNumber,
          title: prTitle,
          body: prBody,
          state: 'closed',
          is_merged: true,
          merged_at_gh: mergedAt,
          github_author_id: githubIdentityId,
          head_sha: headSha,
          base_sha: baseSha,
          url: body.prUrl,
          additions,
          deletions,
          changed_files_count: changedFiles,
          created_at_gh: body.createdAt,
          updated_at_gh: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: 'org_id,github_pr_id' },
      )
      .select('id')
      .single();

    if (prError) {
      console.error('Failed to upsert PR:', prError);
      return NextResponse.json(
        { error: 'Failed to save PR record', details: prError.message },
        { status: 500 },
      );
    }

    // Upsert evaluation record
    // Note: primary_component_id is set to null since we use repo_components now
    // Component info is stored in raw_response instead
    const { data: evalRecord, error: evalError } = await admin
      .from('pr_evaluations')
      .upsert(
        {
          org_id: orgId,
          pr_id: prRecord.id,
          rule_set_id: ruleSet?.id,
          model_name: modelName,
          evaluation_source: 'auto',
          primary_component_id: null, // Using repo_components, not product_components
          severity_id: severity.id,
          base_points: basePoints,
          multiplier,
          final_score: finalScore,
          eligibility_issue: evaluation.eligibility.issue,
          eligibility_fix_implementation: evaluation.eligibility.fix_implementation,
          eligibility_pr_linked: evaluation.eligibility.pr_linked,
          eligibility_tests: evaluation.eligibility.tests,
          is_eligible: isEligible,
          justification_component: evaluation.justification_component,
          justification_severity: evaluation.justification_severity,
          impact_summary: evaluation.impact_summary,
          eligibility_notes: evaluation.eligibility_notes,
          review_notes: evaluation.review_notes,
          raw_response: {
            ...evaluation,
            component_key: component.key,
            component_name: component.name,
            component_multiplier: component.multiplier,
          },
        },
        { onConflict: 'pr_id,rule_set_id' },
      )
      .select('id')
      .single();

    if (evalError) {
      console.error('Failed to upsert evaluation:', evalError);
      return NextResponse.json(
        { error: 'Failed to save evaluation', details: evalError.message },
        { status: 500 },
      );
    }

    const evaluationResult = {
      id: evalRecord.id,
      pr_id: prRecord.id,
      component: {
        key: component.key,
        name: component.name,
        multiplier: component.multiplier,
      },
      severity: {
        key: severity.key,
        name: severity.name,
        base_points: severity.base_points,
      },
      eligibility: evaluation.eligibility,
      is_eligible: isEligible,
      base_points: basePoints,
      multiplier,
      final_score: finalScore,
      justification_component: evaluation.justification_component,
      justification_severity: evaluation.justification_severity,
      impact_summary: evaluation.impact_summary,
      eligibility_notes: evaluation.eligibility_notes,
      author: prAuthor,
    };

    // Post comment on PR if enabled
    let commentPosted = false;
    if (postComment && prNumber) {
      try {
        const comment = formatEvaluationComment(evaluationResult);
        await client.postPRComment(owner, repo, prNumber, comment);
        commentPosted = true;
        console.log(`Posted evaluation comment on PR #${prNumber}`);
      } catch (commentErr) {
        console.error('Failed to post PR comment:', commentErr);
        // Don't fail the request if comment posting fails
      }
    }

    return NextResponse.json({
      success: true,
      evaluation: evaluationResult,
      commentPosted,
    });
  } catch (err) {
    console.error('Error processing PR:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

