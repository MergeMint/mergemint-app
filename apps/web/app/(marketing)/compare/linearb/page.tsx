import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
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
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

export const metadata: Metadata = {
  title: 'MergeMint vs LinearB: Compare Developer Analytics Platforms (2025)',
  description:
    'Detailed comparison of MergeMint and LinearB for engineering metrics and developer productivity. See pricing, features, and which platform is right for your team.',
  keywords: [
    'MergeMint vs LinearB',
    'LinearB alternative',
    'LinearB comparison',
    'developer analytics comparison',
    'engineering metrics tools',
    'PR scoring vs DORA metrics',
    'AI code review comparison',
    'developer productivity tools',
  ],
  openGraph: {
    title: 'MergeMint vs LinearB: Compare Developer Analytics Platforms (2025)',
    description:
      'Detailed comparison of MergeMint and LinearB for engineering metrics and developer productivity.',
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
          note: 'MergeMint uses Claude AI to analyze every PR',
        },
        {
          feature: 'DORA Metrics',
          mergemint: false,
          competitor: true,
          note: 'LinearB focuses on DORA metrics',
        },
        {
          feature: 'Developer Leaderboards',
          mergemint: true,
          competitor: 'limited',
          note: 'MergeMint has comprehensive gamification',
        },
        {
          feature: 'Bug Bounty Automation',
          mergemint: true,
          competitor: false,
          note: 'Built-in scoring for bounty programs',
        },
      ],
    },
    {
      category: 'AI Capabilities',
      items: [
        {
          feature: 'PR Impact Analysis',
          mergemint: true,
          competitor: false,
          note: 'Claude AI evaluates code changes',
        },
        {
          feature: 'Automatic Severity Classification',
          mergemint: true,
          competitor: false,
          note: 'P0-P3 severity detection',
        },
        {
          feature: 'Component Classification',
          mergemint: true,
          competitor: false,
          note: 'Automatic code area detection',
        },
        {
          feature: 'AI Code Review',
          mergemint: false,
          competitor: true,
          note: 'LinearB offers gitStream',
        },
      ],
    },
    {
      category: 'Deployment & Privacy',
      items: [
        {
          feature: 'Self-Hosted Option',
          mergemint: true,
          competitor: false,
          note: 'Keep all data behind your firewall',
        },
        {
          feature: 'Open Source',
          mergemint: true,
          competitor: false,
          note: 'CC BY-NC 4.0 license',
        },
        {
          feature: 'Cloud SaaS',
          mergemint: true,
          competitor: true,
          note: 'Both offer hosted solutions',
        },
        {
          feature: 'SOC 2 Compliance',
          mergemint: 'ready',
          competitor: true,
          note: 'LinearB is SOC 2 certified',
        },
      ],
    },
    {
      category: 'Integrations',
      items: [
        {
          feature: 'GitHub Integration',
          mergemint: true,
          competitor: true,
          note: 'Both support GitHub',
        },
        {
          feature: 'GitLab Integration',
          mergemint: false,
          competitor: true,
          note: 'Coming soon to MergeMint',
        },
        {
          feature: 'Jira Integration',
          mergemint: false,
          competitor: true,
          note: 'LinearB has broader integrations',
        },
        {
          feature: 'Slack Integration',
          mergemint: false,
          competitor: true,
          note: 'Coming soon to MergeMint',
        },
      ],
    },
  ],
  pricing: {
    mergemint: {
      free: 'Free for non-commercial use',
      paid: 'Contact for commercial licensing',
      notes: 'Self-hosted option available',
    },
    competitor: {
      free: 'Free tier (limited)',
      paid: 'Starting at $49/contributor/month',
      notes: 'Annual contracts, minimum 50 contributors ($2,450/month)',
    },
  },
};

export default function MergeMintVsLinearB() {
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
              MergeMint vs LinearB
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Choosing between engineering analytics platforms? Here's an honest
              comparison to help you decide which tool fits your team's needs.
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

      {/* Quick Summary */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* MergeMint Card */}
            <div className="relative rounded-2xl border-2 border-purple-500/50 bg-card p-8 shadow-lg">
              <div className="absolute -top-3 left-6">
                <Badge className="bg-purple-600 text-white">
                  <Crown className="mr-1 h-3 w-3" />
                  Best for PR-Level Analytics
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
                  'AI evaluates every merged PR automatically',
                  'Developer recognition and leaderboards',
                  'Bug bounty program automation',
                  'Open source and self-hostable',
                  'Free for non-commercial use',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Best for:</strong> Teams wanting objective PR scoring,
                  bug bounty automation, or developer recognition systems.
                </p>
              </div>
            </div>

            {/* LinearB Card */}
            <div className="relative rounded-2xl border bg-card p-8 shadow-lg">
              <div className="absolute -top-3 left-6">
                <Badge variant="secondary">Best for DORA Metrics</Badge>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">LinearB</h3>
                  <p className="text-sm text-muted-foreground">
                    Engineering Effectiveness Platform
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Comprehensive DORA metrics tracking',
                  'Cycle time and throughput analytics',
                  'gitStream for workflow automation',
                  'Broad tool integrations (Jira, Slack)',
                  'Industry benchmarking',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Best for:</strong> Enterprise teams focused on DORA
                  metrics, delivery optimization, and workflow automation.
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
                An honest look at what each platform offers. We acknowledge
                where LinearB excels and where MergeMint shines.
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
                          LinearB
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
                <h3 className="text-xl font-bold mb-4">LinearB</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-semibold">Free Tier</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Limited features, basic DORA insights
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-semibold">$49/contributor/month</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum 50 contributors ($2,450/month)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Annual contracts only
                    </p>
                  </div>
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
                    'Want AI-powered PR scoring and impact analysis',
                    'Need to automate bug bounty or reward programs',
                    'Want developer leaderboards and gamification',
                    'Prefer open source and self-hosted solutions',
                    'Need a free solution for your team',
                    'Focus on individual PR-level analytics',
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
                  <Layers className="h-5 w-5 text-blue-600" />
                  Choose LinearB if you:
                </h3>
                <ul className="space-y-3">
                  {[
                    'Need comprehensive DORA metrics tracking',
                    'Want workflow automation with gitStream',
                    'Require broad integrations (Jira, GitLab, Slack)',
                    'Need industry benchmarking data',
                    'Focus on team-level delivery optimization',
                    'Have budget for enterprise tooling',
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
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
            Join hundreds of engineering teams using AI-powered PR scoring. Free
            for non-commercial use, self-hostable, and open source.
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
