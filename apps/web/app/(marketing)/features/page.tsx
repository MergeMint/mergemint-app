import Link from 'next/link';

import {
  ArrowRightIcon,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  Code2,
  Cog,
  Database,
  Github,
  GitMerge,
  GitPullRequest,
  LayoutDashboard,
  Lock,
  Medal,
  RefreshCcw,
  Server,
  Settings2,
  Shield,
  Sparkles,
  Target,
  Users,
  Webhook,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { ShineBorder } from '@kit/ui/magicui';

import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  return {
    title: 'Features - MergeMint',
    description: 'Discover all the features that make MergeMint the best AI-powered PR scoring platform for engineering teams.',
  };
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
            Features
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              measure developer impact
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            MergeMint combines AI evaluation, configurable scoring, and beautiful dashboards 
            to turn every merged PR into actionable insights.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Core Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The fundamental building blocks that power MergeMint&apos;s PR intelligence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Bot className="h-6 w-6" />}
              title="AI-Powered Evaluation"
              description="Claude analyzes every merged PR—reading the diff, understanding the changes, and classifying the impact automatically."
              highlights={[
                'Intelligent component detection',
                'Severity classification (P0-P3)',
                'Context-aware scoring',
                'Handles large diffs gracefully',
              ]}
            />

            <FeatureCard
              icon={<Settings2 className="h-6 w-6" />}
              title="Configurable Scoring Rules"
              description="Define your own scoring system. Set multipliers per component, base points per severity, and custom eligibility criteria."
              highlights={[
                'Custom component definitions',
                'Adjustable multipliers',
                'Severity level configuration',
                'Per-repository overrides',
              ]}
            />

            <FeatureCard
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="Real-time Dashboards"
              description="Beautiful, data-rich dashboards for PMs and developers. See scores, trends, and leaderboards at a glance."
              highlights={[
                'Team overview dashboard',
                'Individual developer profiles',
                'Component hotspot analysis',
                'Score trend visualization',
              ]}
            />

            <FeatureCard
              icon={<Medal className="h-6 w-6" />}
              title="Leaderboards"
              description="Gamify contributions with real-time leaderboards. Track weekly MVPs, top PRs, and cumulative scores."
              highlights={[
                'Weekly/monthly/all-time views',
                'Top PR highlights',
                'Streak tracking',
                'Export capabilities',
              ]}
            />

            <FeatureCard
              icon={<GitPullRequest className="h-6 w-6" />}
              title="PR Comments"
              description="MergeMint posts detailed evaluation comments directly on GitHub PRs, giving developers instant feedback."
              highlights={[
                'Score breakdown',
                'Eligibility check results',
                'Impact summary',
                'Optional (can be disabled)',
              ]}
            />

            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Developer Profiles"
              description="Each contributor gets a profile page showing their score history, PR breakdown, and contribution patterns."
              highlights={[
                'Historical score trends',
                'Component expertise',
                'Severity distribution',
                'PR activity timeline',
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
                GitHub Integration
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Deep GitHub integration
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                MergeMint integrates seamlessly with GitHub through a secure GitHub App. 
                Automatic webhook processing, no manual work required.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Webhook />, title: 'Webhook-driven', desc: 'Instant processing when PRs are merged' },
                  { icon: <GitMerge />, title: 'Diff analysis', desc: 'Full access to PR diffs and file changes' },
                  { icon: <Target />, title: 'Issue linking', desc: 'Detects linked issues from PR descriptions' },
                  { icon: <Bell />, title: 'PR comments', desc: 'Posts evaluation results as PR comments' },
                  { icon: <RefreshCcw />, title: 'Backfill support', desc: 'Process historical PRs on demand' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
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
              Scoring Engine
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Fully customizable scoring
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every team is different. Configure MergeMint to match your specific needs.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-8 rounded-2xl border bg-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Cog className="h-5 w-5 text-purple-500" />
                Component Definitions
              </h3>
              <p className="text-muted-foreground mb-6">
                Define the components of your product and assign multipliers based on complexity or business importance.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">AUTH</span>
                  <Badge variant="secondary">1.5× multiplier</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">PAYMENTS</span>
                  <Badge variant="secondary">2.0× multiplier</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">UI</span>
                  <Badge variant="secondary">1.0× multiplier</Badge>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl border bg-card">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Severity Levels
              </h3>
              <p className="text-muted-foreground mb-6">
                Configure severity levels with base points. The AI will classify each PR based on the impact of the changes.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                  <span className="font-mono text-sm text-red-600">P0 - Critical</span>
                  <Badge variant="destructive">100 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                  <span className="font-mono text-sm text-orange-600">P1 - High</span>
                  <Badge className="bg-orange-500">50 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                  <span className="font-mono text-sm text-yellow-600">P2 - Medium</span>
                  <Badge className="bg-yellow-500 text-yellow-900">25 pts</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm">P3 - Low</span>
                  <Badge variant="secondary">10 pts</Badge>
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
                  <h4 className="font-semibold mb-1">Your Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">Deploy on any cloud or on-premise</p>
                </div>
                <div className="p-6 rounded-xl border bg-card">
                  <Lock className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-1">Data Sovereignty</h4>
                  <p className="text-sm text-muted-foreground">All data stays behind your firewall</p>
                </div>
                <div className="p-6 rounded-xl border bg-card">
                  <Database className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-1">Supabase Backend</h4>
                  <p className="text-sm text-muted-foreground">PostgreSQL with Row Level Security</p>
                </div>
                <div className="p-6 rounded-xl border bg-card">
                  <Code2 className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-1">CC BY-NC 4.0</h4>
                  <p className="text-sm text-muted-foreground">Free for non-commercial use</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Badge variant="outline" className="mb-4">
                <Shield className="mr-2 h-4 w-4" />
                Self-Hosted
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Deploy on your own infrastructure
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                MergeMint is fully open source. Self-host it on your own servers for complete 
                control over your data and customization options.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                    <Github className="mr-2 h-4 w-4" />
                    View Source
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://github.com/MergeMint/mergemint-app#getting-started">
                    Deployment Guide
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
              Ready to get started?
            </h2>
            <p className="mx-auto max-w-xl text-lg text-white/80 mb-8 relative">
              Set up MergeMint in under 5 minutes. Free for open source projects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                <Link href="/auth/sign-up">
                  Start Free
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/how-it-works">
                  See How It Works
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
  title,
  description,
  highlights,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
}) {
  return (
    <div className="relative p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow overflow-hidden group">
      <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} borderRadius={16} />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <ul className="space-y-2">
        {highlights.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

