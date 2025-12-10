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
  Eye,
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
  title: 'MergeMint vs GitClear: Compare Developer Analytics Platforms (2025)',
  description:
    'Detailed comparison of MergeMint and GitClear for developer productivity and PR analytics. Compare AI PR scoring vs commit activity tracking, pricing, and features.',
  keywords: [
    'MergeMint vs GitClear',
    'GitClear alternative',
    'GitClear comparison',
    'developer analytics comparison',
    'engineering metrics tools',
    'PR scoring vs commit tracking',
    'AI code review comparison',
    'developer productivity tools',
  ],
  openGraph: {
    title: 'MergeMint vs GitClear: Compare Developer Analytics Platforms (2025)',
    description:
      'Detailed comparison of MergeMint and GitClear for developer analytics and engineering metrics.',
    type: 'article',
  },
};

const comparisonData = {
  features: [
    {
      category: 'Core Analytics',
      items: [
        {
          feature: 'AI-Powered PR Evaluation',
          mergemint: true,
          competitor: false,
          note: 'MergeMint uses Claude AI to analyze PRs',
        },
        {
          feature: 'Commit Activity Analysis',
          mergemint: 'limited',
          competitor: true,
          note: 'GitClear tracks detailed commit patterns',
        },
        {
          feature: 'PR Scoring',
          mergemint: true,
          competitor: 'limited',
          note: 'MergeMint scores every merged PR',
        },
        {
          feature: 'Lines of Code Metrics',
          mergemint: false,
          competitor: true,
          note: 'GitClear tracks LOC changes',
        },
      ],
    },
    {
      category: 'Developer Features',
      items: [
        {
          feature: 'Developer Leaderboards',
          mergemint: true,
          competitor: true,
          note: 'Both offer ranking systems',
        },
        {
          feature: 'Individual Developer Profiles',
          mergemint: true,
          competitor: true,
          note: 'Both provide developer dashboards',
        },
        {
          feature: 'PR Review Time Optimization',
          mergemint: false,
          competitor: true,
          note: 'GitClear claims 30% review time reduction',
        },
        {
          feature: 'Bug Bounty Automation',
          mergemint: true,
          competitor: false,
          note: 'MergeMint built for reward programs',
        },
      ],
    },
    {
      category: 'Technical Capabilities',
      items: [
        {
          feature: 'Automatic Severity Classification',
          mergemint: true,
          competitor: false,
          note: 'AI detects P0-P3 severity',
        },
        {
          feature: 'Component Detection',
          mergemint: true,
          competitor: false,
          note: 'Auto-classifies code areas',
        },
        {
          feature: 'Tech Debt Tracking',
          mergemint: false,
          competitor: true,
          note: 'GitClear has Tech Debt Inspector',
        },
        {
          feature: 'Visual Changelogs',
          mergemint: true,
          competitor: true,
          note: 'Both generate changelogs',
        },
      ],
    },
    {
      category: 'Deployment & Access',
      items: [
        {
          feature: 'Self-Hosted Option',
          mergemint: true,
          competitor: false,
          note: 'MergeMint can run on your infra',
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
          competitor: true,
          note: 'Both offer free options',
        },
        {
          feature: 'API Access',
          mergemint: true,
          competitor: true,
          note: 'GitClear offers RESTful API',
        },
      ],
    },
  ],
};

export default function MergeMintVsGitClear() {
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
              MergeMint vs GitClear
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Two developer-friendly analytics platforms with different
              approaches. AI-powered PR scoring vs comprehensive commit
              tracking.
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
      <section className="py-8 bg-gradient-to-r from-purple-500/10 to-green-500/10 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-medium">
              <span className="text-purple-600">MergeMint</span> focuses on{' '}
              <strong>AI-powered PR evaluation and impact scoring</strong>,
              while <span className="text-green-600">GitClear</span> focuses on{' '}
              <strong>commit activity analysis and LOC metrics</strong>.
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
                  Best for AI PR Analysis
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
                  'Automatic severity classification (P0-P3)',
                  'Component and impact analysis',
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
                  <strong>Best for:</strong> Teams wanting AI-driven PR scoring,
                  developer recognition, and automated reward programs.
                </p>
              </div>
            </div>

            {/* GitClear Card */}
            <div className="relative rounded-2xl border bg-card p-8 shadow-lg">
              <div className="absolute -top-3 left-6">
                <Badge variant="secondary">
                  Best for Commit-Level Analytics
                </Badge>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">GitClear</h3>
                  <p className="text-sm text-muted-foreground">
                    Software Engineering Intelligence
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  'Detailed commit activity tracking',
                  '65+ velocity and quality metrics',
                  'Tech Debt Inspector',
                  'PR review time optimization',
                  'Visual changelogs for open source',
                  'DORA benchmarking',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Best for:</strong> Teams wanting detailed commit
                  analytics, tech debt tracking, and comprehensive LOC metrics.
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
                Both are developer-friendly tools with different strengths.
                Here's where each excels.
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
                          GitClear
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
                <h3 className="text-xl font-bold mb-4">GitClear</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="font-semibold text-green-600">
                      Free Tier Available
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get started with basic features
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-semibold">Paid Plans</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tiered pricing based on team size
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Developer-friendly pricing structure
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
                    'Want AI to evaluate PR impact automatically',
                    'Need automated bug bounty scoring',
                    'Prefer open source and self-hosting',
                    'Focus on PR-level (not commit-level) analytics',
                    'Want free non-commercial use',
                    'Need severity and component classification',
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
                  <Eye className="h-5 w-5 text-green-600" />
                  Choose GitClear if you:
                </h3>
                <ul className="space-y-3">
                  {[
                    'Need detailed commit-level tracking',
                    'Want LOC and code churn metrics',
                    'Need Tech Debt inspection tools',
                    'Want PR review time optimization',
                    'Prefer 65+ built-in metrics',
                    'Need DORA benchmarking data',
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
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
