import { Metadata } from 'next';
import Link from 'next/link';

import {
  AlertCircle,
  AlertTriangle,
  ArrowRightIcon,
  BarChart3,
  Bell,
  Bot,
  Bug,
  Calendar,
  CheckCircle2,
  Code2,
  Cog,
  Crown,
  Database,
  ExternalLink,
  FileText,
  Github,
  GitMerge,
  GitPullRequest,
  Layers,
  LayoutDashboard,
  Lock,
  Medal,
  RefreshCcw,
  ScrollText,
  Server,
  Settings2,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Webhook,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { ShineBorder } from '@kit/ui/magicui';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: 'Features - AI PR Scoring, Developer Leaderboards & More',
  description:
    'Explore MergeMint features: AI-powered PR evaluation with Claude, developer leaderboards, bug bounty automation, configurable scoring, GitHub integration, and self-hosting options.',
  keywords: [
    'PR scoring features',
    'AI code review',
    'developer leaderboards',
    'GitHub PR analytics',
    'engineering metrics',
    'bug bounty automation',
    'Claude AI evaluation',
    'developer recognition platform',
  ],
  openGraph: {
    title: 'MergeMint Features - AI PR Scoring & Developer Recognition',
    description:
      'Explore all features: AI-powered PR evaluation, developer leaderboards, bug bounty automation, and more.',
    type: 'website',
    url: 'https://mergemint.dev/features',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MergeMint Features - AI PR Scoring & Developer Recognition',
    description:
      'Explore all features: AI-powered PR evaluation, developer leaderboards, bug bounty automation.',
  },
  alternates: {
    canonical: 'https://mergemint.dev/features',
  },
};

async function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            <Trans i18nKey="marketing:features.badge" />
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            <Trans i18nKey="marketing:features.heroTitle" />
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              <Trans i18nKey="marketing:features.heroTitleHighlight" />
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-4">
            <Trans i18nKey="marketing:features.heroDescription" />
          </p>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground/80">
            <Trans i18nKey="marketing:features.heroSubtext" />
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              <Trans i18nKey="marketing:features.corePlatformTitle" />
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <Trans i18nKey="marketing:features.corePlatformDescription" />
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Bot className="h-6 w-6" />}
              titleKey="marketing:features.aiEvaluationTitle"
              descriptionKey="marketing:features.aiEvaluationDescription"
              highlightKeys={[
                'marketing:features.aiEvaluationFeature1',
                'marketing:features.aiEvaluationFeature2',
                'marketing:features.aiEvaluationFeature3',
                'marketing:features.aiEvaluationFeature4',
              ]}
            />

            <FeatureCard
              icon={<Settings2 className="h-6 w-6" />}
              titleKey="marketing:features.configurableTitle"
              descriptionKey="marketing:features.configurableDescription"
              highlightKeys={[
                'marketing:features.configurableFeature1',
                'marketing:features.configurableFeature2',
                'marketing:features.configurableFeature3',
                'marketing:features.configurableFeature4',
              ]}
            />

            <FeatureCard
              icon={<LayoutDashboard className="h-6 w-6" />}
              titleKey="marketing:features.dashboardsTitle"
              descriptionKey="marketing:features.dashboardsDescription"
              highlightKeys={[
                'marketing:features.dashboardsFeature1',
                'marketing:features.dashboardsFeature2',
                'marketing:features.dashboardsFeature3',
                'marketing:features.dashboardsFeature4',
              ]}
            />

            <FeatureCard
              icon={<Medal className="h-6 w-6" />}
              titleKey="marketing:features.leaderboardsTitle"
              descriptionKey="marketing:features.leaderboardsDescription"
              highlightKeys={[
                'marketing:features.leaderboardsFeature1',
                'marketing:features.leaderboardsFeature2',
                'marketing:features.leaderboardsFeature3',
                'marketing:features.leaderboardsFeature4',
              ]}
            />

            <FeatureCard
              icon={<GitPullRequest className="h-6 w-6" />}
              titleKey="marketing:features.prCommentsTitle"
              descriptionKey="marketing:features.prCommentsDescription"
              highlightKeys={[
                'marketing:features.prCommentsFeature1',
                'marketing:features.prCommentsFeature2',
                'marketing:features.prCommentsFeature3',
                'marketing:features.prCommentsFeature4',
              ]}
            />

            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              titleKey="marketing:features.profilesTitle"
              descriptionKey="marketing:features.profilesDescription"
              highlightKeys={[
                'marketing:features.profilesFeature1',
                'marketing:features.profilesFeature2',
                'marketing:features.profilesFeature3',
                'marketing:features.profilesFeature4',
              ]}
            />
          </div>
        </div>
      </section>

      {/* GitHub Integration */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <Github className="mr-2 h-4 w-4" />
                <Trans i18nKey="marketing:features.githubBadge" />
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                <Trans i18nKey="marketing:features.githubTitle" />
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                <Trans i18nKey="marketing:features.githubDescription" />
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Webhook />, titleKey: 'marketing:features.githubWebhook', descKey: 'marketing:features.githubWebhookDesc' },
                  { icon: <GitMerge />, titleKey: 'marketing:features.githubDiff', descKey: 'marketing:features.githubDiffDesc' },
                  { icon: <Target />, titleKey: 'marketing:features.githubIssue', descKey: 'marketing:features.githubIssueDesc' },
                  { icon: <Bell />, titleKey: 'marketing:features.githubComments', descKey: 'marketing:features.githubCommentsDesc' },
                  { icon: <RefreshCcw />, titleKey: 'marketing:features.githubBackfill', descKey: 'marketing:features.githubBackfillDesc' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        <Trans i18nKey={item.titleKey} />
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <Trans i18nKey={item.descKey} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-2xl blur-xl" />
              <div className="relative rounded-xl border bg-card p-8">
                <pre className="text-sm overflow-x-auto">
                  <code className="text-muted-foreground">{`// GitHub Webhook Payload
{
  "action": "closed",
  "pull_request": {
    "merged": true,
    "number": 142,
    "title": "Fix auth token refresh",
    "additions": 45,
    "deletions": 12,
    "changed_files": 3
  }
}

// MergeMint Response
{
  "component": "AUTH",
  "severity": "P1",
  "score": 75,
  "eligibility": {
    "issue": true,
    "implementation": true,
    "tests": true
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring Engine */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Target className="mr-2 h-4 w-4" />
              <Trans i18nKey="marketing:features.scoringBadge" />
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              <Trans i18nKey="marketing:features.scoringTitle" />
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <Trans i18nKey="marketing:features.scoringDescription" />
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-8 rounded-2xl border bg-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Cog className="h-5 w-5 text-purple-500" />
                <Trans i18nKey="marketing:features.componentDefinitions" />
              </h3>
              <p className="text-muted-foreground mb-6">
                <Trans i18nKey="marketing:features.componentDefinitionsDesc" />
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">AUTH</span>
                  <Badge variant="secondary">1.5× <Trans i18nKey="marketing:features.multiplier" /></Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">PAYMENTS</span>
                  <Badge variant="secondary">2.0× <Trans i18nKey="marketing:features.multiplier" /></Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">UI</span>
                  <Badge variant="secondary">1.0× <Trans i18nKey="marketing:features.multiplier" /></Badge>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border bg-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <Trans i18nKey="marketing:features.severityLevels" />
              </h3>
              <p className="text-muted-foreground mb-6">
                <Trans i18nKey="marketing:features.severityLevelsDesc" />
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                  <span className="font-mono text-sm text-red-600">
                    <Trans i18nKey="marketing:features.severityP0" />
                  </span>
                  <Badge variant="destructive">100 <Trans i18nKey="marketing:features.pts" /></Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                  <span className="font-mono text-sm text-orange-600">
                    <Trans i18nKey="marketing:features.severityP1" />
                  </span>
                  <Badge className="bg-orange-500">50 <Trans i18nKey="marketing:features.pts" /></Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                  <span className="font-mono text-sm text-yellow-600">
                    <Trans i18nKey="marketing:features.severityP2" />
                  </span>
                  <Badge className="bg-yellow-500 text-yellow-900">25 <Trans i18nKey="marketing:features.pts" /></Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">
                    <Trans i18nKey="marketing:features.severityP3" />
                  </span>
                  <Badge variant="secondary">10 <Trans i18nKey="marketing:features.pts" /></Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Insights - NEW */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-cyan-500/30 bg-cyan-500/5">
              <Layers className="mr-2 h-4 w-4 text-cyan-600" />
              <span className="text-cyan-600">
                <Trans i18nKey="marketing:features.productInsightsBadge" />
              </span>
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              <Trans i18nKey="marketing:features.productInsightsTitle" />
              <span className="block bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                <Trans i18nKey="marketing:features.productInsightsSubtitle" />
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <Trans i18nKey="marketing:features.productInsightsDescription" />
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Layers className="h-6 w-6" />}
              titleKey="marketing:features.componentAnalyticsTitle"
              descriptionKey="marketing:features.componentAnalyticsDescription"
              highlightKeys={[
                'marketing:features.componentAnalyticsFeature1',
                'marketing:features.componentAnalyticsFeature2',
                'marketing:features.componentAnalyticsFeature3',
                'marketing:features.componentAnalyticsFeature4',
              ]}
              gradientFrom="from-cyan-500"
              gradientTo="to-teal-500"
            />

            <FeatureCard
              icon={<Bug className="h-6 w-6" />}
              titleKey="marketing:features.bugHotspotsTitle"
              descriptionKey="marketing:features.bugHotspotsDescription"
              highlightKeys={[
                'marketing:features.bugHotspotsFeature1',
                'marketing:features.bugHotspotsFeature2',
                'marketing:features.bugHotspotsFeature3',
                'marketing:features.bugHotspotsFeature4',
              ]}
              gradientFrom="from-red-500"
              gradientTo="to-orange-500"
            />

            <FeatureCard
              icon={<Crown className="h-6 w-6" />}
              titleKey="marketing:features.featureOwnershipTitle"
              descriptionKey="marketing:features.featureOwnershipDescription"
              highlightKeys={[
                'marketing:features.featureOwnershipFeature1',
                'marketing:features.featureOwnershipFeature2',
                'marketing:features.featureOwnershipFeature3',
                'marketing:features.featureOwnershipFeature4',
              ]}
              gradientFrom="from-purple-500"
              gradientTo="to-pink-500"
            />

            <FeatureCard
              icon={<AlertTriangle className="h-6 w-6" />}
              titleKey="marketing:features.knowledgeSilosTitle"
              descriptionKey="marketing:features.knowledgeSilosDescription"
              highlightKeys={[
                'marketing:features.knowledgeSilosFeature1',
                'marketing:features.knowledgeSilosFeature2',
                'marketing:features.knowledgeSilosFeature3',
                'marketing:features.knowledgeSilosFeature4',
              ]}
              gradientFrom="from-yellow-500"
              gradientTo="to-amber-500"
            />

            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              titleKey="marketing:features.severityTrendsTitle"
              descriptionKey="marketing:features.severityTrendsDescription"
              highlightKeys={[
                'marketing:features.severityTrendsFeature1',
                'marketing:features.severityTrendsFeature2',
                'marketing:features.severityTrendsFeature3',
                'marketing:features.severityTrendsFeature4',
              ]}
              gradientFrom="from-blue-500"
              gradientTo="to-indigo-500"
            />

            <FeatureCard
              icon={<AlertCircle className="h-6 w-6" />}
              titleKey="marketing:features.atRiskTitle"
              descriptionKey="marketing:features.atRiskDescription"
              highlightKeys={[
                'marketing:features.atRiskFeature1',
                'marketing:features.atRiskFeature2',
                'marketing:features.atRiskFeature3',
                'marketing:features.atRiskFeature4',
              ]}
              gradientFrom="from-rose-500"
              gradientTo="to-red-500"
            />
          </div>

          <div className="mt-16 p-8 rounded-2xl border bg-gradient-to-br from-cyan-500/5 to-teal-500/5 relative overflow-hidden">
            <ShineBorder shineColor={['#06b6d4', '#14b8a6', '#06b6d4']} borderRadius={16} />
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  <Trans i18nKey="marketing:features.productInsightsCalloutTitle" />
                </h3>
                <p className="text-muted-foreground mb-6">
                  <Trans i18nKey="marketing:features.productInsightsCalloutDesc" />
                </p>
                <div className="space-y-3">
                  {[
                    { icon: <UserCheck className="h-4 w-4" />, textKey: 'marketing:features.productInsightsCallout1' },
                    { icon: <TrendingUp className="h-4 w-4" />, textKey: 'marketing:features.productInsightsCallout2' },
                    { icon: <Layers className="h-4 w-4" />, textKey: 'marketing:features.productInsightsCallout3' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                        {item.icon}
                      </div>
                      <span className="text-sm">
                        <Trans i18nKey={item.textKey} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="font-semibold">
                      <Trans i18nKey="marketing:features.componentHealthScore" />
                    </span>
                    <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
                      <Trans i18nKey="marketing:features.dashboard" />
                    </Badge>
                  </div>
                  {[
                    { name: 'Auth', score: 92, color: 'bg-green-500' },
                    { name: 'Payments', score: 78, color: 'bg-yellow-500' },
                    { name: 'Dashboard', score: 85, color: 'bg-green-500' },
                    { name: 'API', score: 65, color: 'bg-orange-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Changelog */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-violet-500/30 bg-violet-500/5">
              <ScrollText className="mr-2 h-4 w-4 text-violet-600" />
              <span className="text-violet-600">
                <Trans i18nKey="marketing:features.changelogBadge" />
              </span>
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              <Trans i18nKey="marketing:features.changelogSectionTitle" />
              <span className="block bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                <Trans i18nKey="marketing:features.changelogSubtitle" />
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <Trans i18nKey="marketing:features.changelogDescription" />
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              titleKey="marketing:features.aiGenerationTitle"
              descriptionKey="marketing:features.aiGenerationDescription"
              highlightKeys={[
                'marketing:features.aiGenerationFeature1',
                'marketing:features.aiGenerationFeature2',
                'marketing:features.aiGenerationFeature3',
                'marketing:features.aiGenerationFeature4',
              ]}
              gradientFrom="from-violet-500"
              gradientTo="to-purple-500"
            />

            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              titleKey="marketing:features.draftPublishTitle"
              descriptionKey="marketing:features.draftPublishDescription"
              highlightKeys={[
                'marketing:features.draftPublishFeature1',
                'marketing:features.draftPublishFeature2',
                'marketing:features.draftPublishFeature3',
                'marketing:features.draftPublishFeature4',
              ]}
              gradientFrom="from-blue-500"
              gradientTo="to-indigo-500"
            />

            <FeatureCard
              icon={<ExternalLink className="h-6 w-6" />}
              titleKey="marketing:features.publicPageTitle"
              descriptionKey="marketing:features.publicPageDescription"
              highlightKeys={[
                'marketing:features.publicPageFeature1',
                'marketing:features.publicPageFeature2',
                'marketing:features.publicPageFeature3',
                'marketing:features.publicPageFeature4',
              ]}
              gradientFrom="from-emerald-500"
              gradientTo="to-teal-500"
            />

            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              titleKey="marketing:features.smartCategoriesTitle"
              descriptionKey="marketing:features.smartCategoriesDescription"
              highlightKeys={[
                'marketing:features.smartCategoriesFeature1',
                'marketing:features.smartCategoriesFeature2',
                'marketing:features.smartCategoriesFeature3',
                'marketing:features.smartCategoriesFeature4',
              ]}
              gradientFrom="from-amber-500"
              gradientTo="to-orange-500"
            />

            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              titleKey="marketing:features.timelineTitle"
              descriptionKey="marketing:features.timelineDescription"
              highlightKeys={[
                'marketing:features.timelineFeature1',
                'marketing:features.timelineFeature2',
                'marketing:features.timelineFeature3',
                'marketing:features.timelineFeature4',
              ]}
              gradientFrom="from-pink-500"
              gradientTo="to-rose-500"
            />

            <FeatureCard
              icon={<Settings2 className="h-6 w-6" />}
              titleKey="marketing:features.customSettingsTitle"
              descriptionKey="marketing:features.customSettingsDescription"
              highlightKeys={[
                'marketing:features.customSettingsFeature1',
                'marketing:features.customSettingsFeature2',
                'marketing:features.customSettingsFeature3',
                'marketing:features.customSettingsFeature4',
              ]}
              gradientFrom="from-slate-500"
              gradientTo="to-zinc-500"
            />
          </div>

          <div className="mt-16 p-8 rounded-2xl border bg-gradient-to-br from-violet-500/5 to-purple-500/5 relative overflow-hidden">
            <ShineBorder shineColor={['#8b5cf6', '#a855f7', '#8b5cf6']} borderRadius={16} />
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  <Trans i18nKey="marketing:features.changelogCalloutTitle" />
                </h3>
                <p className="text-muted-foreground mb-6">
                  <Trans i18nKey="marketing:features.changelogCalloutDesc" />
                </p>
                <div className="space-y-3">
                  {[
                    { icon: <Zap className="h-4 w-4" />, textKey: 'marketing:features.changelogCallout1' },
                    { icon: <FileText className="h-4 w-4" />, textKey: 'marketing:features.changelogCallout2' },
                    { icon: <ExternalLink className="h-4 w-4" />, textKey: 'marketing:features.changelogCallout3' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600">
                        {item.icon}
                      </div>
                      <span className="text-sm">
                        <Trans i18nKey={item.textKey} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="font-semibold">
                      <Trans i18nKey="marketing:features.recentUpdates" />
                    </span>
                    <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                      <Trans i18nKey="marketing:features.public" />
                    </Badge>
                  </div>
                  {[
                    { categoryKey: 'marketing:features.newFeature', title: 'Dark mode support', color: 'bg-emerald-500' },
                    { categoryKey: 'marketing:features.improvement', title: 'Faster page load times', color: 'bg-blue-500' },
                    { categoryKey: 'marketing:features.bugFix', title: 'Fixed login redirect issue', color: 'bg-amber-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full ${item.color} mt-2`} />
                      <div>
                        <span className="text-xs text-muted-foreground">
                          <Trans i18nKey={item.categoryKey} />
                        </span>
                        <p className="text-sm font-medium">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Hosting */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid gap-4 grid-cols-2">
                <div className="p-6 rounded-xl border bg-card">
                  <Server className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-1">
                    <Trans i18nKey="marketing:features.yourInfra" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <Trans i18nKey="marketing:features.yourInfraDesc" />
                  </p>
                </div>
                <div className="p-6 rounded-xl border bg-card">
                  <Lock className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-1">
                    <Trans i18nKey="marketing:features.dataSovereignty" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <Trans i18nKey="marketing:features.dataSovereigntyDesc" />
                  </p>
                </div>
                <div className="p-6 rounded-xl border bg-card">
                  <Database className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-1">
                    <Trans i18nKey="marketing:features.supabaseBackend" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <Trans i18nKey="marketing:features.supabaseBackendDesc" />
                  </p>
                </div>
                <div className="p-6 rounded-xl border bg-card">
                  <Code2 className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-1">
                    <Trans i18nKey="marketing:features.license" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <Trans i18nKey="marketing:features.licenseDesc" />
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Badge variant="outline" className="mb-4">
                <Shield className="mr-2 h-4 w-4" />
                <Trans i18nKey="marketing:features.selfHostBadge" />
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                <Trans i18nKey="marketing:features.selfHostTitle" />
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                <Trans i18nKey="marketing:features.selfHostDescription" />
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                    <Github className="mr-2 h-4 w-4" />
                    <Trans i18nKey="marketing:features.viewSource" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://github.com/MergeMint/mergemint-app#getting-started">
                    <Trans i18nKey="marketing:features.deploymentGuide" />
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
              <Trans i18nKey="marketing:features.ctaTitle" />
            </h2>
            <p className="mx-auto max-w-xl text-lg text-white/80 mb-8 relative">
              <Trans i18nKey="marketing:features.ctaDescription" />
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                <Link href="/auth/sign-up">
                  <Trans i18nKey="marketing:features.ctaCta" />
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/how-it-works">
                  <Trans i18nKey="marketing:features.ctaSecondaryCta" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default withI18n(FeaturesPage);

function FeatureCard({
  icon,
  titleKey,
  descriptionKey,
  highlightKeys,
  gradientFrom,
  gradientTo,
}: {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  highlightKeys: string[];
  gradientFrom?: string;
  gradientTo?: string;
}) {
  const hasCustomGradient = gradientFrom && gradientTo;
  const shineColors = hasCustomGradient
    ? [gradientFrom.replace('from-', '#').replace('-500', ''), gradientTo.replace('to-', '#').replace('-500', ''), gradientFrom.replace('from-', '#').replace('-500', '')]
    : ['#7c3aed', '#a855f7', '#7c3aed'];

  return (
    <div className="relative p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow overflow-hidden group">
      <ShineBorder shineColor={shineColors as [string, string, string]} borderRadius={16} />
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-all ${
        hasCustomGradient
          ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg group-hover:scale-110`
          : 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white'
      }`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">
        <Trans i18nKey={titleKey} />
      </h3>
      <p className="text-muted-foreground mb-4">
        <Trans i18nKey={descriptionKey} />
      </p>
      <ul className="space-y-2">
        {highlightKeys.map((key, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>
              <Trans i18nKey={key} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
