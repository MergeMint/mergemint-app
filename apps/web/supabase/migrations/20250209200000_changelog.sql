-- Changelog Feature Migration
-- Adds tables for product info, changelog entries, and settings

-- 1. Product Info - Store product context for changelog generation
CREATE TABLE IF NOT EXISTS public.product_info (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
    website_url text,
    product_name text,
    product_description text,
    target_audience text,
    scraped_content text,
    scraped_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (org_id)
);

-- Enable RLS
ALTER TABLE public.product_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_info
CREATE POLICY "Users can view product_info for their orgs"
    ON public.product_info FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage product_info"
    ON public.product_info FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Changelog Entries - Store generated changelog items
CREATE TABLE IF NOT EXISTS public.changelog_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
    pr_id uuid REFERENCES public.pull_requests ON DELETE SET NULL,

    -- Entry content
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL DEFAULT 'improvement' CHECK (category IN ('new_feature', 'improvement', 'bug_fix', 'breaking_change')),

    -- Metadata
    version text,
    published_at timestamptz,
    is_draft boolean DEFAULT true,
    is_hidden boolean DEFAULT false,

    -- Generation tracking
    generated_by_llm boolean DEFAULT true,
    raw_llm_response jsonb,
    admin_edited boolean DEFAULT false,

    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for changelog_entries
CREATE INDEX IF NOT EXISTS idx_changelog_org_published ON public.changelog_entries(org_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_pr ON public.changelog_entries(pr_id);
CREATE INDEX IF NOT EXISTS idx_changelog_category ON public.changelog_entries(org_id, category);
CREATE INDEX IF NOT EXISTS idx_changelog_draft ON public.changelog_entries(org_id, is_draft);

-- Enable RLS
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for changelog_entries
CREATE POLICY "Users can view changelog_entries for their orgs"
    ON public.changelog_entries FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage changelog_entries"
    ON public.changelog_entries FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Public read access for published entries (for public changelog page)
CREATE POLICY "Anyone can view published changelog_entries"
    ON public.changelog_entries FOR SELECT
    USING (
        is_draft = false AND is_hidden = false
    );

-- 3. Changelog Settings - Per-org changelog configuration
CREATE TABLE IF NOT EXISTS public.changelog_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES public.organizations ON DELETE CASCADE,

    -- Display settings
    public_url_slug text,
    show_pr_links boolean DEFAULT false,
    show_dates boolean DEFAULT true,
    group_by text DEFAULT 'month' CHECK (group_by IN ('day', 'week', 'month', 'version')),

    -- Generation settings
    auto_generate boolean DEFAULT false,
    require_approval boolean DEFAULT true,

    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (org_id)
);

-- Enable RLS
ALTER TABLE public.changelog_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for changelog_settings
CREATE POLICY "Users can view changelog_settings for their orgs"
    ON public.changelog_settings FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage changelog_settings"
    ON public.changelog_settings FOR ALL
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Public read access for settings (needed for public changelog page)
CREATE POLICY "Anyone can view changelog_settings"
    ON public.changelog_settings FOR SELECT
    USING (true);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_product_info_updated_at ON public.product_info;
CREATE TRIGGER update_product_info_updated_at
    BEFORE UPDATE ON public.product_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_changelog_entries_updated_at ON public.changelog_entries;
CREATE TRIGGER update_changelog_entries_updated_at
    BEFORE UPDATE ON public.changelog_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_changelog_settings_updated_at ON public.changelog_settings;
CREATE TRIGGER update_changelog_settings_updated_at
    BEFORE UPDATE ON public.changelog_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
