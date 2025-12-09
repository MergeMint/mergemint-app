/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
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

  // If user already has a membership (e.g., invited user), they don't need to create an org
  // Just mark their onboarding as complete if not already done
  if (membership && !hasCompletedWelcomeOnboarding) {
    // Auto-complete onboarding for invited users - they're already in an org
    await admin
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        onboarding_completed_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  }

  // Only show onboarding dialog if user has NO membership and hasn't completed onboarding
  // This is for brand new users who need to create their own organization
  if (!membership && !hasCompletedWelcomeOnboarding) {
    const userName = user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.email?.split('@')[0] || '';

    return (
      <>
        <PageHeader
          title="Welcome"
          description="Let's get you set up"
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

  // If still no membership after welcome onboarding, redirect to GitHub setup
  if (!membership) {
    redirect('/home/onboarding');
  }

  // Redirect to the user's primary org dashboard
  const org = membership.organizations as unknown as { name: string; slug: string } | null;
  if (org?.slug) {
    redirect(`/${org.slug}/dashboard`);
  }

  // Fallback to mergemint hub if org doesn't have a slug
  redirect('/home/mergemint');
}
