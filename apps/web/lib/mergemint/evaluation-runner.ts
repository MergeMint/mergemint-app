/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { mapComponentsForPullRequest } from './component-mapper';
import { LLMClient, OpenAICompatibleClient } from './llm';
import {
  ComponentRecord,
  EvaluationLLMResult,
  MergeMintDatabase,
  PromptTemplateRecord,
  ScoringRuleSetRecord,
  SeverityRecord,
  evaluationResultSchema,
} from './types';

type PRContext = {
  pr:
    MergeMintDatabase['public']['Tables']['pull_requests']['Row'] & {
      repo_name?: string;
    };
  files: { filename: string; status: string | null }[];
  issues: {
    number: number;
    title: string;
    body: string | null;
    labels: string[];
    url: string | null;
  }[];
  components: ComponentRecord[];
  severities: SeverityRecord[];
  prompt: PromptTemplateRecord;
  ruleSet: ScoringRuleSetRecord;
};

export type EvaluationRunOptions = {
  orgId: string;
  ruleSetId?: string;
  windowDays?: number;
  llmClient?: LLMClient;
  runType?: 'manual' | 'scheduled';
};

export async function runEvaluationBatch(options: EvaluationRunOptions) {
  const admin = getSupabaseServerAdminClient<any>();
  const ruleSet =
    options.ruleSetId !== undefined
      ? await getRuleSetById(admin, options.orgId, options.ruleSetId)
      : await getActiveRuleSet(admin, options.orgId);

  if (!ruleSet) {
    throw new Error('No active scoring rule set found for organization.');
  }

  const prompt = await getPromptTemplate(admin, options.orgId, ruleSet.id);
  if (!prompt) {
    throw new Error('No prompt template configured for rule set.');
  }

  const batchId = await createBatch(
    admin,
    options.orgId,
    ruleSet.id,
    options.runType ?? 'manual',
  );

  const prs = await getPullRequestsToEvaluate(
    admin,
    options.orgId,
    ruleSet.id,
    options.windowDays ?? 7,
  );

  const llm =
    options.llmClient ??
    new OpenAICompatibleClient(
      process.env.OPENAI_API_KEY ?? process.env.MERGEMINT_LLM_API_KEY ?? '',
      process.env.MERGEMINT_LLM_BASE_URL,
    );

  try {
    await admin
      .from('evaluation_batches')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', batchId);

    for (const pr of prs) {
      const ctx = await buildPrContext(admin, options.orgId, pr.id, {
        prompt,
        ruleSet,
      });
      await mapComponentsForPullRequest(admin, options.orgId, pr.id);
      const result = await runEvaluation(llm, ctx);
      await persistEvaluation(admin, options.orgId, ctx, result, batchId);
    }

    await admin
      .from('evaluation_batches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', batchId);
  } catch (error) {
    await admin
      .from('evaluation_batches')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: (error as Error).message,
      })
      .eq('id', batchId);
    throw error;
  }
}

async function getRuleSetById(
  client: SupabaseClient<any>,
  orgId: string,
  ruleSetId: string,
) {
  const { data, error } = await client
    .from('scoring_rule_sets')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', ruleSetId)
    .maybeSingle();

  if (error) throw error;
  return data ?? undefined;
}

async function getActiveRuleSet(
  client: SupabaseClient<any>,
  orgId: string,
) {
  const { data, error } = await client
    .from('scoring_rule_sets')
    .select('*')
    .eq('org_id', orgId)
    .order('is_default', { ascending: false })
    .order('active_from', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? undefined;
}

async function getPromptTemplate(
  client: SupabaseClient<any>,
  orgId: string,
  ruleSetId: string,
) {
  const { data, error } = await client
    .from('prompt_templates')
    .select('*')
    .eq('org_id', orgId)
    .eq('rule_set_id', ruleSetId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? undefined;
}

async function createBatch(
  client: SupabaseClient<any>,
  orgId: string,
  ruleSetId: string,
  runType: 'manual' | 'scheduled',
) {
  const { data, error } = await client
    .from('evaluation_batches')
    .insert({
      org_id: orgId,
      rule_set_id: ruleSetId,
      run_type: runType,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function getPullRequestsToEvaluate(
  client: SupabaseClient<any>,
  orgId: string,
  ruleSetId: string,
  windowDays: number,
) {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);

  const { data: evaluated, error: evalError } = await client
    .from('pr_evaluations')
    .select('pr_id')
    .eq('org_id', orgId)
    .eq('rule_set_id', ruleSetId);

  if (evalError) throw evalError;

  const evaluatedIds = new Set(evaluated?.map((e) => e.pr_id));

  const { data, error } = await client
    .from('pull_requests')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_merged', true)
    .gte('merged_at_gh', since.toISOString())
    .order('merged_at_gh', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).filter((pr) => !evaluatedIds.has(pr.id));
}

async function buildPrContext(
  client: SupabaseClient<any>,
  orgId: string,
  prId: string,
  base: { prompt: PromptTemplateRecord; ruleSet: ScoringRuleSetRecord },
): Promise<PRContext> {
  const { data: pr, error } = await client
    .from('pull_requests')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', prId)
    .maybeSingle();

  if (error) throw error;
  if (!pr) throw new Error('Pull request not found');

  const { data: repo, error: repoError } = await client
    .from('repositories')
    .select('name, full_name')
    .eq('id', pr.repo_id)
    .maybeSingle();
  if (repoError) throw repoError;

  const { data: files, error: fileError } = await client
    .from('pr_files')
    .select('filename, status')
    .eq('pr_id', prId);
  if (fileError) throw fileError;

  const { data: links, error: linkError } = await client
    .from('pr_issue_links')
    .select('issue_id')
    .eq('pr_id', prId);
  if (linkError) throw linkError;

  const issueIds = (links ?? [])
    .map((l) => l.issue_id)
    .filter((v): v is string => Boolean(v));

  const { data: issues, error: issueError } = await client
    .from('issues')
    .select('number, title, body, labels, url')
    .in('id', issueIds.length ? issueIds : ['00000000-0000-0000-0000-000000000000']);
  if (issueError) throw issueError;

  const { data: components, error: componentsError } = await client
    .from('product_components')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true);
  if (componentsError) throw componentsError;

  const { data: severities, error: severityError } = await client
    .from('severity_levels')
    .select('*')
    .eq('org_id', orgId);
  if (severityError) throw severityError;

  return {
    pr: { ...pr, repo_name: repo?.full_name ?? repo?.name },
    files: files ?? [],
    issues: issues ?? [],
    components: components ?? [],
    severities: severities ?? [],
    prompt: base.prompt,
    ruleSet: base.ruleSet,
  };
}

async function runEvaluation(llm: LLMClient, ctx: PRContext) {
  const prompt = renderPrompt(ctx);
  const content = await llm.complete(
    ctx.ruleSet.model_name ?? 'gpt-4o-mini',
    [
      {
        role: 'system',
        content:
          'You are scoring GitHub PRs for a bug bounty. Respond with JSON only.',
      },
      { role: 'user', content: prompt },
    ],
  );

  const parsed = safeParse(content);
  return parsed;
}

function safeParse(content: string) {
  let json: unknown = content;
  try {
    json = JSON.parse(content);
  } catch {
    // some providers return already structured JSON in string form
  }

  return evaluationResultSchema.parse(json) as EvaluationLLMResult;
}

function renderPrompt(ctx: PRContext) {
  const componentsTable = ctx.components
    .map(
      (c) =>
        `${c.key} (${c.name}) - multiplier ${c.multiplier} - ${c.description ?? ''}`,
    )
    .join('\n');

  const severityTable = ctx.severities
    .map(
      (s) =>
        `${s.key} (${s.name}) - base points ${s.base_points} - ${s.description ?? ''}`,
    )
    .join('\n');

  const issueSection =
    ctx.issues.length > 0
      ? ctx.issues
          .map(
            (issue) =>
              `#${issue.number}: ${issue.title}
Labels: ${(issue.labels ?? []).join(', ')}
URL: ${issue.url ?? 'N/A'}
Body:
${issue.body ?? 'No description'}
`,
          )
          .join('\n---\n')
      : 'No linked issue';

  const filesSection =
    ctx.files.length > 0
      ? ctx.files
          .map((file) => `- ${file.filename} (${file.status ?? 'changed'})`)
          .join('\n')
      : 'No file list available';

  const prSection = `Title: ${ctx.pr.title}
Repo: ${ctx.pr.repo_name ?? 'unknown'}
URL: ${ctx.pr.url ?? 'N/A'}
Body:
${ctx.pr.body ?? 'No description'}
`;

  const eligibilityCriteria = [
    'GitHub issue exists with reproducible steps.',
    'PR contains a working fix.',
    'PR description links to the issue (Fixes #123 or similar).',
    'Tests are included or updated.',
  ].join('\n- ');

  return ctx.prompt.template
    .replace('{{components_table}}', componentsTable)
    .replace('{{severity_table}}', severityTable)
    .replace('{{issue_section}}', issueSection)
    .replace('{{pr_section}}', prSection)
    .replace('{{files_section}}', filesSection)
    .replace('{{eligibility_criteria}}', `- ${eligibilityCriteria}`);
}

async function persistEvaluation(
  client: SupabaseClient<any>,
  orgId: string,
  ctx: PRContext,
  result: EvaluationLLMResult,
  batchId: string,
) {
  const componentMap = new Map(ctx.components.map((c) => [c.key, c]));
  const severityMap = new Map(ctx.severities.map((s) => [s.key, s]));
  const primaryComponent =
    componentMap.get(result.primary_component_key) ??
    componentMap.get('OTHER') ??
    ctx.components[0];
  const severity = severityMap.get(result.severity_key);

  const basePoints = severity?.base_points ?? 0;
  const multiplier = primaryComponent?.multiplier ?? 1;
  const eligibilityFlags = result.eligibility;
  const eligible =
    eligibilityFlags.issue &&
    eligibilityFlags.fix_implementation &&
    eligibilityFlags.pr_linked &&
    eligibilityFlags.tests;
  const finalScore = eligible ? basePoints * multiplier : 0;

  const { data: evaluationRow, error } = await client
    .from('pr_evaluations')
    .upsert(
      {
        org_id: orgId,
        pr_id: ctx.pr.id,
        batch_id: batchId,
        rule_set_id: ctx.ruleSet.id,
        model_name: ctx.ruleSet.model_name ?? 'gpt-4o-mini',
        evaluation_source: 'auto',
        primary_component_id: primaryComponent?.id ?? null,
        severity_id: severity?.id ?? null,
        base_points: basePoints,
        multiplier,
        final_score: finalScore,
        eligibility_issue: eligibilityFlags.issue,
        eligibility_fix_implementation: eligibilityFlags.fix_implementation,
        eligibility_pr_linked: eligibilityFlags.pr_linked,
        eligibility_tests: eligibilityFlags.tests,
        is_eligible: eligible,
        justification_component: result.justification_component,
        justification_severity: result.justification_severity,
        impact_summary: result.impact_summary,
        eligibility_notes: result.eligibility_notes ?? null,
        review_notes: result.review_notes ?? null,
        raw_response: result,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'pr_id,rule_set_id' },
    )
    .select('id')
    .maybeSingle();

  if (error) throw error;

  await updateDeveloperDailyStats(
    client,
    orgId,
    ctx,
    result,
    finalScore,
    evaluationRow?.id,
  );
}

async function updateDeveloperDailyStats(
  client: SupabaseClient<any>,
  orgId: string,
  ctx: PRContext,
  result: EvaluationLLMResult,
  finalScore: number,
  _evaluationId?: string,
) {
  if (!ctx.pr.github_author_id) return;

  const severityKey = result.severity_key;
  const componentKey = result.primary_component_key ?? 'OTHER';
  const mergedAt = ctx.pr.merged_at_gh
    ? new Date(ctx.pr.merged_at_gh)
    : new Date();
  const dateKey = mergedAt.toISOString().slice(0, 10);
  const isEligible =
    result.eligibility.issue &&
    result.eligibility.fix_implementation &&
    result.eligibility.pr_linked &&
    result.eligibility.tests;

  const { data: existing, error } = await client
    .from('developer_daily_stats')
    .select('id, total_score, pr_count, p0_count, p1_count, p2_count, p3_count, component_scores')
    .eq('org_id', orgId)
    .eq('github_user_id', ctx.pr.github_author_id)
    .eq('date', dateKey)
    .maybeSingle();
  if (error) throw error;

  const componentScores = (existing?.component_scores ?? {}) as Record<
    string,
    number
  >;
  componentScores[componentKey] =
    (componentScores[componentKey] ?? 0) + (isEligible ? finalScore : 0);

  const payload = {
    org_id: orgId,
    github_user_id: ctx.pr.github_author_id,
    date: dateKey,
    total_score: (existing?.total_score ?? 0) + (isEligible ? finalScore : 0),
    pr_count: (existing?.pr_count ?? 0) + (isEligible ? 1 : 0),
    p0_count: (existing?.p0_count ?? 0) + (isEligible && severityKey === 'P0' ? 1 : 0),
    p1_count: (existing?.p1_count ?? 0) + (isEligible && severityKey === 'P1' ? 1 : 0),
    p2_count: (existing?.p2_count ?? 0) + (isEligible && severityKey === 'P2' ? 1 : 0),
    p3_count: (existing?.p3_count ?? 0) + (isEligible && severityKey === 'P3' ? 1 : 0),
    component_scores: componentScores,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await client
      .from('developer_daily_stats')
      .update(payload)
      .eq('id', existing.id);
  } else {
    await client.from('developer_daily_stats').insert({
      ...payload,
      id: undefined,
      created_at: new Date().toISOString(),
    });
  }
}
