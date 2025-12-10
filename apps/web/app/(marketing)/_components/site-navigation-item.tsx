'use client';

import { usePathname } from 'next/navigation';

import { NavigationMenuItem } from '@kit/ui/navigation-menu';
import { cn, isRouteActive } from '@kit/ui/utils';

import { LocalizedLink } from '~/components/localized-link';
import type { Locale } from '~/lib/i18n/locales.config';

const getClassName = (path: string, currentPathName: string) => {
  // Check if the current path matches the target path
  // This needs to account for localized paths
  const isActive = isRouteActive(path, currentPathName) ||
    currentPathName.includes(path.replace('/', ''));

  return cn(
    `inline-flex w-max text-sm font-medium transition-colors duration-300`,
    {
      'dark:text-gray-300 dark:hover:text-white': !isActive,
      'text-current dark:text-white': isActive,
    },
  );
};

interface SiteNavigationItemProps {
  path: string;
  children: React.ReactNode;
  locale?: Locale;
}

export function SiteNavigationItem({
  path,
  children,
  locale,
}: SiteNavigationItemProps) {
  const currentPathName = usePathname();
  const className = getClassName(path, currentPathName);

  return (
    <NavigationMenuItem key={path}>
      <LocalizedLink className={className} href={path} locale={locale}>
        {children}
      </LocalizedLink>
    </NavigationMenuItem>
  );
}
