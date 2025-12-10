import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRightIcon,
  Check,
  Code2,
  Github,
  HelpCircle,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { ShineBorder } from '@kit/ui/magicui';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: 'Pricing - Free Open Source & Enterprise Plans',
  description:
    'MergeMint pricing: Free forever for open source and non-commercial use. Self-host unlimited repos, PRs, and team members. Enterprise plans available for commercial use.',
  keywords: [
    'MergeMint pricing',
    'free PR scoring tool',
    'open source developer analytics',
    'engineering metrics pricing',
    'self-hosted PR analytics',
    'free GitHub analytics',
    'developer recognition pricing',
  ],
  openGraph: {
    title: 'MergeMint Pricing - Free Open Source & Enterprise Plans',
    description:
      'Free forever for non-commercial use. Self-host with unlimited repos, PRs, and team members.',
    type: 'website',
    url: 'https://mergemint.dev/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MergeMint Pricing - Free Open Source',
    description:
      'Free forever for non-commercial use. Self-host with unlimited features.',
  },
  alternates: {
    canonical: 'https://mergemint.dev/pricing',
  },
};

async function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            <Trans i18nKey="marketing:pricing.badge" />
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            <Trans i18nKey="marketing:pricing.heroTitle" />
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              <Trans i18nKey="marketing:pricing.heroTitleHighlight" />
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            <Trans i18nKey="marketing:pricing.heroDescription" />
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Open Source */}
            <Card className="relative border-2 overflow-hidden">
              <ShineBorder shineColor={['#6b7280', '#9ca3af', '#6b7280']} />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">
                    <Trans i18nKey="marketing:pricing.openSourceTitle" />
                  </CardTitle>
                </div>
                <CardDescription>
                  <Trans i18nKey="marketing:pricing.openSourceDescription" />
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">
                    <Trans i18nKey="marketing:pricing.openSourcePrice" />
                  </span>
                  <span className="text-muted-foreground ml-2">
                    <Trans i18nKey="marketing:pricing.openSourcePriceSuffix" />
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'openSourceFeature1',
                    'openSourceFeature2',
                    'openSourceFeature3',
                    'openSourceFeature4',
                    'openSourceFeature5',
                    'openSourceFeature6',
                    'openSourceFeature7',
                    'openSourceFeature8',
                    'openSourceFeature9',
                  ].map((key, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        <Trans i18nKey={`marketing:pricing.${key}`} />
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                    <Github className="mr-2 h-4 w-4" />
                    <Trans i18nKey="marketing:pricing.openSourceCta" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro (Most Popular) */}
            <Card className="relative border-2 border-purple-500 shadow-lg scale-105 overflow-hidden">
              <ShineBorder shineColor={['#7c3aed', '#a855f7', '#ec4899']} duration={10} />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-4 py-1">
                  <Star className="mr-1 h-3 w-3" />
                  <Trans i18nKey="marketing:pricing.proBadge" />
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">
                    <Trans i18nKey="marketing:pricing.proTitle" />
                  </CardTitle>
                </div>
                <CardDescription>
                  <Trans i18nKey="marketing:pricing.proDescription" />
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">
                    <Trans i18nKey="marketing:pricing.proPrice" />
                  </span>
                  <span className="text-muted-foreground ml-2">
                    <Trans i18nKey="marketing:pricing.proPriceSuffix" />
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'proFeature1',
                    'proFeature2',
                    'proFeature3',
                    'proFeature4',
                    'proFeature5',
                    'proFeature6',
                    'proFeature7',
                    'proFeature8',
                    'proFeature9',
                  ].map((key, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        <Trans i18nKey={`marketing:pricing.${key}`} />
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/auth/sign-up">
                    <Trans i18nKey="marketing:pricing.proCta" />
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  <Trans i18nKey="marketing:pricing.proTrialNote" />
                </p>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="relative border-2 overflow-hidden">
              <ShineBorder shineColor={['#6b7280', '#9ca3af', '#6b7280']} />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">
                    <Trans i18nKey="marketing:pricing.enterpriseTitle" />
                  </CardTitle>
                </div>
                <CardDescription>
                  <Trans i18nKey="marketing:pricing.enterpriseDescription" />
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">
                    <Trans i18nKey="marketing:pricing.enterprisePrice" />
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'enterpriseFeature1',
                    'enterpriseFeature2',
                    'enterpriseFeature3',
                    'enterpriseFeature4',
                    'enterpriseFeature5',
                    'enterpriseFeature6',
                    'enterpriseFeature7',
                    'enterpriseFeature8',
                    'enterpriseFeature9',
                  ].map((key, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        <Trans i18nKey={`marketing:pricing.${key}`} />
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">
                    <Trans i18nKey="marketing:pricing.enterpriseCta" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Source Callout */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 rounded-2xl border bg-gradient-to-b from-purple-500/5 to-transparent">
              <Code2 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                <Trans i18nKey="marketing:pricing.ossTitle" />
              </h2>
              <p className="text-muted-foreground mb-6">
                <Trans i18nKey="marketing:pricing.ossDescription" />
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">
                  <Trans i18nKey="marketing:pricing.ossCta" />
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              <Trans i18nKey="marketing:pricing.faqTitle" />
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  <Trans i18nKey={`marketing:pricing.faq${num}Question`} />
                </h3>
                <p className="text-muted-foreground">
                  <Trans i18nKey={`marketing:pricing.faq${num}Answer`} />
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              <Trans i18nKey="marketing:pricing.faqContactTitle" />
            </p>
            <Button asChild variant="outline">
              <Link href="/contact">
                <Trans i18nKey="marketing:pricing.faqContactCta" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-violet-600 p-12 lg:p-16 text-center text-white">
            <ShineBorder shineColor={['#ffffff', '#a855f7', '#ffffff']} borderRadius={24} />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              <Trans i18nKey="marketing:pricing.ctaTitle" />
            </h2>
            <p className="mx-auto max-w-xl text-lg text-white/80 mb-8">
              <Trans i18nKey="marketing:pricing.ctaDescription" />
            </p>
            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              <Link href="/auth/sign-up">
                <Trans i18nKey="marketing:pricing.ctaCta" />
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default withI18n(PricingPage);
