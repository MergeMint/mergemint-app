import Link from 'next/link';

import { Github, Twitter } from 'lucide-react';

import { Footer } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';

export function SiteFooter() {
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
              href: '/features',
              label: 'Features',
            },
            {
              href: '/how-it-works',
              label: 'How It Works',
            },
            {
              href: '/pricing',
              label: 'Pricing',
            },
            {
              href: '/faq',
              label: 'FAQ',
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
              href: '/contact',
              label: 'Contact',
            },
            {
              href: '/terms-of-service',
              label: <Trans i18nKey="marketing:termsOfService" />,
            },
            {
              href: '/privacy-policy',
              label: <Trans i18nKey="marketing:privacyPolicy" />,
            },
          ],
        },
      ]}
    />
  );
}
