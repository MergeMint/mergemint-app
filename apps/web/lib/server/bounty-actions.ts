/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type {
  CalculatedReward,
  CreateProgramInput,
} from '../types/bounty.types';
import {
  sendRewardCalculatedEmail,
  sendRewardApprovedEmail,
  sendRewardPaidEmail,
} from '../email/bounty-notifications';

// Validation schemas
const createProgramSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(3),
  description: z.string().optional(),
  program_type: z.enum(['ranking', 'tier']),
  period_type: z.enum(['weekly', 'monthly', 'quarterly', 'custom']),
  start_date: z.string(),
  end_date: z.string(),
  auto_notify: z.coerce.boolean().default(true),
  slug: z.string().optional(),
  ranking_rewards: z.string().optional(), // JSON string
  tier_rewards: z.string().optional(), // JSON string
});

const updateProgramSchema = z.object({
  programId: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  auto_notify: z.coerce.boolean().optional(),
  slug: z.string().optional(),
});

const updateStatusSchema = z.object({
  programId: z.string().uuid(),
  orgId: z.string().uuid(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']),
  slug: z.string().optional(),
});

const calculateRewardsSchema = z.object({
  programId: z.string().uuid(),
  orgId: z.string().uuid(),
  slug: z.string().optional(),
});

const approveRewardSchema = z.object({
  rewardId: z.string().uuid(),
  orgId: z.string().uuid(),
  notes: z.string().optional(),
  slug: z.string().optional(),
});

const markPaidSchema = z.object({
  rewardId: z.string().uuid(),
  orgId: z.string().uuid(),
  payout_method: z.string().min(1),
  payout_reference: z.string().min(1),
  payout_notes: z.string().optional(),
  slug: z.string().optional(),
});

// Helper function to check if user is org admin
async function assertOrgAdmin(orgId: string) {
  const client = getSupabaseServerClient<any>();
  const admin = getSupabaseServerAdminClient<any>();
  const { data: authData } = await client.auth.getUser();
  const userId = authData.user?.id;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Use admin client to bypass RLS for membership check
  const { data: membership, error } = await admin
    .from('organization_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!membership || membership.role !== 'admin') {
    throw new Error('Admin role required');
  }

  return userId;
}

// Server actions

export async function createBountyProgramAction(formData: FormData) {
  const parsed = createProgramSchema.safeParse({
    orgId: formData.get('orgId'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    program_type: formData.get('program_type'),
    period_type: formData.get('period_type'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    auto_notify: formData.get('auto_notify'),
    slug: formData.get('slug') || undefined,
    ranking_rewards: formData.get('ranking_rewards') || undefined,
    tier_rewards: formData.get('tier_rewards') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const {
    orgId,
    name,
    description,
    program_type,
    period_type,
    start_date,
    end_date,
    auto_notify,
    slug,
    ranking_rewards: rankingRewardsStr,
    tier_rewards: tierRewardsStr,
  } = parsed.data;

  const userId = await assertOrgAdmin(orgId);
  const admin = getSupabaseServerAdminClient<any>();

  // Create the program
  const { data: program, error: programError } = await admin
    .from('bounty_programs')
    .insert({
      org_id: orgId,
      name,
      description,
      program_type,
      period_type,
      start_date,
      end_date,
      auto_notify,
      created_by: userId,
      status: 'draft',
    })
    .select()
    .single();

  if (programError) throw programError;

  // Create ranking rewards if applicable
  if (program_type === 'ranking' && rankingRewardsStr) {
    const rankingRewards = JSON.parse(rankingRewardsStr);
    if (Array.isArray(rankingRewards) && rankingRewards.length > 0) {
      const { error: rankingError } = await admin
        .from('bounty_ranking_config')
        .insert(
          rankingRewards.map((r: any) => ({
            program_id: program.id,
            rank_position: r.rank,
            reward_amount: r.amount,
            reward_currency: r.currency || 'USD',
          })),
        );

      if (rankingError) throw rankingError;
    }
  }

  // Create tier rewards if applicable
  if (program_type === 'tier' && tierRewardsStr) {
    const tierRewards = JSON.parse(tierRewardsStr);
    if (Array.isArray(tierRewards) && tierRewards.length > 0) {
      const { error: tierError } = await admin
        .from('bounty_tier_config')
        .insert(
          tierRewards.map((t: any, index: number) => ({
            program_id: program.id,
            tier_name: t.tier_name,
            min_score: t.min_score,
            max_score: t.max_score || null,
            reward_amount: t.amount,
            reward_currency: t.currency || 'USD',
            sort_order: t.sort_order ?? index,
          })),
        );

      if (tierError) throw tierError;
    }
  }

  revalidateBountyPaths(orgId, slug);

  return { success: true, programId: program.id };
}

export async function updateBountyProgramAction(formData: FormData) {
  const parsed = updateProgramSchema.safeParse({
    programId: formData.get('programId'),
    orgId: formData.get('orgId'),
    name: formData.get('name') || undefined,
    description: formData.get('description') || undefined,
    start_date: formData.get('start_date') || undefined,
    end_date: formData.get('end_date') || undefined,
    auto_notify: formData.get('auto_notify'),
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { programId, orgId, slug, ...updates } = parsed.data;
  await assertOrgAdmin(orgId);
  const admin = getSupabaseServerAdminClient<any>();

  // Remove undefined values
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined),
  );

  const { error } = await admin
    .from('bounty_programs')
    .update(cleanUpdates)
    .eq('id', programId)
    .eq('org_id', orgId);

  if (error) throw error;

  revalidateBountyPaths(orgId, slug);

  return { success: true };
}

export async function updateProgramStatusAction(formData: FormData) {
  const parsed = updateStatusSchema.safeParse({
    programId: formData.get('programId'),
    orgId: formData.get('orgId'),
    status: formData.get('status'),
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { programId, orgId, status, slug } = parsed.data;
  await assertOrgAdmin(orgId);
  const admin = getSupabaseServerAdminClient<any>();

  const { error } = await admin
    .from('bounty_programs')
    .update({ status })
    .eq('id', programId)
    .eq('org_id', orgId);

  if (error) throw error;

  revalidateBountyPaths(orgId, slug);

  return { success: true };
}

export async function calculateProgramRewardsAction(formData: FormData) {
  const parsed = calculateRewardsSchema.safeParse({
    programId: formData.get('programId'),
    orgId: formData.get('orgId'),
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { programId, orgId, slug } = parsed.data;
  await assertOrgAdmin(orgId);
  const admin = getSupabaseServerAdminClient<any>();

  // Call the database function to calculate rewards
  const { data: calculatedRewards, error: calcError } = await admin.rpc(
    'calculate_bounty_rewards',
    { program_uuid: programId },
  );

  if (calcError) throw calcError;

  if (!calculatedRewards || calculatedRewards.length === 0) {
    return { success: true, rewards: [], message: 'No eligible developers found' };
  }

  // Insert calculated rewards into bounty_rewards table
  const rewardsToInsert = (calculatedRewards as CalculatedReward[]).map(
    (reward) => ({
      program_id: programId,
      org_id: orgId,
      github_user_id: reward.github_user_id,
      final_score: reward.final_score,
      rank_position: reward.rank_position,
      tier_name: reward.tier_name,
      reward_amount: reward.reward_amount,
      reward_currency: reward.reward_currency,
      payout_status: 'pending',
    }),
  );

  const { error: insertError } = await admin
    .from('bounty_rewards')
    .upsert(rewardsToInsert, {
      onConflict: 'program_id,github_user_id',
    });

  if (insertError) throw insertError;

  // Send email notifications if auto_notify is enabled
  const { data: program } = await admin
    .from('bounty_programs')
    .select('name, auto_notify, org_id')
    .eq('id', programId)
    .single();

  if (program?.auto_notify) {
    // Get org details for email
    const { data: org } = await admin
      .from('organizations')
      .select('name, slug')
      .eq('id', orgId)
      .single();

    // Send emails to each recipient (background process, don't wait)
    for (const reward of calculatedRewards as CalculatedReward[]) {
      // Get developer's email from GitHub identity
      const { data: githubIdentity } = await admin
        .from('github_identities')
        .select('user_id')
        .eq('id', reward.github_user_id)
        .single();

      if (githubIdentity?.user_id) {
        const { data: userData } = await admin.auth.admin.getUserById(
          githubIdentity.user_id,
        );

        if (userData?.user?.email) {
          const rankOrTier = reward.rank_position
            ? `Rank #${reward.rank_position}`
            : reward.tier_name || 'Participant';

          // Fire and forget - don't block on email sending
          sendRewardCalculatedEmail({
            to: userData.user.email,
            developerName:
              userData.user.user_metadata?.name ||
              reward.github_login ||
              'Developer',
            programName: program.name,
            finalScore: Number(reward.final_score),
            rankOrTier,
            rewardAmount: Number(reward.reward_amount),
            rewardCurrency: reward.reward_currency,
            orgName: org?.name || 'Organization',
            orgSlug: org?.slug || slug || '',
          }).catch((error) => {
            console.error('Failed to send reward calculated email:', error);
          });
        }
      }
    }
  }

  revalidateBountyPaths(orgId, slug);

  return {
    success: true,
    rewards: calculatedRewards,
    count: calculatedRewards.length,
  };
}

export async function approveRewardAction(formData: FormData) {
  const parsed = approveRewardSchema.safeParse({
    rewardId: formData.get('rewardId'),
    orgId: formData.get('orgId'),
    notes: formData.get('notes') || undefined,
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { rewardId, orgId, notes, slug } = parsed.data;
  const userId = await assertOrgAdmin(orgId);
  const admin = getSupabaseServerAdminClient<any>();

  // Get reward details before updating
  const { data: rewardData } = await admin
    .from('bounty_rewards')
    .select(
      `
      *,
      bounty_programs!inner(name),
      github_identities!inner(user_id, github_login)
    `,
    )
    .eq('id', rewardId)
    .single();

  const { error } = await admin
    .from('bounty_rewards')
    .update({
      payout_status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString(),
      payout_notes: notes,
    })
    .eq('id', rewardId)
    .eq('org_id', orgId);

  if (error) throw error;

  // Send approval email
  if (rewardData) {
    const { data: org } = await admin
      .from('organizations')
      .select('name, slug')
      .eq('id', orgId)
      .single();

    const { data: userData } = await admin.auth.admin.getUserById(
      (rewardData as any).github_identities.user_id,
    );

    if (userData?.user?.email) {
      sendRewardApprovedEmail({
        to: userData.user.email,
        developerName:
          userData.user.user_metadata?.name ||
          (rewardData as any).github_identities.github_login ||
          'Developer',
        programName: (rewardData as any).bounty_programs.name,
        rewardAmount: Number(rewardData.reward_amount),
        rewardCurrency: rewardData.reward_currency,
        orgName: org?.name || 'Organization',
        orgSlug: org?.slug || slug || '',
      }).catch((error) => {
        console.error('Failed to send reward approved email:', error);
      });
    }
  }

  revalidateBountyPaths(orgId, slug);

  return { success: true };
}

export async function markRewardPaidAction(formData: FormData) {
  const parsed = markPaidSchema.safeParse({
    rewardId: formData.get('rewardId'),
    orgId: formData.get('orgId'),
    payout_method: formData.get('payout_method'),
    payout_reference: formData.get('payout_reference'),
    payout_notes: formData.get('payout_notes') || undefined,
    slug: formData.get('slug') || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { rewardId, orgId, payout_method, payout_reference, payout_notes, slug } =
    parsed.data;
  await assertOrgAdmin(orgId);
  const admin = getSupabaseServerAdminClient<any>();

  // Get reward details before updating
  const { data: rewardData } = await admin
    .from('bounty_rewards')
    .select(
      `
      *,
      bounty_programs!inner(name),
      github_identities!inner(user_id, github_login)
    `,
    )
    .eq('id', rewardId)
    .single();

  const { error } = await admin
    .from('bounty_rewards')
    .update({
      payout_status: 'paid',
      payout_method,
      payout_reference,
      payout_date: new Date().toISOString(),
      payout_notes,
    })
    .eq('id', rewardId)
    .eq('org_id', orgId);

  if (error) throw error;

  // Send payment confirmation email
  if (rewardData) {
    const { data: org } = await admin
      .from('organizations')
      .select('name, slug')
      .eq('id', orgId)
      .single();

    const { data: userData } = await admin.auth.admin.getUserById(
      (rewardData as any).github_identities.user_id,
    );

    if (userData?.user?.email) {
      sendRewardPaidEmail({
        to: userData.user.email,
        developerName:
          userData.user.user_metadata?.name ||
          (rewardData as any).github_identities.github_login ||
          'Developer',
        programName: (rewardData as any).bounty_programs.name,
        rewardAmount: Number(rewardData.reward_amount),
        rewardCurrency: rewardData.reward_currency,
        payoutMethod: payout_method,
        payoutReference: payout_reference,
        orgName: org?.name || 'Organization',
        orgSlug: org?.slug || slug || '',
      }).catch((error) => {
        console.error('Failed to send reward paid email:', error);
      });
    }
  }

  revalidateBountyPaths(orgId, slug);

  return { success: true };
}

export async function deleteBountyProgramAction(formData: FormData) {
  const programId = String(formData.get('programId'));
  const orgId = String(formData.get('orgId'));
  const slug = formData.get('slug')?.toString();

  await assertOrgAdmin(orgId);
  const admin = getSupabaseServerAdminClient<any>();

  // Only allow deleting draft programs
  const { data: program } = await admin
    .from('bounty_programs')
    .select('status')
    .eq('id', programId)
    .eq('org_id', orgId)
    .single();

  if (program?.status !== 'draft') {
    throw new Error('Only draft programs can be deleted');
  }

  const { error } = await admin
    .from('bounty_programs')
    .delete()
    .eq('id', programId)
    .eq('org_id', orgId);

  if (error) throw error;

  revalidateBountyPaths(orgId, slug);

  return { success: true };
}

// Helper function to revalidate bounty-related paths
function revalidateBountyPaths(orgId: string, slug?: string | null) {
  revalidatePath('/home/mergemint');
  if (slug) {
    revalidatePath(`/${slug}/bounty`);
    revalidatePath(`/${slug}/admin/bounty`);
    revalidatePath(`/${slug}/admin`);
    revalidatePath(`/${slug}/leaderboard`);
  } else {
    revalidatePath(`/${orgId}/bounty`);
    revalidatePath(`/${orgId}/admin/bounty`);
  }
}
