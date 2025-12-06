import { z } from 'zod';

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MergeMintDatabase = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      organization_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: 'admin' | 'developer' | 'pm' | 'viewer';
        };
      };
      github_connections: {
        Row: {
          id: string;
          org_id: string;
          installation_type: 'app' | 'token';
          github_org_name: string | null;
          github_installation_id: number | null;
          token_hash: string | null;
          token_last_4: string | null;
          token_expires_at: string | null;
          is_active: boolean | null;
        };
      };
      repositories: {
        Row: {
          id: string;
          org_id: string;
          github_repo_id: number;
          name: string;
          full_name: string;
          default_branch: string | null;
          is_active: boolean | null;
          last_synced_at: string | null;
        };
      };
      github_identities: {
        Row: {
          id: string;
          github_user_id: number;
          github_login: string;
          avatar_url: string | null;
        };
      };
      product_components: {
        Row: {
          id: string;
          org_id: string;
          key: string;
          name: string;
          description: string | null;
          multiplier: number;
          is_active: boolean | null;
          sort_order: number | null;
        };
      };
      component_file_rules: {
        Row: {
          id: string;
          component_id: string;
          match_type: 'prefix' | 'suffix' | 'regex' | 'glob';
          pattern: string;
          side: 'backend' | 'frontend' | 'any';
          priority: number | null;
        };
      };
      severity_levels: {
        Row: {
          id: string;
          org_id: string;
          key: string;
          name: string;
          description: string | null;
          base_points: number;
          sort_order: number | null;
        };
      };
      scoring_rule_sets: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          is_default: boolean | null;
          model_name: string | null;
          active_from: string | null;
          active_to: string | null;
        };
      };
      prompt_templates: {
        Row: {
          id: string;
          org_id: string;
          rule_set_id: string;
          name: string;
          description: string | null;
          kind: 'pr_evaluation';
          template: string;
          ui_schema: Json;
          version: number;
        };
      };
      issues: {
        Row: {
          id: string;
          org_id: string;
          repo_id: string;
          github_issue_id: number;
          number: number;
          title: string;
          body: string | null;
          state: string | null;
          labels: string[] | null;
          created_at_gh: string | null;
          closed_at_gh: string | null;
          github_author_id: string | null;
          url: string | null;
        };
      };
      pull_requests: {
        Row: {
          id: string;
          org_id: string;
          repo_id: string;
          github_pr_id: number;
          number: number;
          title: string;
          body: string | null;
          state: string | null;
          is_merged: boolean | null;
          merged_at_gh: string | null;
          github_author_id: string | null;
          head_sha: string | null;
          base_sha: string | null;
          url: string | null;
          additions: number | null;
          deletions: number | null;
          changed_files_count: number | null;
          created_at_gh: string | null;
          updated_at_gh: string | null;
        };
      };
      pr_issue_links: {
        Row: {
          id: string;
          org_id: string;
          pr_id: string;
          issue_id: string | null;
          link_type: string | null;
        };
      };
      pr_files: {
        Row: {
          id: string;
          pr_id: string;
          filename: string;
          status: string | null;
          additions: number | null;
          deletions: number | null;
          changes: number | null;
          patch: string | null;
        };
      };
      pr_components: {
        Row: {
          id: string;
          pr_id: string;
          component_id: string;
          score_lines_changed: number | null;
          is_primary: boolean | null;
        };
      };
      evaluation_batches: {
        Row: {
          id: string;
          org_id: string;
          rule_set_id: string | null;
          run_type: 'manual' | 'scheduled';
          status: 'pending' | 'running' | 'completed' | 'failed';
          started_at: string | null;
          completed_at: string | null;
          error_message: string | null;
          created_by: string | null;
        };
      };
      pr_evaluations: {
        Row: {
          id: string;
          org_id: string;
          pr_id: string;
          batch_id: string | null;
          rule_set_id: string;
          model_name: string | null;
          evaluation_source: 'auto' | 'manual';
          primary_component_id: string | null;
          severity_id: string | null;
          base_points: number | null;
          multiplier: number | null;
          final_score: number | null;
          eligibility_issue: boolean | null;
          eligibility_fix_implementation: boolean | null;
          eligibility_pr_linked: boolean | null;
          eligibility_tests: boolean | null;
          is_eligible: boolean | null;
          justification_component: string | null;
          justification_severity: string | null;
          impact_summary: string | null;
          eligibility_notes: string | null;
          review_notes: string | null;
          raw_response: Json | null;
          created_by: string | null;
        };
      };
      developer_daily_stats: {
        Row: {
          id: string;
          org_id: string;
          github_user_id: string;
          date: string;
          total_score: number | null;
          pr_count: number | null;
          p0_count: number | null;
          p1_count: number | null;
          p2_count: number | null;
          p3_count: number | null;
          component_scores: Record<string, number>;
        };
      };
    };
  };
};

export const evaluationResultSchema = z.object({
  primary_component_key: z.string(),
  severity_key: z.string(),
  eligibility: z.object({
    issue: z.boolean(),
    fix_implementation: z.boolean(),
    pr_linked: z.boolean(),
    tests: z.boolean(),
  }),
  justification_component: z.string(),
  justification_severity: z.string(),
  impact_summary: z.string(),
  eligibility_notes: z.string().optional().nullable(),
  review_notes: z.string().optional().nullable(),
});

export type EvaluationLLMResult = z.infer<typeof evaluationResultSchema>;

export type ComponentRule = MergeMintDatabase['public']['Tables']['component_file_rules']['Row'] & {
  component: MergeMintDatabase['public']['Tables']['product_components']['Row'];
};

export type PullRequestRecord =
  MergeMintDatabase['public']['Tables']['pull_requests']['Row'];

export type SeverityRecord =
  MergeMintDatabase['public']['Tables']['severity_levels']['Row'];

export type ComponentRecord =
  MergeMintDatabase['public']['Tables']['product_components']['Row'];

export type PromptTemplateRecord =
  MergeMintDatabase['public']['Tables']['prompt_templates']['Row'];

export type ScoringRuleSetRecord =
  MergeMintDatabase['public']['Tables']['scoring_rule_sets']['Row'];
