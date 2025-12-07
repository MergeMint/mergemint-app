-- MergeMint core schema, RLS, and default seeders
-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    display_name text,
    avatar_url text,
    github_username text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy profiles_select on public.profiles
    for select using (id = auth.uid());
create policy profiles_insert on public.profiles
    for insert with check (id = auth.uid());
create policy profiles_update on public.profiles
    for update using (id = auth.uid());

-- Organizations and membership
create table if not exists public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    created_by uuid references auth.users,
    updated_by uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.organization_members (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    user_id uuid not null references auth.users on delete cascade,
    role text not null check (role in ('admin', 'developer', 'pm', 'viewer')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id, user_id)
);
create index if not exists organization_members_org_idx on public.organization_members (org_id);

-- Helper membership functions (placed after organization_members exists)
create or replace function kit.is_org_member(org uuid) returns boolean
    language sql
    security definer
    set search_path = public as
$$
select exists(
    select 1
    from public.organization_members om
    where om.org_id = org
      and om.user_id = auth.uid()
);
$$;

create or replace function kit.is_org_admin(org uuid) returns boolean
    language sql
    security definer
    set search_path = public as
$$
select exists(
    select 1
    from public.organization_members om
    where om.org_id = org
      and om.user_id = auth.uid()
      and om.role = 'admin'
);
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create policy organizations_select on public.organizations
    for select using (
        exists(
            select 1 from public.organization_members om
            where om.org_id = id and om.user_id = auth.uid()
        )
    );
create policy organizations_insert on public.organizations
    for insert to authenticated
    with check (true);
create policy organizations_update on public.organizations
    for update using (kit.is_org_admin(id));
create policy organizations_delete on public.organizations
    for delete using (kit.is_org_admin(id));

create policy organization_members_select on public.organization_members
    for select using (kit.is_org_member(org_id));
create policy organization_members_insert on public.organization_members
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy organization_members_update on public.organization_members
    for update using (kit.is_org_admin(org_id));
create policy organization_members_delete on public.organization_members
    for delete using (kit.is_org_admin(org_id));

-- GitHub identities (global)
create table if not exists public.github_identities (
    id uuid primary key default gen_random_uuid(),
    github_user_id bigint not null,
    github_login text not null,
    avatar_url text,
    linked_user_id uuid references auth.users on delete set null,
    last_seen_at timestamptz default now(),
    created_at timestamptz default now(),
    unique (github_user_id)
);
create index if not exists github_identities_login_idx on public.github_identities (github_login);

alter table public.github_identities enable row level security;
create policy github_identities_select on public.github_identities
    for select using (true);
create policy github_identities_insert on public.github_identities
    for insert to authenticated with check (true);
create policy github_identities_update on public.github_identities
    for update to authenticated using (true);

-- GitHub connections and repositories
create table if not exists public.github_connections (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    installation_type text not null check (installation_type in ('app', 'token')),
    github_org_name text,
    github_installation_id bigint,
    token_hash text,
    token_last_4 text,
    token_expires_at timestamptz,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id)
);

create table if not exists public.repositories (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    github_repo_id bigint not null,
    name text not null,
    full_name text not null,
    default_branch text,
    is_active boolean default true,
    last_synced_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id, github_repo_id)
);
create index if not exists repositories_org_active_idx on public.repositories (org_id, is_active);

alter table public.github_connections enable row level security;
alter table public.repositories enable row level security;

create policy github_connections_select on public.github_connections
    for select using (kit.is_org_member(org_id));
create policy github_connections_insert on public.github_connections
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy github_connections_update on public.github_connections
    for update using (kit.is_org_admin(org_id));

create policy repositories_select on public.repositories
    for select using (kit.is_org_member(org_id));
create policy repositories_insert on public.repositories
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy repositories_update on public.repositories
    for update using (kit.is_org_admin(org_id));

-- Components and severity configuration
create table if not exists public.product_components (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    key text not null,
    name text not null,
    description text,
    multiplier numeric(10, 2) not null default 1,
    is_active boolean default true,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id, key)
);

create table if not exists public.component_file_rules (
    id uuid primary key default gen_random_uuid(),
    component_id uuid not null references public.product_components on delete cascade,
    match_type text not null check (match_type in ('prefix', 'suffix', 'regex', 'glob')),
    pattern text not null,
    side text not null default 'any' check (side in ('backend', 'frontend', 'any')),
    priority integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists component_file_rules_component_idx on public.component_file_rules (component_id, priority desc);

create table if not exists public.severity_levels (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    key text not null,
    name text not null,
    description text,
    base_points integer not null default 0,
    sort_order integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id, key)
);

create table if not exists public.scoring_rule_sets (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    name text not null,
    description text,
    is_default boolean default false,
    model_name text,
    active_from timestamptz,
    active_to timestamptz,
    created_by uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create unique index if not exists scoring_rule_sets_default_idx
    on public.scoring_rule_sets (org_id)
    where is_default;

create table if not exists public.prompt_templates (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    rule_set_id uuid not null references public.scoring_rule_sets on delete cascade,
    name text not null,
    description text,
    kind text not null default 'pr_evaluation' check (kind in ('pr_evaluation')),
    template text not null,
    ui_schema jsonb not null default '{}'::jsonb,
    version integer not null default 1,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists prompt_templates_org_idx on public.prompt_templates (org_id);

alter table public.product_components enable row level security;
alter table public.component_file_rules enable row level security;
alter table public.severity_levels enable row level security;
alter table public.scoring_rule_sets enable row level security;
alter table public.prompt_templates enable row level security;

create policy product_components_select on public.product_components
    for select using (kit.is_org_member(org_id));
create policy product_components_insert on public.product_components
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy product_components_update on public.product_components
    for update using (kit.is_org_admin(org_id));
create policy product_components_delete on public.product_components
    for delete using (kit.is_org_admin(org_id));

create policy component_file_rules_select on public.component_file_rules
    for select using (
        kit.is_org_member((select pc.org_id from public.product_components pc where pc.id = component_id))
    );
create policy component_file_rules_insert on public.component_file_rules
    for insert to authenticated
    with check (
        kit.is_org_admin((select pc.org_id from public.product_components pc where pc.id = component_id))
    );
create policy component_file_rules_update on public.component_file_rules
    for update using (
        kit.is_org_admin((select pc.org_id from public.product_components pc where pc.id = component_id))
    );
create policy component_file_rules_delete on public.component_file_rules
    for delete using (
        kit.is_org_admin((select pc.org_id from public.product_components pc where pc.id = component_id))
    );

create policy severity_levels_select on public.severity_levels
    for select using (kit.is_org_member(org_id));
create policy severity_levels_insert on public.severity_levels
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy severity_levels_update on public.severity_levels
    for update using (kit.is_org_admin(org_id));
create policy severity_levels_delete on public.severity_levels
    for delete using (kit.is_org_admin(org_id));

create policy scoring_rule_sets_select on public.scoring_rule_sets
    for select using (kit.is_org_member(org_id));
create policy scoring_rule_sets_insert on public.scoring_rule_sets
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy scoring_rule_sets_update on public.scoring_rule_sets
    for update using (kit.is_org_admin(org_id));
create policy scoring_rule_sets_delete on public.scoring_rule_sets
    for delete using (kit.is_org_admin(org_id));

create policy prompt_templates_select on public.prompt_templates
    for select using (kit.is_org_member(org_id));
create policy prompt_templates_insert on public.prompt_templates
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy prompt_templates_update on public.prompt_templates
    for update using (kit.is_org_admin(org_id));
create policy prompt_templates_delete on public.prompt_templates
    for delete using (kit.is_org_admin(org_id));

-- Issues and pull requests
create table if not exists public.issues (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    repo_id uuid not null references public.repositories on delete cascade,
    github_issue_id bigint not null,
    number integer not null,
    title text not null,
    body text,
    state text,
    labels text[] default '{}',
    created_at_gh timestamptz,
    closed_at_gh timestamptz,
    github_author_id uuid references public.github_identities on delete set null,
    url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id, github_issue_id)
);
create index if not exists issues_org_repo_idx on public.issues (org_id, repo_id);

create table if not exists public.pull_requests (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    repo_id uuid not null references public.repositories on delete cascade,
    github_pr_id bigint not null,
    number integer not null,
    title text not null,
    body text,
    state text,
    is_merged boolean default false,
    merged_at_gh timestamptz,
    github_author_id uuid references public.github_identities on delete set null,
    head_sha text,
    base_sha text,
    url text,
    additions integer default 0,
    deletions integer default 0,
    changed_files_count integer default 0,
    created_at_gh timestamptz,
    updated_at_gh timestamptz,
    first_synced_at timestamptz default now(),
    last_synced_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id, github_pr_id)
);
create index if not exists pull_requests_org_merged_idx on public.pull_requests (org_id, is_merged, merged_at_gh desc);

create table if not exists public.pr_issue_links (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    pr_id uuid not null references public.pull_requests on delete cascade,
    issue_id uuid references public.issues on delete cascade,
    link_type text default 'referenced',
    created_at timestamptz default now()
);
create index if not exists pr_issue_links_pr_idx on public.pr_issue_links (pr_id);
create unique index if not exists pr_issue_links_unique on public.pr_issue_links (pr_id, issue_id);

create table if not exists public.pr_files (
    id uuid primary key default gen_random_uuid(),
    pr_id uuid not null references public.pull_requests on delete cascade,
    filename text not null,
    status text,
    additions integer default 0,
    deletions integer default 0,
    changes integer default 0,
    patch text,
    created_at timestamptz default now()
);
create index if not exists pr_files_pr_idx on public.pr_files (pr_id);

create table if not exists public.pr_components (
    id uuid primary key default gen_random_uuid(),
    pr_id uuid not null references public.pull_requests on delete cascade,
    component_id uuid not null references public.product_components on delete cascade,
    score_lines_changed integer default 0,
    is_primary boolean default false,
    created_at timestamptz default now(),
    unique (pr_id, component_id)
);
create unique index if not exists pr_components_primary_idx on public.pr_components (pr_id) where is_primary;

alter table public.issues enable row level security;
alter table public.pull_requests enable row level security;
alter table public.pr_issue_links enable row level security;
alter table public.pr_files enable row level security;
alter table public.pr_components enable row level security;

create policy issues_select on public.issues
    for select using (kit.is_org_member(org_id));
create policy issues_insert on public.issues
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy issues_update on public.issues
    for update using (kit.is_org_admin(org_id));

create policy pull_requests_select on public.pull_requests
    for select using (kit.is_org_member(org_id));
create policy pull_requests_insert on public.pull_requests
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy pull_requests_update on public.pull_requests
    for update using (kit.is_org_admin(org_id));

create policy pr_issue_links_select on public.pr_issue_links
    for select using (kit.is_org_member(org_id));
create policy pr_issue_links_insert on public.pr_issue_links
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy pr_issue_links_delete on public.pr_issue_links
    for delete using (kit.is_org_admin(org_id));

create policy pr_files_select on public.pr_files
    for select using (
        kit.is_org_member((select pr.org_id from public.pull_requests pr where pr.id = pr_files.pr_id))
    );
create policy pr_files_insert on public.pr_files
    for insert to authenticated
    with check (
        kit.is_org_admin((select pr.org_id from public.pull_requests pr where pr.id = pr_files.pr_id))
    );
create policy pr_files_update on public.pr_files
    for update using (
        kit.is_org_admin((select pr.org_id from public.pull_requests pr where pr.id = pr_files.pr_id))
    );
create policy pr_files_delete on public.pr_files
    for delete using (
        kit.is_org_admin((select pr.org_id from public.pull_requests pr where pr.id = pr_files.pr_id))
    );

create policy pr_components_select on public.pr_components
    for select using (
        kit.is_org_member((select pr.org_id from public.pull_requests pr where pr.id = pr_components.pr_id))
    );
create policy pr_components_insert on public.pr_components
    for insert to authenticated
    with check (
        kit.is_org_admin((select pr.org_id from public.pull_requests pr where pr.id = pr_components.pr_id))
    );
create policy pr_components_delete on public.pr_components
    for delete using (
        kit.is_org_admin((select pr.org_id from public.pull_requests pr where pr.id = pr_components.pr_id))
    );

-- Evaluation batches and results
create table if not exists public.evaluation_batches (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    rule_set_id uuid references public.scoring_rule_sets on delete set null,
    run_type text not null default 'scheduled' check (run_type in ('manual', 'scheduled')),
    status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
    started_at timestamptz,
    completed_at timestamptz,
    error_message text,
    created_by uuid references auth.users,
    created_at timestamptz default now()
);
create index if not exists evaluation_batches_org_idx on public.evaluation_batches (org_id, created_at desc);

create table if not exists public.pr_evaluations (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    pr_id uuid not null references public.pull_requests on delete cascade,
    batch_id uuid references public.evaluation_batches on delete set null,
    rule_set_id uuid not null references public.scoring_rule_sets on delete cascade,
    model_name text,
    evaluation_source text not null default 'auto' check (evaluation_source in ('auto', 'manual')),
    primary_component_id uuid references public.product_components on delete set null,
    severity_id uuid references public.severity_levels on delete set null,
    base_points integer,
    multiplier numeric(10, 2),
    final_score numeric(12, 2),
    eligibility_issue boolean,
    eligibility_fix_implementation boolean,
    eligibility_pr_linked boolean,
    eligibility_tests boolean,
    is_eligible boolean default true,
    justification_component text,
    justification_severity text,
    impact_summary text,
    eligibility_notes text,
    review_notes text,
    raw_response jsonb,
    created_by uuid references auth.users,
    created_at timestamptz default now(),
    unique (pr_id, rule_set_id)
);
create index if not exists pr_evaluations_org_rule_idx on public.pr_evaluations (org_id, rule_set_id);

alter table public.evaluation_batches enable row level security;
alter table public.pr_evaluations enable row level security;

create policy evaluation_batches_select on public.evaluation_batches
    for select using (kit.is_org_member(org_id));
create policy evaluation_batches_insert on public.evaluation_batches
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy evaluation_batches_update on public.evaluation_batches
    for update using (kit.is_org_admin(org_id));

create policy pr_evaluations_select on public.pr_evaluations
    for select using (kit.is_org_member(org_id));
create policy pr_evaluations_insert on public.pr_evaluations
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy pr_evaluations_update on public.pr_evaluations
    for update using (kit.is_org_admin(org_id));

-- Developer daily stats
create table if not exists public.developer_daily_stats (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    github_user_id uuid not null references public.github_identities on delete cascade,
    date date not null,
    total_score numeric(12, 2) default 0,
    pr_count integer default 0,
    p0_count integer default 0,
    p1_count integer default 0,
    p2_count integer default 0,
    p3_count integer default 0,
    component_scores jsonb not null default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (org_id, github_user_id, date)
);
create index if not exists developer_daily_stats_org_idx on public.developer_daily_stats (org_id, date desc);

alter table public.developer_daily_stats enable row level security;
create policy developer_daily_stats_select on public.developer_daily_stats
    for select using (kit.is_org_member(org_id));
create policy developer_daily_stats_insert on public.developer_daily_stats
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy developer_daily_stats_update on public.developer_daily_stats
    for update using (kit.is_org_admin(org_id));

-- Views for analytics
create or replace view public.view_leaderboard_last_30_days as
select
    pr.org_id,
    gi.github_login,
    sum(coalesce(pe.final_score, 0)) as total_score,
    count(*) filter (where coalesce(pe.is_eligible, false) = true) as pr_count,
    count(*) filter (where sl.key = 'P0') as p0_count,
    count(*) filter (where sl.key = 'P1') as p1_count,
    count(*) filter (where sl.key = 'P2') as p2_count,
    count(*) filter (where sl.key = 'P3') as p3_count
from public.pr_evaluations pe
    join public.pull_requests pr on pe.pr_id = pr.id
    left join public.github_identities gi on pr.github_author_id = gi.id
    left join public.severity_levels sl on pe.severity_id = sl.id
where pr.merged_at_gh >= now() - interval '30 days'
  and coalesce(pe.is_eligible, false) = true
group by pr.org_id, gi.github_login;

create or replace view public.view_component_activity_last_30_days as
select
    pr.org_id,
    pc.key as component_key,
    pc.name as component_name,
    sum(coalesce(pe.final_score, 0)) as total_score,
    count(*) filter (where coalesce(pe.is_eligible, false) = true) as pr_count
from public.pr_evaluations pe
    join public.product_components pc on pe.primary_component_id = pc.id
    join public.pull_requests pr on pe.pr_id = pr.id
where pr.merged_at_gh >= now() - interval '30 days'
  and coalesce(pe.is_eligible, false) = true
group by pr.org_id, pc.key, pc.name;

-- Triggers for creator membership and default seeds
create or replace function kit.add_creator_membership() returns trigger
    language plpgsql
    security definer
    set search_path = public as
$$
declare
    actor uuid := coalesce(auth.uid(), new.created_by);
begin
    if actor is not null then
        insert into public.organization_members (org_id, user_id, role)
        values (new.id, actor, 'admin')
        on conflict do nothing;
    end if;
    return new;
end;
$$;

create or replace function kit.seed_organization_defaults() returns trigger
    language plpgsql
    security definer
    set search_path = public as
$$
declare
    default_rule_set uuid;
    prompt text;
    ui_schema jsonb := jsonb_build_object(
        'placeholders',
        array[
            'components_table',
            'severity_table',
            'issue_section',
            'pr_section',
            'files_section',
            'eligibility_criteria'
        ]
    );
begin
    insert into public.product_components (org_id, key, name, description, multiplier, sort_order)
    values
        (new.id, 'CORE_CHAT', 'Core Chat', 'Messaging and conversation pipeline', 3, 1),
        (new.id, 'KNOWLEDGE_BASES', 'Knowledge Bases', 'Docs ingestion and retrieval', 2, 2),
        (new.id, 'AGENTS', 'Agents', 'Automation agents and tools', 2, 3),
        (new.id, 'OTHER', 'Other', 'Unmapped or miscellaneous changes', 1, 99)
    on conflict do nothing;

    insert into public.severity_levels (org_id, key, name, description, base_points, sort_order)
    values
        (new.id, 'P0', 'Critical', 'Service down or security risk', 100, 1),
        (new.id, 'P1', 'High', 'Major impact or data loss', 50, 2),
        (new.id, 'P2', 'Medium', 'Functional bug with workaround', 20, 3),
        (new.id, 'P3', 'Low', 'Minor bug or polish', 5, 4)
    on conflict do nothing;

    insert into public.scoring_rule_sets (org_id, name, description, is_default, model_name, created_by)
    values (
        new.id,
        'Default Rule Set',
        'Base evaluation rules seeded automatically for new organizations.',
        true,
        'claude-haiku-4-5-20251001',
        auth.uid()
    )
    on conflict do nothing
    returning id into default_rule_set;

    if default_rule_set is null then
        select id into default_rule_set
        from public.scoring_rule_sets
        where org_id = new.id
        order by is_default desc, created_at desc
        limit 1;
    end if;

    prompt := $prompt$
You are an expert engineering manager scoring a merged pull request for a bug bounty program.

Goals:
- Identify the primary product component impacted.
- Assign severity.
- Check eligibility gates (issue exists with repro, fix implemented, PR linked to issue, tests included).
- Compute score = base_points(severity) * multiplier(component). If any eligibility check fails, score is 0 and the PR is marked ineligible.

Inputs:
- Components table: {{components_table}}
- Severity table: {{severity_table}}
- Issue: {{issue_section}}
- Pull Request: {{pr_section}}
- Files: {{files_section}}
- Eligibility checklist: {{eligibility_criteria}}

Output JSON (no prose):
{
  "primary_component_key": "CORE_CHAT | KNOWLEDGE_BASES | AGENTS | OTHER",
  "severity_key": "P0 | P1 | P2 | P3",
  "eligibility": {
    "issue": true/false,
    "fix_implementation": true/false,
    "pr_linked": true/false,
    "tests": true/false
  },
  "justification_component": "why this component",
  "justification_severity": "why this severity",
  "impact_summary": "1-3 line summary of impact",
  "eligibility_notes": "brief notes",
  "review_notes": "optional extra review feedback"
}
$prompt$;

    if default_rule_set is not null then
        insert into public.prompt_templates (
            org_id,
            rule_set_id,
            name,
            description,
            kind,
            template,
            ui_schema,
            version
        )
        values (
            new.id,
            default_rule_set,
            'Default PR Evaluation',
            'LLM prompt with placeholders for PR, issue, component, and severity tables.',
            'pr_evaluation',
            prompt,
            ui_schema,
            1
        )
        on conflict do nothing;
    end if;

    return new;
end;
$$;

drop trigger if exists add_creator_membership on public.organizations;
create trigger add_creator_membership
    after insert on public.organizations
    for each row execute function kit.add_creator_membership();

drop trigger if exists seed_organization_defaults on public.organizations;
create trigger seed_organization_defaults
    after insert on public.organizations
    for each row execute function kit.seed_organization_defaults();
