import { Metadata } from 'next';
import Link from 'next/link';

import { ArrowRight, ChevronDown, Github, HelpCircle } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions About MergeMint',
  description:
    'Find answers to common questions about MergeMint: AI-powered PR scoring, GitHub integration, pricing, self-hosting, privacy, and more.',
  keywords: [
    'MergeMint FAQ',
    'PR scoring questions',
    'AI code review FAQ',
    'GitHub integration help',
    'developer analytics questions',
    'self-hosted PR scoring',
    'MergeMint pricing FAQ',
    'Claude AI PR evaluation',
  ],
  openGraph: {
    title: 'FAQ - Frequently Asked Questions About MergeMint',
    description:
      'Find answers to common questions about MergeMint: AI-powered PR scoring, GitHub integration, pricing, self-hosting, and privacy.',
    type: 'website',
    url: 'https://mergemint.dev/faq',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MergeMint FAQ - Your Questions Answered',
    description:
      'Everything you need to know about AI-powered PR scoring with MergeMint.',
  },
  alternates: {
    canonical: 'https://mergemint.dev/faq',
  },
};

async function FAQPage() {
  const faqCategories = [
    {
      titleKey: 'marketing:faq.cat1Title',
      items: [
        { questionKey: 'marketing:faq.cat1Q1', answerKey: 'marketing:faq.cat1A1' },
        { questionKey: 'marketing:faq.cat1Q2', answerKey: 'marketing:faq.cat1A2' },
        { questionKey: 'marketing:faq.cat1Q3', answerKey: 'marketing:faq.cat1A3' },
        { questionKey: 'marketing:faq.cat1Q4', answerKey: 'marketing:faq.cat1A4' },
      ],
    },
    {
      titleKey: 'marketing:faq.cat2Title',
      items: [
        { questionKey: 'marketing:faq.cat2Q1', answerKey: 'marketing:faq.cat2A1' },
        { questionKey: 'marketing:faq.cat2Q2', answerKey: 'marketing:faq.cat2A2' },
        { questionKey: 'marketing:faq.cat2Q3', answerKey: 'marketing:faq.cat2A3' },
        { questionKey: 'marketing:faq.cat2Q4', answerKey: 'marketing:faq.cat2A4' },
      ],
    },
    {
      titleKey: 'marketing:faq.cat3Title',
      items: [
        { questionKey: 'marketing:faq.cat3Q1', answerKey: 'marketing:faq.cat3A1' },
        { questionKey: 'marketing:faq.cat3Q2', answerKey: 'marketing:faq.cat3A2' },
        { questionKey: 'marketing:faq.cat3Q3', answerKey: 'marketing:faq.cat3A3' },
        { questionKey: 'marketing:faq.cat3Q4', answerKey: 'marketing:faq.cat3A4' },
      ],
    },
    {
      titleKey: 'marketing:faq.cat4Title',
      items: [
        { questionKey: 'marketing:faq.cat4Q1', answerKey: 'marketing:faq.cat4A1' },
        { questionKey: 'marketing:faq.cat4Q2', answerKey: 'marketing:faq.cat4A2' },
        { questionKey: 'marketing:faq.cat4Q3', answerKey: 'marketing:faq.cat4A3' },
        { questionKey: 'marketing:faq.cat4Q4', answerKey: 'marketing:faq.cat4A4' },
      ],
    },
    {
      titleKey: 'marketing:faq.cat5Title',
      items: [
        { questionKey: 'marketing:faq.cat5Q1', answerKey: 'marketing:faq.cat5A1' },
        { questionKey: 'marketing:faq.cat5Q2', answerKey: 'marketing:faq.cat5A2' },
        { questionKey: 'marketing:faq.cat5Q3', answerKey: 'marketing:faq.cat5A3' },
        { questionKey: 'marketing:faq.cat5Q4', answerKey: 'marketing:faq.cat5A4' },
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="mr-2 h-4 w-4 text-purple-500" />
            <Trans i18nKey="marketing:faq.badge" />
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            <Trans i18nKey="marketing:faq.heroTitle" />
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              <Trans i18nKey="marketing:faq.heroTitleHighlight" />
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            <Trans i18nKey="marketing:faq.heroDescription" />
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqCategories.map((category, catIdx) => (
              <div key={catIdx}>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 text-sm font-bold">
                    {catIdx + 1}
                  </span>
                  <Trans i18nKey={category.titleKey} />
                </h2>
                <div className="space-y-4">
                  {category.items.map((item, idx) => (
                    <FaqItem key={idx} questionKey={item.questionKey} answerKey={item.answerKey} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="max-w-3xl mx-auto mt-16 p-8 rounded-2xl border bg-card text-center">
            <h3 className="text-xl font-semibold mb-2">
              <Trans i18nKey="marketing:faq.contactTitle" />
            </h3>
            <p className="text-muted-foreground mb-6">
              <Trans i18nKey="marketing:faq.contactDescription" />
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="https://github.com/MergeMint/mergemint-app/discussions" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  <Trans i18nKey="marketing:faq.contactGitHub" />
                </Link>
              </Button>
              <Button asChild>
                <Link href="/contact">
                  <Trans i18nKey="marketing:faq.contactCta" />
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default withI18n(FAQPage);

function FaqItem({
  questionKey,
  answerKey,
}: {
  questionKey: string;
  answerKey: string;
}) {
  return (
    <details className="group rounded-xl border bg-card overflow-hidden">
      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors">
        <h3 className="font-medium pr-4">
          <Trans i18nKey={questionKey} />
        </h3>
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-open:rotate-180 flex-shrink-0" />
      </summary>
      <div className="px-6 pb-6 text-muted-foreground">
        <Trans i18nKey={answerKey} />
      </div>
    </details>
  );
}
