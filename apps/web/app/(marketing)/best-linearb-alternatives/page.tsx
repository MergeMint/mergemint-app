import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Clock,
  Code2,
  Crown,
  DollarSign,
  Github,
  Layers,
  Medal,
  Server,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

import { LocalizedLink } from '~/components/localized-link';

export const metadata: Metadata = {
  title: 'Best LinearB Alternatives (2025) - MergeMint & More',
  description:
    'Looking for LinearB alternatives? Compare the best engineering analytics platforms including MergeMint, Jellyfish, Sleuth, and more. Find the right tool for your team.',
  keywords: [
    'LinearB alternative',
    'LinearB alternatives',
    'LinearB competitor',
    'engineering analytics tools',
    'developer productivity platform',
    'DORA metrics alternative',
    'MergeMint vs LinearB',
    'best engineering metrics tools 2025',
  ],
  openGraph: {
    title: 'Best LinearB Alternatives (2025) - MergeMint & More',
    description:
      'Compare the best LinearB alternatives for engineering analytics and developer productivity.',
    type: 'article',
  },
};

const alternatives = [
  {
    name: 'MergeMint',
    description: 'AI-powered PR scoring and developer recognition platform',
    highlight: true,
    logo: Trophy,
    color: 'purple',
    pros: [
      'AI evaluates every merged PR automatically',
      'Developer leaderboards and gamification',
      'Bug bounty program automation',
      'Open source and self-hostable',
      'Free for non-commercial use',
    ],
    cons: [
      'GitHub-only integration (for now)',
      'No DORA metrics tracking',
      'Newer platform',
    ],
    bestFor: 'Teams wanting AI-driven PR scoring and developer recognition',
    pricing: 'Free (non-commercial) / Contact for enterprise',
    cta: '/auth/sign-up',
    ctaText: 'Try MergeMint Free',
  },
  {
    name: 'Jellyfish',
    description: 'Engineering intelligence platform for business alignment',
    highlight: false,
    logo: Layers,
    color: 'cyan',
    pros: [
      'Engineering-business alignment',
      'Software capitalization tracking',
      'Resource allocation visibility',
      'Executive dashboards',
    ],
    cons: [
      'Enterprise pricing only',
      'No free tier',
      'Complex setup',
    ],
    bestFor: 'Large enterprises needing financial planning integration',
    pricing: 'Enterprise (custom quotes)',
    cta: 'https://jellyfish.co',
    ctaText: 'Visit Jellyfish',
    external: true,
  },
  {
    name: 'Sleuth',
    description: 'Deployment tracking and DORA metrics platform',
    highlight: false,
    logo: Target,
    color: 'green',
    pros: [
      'Excellent DORA metrics',
      'Deployment tracking',
      'Fast setup (minutes)',
      'CI/CD integration',
    ],
    cons: [
      'Focused on deployment metrics',
      'Less developer recognition features',
      'Limited PR-level analysis',
    ],
    bestFor: 'Teams focused on deployment frequency and DORA',
    pricing: 'Free tier + paid plans',
    cta: 'https://sleuth.io',
    ctaText: 'Visit Sleuth',
    external: true,
  },
  {
    name: 'GitClear',
    description: 'Developer-friendly engineering intelligence platform',
    highlight: false,
    logo: Code2,
    color: 'emerald',
    pros: [
      '65+ metrics available',
      'Tech Debt Inspector',
      'PR review optimization',
      'Developer-friendly',
    ],
    cons: [
      'Commit-focused (not PR-focused)',
      'No AI evaluation',
      'No self-hosted option',
    ],
    bestFor: 'Teams wanting detailed commit-level analytics',
    pricing: 'Free tier + paid plans',
    cta: 'https://gitclear.com',
    ctaText: 'Visit GitClear',
    external: true,
  },
  {
    name: 'Swarmia',
    description: 'Engineering effectiveness platform with team focus',
    highlight: false,
    logo: Users,
    color: 'orange',
    pros: [
      'Team health metrics',
      'Working agreements',
      'Developer experience focus',
      'Slack integration',
    ],
    cons: [
      'Team-focused, not individual',
      'No AI PR analysis',
      'Limited gamification',
    ],
    bestFor: 'Teams prioritizing team dynamics and agreements',
    pricing: 'Contact for pricing',
    cta: 'https://swarmia.com',
    ctaText: 'Visit Swarmia',
    external: true,
  },
];

const whySwitchReasons = [
  {
    title: 'Pricing Concerns',
    description:
      'LinearB starts at $2,450/month (50 contributors minimum). Many teams find this prohibitive, especially startups.',
    icon: DollarSign,
  },
  {
    title: 'Want PR-Level Analysis',
    description:
      'LinearB focuses on team metrics and DORA. Some teams want deeper, AI-powered analysis of individual PRs.',
    icon: Bot,
  },
  {
    title: 'Need Self-Hosting',
    description:
      'Security-conscious teams often need data to stay behind their firewall. LinearB is cloud-only.',
    icon: Shield,
  },
  {
    title: 'Prefer Open Source',
    description:
      'Some teams value being able to inspect, modify, and contribute to the tools they use.',
    icon: Code2,
  },
];

export default function LinearBAlternatives() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
              2025 Guide
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Best LinearB Alternatives
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Looking for a LinearB alternative? Whether you're concerned about
              pricing, need different features, or prefer open source—here are
              the top options for 2025.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Link href="/auth/sign-up">
                  Try MergeMint Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#alternatives">View All Alternatives</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Switch Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                Common Reasons
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Teams Look for LinearB Alternatives
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {whySwitchReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                      <reason.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">{reason.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alternatives Grid */}
      <section id="alternatives" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                <Star className="mr-1 h-3 w-3" />
                Top Picks
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                LinearB Alternatives Compared
              </h2>
              <p className="mt-4 text-muted-foreground">
                An honest look at the best alternatives. We acknowledge where
                each excels.
              </p>
            </div>

            <div className="space-y-8">
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'rounded-2xl border p-8 transition-all hover:shadow-lg',
                    alt.highlight
                      ? 'border-2 border-purple-500/50 bg-purple-500/5'
                      : 'bg-card',
                  )}
                >
                  {alt.highlight && (
                    <div className="mb-4">
                      <Badge className="bg-purple-600 text-white">
                        <Crown className="mr-1 h-3 w-3" />
                        Recommended Alternative
                      </Badge>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Logo and Info */}
                    <div className="flex-shrink-0">
                      <div
                        className={cn(
                          'flex h-16 w-16 items-center justify-center rounded-2xl',
                          alt.color === 'purple' &&
                            'bg-gradient-to-br from-purple-500 to-violet-600',
                          alt.color === 'cyan' &&
                            'bg-gradient-to-br from-cyan-500 to-teal-600',
                          alt.color === 'green' &&
                            'bg-gradient-to-br from-green-500 to-emerald-600',
                          alt.color === 'emerald' &&
                            'bg-gradient-to-br from-emerald-500 to-green-600',
                          alt.color === 'orange' &&
                            'bg-gradient-to-br from-orange-500 to-amber-600',
                        )}
                      >
                        <alt.logo className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{alt.name}</h3>
                          <p className="text-muted-foreground">
                            {alt.description}
                          </p>
                        </div>
                        <Button
                          asChild
                          className={cn(
                            alt.highlight &&
                              'bg-purple-600 hover:bg-purple-700',
                          )}
                          variant={alt.highlight ? 'default' : 'outline'}
                        >
                          <Link
                            href={alt.cta}
                            target={alt.external ? '_blank' : undefined}
                          >
                            {alt.ctaText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2 mb-4">
                        {/* Pros */}
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-2">
                            Strengths
                          </p>
                          <ul className="space-y-1">
                            {alt.pros.map((pro, proIdx) => (
                              <li
                                key={proIdx}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div>
                          <p className="text-sm font-semibold text-red-500 mb-2">
                            Limitations
                          </p>
                          <ul className="space-y-1">
                            {alt.cons.map((con, conIdx) => (
                              <li
                                key={conIdx}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4 border-t text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Best for:{' '}
                          </span>
                          <span className="font-medium">{alt.bestFor}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Pricing:{' '}
                          </span>
                          <span className="font-medium">{alt.pricing}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Migration CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-8 lg:p-12 text-center">
              <Badge className="mb-4 bg-purple-600 text-white">
                <Zap className="mr-1 h-3 w-3" />
                Easy Migration
              </Badge>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Switching from LinearB?
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                MergeMint connects to your GitHub in minutes. No complex setup,
                no long onboarding. Just install our GitHub App and start seeing
                AI-powered PR evaluations immediately.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>5-minute setup</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Free for non-commercial</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Link href="/auth/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <LocalizedLink href="/mergemint-vs-linearb">See Full Comparison</LocalizedLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                FAQ
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: 'What makes MergeMint different from LinearB?',
                  a: 'MergeMint uses Claude AI to evaluate every merged PR, providing impact scores and severity classification. LinearB focuses on DORA metrics and cycle time. MergeMint is also open source and self-hostable, while LinearB is cloud-only.',
                },
                {
                  q: 'Is MergeMint really free?',
                  a: 'Yes, MergeMint is free for non-commercial use under the CC BY-NC 4.0 license. For commercial use, contact us for licensing options.',
                },
                {
                  q: 'How long does it take to set up MergeMint?',
                  a: 'Most teams are up and running in under 5 minutes. Just install our GitHub App, select your repositories, and MergeMint starts evaluating merged PRs automatically.',
                },
                {
                  q: 'Can I migrate my data from LinearB?',
                  a: "MergeMint processes PRs going forward. Historical PR data from LinearB isn't directly imported, but you can backfill historical PRs through our API.",
                },
                {
                  q: 'Does MergeMint support GitLab or Bitbucket?',
                  a: 'Currently, MergeMint supports GitHub only. GitLab and Bitbucket integrations are on our roadmap.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 rounded-xl border bg-card">
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-violet-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Ready to try a LinearB alternative?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Experience AI-powered PR scoring with MergeMint. Free for
            non-commercial use, open source, and self-hostable.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link
                href="https://github.com/MergeMint/mergemint-app"
                target="_blank"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
