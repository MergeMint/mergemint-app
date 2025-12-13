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

// org layout imports
import { OrgSidebar } from './_components/org-sidebar';
import { OrgMobileNavigation } from './_components/org-mobile-navigation';

function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const style = use(getLayoutStyle());
  const resolvedParams = use(params);

  if (style === 'sidebar') {
    return (
      <SidebarLayout orgSlug={resolvedParams.orgSlug}>{children}</SidebarLayout>
    );
  }

  return (
    <HeaderLayout orgSlug={resolvedParams.orgSlug}>{children}</HeaderLayout>
  );
}

export default withI18n(OrgLayout);

async function getOrgDetails(orgSlug: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseServerAdminClient<any>();
  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .maybeSingle();

  if (org) {
    return { slug: org.slug, name: org.name };
  }
  return null;
}

async function getUserRole(userId: string, orgSlug: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseServerAdminClient<any>();
  const { data: membership } = await admin
    .from('organization_members')
    .select('role, organizations!inner(slug)')
    .eq('user_id', userId)
    .eq('organizations.slug', orgSlug)
    .maybeSingle();

  return membership?.role ?? 'member';
}

function SidebarLayout({
  children,
  orgSlug,
}: {
  children: React.ReactNode;
  orgSlug: string;
}) {
  const sidebarMinimized = navigationConfig.sidebarCollapsed;
  const [user] = use(Promise.all([requireUserInServerComponent()]));
  const org = use(getOrgDetails(orgSlug));
  const role = use(getUserRole(user.sub as string, orgSlug));

  const orgWithRole = org ? { ...org, role } : null;

  return (
    <SidebarProvider defaultOpen={sidebarMinimized}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <OrgSidebar user={user} org={orgWithRole} />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation orgSlug={orgSlug} />
        </PageMobileNavigation>

        {children}
      </Page>
      <FeedbackWidget />
    </SidebarProvider>
  );
}

function HeaderLayout({
  children,
  orgSlug,
}: {
  children: React.ReactNode;
  orgSlug: string;
}) {
  return (
    <>
      <Page style={'header'}>
        <PageMobileNavigation className={'flex items-center justify-between'}>
          <MobileNavigation orgSlug={orgSlug} />
        </PageMobileNavigation>

        {children}
      </Page>
      <FeedbackWidget />
    </>
  );
}

function MobileNavigation({ orgSlug }: { orgSlug: string }) {
  return (
    <>
      <AppLogo />
      <OrgMobileNavigation orgSlug={orgSlug} />
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
