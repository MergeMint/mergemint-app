import { BarChart3, Building2, FileText, Home, Layers, Settings, Trophy, User, Users } from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'MergeMint Hub',
        path: pathsConfig.app.mergemint,
        Icon: <Trophy className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profileSettings,
        Icon: <User className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

// Function to create org-specific routes
export function getOrgRoutes(orgSlug: string) {
  return [
    {
      label: 'Organization',
      children: [
        {
          label: 'Dashboard',
          path: `/${orgSlug}/dashboard`,
          Icon: <Home className={iconClasses} />,
          end: true,
        },
        {
          label: 'Product Insights',
          path: `/${orgSlug}/product`,
          Icon: <Layers className={iconClasses} />,
        },
        {
          label: 'Leaderboard',
          path: `/${orgSlug}/leaderboard`,
          Icon: <BarChart3 className={iconClasses} />,
        },
        {
          label: 'Team Members',
          path: `/${orgSlug}/members`,
          Icon: <Users className={iconClasses} />,
        },
        {
          label: 'Org Settings',
          path: `/${orgSlug}/settings`,
          Icon: <Building2 className={iconClasses} />,
        },
        {
          label: 'Admin',
          path: `/${orgSlug}/admin`,
          Icon: <Settings className={iconClasses} />,
        },
        {
          label: 'Changelog',
          path: `/${orgSlug}/changelog`,
          Icon: <FileText className={iconClasses} />,
        },
      ],
    },
  ];
}

export const navigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
