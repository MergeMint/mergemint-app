import { use } from 'react';

import { cookies } from 'next/headers';

import {
  Page,
  PageLayoutStyle,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';
import { SidebarProvider } from '@kit/ui/shadcn-sidebar';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { AppLogo } from '~/components/app-logo';
import { FeedbackWidget } from '~/components/feedback-widget';
import { navigationConfig } from '~/config/navigation.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

// home imports
import { HomeMenuNavigation } from './_components/home-menu-navigation';
import { HomeMobileNavigation } from './_components/home-mobile-navigation';
import { HomeSidebar } from './_components/home-sidebar';

function HomeLayout({ children }: React.PropsWithChildren) {
  const style = use(getLayoutStyle());

  if (style === 'sidebar') {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  return <HeaderLayout>{children}</HeaderLayout>;
}

export default withI18n(HomeLayout);

async function getUserOrg(userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseServerAdminClient<any>();
  const { data: membership } = await admin
    .from('organization_members')
    .select('org_id, role, organizations(name, slug)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (membership?.organizations) {
    const orgData = Array.isArray(membership.organizations)
      ? (membership.organizations as { name: string; slug: string }[])[0]
      : (membership.organizations as { name: string; slug: string });

    if (orgData) {
      return { slug: orgData.slug, name: orgData.name, role: membership.role };
    }
  }
  return null;
}

function SidebarLayout({ children }: React.PropsWithChildren) {
  const sidebarMinimized = navigationConfig.sidebarCollapsed;
  const [user] = use(Promise.all([requireUserInServerComponent()]));
  const org = use(getUserOrg(user.sub as string));

  return (
    <SidebarProvider defaultOpen={sidebarMinimized}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <HomeSidebar user={user} org={org} />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation />
        </PageMobileNavigation>

        {children}
      </Page>
      <FeedbackWidget />
    </SidebarProvider>
  );
}

function HeaderLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Page style={'header'}>
        <PageNavigation>
          <HomeMenuNavigation />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation />
        </PageMobileNavigation>

        {children}
      </Page>
      <FeedbackWidget />
    </>
  );
}

function MobileNavigation() {
  return (
    <>
      <AppLogo />

      <HomeMobileNavigation />
    </>
  );
}

async function getLayoutStyle() {
  const cookieStore = await cookies();

  return (
    (cookieStore.get('layout-style')?.value as PageLayoutStyle) ??
    navigationConfig.style
  );
}
