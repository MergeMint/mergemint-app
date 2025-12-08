-- Add metadata column to organization_invitations for storing GitHub-specific invite data
ALTER TABLE public.organization_invitations
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Update the role constraint to include 'member' as a valid role
ALTER TABLE public.organization_invitations
DROP CONSTRAINT IF EXISTS organization_invitations_role_check;

ALTER TABLE public.organization_invitations
ADD CONSTRAINT organization_invitations_role_check
CHECK (role IN ('admin', 'developer', 'pm', 'viewer', 'member'));

-- Create index on metadata for efficient querying by github_login
CREATE INDEX IF NOT EXISTS organization_invitations_metadata_github_login_idx
ON public.organization_invitations ((metadata->>'github_login'));

-- Comment explaining the metadata structure
COMMENT ON COLUMN public.organization_invitations.metadata IS
'JSON metadata for invitations. For GitHub-based invites: {github_login: string, avatar_url: string, invite_type: "github"|"email"}';
