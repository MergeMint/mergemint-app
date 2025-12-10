import { MetadataRoute } from 'next';

import appConfig from '~/config/app.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/home/',
        '/settings/',
        '/admin/',
        '/_next/',
        '/auth/callback',
        '/auth/verify',
      ],
    },
    sitemap: `${appConfig.url}/sitemap.xml`,
    host: appConfig.url,
  };
}
