import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRightIcon,
  BarChart3,
  Bot,
  CheckCircle2,
  Cog,
  Github,
  GitMerge,
  Medal,
  MessageSquare,
  Sparkles,
  Target,
  Trophy,
  Webhook,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { ShineBorder } from '@kit/ui/magicui';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: 'How MergeMint Works - AI PR Scoring in 4 Steps',
  description:
    'Learn how MergeMint works: Connect GitHub, merge PRs, let Claude AI evaluate the code, and see scores on leaderboards. Setup takes under 5 minutes.',
  keywords: [
    'how MergeMint works',
    'AI PR evaluation process',
    'GitHub integration setup',
    'automatic PR scoring',
    'Claude AI code review',
    'developer scoring workflow',
    'engineering metrics automation',
  ],
  openGraph: {
    title: 'How MergeMint Works - AI PR Scoring in 4 Steps',
    description:
      'From PR merge to developer recognition in seconds. Learn how MergeMint automates engineering metrics.',
    type: 'website',
    url: 'https://mergemint.dev/how-it-works',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How MergeMint Works - AI PR Scoring',
    description:
      'From PR merge to developer recognition in seconds. Setup takes under 5 minutes.',
  },
  alternates: {
    canonical: 'https://mergemint.dev/how-it-works',
  },
};

async function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            <Trans i18nKey="marketing:howItWorks.badge" />
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            <Trans i18nKey="marketing:howItWorks.heroTitle" />
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              <Trans i18nKey="marketing:howItWorks.heroTitleHighlight" />
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-4">
            <Trans i18nKey="marketing:howItWorks.heroDescription" />
          </p>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground/80">
            <Trans i18nKey="marketing:howItWorks.heroSubtext" />
          </p>
        </div>
      </section>

      {/* Timeline Flow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="relative pb-16">
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-500/20 hidden md:block" />

              <div className="flex gap-8 items-start">
                <div className="hidden md:flex flex-shrink-0 h-16 w-16 rounded-2xl bg-purple-500 items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Github className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-purple-500 items-center justify-center text-white">
                      <Github className="h-6 w-6" />
                    </div>
                  </div>
                  <Badge className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/20">
                    <Trans i18nKey="marketing:howItWorks.step1Badge" />
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">
                    <Trans i18nKey="marketing:howItWorks.step1Title" />
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    <Trans i18nKey="marketing:howItWorks.step1Description" />
                  </p>
                  <div className="relative p-6 rounded-xl border bg-card overflow-hidden">
                    <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Github className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          <Trans i18nKey="marketing:howItWorks.step1AppTitle" />
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Trans i18nKey="marketing:howItWorks.step1AppSubtitle" />
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span><Trans i18nKey="marketing:howItWorks.step1Feature1" /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span><Trans i18nKey="marketing:howItWorks.step1Feature2" /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span><Trans i18nKey="marketing:howItWorks.step1Feature3" /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pb-16">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-purple-500 to-purple-500/20 hidden md:block" />

              <div className="flex gap-8 items-start">
                <div className="hidden md:flex flex-shrink-0 h-16 w-16 rounded-2xl bg-purple-500 items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Cog className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-purple-500 items-center justify-center text-white">
                      <Cog className="h-6 w-6" />
                    </div>
                  </div>
                  <Badge className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/20">
                    <Trans i18nKey="marketing:howItWorks.step2Badge" />
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">
                    <Trans i18nKey="marketing:howItWorks.step2Title" />
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    <Trans i18nKey="marketing:howItWorks.step2Description" />
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-xl border bg-card">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-500" />
                        <Trans i18nKey="marketing:howItWorks.step2Components" />
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 rounded bg-muted/50">
                          <span>AUTH</span>
                          <span className="text-purple-600 font-medium">1.5×</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/50">
                          <span>PAYMENTS</span>
                          <span className="text-purple-600 font-medium">2.0×</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-muted/50">
                          <span>API</span>
                          <span className="text-purple-600 font-medium">1.2×</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                        <Trans i18nKey="marketing:howItWorks.step2SeverityLevels" />
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 rounded bg-red-500/10">
                          <span className="text-red-600">
                            <Trans i18nKey="marketing:howItWorks.step2P0" />
                          </span>
                          <span className="font-medium">100 pts</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-orange-500/10">
                          <span className="text-orange-600">
                            <Trans i18nKey="marketing:howItWorks.step2P1" />
                          </span>
                          <span className="font-medium">50 pts</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-yellow-500/10">
                          <span className="text-yellow-600">
                            <Trans i18nKey="marketing:howItWorks.step2P2" />
                          </span>
                          <span className="font-medium">25 pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pb-16">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-purple-500 to-purple-500/20 hidden md:block" />

              <div className="flex gap-8 items-start">
                <div className="hidden md:flex flex-shrink-0 h-16 w-16 rounded-2xl bg-purple-500 items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <GitMerge className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-purple-500 items-center justify-center text-white">
                      <GitMerge className="h-6 w-6" />
                    </div>
                  </div>
                  <Badge className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/20">
                    <Trans i18nKey="marketing:howItWorks.step3Badge" />
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">
                    <Trans i18nKey="marketing:howItWorks.step3Title" />
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    <Trans i18nKey="marketing:howItWorks.step3Description" />
                  </p>
                  <div className="p-6 rounded-xl border bg-card font-mono text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Webhook className="h-4 w-4" />
                      <span><Trans i18nKey="marketing:howItWorks.step3Webhook" /></span>
                    </div>
                    <pre className="text-xs overflow-x-auto">
{`{
  "action": "closed",
  "pull_request": {
    "merged": true,
    "number": 142,
    "title": "Fix session timeout bug",
    "user": { "login": "dev123" },
    "additions": 45,
    "deletions": 12
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative pb-16">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-purple-500 to-purple-500/20 hidden md:block" />

              <div className="flex gap-8 items-start">
                <div className="hidden md:flex flex-shrink-0 h-16 w-16 rounded-2xl bg-purple-500 items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Bot className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-purple-500 items-center justify-center text-white">
                      <Bot className="h-6 w-6" />
                    </div>
                  </div>
                  <Badge className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/20">
                    <Trans i18nKey="marketing:howItWorks.step4Badge" />
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">
                    <Trans i18nKey="marketing:howItWorks.step4Title" />
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    <Trans i18nKey="marketing:howItWorks.step4Description" />
                  </p>
                  <div className="p-6 rounded-xl border bg-gradient-to-br from-purple-500/5 to-violet-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          <Trans i18nKey="marketing:howItWorks.step4Analysis" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Trans i18nKey="marketing:howItWorks.step4Processing" />
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span><Trans i18nKey="marketing:howItWorks.step4Feature1" /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span><Trans i18nKey="marketing:howItWorks.step4Feature2" /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span><Trans i18nKey="marketing:howItWorks.step4Feature3" /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span><Trans i18nKey="marketing:howItWorks.step4Feature4" /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative pb-16">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-purple-500 to-purple-500/20 hidden md:block" />

              <div className="flex gap-8 items-start">
                <div className="hidden md:flex flex-shrink-0 h-16 w-16 rounded-2xl bg-purple-500 items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-purple-500 items-center justify-center text-white">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                  </div>
                  <Badge className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/20">
                    <Trans i18nKey="marketing:howItWorks.step5Badge" />
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">
                    <Trans i18nKey="marketing:howItWorks.step5Title" />
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    <Trans i18nKey="marketing:howItWorks.step5Description" />
                  </p>
                  <div className="relative p-6 rounded-xl border bg-card overflow-hidden">
                    <ShineBorder shineColor={['#7c3aed', '#ec4899', '#7c3aed']} />
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          <Trans i18nKey="marketing:howItWorks.step5Bot" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Trans i18nKey="marketing:howItWorks.step5CommentedJustNow" />
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold">
                          <Trans i18nKey="marketing:howItWorks.step5Score" values={{ points: 75 }} />
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div><Trans i18nKey="marketing:howItWorks.step5Component" /> <span className="text-purple-600 font-medium">AUTH (1.5×)</span></div>
                          <div><Trans i18nKey="marketing:howItWorks.step5Severity" /> <span className="text-orange-600 font-medium">P1 (50 pts)</span></div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <Trans i18nKey="marketing:howItWorks.step5IssueLinked" />
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <Trans i18nKey="marketing:howItWorks.step5TestsIncluded" />
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <Trans i18nKey="marketing:howItWorks.step5Implementation" />
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="relative">
              <div className="flex gap-8 items-start">
                <div className="hidden md:flex flex-shrink-0 h-16 w-16 rounded-2xl bg-purple-500 items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="md:hidden mb-4">
                    <div className="inline-flex h-12 w-12 rounded-xl bg-purple-500 items-center justify-center text-white">
                      <Trophy className="h-6 w-6" />
                    </div>
                  </div>
                  <Badge className="mb-2 bg-purple-500/10 text-purple-600 border-purple-500/20">
                    <Trans i18nKey="marketing:howItWorks.step6Badge" />
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">
                    <Trans i18nKey="marketing:howItWorks.step6Title" />
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    <Trans i18nKey="marketing:howItWorks.step6Description" />
                  </p>
                  <div className="relative p-6 rounded-xl border bg-card overflow-hidden">
                    <ShineBorder shineColor={['#fbbf24', '#7c3aed', '#fbbf24']} />
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Medal className="h-4 w-4 text-purple-500" />
                        <Trans i18nKey="marketing:howItWorks.step6Leaderboard" />
                      </h4>
                      <Badge variant="outline">
                        <Trans i18nKey="marketing:howItWorks.step6Live" />
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {[
                        { rank: 1, name: 'sarah_dev', score: 425, prs: 8 },
                        { rank: 2, name: 'mike_eng', score: 380, prs: 6 },
                        { rank: 3, name: 'dev123', score: 275, prs: 5, highlight: true },
                      ].map((dev) => (
                        <div
                          key={dev.rank}
                          className={`flex items-center gap-4 p-3 rounded-lg ${dev.highlight ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-muted/50'}`}
                        >
                          <span className={`text-lg font-bold ${dev.rank === 1 ? 'text-yellow-500' : dev.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`}>
                            #{dev.rank}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{dev.name}</p>
                            <p className="text-xs text-muted-foreground">{dev.prs} <Trans i18nKey="marketing:howItWorks.step6PRs" /></p>
                          </div>
                          <span className="font-bold text-purple-600">{dev.score} <Trans i18nKey="marketing:howItWorks.step6Pts" /></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-violet-600 p-12 lg:p-16 text-center text-white">
            <ShineBorder shineColor={['#ffffff', '#a855f7', '#ffffff']} borderRadius={24} />
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 relative">
              <Trans i18nKey="marketing:howItWorks.ctaTitle" />
            </h2>
            <p className="mx-auto max-w-xl text-lg text-white/80 mb-8 relative">
              <Trans i18nKey="marketing:howItWorks.ctaDescription" />
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                <Link href="/auth/sign-up">
                  <Trans i18nKey="marketing:howItWorks.ctaCta" />
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/features">
                  <Trans i18nKey="marketing:howItWorks.ctaSecondaryCta" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default withI18n(HowItWorksPage);
