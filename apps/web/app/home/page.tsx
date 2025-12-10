/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { WelcomeOnboardingDialog } from '~/home/_components/welcome-onboarding-dialog';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Get user's first org
  const admin = getSupabaseServerAdminClient<any>();
  const { data: membership } = await admin
    .from('organization_members')
    .select('org_id, organizations(name, slug)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  // Check if user has completed initial onboarding (profile + org setup)
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name, onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  const hasCompletedWelcomeOnboarding = !!profile?.onboarding_completed_at;

  // Check if user has a pending invitation they haven't accepted yet
  // This handles the case where the auth flow didn't preserve the invite redirect
  if (!membership && user.email) {
    const { data: pendingInvite } = await admin
      .from('organization_invitations')
      .select('token, email, status, expires_at')
      .eq('email', user.email.toLowerCase())
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (pendingInvite) {
      // Redirect user to accept their pending invitation
      redirect(`/invite/${pendingInvite.token}`);
    }
  }

  // If user already has a membership (e.g., invited user), they don't need to create an org
  // Auto-complete their onboarding and redirect them directly to their org dashboard
  if (membership) {
    const org = membership.organizations as unknown as { name: string; slug: string } | null;

    // If onboarding not complete, mark it as complete for invited users
    if (!hasCompletedWelcomeOnboarding) {
      await admin
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          onboarding_completed_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }

    // Redirect to the org dashboard
    if (org?.slug) {
      redirect(`/${org.slug}/dashboard`);
    }

    // Fallback: redirect to GitHub onboarding to set up the org properly
    redirect('/home/onboarding');
  }

  // Only show onboarding dialog if user has NO membership and hasn't completed onboarding
  // This is for brand new users who need to create their own organization
  if (!hasCompletedWelcomeOnboarding) {
    const userName = user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.email?.split('@')[0] || '';

    return (
      <>
        <PageHeader
          title="Welcome"
          description="Let's get you set up"
          breadcrumbs={<AppBreadcrumbs />}
        />
        <PageBody>
          <div className="flex items-center justify-center min-h-[400px]">
            <WelcomeOnboardingDialog
              open={true}
              userName={userName}
              userEmail={user.email}
            />
          </div>
        </PageBody>
      </>
    );
  }

  // User has completed welcome onboarding but has no membership yet
  // This means they created an org in the welcome dialog - redirect to GitHub setup
  redirect('/home/onboarding');
}
