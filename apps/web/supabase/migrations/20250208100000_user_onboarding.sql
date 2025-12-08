-- User onboarding fields and organization invitations

-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Add team_size to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS team_size text CHECK (team_size IN ('just_me', '2-5', '6-10', '11-25', '26-50', '51-100', '100+')),
ADD COLUMN IF NOT EXISTS industry text;

-- Organization invitations table
CREATE TABLE IF NOT EXISTS public.organization_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL REFERENCES public.organizations ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'developer', 'pm', 'viewer')),
    invited_by uuid REFERENCES auth.users ON DELETE SET NULL,
    token text UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (org_id, email, status)
);

CREATE INDEX IF NOT EXISTS organization_invitations_org_idx ON public.organization_invitations (org_id);
CREATE INDEX IF NOT EXISTS organization_invitations_email_idx ON public.organization_invitations (email);
CREATE INDEX IF NOT EXISTS organization_invitations_token_idx ON public.organization_invitations (token);

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for organization_invitations
CREATE POLICY organization_invitations_select ON public.organization_invitations
    FOR SELECT USING (kit.is_org_member(org_id));

CREATE POLICY organization_invitations_insert ON public.organization_invitations
    FOR INSERT TO authenticated
    WITH CHECK (kit.is_org_admin(org_id));

CREATE POLICY organization_invitations_update ON public.organization_invitations
    FOR UPDATE USING (kit.is_org_admin(org_id));

CREATE POLICY organization_invitations_delete ON public.organization_invitations
    FOR DELETE USING (kit.is_org_admin(org_id));

-- Function to check if a user has completed onboarding
CREATE OR REPLACE FUNCTION kit.has_completed_onboarding(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public AS
$$
SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_id
    AND p.onboarding_completed_at IS NOT NULL
);
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION kit.has_completed_onboarding(uuid) TO authenticated, service_role;

