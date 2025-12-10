'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { Github, Twitter } from 'lucide-react';

import { Footer } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import {
  DEFAULT_LOCALE,
  isValidLocale,
  type Locale,
} from '~/lib/i18n/locales.config';
import { getLocalizedPath } from '~/lib/i18n/slug-translations';

interface SiteFooterProps {
  locale?: Locale;
}

export function SiteFooter({ locale: localeProp }: SiteFooterProps) {
  const pathname = usePathname();

  // Determine current locale from pathname or prop
  const locale = useMemo(() => {
    if (localeProp) return localeProp;

    const segments = pathname.split('/').filter(Boolean);
    const potentialLocale = segments[0];

    if (potentialLocale && isValidLocale(potentialLocale)) {
      return potentialLocale;
    }

    return DEFAULT_LOCALE;
  }, [localeProp, pathname]);

  // Helper to localize internal marketing paths
  const localize = (path: string) => {
    if (path.startsWith('http')) return path;
    const pathWithoutSlash = path.startsWith('/') ? path.slice(1) : path;
    return getLocalizedPath(pathWithoutSlash, locale);
  };
  return (
    <Footer
      logo={<AppLogo className="h-8 w-auto" />}
      description={
        <span>
          AI-powered PR scoring platform for engineering teams. 
          Open source and self-hostable.
        </span>
      }
      copyright={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
          <span>
            © {new Date().getFullYear()} MergeMint. CC BY-NC 4.0
          </span>
          <div className="flex items-center gap-4">
            <Link 
              href="https://github.com/MergeMint/mergemint-app" 
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link 
              href="https://twitter.com/mergemint" 
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      }
      sections={[
        {
          heading: 'Product',
          links: [
            {
              href: localize('/features'),
              label: 'Features',
            },
            {
              href: localize('/how-it-works'),
              label: 'How It Works',
            },
            {
              href: localize('/pricing'),
              label: 'Pricing',
            },
            {
              href: localize('/faq'),
              label: 'FAQ',
            },
          ],
        },
        {
          heading: 'Compare',
          links: [
            {
              href: localize('/mergemint-vs-linearb'),
              label: 'MergeMint vs LinearB',
            },
            {
              href: localize('/mergemint-vs-jellyfish'),
              label: 'MergeMint vs Jellyfish',
            },
            {
              href: localize('/mergemint-vs-gitclear'),
              label: 'MergeMint vs GitClear',
            },
            {
              href: localize('/best-linearb-alternatives'),
              label: 'LinearB Alternatives',
            },
            {
              href: localize('/best-jellyfish-alternatives'),
              label: 'Jellyfish Alternatives',
            },
          ],
        },
        {
          heading: 'Resources',
          links: [
            {
              href: 'https://github.com/MergeMint/mergemint-app',
              label: 'GitHub',
            },
            {
              href: 'https://github.com/MergeMint/mergemint-app#getting-started',
              label: 'Documentation',
            },
            {
              href: 'https://github.com/MergeMint/mergemint-app/blob/main/CONTRIBUTING.md',
              label: 'Contributing',
            },
          ],
        },
        {
          heading: 'Company',
          links: [
            {
              href: localize('/contact'),
              label: 'Contact',
            },
            {
              href: localize('/terms-of-service'),
              label: <Trans i18nKey="marketing:termsOfService" />,
            },
            {
              href: localize('/privacy-policy'),
              label: <Trans i18nKey="marketing:privacyPolicy" />,
            },
          ],
        },
      ]}
    />
  );
}
