import { Menu } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuList } from '@kit/ui/navigation-menu';

import { LocalizedLink } from '~/components/localized-link';
import type { Locale } from '~/lib/i18n/locales.config';

import { SiteNavigationItem } from './site-navigation-item';

const links: Record<
  string,
  {
    label: string;
    path: string;
  }
> = {
  Features: {
    label: 'Features',
    path: '/features',
  },
  HowItWorks: {
    label: 'How It Works',
    path: '/how-it-works',
  },
  Pricing: {
    label: 'Pricing',
    path: '/pricing',
  },
  FAQ: {
    label: 'FAQ',
    path: '/faq',
  },
};

interface SiteNavigationProps {
  locale?: Locale;
}

export function SiteNavigation({ locale }: SiteNavigationProps) {
  const NavItems = Object.values(links).map((item) => {
    return (
      <SiteNavigationItem key={item.path} path={item.path} locale={locale}>
        {item.label}
      </SiteNavigationItem>
    );
  });

  return (
    <>
      <div className="hidden items-center justify-center md:flex">
        <NavigationMenu className="px-4 py-2">
          <NavigationMenuList className="space-x-5">
            {NavItems}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex justify-start sm:items-center md:hidden">
        <MobileDropdown locale={locale} />
      </div>
    </>
  );
}

function MobileDropdown({ locale }: { locale?: Locale }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Open Menu">
        <Menu className="h-8 w-8" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-full">
        {Object.values(links).map((item) => {
          const className = 'flex w-full h-full items-center';

          return (
            <DropdownMenuItem key={item.path} asChild>
              <LocalizedLink className={className} href={item.path} locale={locale}>
                {item.label}
              </LocalizedLink>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
