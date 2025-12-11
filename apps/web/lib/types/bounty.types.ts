// TypeScript types for Bug Bounty Programs

export type ProgramType = 'ranking' | 'tier';
export type ProgramStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'custom';
export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface BountyProgram {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  program_type: ProgramType;
  status: ProgramStatus;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  auto_notify: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BountyRankingConfig {
  id: string;
  program_id: string;
  rank_position: number;
  reward_amount: number;
  reward_currency: string;
  created_at: string;
}

export interface BountyTierConfig {
  id: string;
  program_id: string;
  tier_name: string;
  min_score: number;
  max_score?: number;
  reward_amount: number;
  reward_currency: string;
  sort_order: number;
  created_at: string;
}

export interface BountyReward {
  id: string;
  program_id: string;
  org_id: string;
  github_user_id: string;
  final_score: number;
  rank_position?: number;
  tier_name?: string;
  reward_amount: number;
  reward_currency: string;
  payout_status: PayoutStatus;
  payout_method?: string;
  payout_date?: string;
  payout_reference?: string;
  payout_notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Extended types for API responses
export interface BountyProgramWithDetails extends BountyProgram {
  ranking_rewards?: Array<{
    rank: number;
    amount: number;
    currency: string;
  }>;
  tier_rewards?: Array<{
    tier: string;
    min_score: number;
    max_score?: number;
    amount: number;
    currency: string;
  }>;
  rewards_count?: number;
  total_reward_amount?: number;
  pending_rewards_count?: number;
  approved_rewards_count?: number;
  paid_rewards_count?: number;
}

export interface BountyRewardWithDetails extends BountyReward {
  github_login?: string;
  github_name?: string;
  github_avatar_url?: string;
  program_name?: string;
}

// Form input types
export interface CreateProgramInput {
  org_id: string;
  name: string;
  description?: string;
  program_type: ProgramType;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  auto_notify?: boolean;
  ranking_rewards?: Array<{
    rank: number;
    amount: number;
    currency?: string;
  }>;
  tier_rewards?: Array<{
    tier_name: string;
    min_score: number;
    max_score?: number;
    amount: number;
    currency?: string;
    sort_order?: number;
  }>;
}

export interface UpdateProgramInput {
  id: string;
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  auto_notify?: boolean;
}

export interface ApproveRewardInput {
  reward_id: string;
  notes?: string;
}

export interface MarkPaidInput {
  reward_id: string;
  payout_method: string;
  payout_reference: string;
  payout_notes?: string;
}

// Calculated reward result
export interface CalculatedReward {
  github_user_id: string;
  github_login: string;
  final_score: number;
  rank_position?: number;
  tier_name?: string;
  reward_amount: number;
  reward_currency: string;
}
