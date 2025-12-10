import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
  Building2,
  Layers,
  Sparkles,
  Trophy,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

import { LocalizedLink } from '~/components/localized-link';

export const metadata: Metadata = {
  title: 'Engineering Analytics Alternatives - MergeMint',
  description:
    'Looking for alternatives to LinearB, Jellyfish, or other engineering analytics platforms? Discover why teams are choosing MergeMint for AI-powered PR scoring.',
  keywords: [
    'LinearB alternative',
    'Jellyfish alternative',
    'engineering analytics alternatives',
    'developer productivity alternatives',
    'DORA metrics alternative',
    'MergeMint',
  ],
  openGraph: {
    title: 'Engineering Analytics Alternatives - MergeMint',
    description:
      'Discover alternatives to popular engineering analytics platforms.',
    type: 'website',
  },
};

const alternatives = [
  {
    platform: 'LinearB',
    description:
      'Looking for a LinearB alternative? Compare AI-powered PR scoring vs DORA metrics tracking.',
    icon: Layers,
    color: 'blue',
    href: '/best-linearb-alternatives',
    reasons: ['Pricing concerns', 'Want AI PR analysis', 'Need self-hosting'],
  },
  {
    platform: 'Jellyfish',
    description:
      'Looking for a Jellyfish alternative? Compare developer-focused analytics vs enterprise planning.',
    icon: Building2,
    color: 'cyan',
    href: '/best-jellyfish-alternatives',
    reasons: ['Need developer focus', 'Budget constraints', 'Want open source'],
  },
];

export default function AlternativesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
              Find Your Fit
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Engineering Analytics Alternatives
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Looking to switch from your current engineering analytics
              platform? We've created honest guides to help you understand your
              options—including when MergeMint might not be the best fit.
            </p>

            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link href="/auth/sign-up">
                Try MergeMint Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Alternatives Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              {alternatives.map((alt, idx) => (
                <LocalizedLink key={idx} href={alt.href} className="group">
                  <div className="h-full rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-purple-500/50">
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl mb-6',
                        alt.color === 'blue' &&
                          'bg-gradient-to-br from-blue-500 to-indigo-600',
                        alt.color === 'cyan' &&
                          'bg-gradient-to-br from-cyan-500 to-teal-600',
                      )}
                    >
                      <alt.icon className="h-7 w-7 text-white" />
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xl font-bold">
                        {alt.platform} Alternatives
                      </h2>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {alt.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {alt.reasons.map((reason, reasonIdx) => (
                        <Badge key={reasonIdx} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why MergeMint */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border-2 border-purple-500/50 bg-purple-500/5 p-8 lg:p-12">
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex-shrink-0">
                  <Trophy className="h-8 w-8 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Why Teams Choose MergeMint
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    {[
                      'AI-powered PR evaluation with Claude',
                      'Developer leaderboards and gamification',
                      'Bug bounty program automation',
                      'Open source and self-hostable',
                      'Free for non-commercial use',
                      '5-minute GitHub setup',
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/auth/sign-up">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Comparisons */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              Want Detailed Comparisons?
            </h2>
            <p className="text-muted-foreground mb-8">
              See feature-by-feature breakdowns of MergeMint vs specific
              platforms.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="outline">
                <LocalizedLink href="/mergemint-vs-linearb">MergeMint vs LinearB</LocalizedLink>
              </Button>
              <Button asChild variant="outline">
                <LocalizedLink href="/mergemint-vs-jellyfish">MergeMint vs Jellyfish</LocalizedLink>
              </Button>
              <Button asChild variant="outline">
                <LocalizedLink href="/mergemint-vs-gitclear">MergeMint vs GitClear</LocalizedLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
