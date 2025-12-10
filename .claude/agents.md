# MergeMint Development Guidelines

## Internationalization (i18n)

This codebase uses a production-grade i18n implementation with i18next, react-i18next, and Next.js App Router. Follow these guidelines when creating new pages or components.

### Supported Languages

11 locales are supported:
- English (en) - Default
- German (de), Spanish (es), French (fr), Italian (it), Dutch (nl), Swedish (sv), Turkish (tr), Polish (pl), Korean (ko), Japanese (ja)

### Translation Files Location

Translation files are stored in:
```
apps/web/public/locales/{locale}/{namespace}.json
```

### Available Namespaces

- `common.json` - Global UI strings (buttons, labels, errors, notifications)
- `auth.json` - Authentication and sign-in/up flows
- `account.json` - Account settings and profile management
- `teams.json` - Team/organization management
- `billing.json` - Subscription and billing features
- `marketing.json` - Marketing page content

### Creating a New Page with Translations

#### 1. Wrap Your Page with `withI18n` HOC

For server components, wrap your page component with the `withI18n` HOC:

```tsx
import { withI18n } from '~/lib/i18n/with-i18n';

async function MyNewPage() {
  return (
    <div>
      {/* Your page content */}
    </div>
  );
}

export default withI18n(MyNewPage);
```

#### 2. Use the `<Trans>` Component for Translations

Import and use the `Trans` component for all user-facing text:

```tsx
import { Trans } from '@kit/ui/trans';

function MyComponent() {
  return (
    <h1>
      <Trans i18nKey="marketing:myPage.title" />
    </h1>
  );
}
```

#### 3. Add Translation Keys to JSON Files

Add your translation keys to the appropriate namespace file. For marketing pages, edit `apps/web/public/locales/en/marketing.json`:

```json
{
  "myPage": {
    "title": "My Page Title",
    "description": "My page description",
    "feature1": "Feature 1 text"
  }
}
```

#### 4. Add Translations for All Supported Locales

After adding English translations, run the translation script to automatically translate to all other locales:

```bash
cd apps/web
pnpm translate
```

This script will:
- Detect new keys in English that are missing in other locales
- Automatically translate them using AI
- Write the translations to the respective locale files

Available translation commands:
- `pnpm translate` - Translate missing keys
- `pnpm translate:all` - Translate all keys
- `pnpm translate:dry-run` - Preview what would be translated without writing files

### Translation Patterns

#### Simple Text
```tsx
<Trans i18nKey="marketing:features.title" />
```

#### With Interpolation
```tsx
// In JSON: "greeting": "Hello, {{name}}!"
<Trans i18nKey="common:greeting" values={{ name: 'John' }} />
```

#### Nested Keys
```tsx
<Trans i18nKey="common:roles.owner.label" />
```

#### Using `t()` Function in Server Components
```tsx
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

async function MyServerComponent() {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('marketing:myPage.title');

  return <h1>{title}</h1>;
}
```

#### Using `useTranslation` Hook in Client Components
```tsx
'use client';

import { useTranslation } from '@kit/i18n/hooks';

function MyClientComponent() {
  const { t } = useTranslation();

  return <p>{t('common:loading')}</p>;
}
```

### Marketing Pages with SEO-Friendly URLs

For marketing pages that need translated URLs (e.g., `/features` -> `/de/funktionen`):

#### 1. Add Slug Translations

Edit `apps/web/lib/i18n/slug-translations.ts`:

```typescript
export const SLUG_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  // ... existing slugs
  'my-new-page': {
    en: 'my-new-page',
    de: 'meine-neue-seite',
    es: 'mi-nueva-pagina',
    // ... other locales
  },
};
```

#### 2. Update Sitemap

The sitemap at `apps/web/app/sitemap.ts` auto-generates entries for all locales. Add your new canonical path to the `canonicalPaths` array if needed.

### Using LocalizedLink for Internal Links

For links to marketing pages, use `LocalizedLink` to automatically handle URL translations:

```tsx
import { LocalizedLink } from '~/components/localized-link';

<LocalizedLink href="/features">
  <Trans i18nKey="common:learnMore" />
</LocalizedLink>
```

### Best Practices

1. **Always use translation keys** - Never hardcode user-facing text
2. **Use descriptive key names** - e.g., `features.aiEvaluationTitle` not `features.title1`
3. **Group related keys** - Use nested objects for related content
4. **Include context in keys** - e.g., `pricing.ctaButton` vs just `button`
5. **Test all locales** - Switch language to verify translations render correctly
6. **Run translate script** - After adding English keys, run `pnpm translate` to generate other locales

### File Structure Reference

```
apps/web/
├── lib/i18n/
│   ├── i18n.settings.ts      # Default namespaces configuration
│   ├── i18n.resolver.ts      # Dynamic import resolution
│   ├── i18n.server.ts        # Server-side i18n instance
│   ├── locales.config.ts     # Locale definitions
│   ├── slug-translations.ts  # URL translations for marketing
│   └── with-i18n.tsx         # HOC for server components
├── components/
│   ├── language-switcher.tsx # Language dropdown component
│   ├── localized-link.tsx    # Locale-aware Link component
│   └── root-providers.tsx    # I18nProvider setup
├── middleware.ts             # Locale routing middleware
└── public/locales/
    ├── en/
    │   ├── common.json
    │   ├── marketing.json
    │   └── ...
    ├── de/
    ├── es/
    └── ...

packages/i18n/src/
├── i18n.server.ts           # Core server initialization
├── i18n.client.ts           # Core client initialization
├── i18n-provider.tsx        # React provider component
└── hooks.ts                 # useTranslation hook export
```

### Example: Creating a New Marketing Page

```tsx
// apps/web/app/(marketing)/my-page/page.tsx
import { Metadata } from 'next';
import { Trans } from '@kit/ui/trans';
import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: 'My Page - MergeMint',
  description: 'Description for SEO',
};

async function MyPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold">
        <Trans i18nKey="marketing:myPage.title" />
      </h1>
      <p className="text-muted-foreground">
        <Trans i18nKey="marketing:myPage.description" />
      </p>
    </div>
  );
}

export default withI18n(MyPage);
```

Then add to `apps/web/public/locales/en/marketing.json`:
```json
{
  "myPage": {
    "title": "My Page Title",
    "description": "My page description"
  }
}
```
