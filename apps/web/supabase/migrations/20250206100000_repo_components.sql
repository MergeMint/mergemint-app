-- Repository-specific components
create table if not exists public.repo_components (
    id uuid primary key default gen_random_uuid(),
    org_id uuid not null references public.organizations on delete cascade,
    repo_id uuid not null references public.repositories on delete cascade,
    key text not null,
    name text not null,
    description text,
    multiplier numeric(10, 2) not null default 1,
    importance text not null default 'normal' check (importance in ('critical', 'high', 'normal', 'low')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (repo_id, key)
);

alter table public.repo_components enable row level security;

create policy repo_components_select on public.repo_components
    for select using (kit.is_org_member(org_id));
create policy repo_components_insert on public.repo_components
    for insert to authenticated
    with check (kit.is_org_admin(org_id));
create policy repo_components_update on public.repo_components
    for update using (kit.is_org_admin(org_id));
create policy repo_components_delete on public.repo_components
    for delete using (kit.is_org_admin(org_id));
