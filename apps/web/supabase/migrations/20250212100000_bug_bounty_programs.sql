-- Bug Bounty Programs Migration
-- This migration adds tables and functions to support bug bounty programs
-- where admins can reward top performers or developers who reach score thresholds

-- Main bounty programs table
create table if not exists public.bounty_programs (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,

    -- Program metadata
    name text not null,
    description text,
    program_type text not null check (program_type in ('ranking', 'tier')),
    status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),

    -- Time period
    period_type text not null check (period_type in ('weekly', 'monthly', 'quarterly', 'custom')),
    start_date timestamptz not null,
    end_date timestamptz not null,

    -- Settings
    auto_notify boolean default true,

    -- Audit
    created_by uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    -- Validation
    constraint valid_date_range check (end_date > start_date)
);

create index if not exists bounty_programs_org_status_idx
    on public.bounty_programs (org_id, status, end_date desc);
create index if not exists bounty_programs_dates_idx
    on public.bounty_programs (start_date, end_date)
    where status = 'active';

-- Ranking-based program configuration (top N performers)
create table if not exists public.bounty_ranking_config (
    id uuid primary key default gen_random_uuid(),
    program_id uuid not null references public.bounty_programs on delete cascade,
    rank_position integer not null check (rank_position > 0),
    reward_amount numeric(12, 2) not null check (reward_amount > 0),
    reward_currency text not null default 'USD',
    created_at timestamptz default now(),
    unique (program_id, rank_position)
);

create index if not exists bounty_ranking_config_program_idx
    on public.bounty_ranking_config (program_id, rank_position);

-- Tier-based program configuration (score thresholds)
create table if not exists public.bounty_tier_config (
    id uuid primary key default gen_random_uuid(),
    program_id uuid not null references public.bounty_programs on delete cascade,
    tier_name text not null,
    min_score numeric(12, 2) not null check (min_score >= 0),
    max_score numeric(12, 2) check (max_score is null or max_score > min_score),
    reward_amount numeric(12, 2) not null check (reward_amount > 0),
    reward_currency text not null default 'USD',
    sort_order integer default 0,
    created_at timestamptz default now(),
    unique (program_id, tier_name)
);

create index if not exists bounty_tier_config_program_idx
    on public.bounty_tier_config (program_id, sort_order);

-- Track individual developer rewards/payouts
create table if not exists public.bounty_rewards (
    id uuid primary key default gen_random_uuid(),
    program_id uuid not null references public.bounty_programs on delete cascade,
    org_id uuid not null references public.organizations on delete cascade,
    github_user_id uuid not null references public.github_identities on delete cascade,

    -- Performance metrics
    final_score numeric(12, 2) not null,
    rank_position integer,  -- For ranking programs
    tier_name text,         -- For tier programs

    -- Reward details
    reward_amount numeric(12, 2) not null check (reward_amount > 0),
    reward_currency text not null default 'USD',

    -- Payout tracking
    payout_status text not null default 'pending' check (payout_status in ('pending', 'approved', 'paid', 'rejected')),
    payout_method text,
    payout_date timestamptz,
    payout_reference text,
    payout_notes text,

    -- Audit
    approved_by uuid references auth.users,
    approved_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    unique (program_id, github_user_id)
);

create index if not exists bounty_rewards_program_idx
    on public.bounty_rewards (program_id, payout_status);
create index if not exists bounty_rewards_github_user_idx
    on public.bounty_rewards (github_user_id, payout_status);
create index if not exists bounty_rewards_org_status_idx
    on public.bounty_rewards (org_id, payout_status, created_at desc);

-- Row Level Security
alter table public.bounty_programs enable row level security;
alter table public.bounty_ranking_config enable row level security;
alter table public.bounty_tier_config enable row level security;
alter table public.bounty_rewards enable row level security;

-- Bounty programs policies
create policy bounty_programs_select on public.bounty_programs
    for select using (kit.is_org_member(org_id));
create policy bounty_programs_insert on public.bounty_programs
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy bounty_programs_update on public.bounty_programs
    for update using (kit.is_org_admin(org_id));
create policy bounty_programs_delete on public.bounty_programs
    for delete using (kit.is_org_admin(org_id));

-- Ranking config policies
create policy bounty_ranking_config_select on public.bounty_ranking_config
    for select using (
        kit.is_org_member((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );
create policy bounty_ranking_config_insert on public.bounty_ranking_config
    for insert to authenticated
    with check (
        kit.is_org_admin((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );
create policy bounty_ranking_config_update on public.bounty_ranking_config
    for update using (
        kit.is_org_admin((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );
create policy bounty_ranking_config_delete on public.bounty_ranking_config
    for delete using (
        kit.is_org_admin((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );

-- Tier config policies
create policy bounty_tier_config_select on public.bounty_tier_config
    for select using (
        kit.is_org_member((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );
create policy bounty_tier_config_insert on public.bounty_tier_config
    for insert to authenticated
    with check (
        kit.is_org_admin((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );
create policy bounty_tier_config_update on public.bounty_tier_config
    for update using (
        kit.is_org_admin((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );
create policy bounty_tier_config_delete on public.bounty_tier_config
    for delete using (
        kit.is_org_admin((select bp.org_id from public.bounty_programs bp where bp.id = program_id))
    );

-- Rewards policies
create policy bounty_rewards_select on public.bounty_rewards
    for select using (kit.is_org_member(org_id));
create policy bounty_rewards_insert on public.bounty_rewards
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy bounty_rewards_update on public.bounty_rewards
    for update using (kit.is_org_admin(org_id));
create policy bounty_rewards_delete on public.bounty_rewards
    for delete using (kit.is_org_admin(org_id));

-- Helper view: Active bounty programs with details
create or replace view public.view_active_bounty_programs as
select
    bp.id,
    bp.org_id,
    bp.name,
    bp.description,
    bp.program_type,
    bp.status,
    bp.period_type,
    bp.start_date,
    bp.end_date,
    bp.auto_notify,
    bp.created_by,
    bp.created_at,
    bp.updated_at,
    -- Aggregate ranking rewards
    coalesce(
        jsonb_agg(
            jsonb_build_object(
                'rank', brc.rank_position,
                'amount', brc.reward_amount,
                'currency', brc.reward_currency
            ) order by brc.rank_position
        ) filter (where bp.program_type = 'ranking' and brc.id is not null),
        '[]'::jsonb
    ) as ranking_rewards,
    -- Aggregate tier rewards
    coalesce(
        jsonb_agg(
            jsonb_build_object(
                'tier', btc.tier_name,
                'min_score', btc.min_score,
                'max_score', btc.max_score,
                'amount', btc.reward_amount,
                'currency', btc.reward_currency
            ) order by btc.sort_order
        ) filter (where bp.program_type = 'tier' and btc.id is not null),
        '[]'::jsonb
    ) as tier_rewards,
    -- Count of issued rewards
    count(distinct br.id) as rewards_count,
    sum(br.reward_amount) filter (where br.payout_status != 'rejected') as total_reward_amount,
    count(distinct br.id) filter (where br.payout_status = 'pending') as pending_rewards_count,
    count(distinct br.id) filter (where br.payout_status = 'approved') as approved_rewards_count,
    count(distinct br.id) filter (where br.payout_status = 'paid') as paid_rewards_count
from public.bounty_programs bp
left join public.bounty_ranking_config brc on brc.program_id = bp.id
left join public.bounty_tier_config btc on btc.program_id = bp.id
left join public.bounty_rewards br on br.program_id = bp.id
group by bp.id;

-- Function to calculate rewards for a completed program
create or replace function public.calculate_bounty_rewards(program_uuid uuid)
returns table(
    github_user_id uuid,
    github_login text,
    final_score numeric,
    rank_position integer,
    tier_name text,
    reward_amount numeric,
    reward_currency text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_org_id uuid;
    v_program_type text;
    v_start_date timestamptz;
    v_end_date timestamptz;
begin
    -- Get program details
    select org_id, program_type, start_date, end_date
    into v_org_id, v_program_type, v_start_date, v_end_date
    from bounty_programs
    where id = program_uuid;

    if not found then
        raise exception 'Program not found';
    end if;

    -- Calculate rewards based on program type
    if v_program_type = 'ranking' then
        -- Ranking-based rewards
        return query
        with leaderboard as (
            select
                pr.org_id,
                gi.id as github_user_id,
                gi.github_login,
                sum(coalesce(pe.final_score, 0)) as total_score,
                row_number() over (order by sum(coalesce(pe.final_score, 0)) desc) as rank
            from pr_evaluations pe
            join pull_requests pr on pe.pr_id = pr.id
            left join github_identities gi on pr.github_author_id = gi.id
            where pr.org_id = v_org_id
              and pr.merged_at_gh >= v_start_date
              and pr.merged_at_gh < v_end_date
              and coalesce(pe.is_eligible, false) = true
              and gi.id is not null
            group by pr.org_id, gi.id, gi.github_login
        )
        select
            l.github_user_id,
            l.github_login,
            l.total_score as final_score,
            l.rank::integer as rank_position,
            null::text as tier_name,
            brc.reward_amount,
            brc.reward_currency
        from leaderboard l
        join bounty_ranking_config brc on brc.program_id = program_uuid and brc.rank_position = l.rank
        order by l.rank;

    elsif v_program_type = 'tier' then
        -- Tier-based rewards
        return query
        with leaderboard as (
            select
                pr.org_id,
                gi.id as github_user_id,
                gi.github_login,
                sum(coalesce(pe.final_score, 0)) as total_score
            from pr_evaluations pe
            join pull_requests pr on pe.pr_id = pr.id
            left join github_identities gi on pr.github_author_id = gi.id
            where pr.org_id = v_org_id
              and pr.merged_at_gh >= v_start_date
              and pr.merged_at_gh < v_end_date
              and coalesce(pe.is_eligible, false) = true
              and gi.id is not null
            group by pr.org_id, gi.id, gi.github_login
        )
        select
            l.github_user_id,
            l.github_login,
            l.total_score as final_score,
            null::integer as rank_position,
            btc.tier_name,
            btc.reward_amount,
            btc.reward_currency
        from leaderboard l
        join bounty_tier_config btc on btc.program_id = program_uuid
            and l.total_score >= btc.min_score
            and (btc.max_score is null or l.total_score < btc.max_score)
        order by btc.sort_order, l.total_score desc;
    end if;
end;
$$;

-- Trigger to auto-update updated_at timestamp (using existing function)
create trigger bounty_programs_updated_at before update on public.bounty_programs
    for each row execute function public.update_updated_at_column();

create trigger bounty_rewards_updated_at before update on public.bounty_rewards
    for each row execute function public.update_updated_at_column();
