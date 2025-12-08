/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { runEvaluationBatch } from '../mergemint/evaluation-runner';
import { syncOrgFromGithub } from '../mergemint/github-sync';

const componentSchema = z.object({
  orgId: z.string().uuid(),
  id: z.string().uuid().optional(),
  key: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional(),
  multiplier: z.coerce.number().positive(),
  slug: z.string().optional(),
});

const severitySchema = z.object({
  orgId: z.string().uuid(),
  id: z.string().uuid().optional(),
  key: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  base_points: z.coerce.number().int().nonnegative(),
  slug: z.string().optional(),
});

const promptSchema = z.object({
  orgId: z.string().uuid(),
  ruleSetId: z.string().uuid(),
  template: z.string().min(10),
  slug: z.string().optional(),
});

async function assertOrgAdmin(orgId: string) {
  const client = getSupabaseServerClient<any>();
  const { data: authData } = await client.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const { data: membership, error } = await client
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!membership || membership.role !== 'admin') {
    throw new Error('Admin role required');
  }
}

export async function saveComponentAction(formData: FormData) {
  const parsed = componentSchema.safeParse({
    orgId: formData.get('orgId'),
    id: formData.get('id') || undefined,
    key: formData.get('key'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    multiplier: formData.get('multiplier'),
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const payload = parsed.data;
  await assertOrgAdmin(payload.orgId);
  const client = getSupabaseServerClient<any>();

  await client.from('product_components').upsert({
    id: payload.id,
    org_id: payload.orgId,
    key: payload.key,
    name: payload.name,
    description: payload.description,
    multiplier: payload.multiplier,
    updated_at: new Date().toISOString(),
  });

  revalidateOrgPaths(payload.orgId, payload.slug);
}

export async function saveSeverityAction(formData: FormData) {
  const parsed = severitySchema.safeParse({
    orgId: formData.get('orgId'),
    id: formData.get('id') || undefined,
    key: formData.get('key'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    base_points: formData.get('base_points'),
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const payload = parsed.data;
  await assertOrgAdmin(payload.orgId);
  const client = getSupabaseServerClient<any>();

  await client.from('severity_levels').upsert({
    id: payload.id,
    org_id: payload.orgId,
    key: payload.key,
    name: payload.name,
    description: payload.description,
    base_points: payload.base_points,
    updated_at: new Date().toISOString(),
  });

  revalidateOrgPaths(payload.orgId, payload.slug);
}

export async function savePromptTemplateAction(formData: FormData) {
  const parsed = promptSchema.safeParse({
    orgId: formData.get('orgId'),
    ruleSetId: formData.get('ruleSetId'),
    template: formData.get('template'),
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) throw new Error(parsed.error.message);

  const { orgId, ruleSetId, template } = parsed.data;
  await assertOrgAdmin(orgId);
  const client = getSupabaseServerClient<any>();

  await client.from('prompt_templates').upsert({
    org_id: orgId,
    rule_set_id: ruleSetId,
    template,
    name: 'PR Evaluation',
    description: 'Custom template configured by admin',
    version: Date.now(),
    kind: 'pr_evaluation',
    updated_at: new Date().toISOString(),
  });

  revalidateOrgPaths(orgId, parsed.data.slug);
}

export async function triggerGithubSyncAction(formData: FormData) {
  const orgId = String(formData.get('orgId'));
  const slug = formData.get('slug')?.toString();
  await assertOrgAdmin(orgId);
  await syncOrgFromGithub(orgId);
  revalidateOrgPaths(orgId, slug);
}

export async function triggerEvaluationRunAction(formData: FormData) {
  const orgId = String(formData.get('orgId'));
  const slug = formData.get('slug')?.toString();
  await assertOrgAdmin(orgId);
  await runEvaluationBatch({ orgId, runType: 'manual' });
  revalidateOrgPaths(orgId, slug);
}

function revalidateOrgPaths(orgId: string, slug?: string | null) {
  revalidatePath('/home/mergemint');
  if (slug) {
    revalidatePath(`/${slug}/admin`);
    revalidatePath(`/${slug}/leaderboard`);
    revalidatePath(`/${slug}/me`);
    revalidatePath(`/${slug}/prs`);
  } else {
    revalidatePath(`/${orgId}/admin`);
  }
}
