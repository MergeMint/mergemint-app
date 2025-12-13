'use client';

import type { JwtPayload } from '@supabase/supabase-js';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
  useSidebar,
} from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { getOrgRoutes, navigationConfig } from '~/config/navigation.config';
import { Tables } from '~/lib/database.types';

function SidebarLogo() {
  const { open } = useSidebar();
  return (
    <div className={open ? '' : 'flex justify-center w-full'}>
      <AppLogo className={'max-w-full'} collapsed={!open} />
    </div>
  );
}

export function OrgSidebar(props: {
  account?: Tables<'accounts'>;
  user: JwtPayload;
  org?: { slug: string; name: string; role: string } | null;
}) {
  // Create combined config with org routes if org exists
  const config = props.org
    ? {
        ...navigationConfig,
        routes: [...navigationConfig.routes, ...getOrgRoutes(props.org.slug)],
      }
    : navigationConfig;

  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader className={'h-16 justify-center'}>
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation config={config} />
      </SidebarContent>

      <SidebarFooter>
        <ProfileAccountDropdownContainer
          user={props.user}
          account={props.account}
        />
      </SidebarFooter>
    </Sidebar>
  );
}






