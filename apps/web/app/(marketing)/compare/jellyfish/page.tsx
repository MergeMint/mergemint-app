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
  PieChart,
  Server,
  Shield,
  Sparkles,
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
  title:
    'MergeMint vs Jellyfish: Compare Engineering Intelligence Platforms (2025)',
  description:
    'Detailed comparison of MergeMint and Jellyfish for engineering analytics. Compare AI PR scoring vs business alignment features, pricing, and deployment options.',
  keywords: [
    'MergeMint vs Jellyfish',
    'Jellyfish alternative',
    'Jellyfish comparison',
    'engineering intelligence platform',
    'developer analytics comparison',
    'PR scoring vs engineering management',
    'software engineering intelligence',
    'engineering metrics tools',
  ],
  openGraph: {
    title:
      'MergeMint vs Jellyfish: Compare Engineering Intelligence Platforms (2025)',
    description:
      'Detailed comparison of MergeMint and Jellyfish for engineering analytics and productivity.',
    type: 'article',
  },
};

const comparisonData = {
  features: [
    {
      category: 'Core Focus',
      items: [
        {
          feature: 'AI-Powered PR Evaluation',
          mergemint: true,
          competitor: false,
          note: 'MergeMint uses Claude AI for PR analysis',
        },
        {
          feature: 'Business Alignment & Planning',
          mergemint: false,
          competitor: true,
          note: 'Jellyfish excels at engineering-business alignment',
        },
        {
          feature: 'Developer Recognition',
          mergemint: true,
          competitor: 'limited',
          note: 'MergeMint has comprehensive leaderboards',
        },
        {
          feature: 'Financial Planning',
          mergemint: false,
          competitor: true,
          note: 'Jellyfish offers software capitalization',
        },
      ],
    },
    {
      category: 'Analytics Capabilities',
      items: [
        {
          feature: 'PR-Level Impact Analysis',
          mergemint: true,
          competitor: false,
          note: 'Detailed per-PR scoring',
        },
        {
          feature: 'Team Resource Allocation',
          mergemint: false,
          competitor: true,
          note: 'Jellyfish provides resource visibility',
        },
        {
          feature: 'DORA Metrics',
          mergemint: false,
          competitor: true,
          note: 'Jellyfish includes DORA tracking',
        },
        {
          feature: 'Bug Bounty Scoring',
          mergemint: true,
          competitor: false,
          note: 'Built for reward automation',
        },
      ],
    },
    {
      category: 'Deployment & Pricing',
      items: [
        {
          feature: 'Self-Hosted Option',
          mergemint: true,
          competitor: false,
          note: 'Full control over your data',
        },
        {
          feature: 'Open Source',
          mergemint: true,
          competitor: false,
          note: 'CC BY-NC 4.0 license',
        },
        {
          feature: 'Free Tier',
          mergemint: true,
          competitor: false,
          note: 'Free for non-commercial use',
        },
        {
          feature: 'Enterprise Support',
          mergemint: 'contact',
          competitor: true,
          note: 'Jellyfish focuses on enterprise',
        },
      ],
    },
    {
      category: 'Target Audience',
      items: [
        {
          feature: 'Engineering Managers',
          mergemint: true,
          competitor: true,
          note: 'Both serve engineering leadership',
        },
        {
          feature: 'CFO/Finance Teams',
          mergemint: false,
          competitor: true,
          note: 'Jellyfish designed for finance',
        },
        {
          feature: 'Individual Developers',
          mergemint: true,
          competitor: 'limited',
          note: 'MergeMint provides developer profiles',
        },
        {
          feature: 'Startups & Small Teams',
          mergemint: true,
          competitor: false,
          note: 'MergeMint is accessible for all sizes',
        },
      ],
    },
  ],
};

export default function MergeMintVsJellyfish() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
              2025 Comparison
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              MergeMint vs Jellyfish
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Comparing AI-powered PR scoring with enterprise engineering
              management. Two different approaches to engineering analytics.
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
                <Link href="#comparison">View Full Comparison</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Difference Banner */}
      <section className="py-8 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-medium">
              <span className="text-purple-600">MergeMint</span> focuses on{' '}
              <strong>PR-level AI evaluation and developer recognition</strong>,
              while <span className="text-cyan-600">Jellyfish</span> focuses on{' '}
              <strong>
                enterprise engineering management and business alignment
              </strong>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* MergeMint Card */}
            <div className="relative rounded-2xl border-2 border-purple-500/50 bg-card p-8 shadow-lg">
              <div className="absolute -top-3 left-6">
                <Badge className="bg-purple-600 text-white">
                  <Crown className="mr-1 h-3 w-3" />
                  Best for Developer Recognition
                </Badge>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">MergeMint</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-Powered PR Scoring
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Claude AI evaluates every merged PR',
                  'Developer leaderboards and gamification',
                  'Automated bug bounty scoring',
                  'Open source and self-hostable',
                  'Free for non-commercial use',
                  'Individual PR-level insights',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Best for:</strong> Engineering teams wanting objective
                  PR scoring, developer recognition, and reward automation.
                </p>
              </div>
            </div>

            {/* Jellyfish Card */}
            <div className="relative rounded-2xl border bg-card p-8 shadow-lg">
              <div className="absolute -top-3 left-6">
                <Badge variant="secondary">Best for Enterprise Planning</Badge>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Jellyfish</h3>
                  <p className="text-sm text-muted-foreground">
                    Engineering Intelligence Platform
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Engineering-business alignment',
                  'Resource allocation visibility',
                  'Software capitalization tracking',
                  'Budget forecasting tools',
                  'Executive dashboards',
                  'Project delivery tracking',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Best for:</strong> Enterprise engineering orgs needing
                  business alignment, financial planning, and executive
                  reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section id="comparison" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                Feature Comparison
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Detailed Feature Breakdown
              </h2>
              <p className="mt-4 text-muted-foreground">
                These platforms serve different needs. Here's where each excels.
              </p>
            </div>

            {comparisonData.features.map((category, categoryIdx) => (
              <div key={categoryIdx} className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-purple-600">
                  {category.category}
                </h3>
                <div className="overflow-hidden rounded-xl border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Feature
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          MergeMint
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium">
                          Jellyfish
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className={cn(
                            'border-t',
                            idx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                          )}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-sm">
                                {item.feature}
                              </p>
                              {item.note && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.mergemint === true ? (
                              <Check className="mx-auto h-5 w-5 text-green-500" />
                            ) : item.mergemint === false ? (
                              <X className="mx-auto h-5 w-5 text-red-400" />
                            ) : (
                              <span className="text-xs text-yellow-600 font-medium">
                                {item.mergemint}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.competitor === true ? (
                              <Check className="mx-auto h-5 w-5 text-green-500" />
                            ) : item.competitor === false ? (
                              <X className="mx-auto h-5 w-5 text-red-400" />
                            ) : (
                              <span className="text-xs text-yellow-600 font-medium">
                                {item.competitor}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                <DollarSign className="mr-1 h-3 w-3" />
                Pricing
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pricing Comparison
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border-2 border-purple-500/50 bg-card p-6">
                <h3 className="text-xl font-bold mb-4 text-purple-600">
                  MergeMint
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="font-semibold text-green-600">
                      Free for Non-Commercial Use
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Open source under CC BY-NC 4.0
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-semibold">Commercial Licensing</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact for enterprise pricing
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Self-hosted option available
                  </p>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-xl font-bold mb-4">Jellyfish</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-semibold">Enterprise Pricing</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Custom quotes based on team size
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-semibold">No Free Tier</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact sales for demo and pricing
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Designed for enterprise organizations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When to Choose */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                <Target className="mr-1 h-3 w-3" />
                Recommendation
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Which One Should You Choose?
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-xl border-2 border-purple-500/30 bg-purple-500/5 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  Choose MergeMint if you:
                </h3>
                <ul className="space-y-3">
                  {[
                    'Want AI-powered PR scoring and analysis',
                    'Need developer leaderboards and recognition',
                    'Run a bug bounty or reward program',
                    'Prefer open source and self-hosting',
                    'Are a startup or smaller team',
                    'Focus on individual contributions',
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

              <div className="rounded-xl border bg-muted/30 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-cyan-600" />
                  Choose Jellyfish if you:
                </h3>
                <ul className="space-y-3">
                  {[
                    'Need engineering-business alignment',
                    'Require software capitalization tracking',
                    'Want executive-level dashboards',
                    'Need resource allocation visibility',
                    'Are a large enterprise organization',
                    'Have budget for premium tooling',
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-violet-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Ready to try MergeMint?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Experience AI-powered PR scoring and developer recognition. Free for
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
