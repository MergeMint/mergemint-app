import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRight,
  Bot,
  Building2,
  Code2,
  Eye,
  Layers,
  Sparkles,
  Trophy,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

export const metadata: Metadata = {
  title: 'MergeMint Comparisons - See How We Stack Up',
  description:
    'Compare MergeMint with other engineering analytics platforms like LinearB, Jellyfish, and GitClear. Honest, detailed comparisons to help you choose the right tool.',
  keywords: [
    'MergeMint comparison',
    'MergeMint vs LinearB',
    'MergeMint vs Jellyfish',
    'MergeMint vs GitClear',
    'engineering analytics comparison',
    'developer productivity tools comparison',
  ],
  openGraph: {
    title: 'MergeMint Comparisons - See How We Stack Up',
    description:
      'Compare MergeMint with other engineering analytics platforms.',
    type: 'website',
  },
};

const comparisons = [
  {
    competitor: 'LinearB',
    tagline: 'AI PR Scoring vs DORA Metrics',
    description:
      'Compare our AI-powered PR evaluation with LinearB\'s DORA-focused approach. See where each excels.',
    icon: Layers,
    color: 'blue',
    href: '/compare/linearb',
  },
  {
    competitor: 'Jellyfish',
    tagline: 'Developer Recognition vs Business Alignment',
    description:
      'Compare PR-level analytics with enterprise business alignment. Different approaches for different needs.',
    icon: Building2,
    color: 'cyan',
    href: '/compare/jellyfish',
  },
  {
    competitor: 'GitClear',
    tagline: 'AI Evaluation vs Commit Analytics',
    description:
      'Compare AI-powered PR scoring with detailed commit-level tracking. Both are developer-friendly.',
    icon: Eye,
    color: 'green',
    href: '/compare/gitclear',
  },
];

export default function ComparisonsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
              Honest Comparisons
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              How MergeMint Compares
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              We believe in transparency. See honest, detailed comparisons of
              MergeMint vs other engineering analytics platforms. We acknowledge
              where competitors excel and where we shine.
            </p>
          </div>
        </div>
      </section>

      {/* Comparisons Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8">
              {comparisons.map((comparison, idx) => (
                <Link
                  key={idx}
                  href={comparison.href}
                  className="group"
                >
                  <div className="rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-purple-500/50">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div
                        className={cn(
                          'flex h-16 w-16 items-center justify-center rounded-2xl flex-shrink-0',
                          comparison.color === 'blue' &&
                            'bg-gradient-to-br from-blue-500 to-indigo-600',
                          comparison.color === 'cyan' &&
                            'bg-gradient-to-br from-cyan-500 to-teal-600',
                          comparison.color === 'green' &&
                            'bg-gradient-to-br from-green-500 to-emerald-600',
                        )}
                      >
                        <comparison.icon className="h-8 w-8 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold">
                            MergeMint vs {comparison.competitor}
                          </h2>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-purple-600 font-medium text-sm mb-2">
                          {comparison.tagline}
                        </p>
                        <p className="text-muted-foreground">
                          {comparison.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Compare Banner */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h2 className="text-2xl font-bold mb-4">
              Why We Create Honest Comparisons
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              We believe buyers deserve honest information. Our comparisons
              acknowledge where competitors excel—because if they're better for
              your use case, you should choose them. If MergeMint fits your
              needs better, we want you to understand why.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/auth/sign-up">
                Try MergeMint Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Looking for Alternatives */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              Looking for Alternatives?
            </h2>
            <p className="text-muted-foreground mb-8">
              If you're looking to switch from another platform, check out our
              alternatives guides.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/alternatives/linearb">
                  LinearB Alternatives
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/alternatives/jellyfish">
                  Jellyfish Alternatives
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
