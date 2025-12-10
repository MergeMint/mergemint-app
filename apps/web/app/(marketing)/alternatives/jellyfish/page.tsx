import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  Check,
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

export const metadata: Metadata = {
  title: 'Best Jellyfish Alternatives (2025) - MergeMint & More',
  description:
    'Looking for Jellyfish alternatives? Compare the best engineering intelligence platforms including MergeMint, LinearB, Sleuth, and more. Find the right tool for your team.',
  keywords: [
    'Jellyfish alternative',
    'Jellyfish alternatives',
    'Jellyfish competitor',
    'engineering intelligence platform',
    'software engineering management',
    'engineering metrics tools',
    'MergeMint vs Jellyfish',
    'best engineering platforms 2025',
  ],
  openGraph: {
    title: 'Best Jellyfish Alternatives (2025) - MergeMint & More',
    description:
      'Compare the best Jellyfish alternatives for engineering intelligence and team analytics.',
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
      'No business alignment features',
      'GitHub-only integration',
      'No financial planning tools',
    ],
    bestFor:
      'Teams wanting AI-driven PR scoring and individual developer recognition',
    pricing: 'Free (non-commercial) / Contact for enterprise',
    cta: '/auth/sign-up',
    ctaText: 'Try MergeMint Free',
  },
  {
    name: 'LinearB',
    description: 'Engineering effectiveness platform with DORA metrics',
    highlight: false,
    logo: Layers,
    color: 'blue',
    pros: [
      'Comprehensive DORA metrics',
      'gitStream workflow automation',
      'Industry benchmarking',
      'Broad integrations',
    ],
    cons: [
      'Starting at $2,450/month minimum',
      'Annual contracts only',
      'No self-hosted option',
    ],
    bestFor: 'Teams focused on DORA metrics and delivery optimization',
    pricing: '$49/contributor/month (min 50)',
    cta: 'https://linearb.io',
    ctaText: 'Visit LinearB',
    external: true,
  },
  {
    name: 'Sleuth',
    description: 'Deployment tracking and engineering intelligence',
    highlight: false,
    logo: Target,
    color: 'green',
    pros: [
      'Excellent deployment tracking',
      'Fast setup (minutes)',
      'AI-powered insights',
      'DORA metrics focus',
    ],
    cons: [
      'Deployment-focused metrics',
      'Less business alignment',
      'Limited resource planning',
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
      'Developer-centric approach',
      'Tech Debt Inspector',
      'PR review optimization',
    ],
    cons: [
      'Commit-focused metrics',
      'No business alignment',
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
    description: 'Engineering effectiveness with team health focus',
    highlight: false,
    logo: Users,
    color: 'orange',
    pros: [
      'Team working agreements',
      'Developer experience metrics',
      'Investment tracking',
      'Slack integration',
    ],
    cons: [
      'Less financial planning',
      'No AI PR evaluation',
      'Limited executive features',
    ],
    bestFor: 'Teams prioritizing team health and working agreements',
    pricing: 'Contact for pricing',
    cta: 'https://swarmia.com',
    ctaText: 'Visit Swarmia',
    external: true,
  },
];

const whySwitchReasons = [
  {
    title: 'Complex Enterprise Setup',
    description:
      'Jellyfish requires significant setup and configuration. Many teams want something they can start using immediately.',
    icon: Building2,
  },
  {
    title: 'Budget Constraints',
    description:
      'Jellyfish focuses on enterprise customers with enterprise pricing. Startups and smaller teams often need more accessible options.',
    icon: DollarSign,
  },
  {
    title: 'Developer-Focused Needs',
    description:
      'Jellyfish is designed for executives and finance teams. Some teams want tools built for developers first.',
    icon: Code2,
  },
  {
    title: 'PR-Level Analytics',
    description:
      "Jellyfish focuses on portfolio and resource management. Teams wanting detailed PR analysis may need different tools.",
    icon: Bot,
  },
];

export default function JellyfishAlternatives() {
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
              Best Jellyfish Alternatives
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Looking for a Jellyfish alternative? Whether you need
              developer-focused analytics, better pricing, or open source
              options—here are the top choices for 2025.
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
                Why Teams Look for Jellyfish Alternatives
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
                Jellyfish Alternatives Compared
              </h2>
              <p className="mt-4 text-muted-foreground">
                Honest comparison of the best alternatives for different needs.
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
                        Best for Developers
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
                          alt.color === 'blue' &&
                            'bg-gradient-to-br from-blue-500 to-indigo-600',
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

      {/* When to choose which */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                <Target className="mr-1 h-3 w-3" />
                Decision Guide
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Which Alternative is Right for You?
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-xl border-2 border-purple-500/50 bg-purple-500/5">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  Choose MergeMint if you need:
                </h3>
                <ul className="space-y-2">
                  {[
                    'AI-powered PR evaluation and scoring',
                    'Developer recognition and leaderboards',
                    'Bug bounty program automation',
                    'Open source and self-hosting options',
                    'Free pricing for your team',
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-xl border bg-card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-cyan-600" />
                  Stick with Jellyfish if you need:
                </h3>
                <ul className="space-y-2">
                  {[
                    'Engineering-business alignment',
                    'Software capitalization tracking',
                    'Executive-level dashboards',
                    'Resource allocation planning',
                    'Enterprise support and SLAs',
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-500" />
                      {item}
                    </li>
                  ))}
                </ul>
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
                  q: 'How is MergeMint different from Jellyfish?',
                  a: 'MergeMint focuses on AI-powered PR evaluation and developer recognition. Jellyfish focuses on business alignment, resource planning, and executive dashboards. MergeMint is open source and developer-centric; Jellyfish is enterprise-focused.',
                },
                {
                  q: 'Can MergeMint replace Jellyfish completely?',
                  a: "It depends on your needs. If you need business alignment and financial planning, Jellyfish offers features MergeMint doesn't have. If you need AI PR analysis and developer recognition, MergeMint excels there.",
                },
                {
                  q: 'Is MergeMint suitable for enterprise teams?',
                  a: 'Yes, MergeMint can be self-hosted for enterprise security requirements. For commercial use, contact us for licensing. Many enterprise teams use MergeMint alongside other tools.',
                },
                {
                  q: 'How does the pricing compare?',
                  a: 'MergeMint is free for non-commercial use. Jellyfish requires enterprise contracts with custom pricing. For many teams, MergeMint provides a cost-effective solution.',
                },
                {
                  q: 'What integrations does MergeMint support?',
                  a: 'Currently, MergeMint integrates with GitHub. Additional integrations (GitLab, Slack, Jira) are on our roadmap. Jellyfish has broader integrations for enterprise environments.',
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
            Ready to try a Jellyfish alternative?
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
