import { Metadata } from 'next';

import { headers } from 'next/headers';

import appConfig from '~/config/app.config';

/**
 * @name generateRootMetadata
 * @description Generates the root metadata for the application with enhanced SEO
 */
export const generateRootMetadata = async (): Promise<Metadata> => {
  const headersStore = await headers();
  const csrfToken = headersStore.get('x-csrf-token') ?? '';

  return {
    title: {
      default: appConfig.title,
      template: `%s | ${appConfig.name}`,
    },
    description: appConfig.description,
    metadataBase: new URL(appConfig.url),
    applicationName: appConfig.name,
    keywords: [
      'PR scoring',
      'developer recognition',
      'AI code review',
      'pull request analytics',
      'engineering metrics',
      'developer productivity',
      'bug bounty automation',
      'performance reviews',
      'GitHub analytics',
      'engineering intelligence',
      'developer leaderboards',
      'PR evaluation',
      'Claude AI',
      'code contribution tracking',
      'engineering team analytics',
      'DORA metrics alternative',
      'LinearB alternative',
      'Jellyfish alternative',
      'GitClear alternative',
      'open source developer analytics',
    ],
    authors: [{ name: 'Jay Derinbogaz', url: 'https://github.com/cderinbogaz' }],
    creator: 'MergeMint',
    publisher: 'MergeMint',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: appConfig.url,
    },
    category: 'Developer Tools',
    other: {
      'csrf-token': csrfToken,
    },
    openGraph: {
      type: 'website',
      url: appConfig.url,
      siteName: appConfig.name,
      title: appConfig.title,
      description: appConfig.description,
      locale: 'en_US',
      images: [
        {
          url: `${appConfig.url}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'MergeMint - AI-Powered PR Scoring & Developer Recognition',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: appConfig.title,
      description: appConfig.description,
      creator: '@mergemint',
      images: [`${appConfig.url}/images/og-image.png`],
    },
    icons: {
      icon: '/images/favicon/favicon.ico',
      apple: '/images/favicon/apple-touch-icon.png',
    },
    verification: {
      // Add your verification codes here when you have them
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  };
};
