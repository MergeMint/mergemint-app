'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRightIcon,
  BarChart3,
  Bot,
  CheckCircle2,
  Code2,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Github,
  Linkedin,
  Medal,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { AnimatedList, BentoCard, BentoGrid, BlurFade, Marquee, Meteors, NumberTicker, ShineBorder } from '@kit/ui/magicui';
import { cn } from '@kit/ui/utils';

// PR Evaluation notifications for animated list
const prEvaluations = [
  {
    name: 'Fix auth token refresh',
    author: 'sarah_dev',
    score: 75,
    severity: 'P1',
    component: 'Auth',
    time: '2m ago',
    color: '#7c3aed',
  },
  {
    name: 'Update payment flow',
    author: 'mike_eng',
    score: 100,
    severity: 'P0',
    component: 'Payments',
    time: '5m ago',
    color: '#ef4444',
  },
  {
    name: 'Add dark mode toggle',
    author: 'jenny_ui',
    score: 25,
    severity: 'P2',
    component: 'UI',
    time: '8m ago',
    color: '#3b82f6',
  },
  {
    name: 'Fix memory leak in API',
    author: 'alex_backend',
    score: 50,
    severity: 'P1',
    component: 'API',
    time: '12m ago',
    color: '#f59e0b',
  },
  {
    name: 'Optimize database queries',
    author: 'chris_db',
    score: 75,
    severity: 'P1',
    component: 'Database',
    time: '15m ago',
    color: '#10b981',
  },
];

// Company testimonials
const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Engineering Manager',
    company: 'TechCorp',
    body: "MergeMint transformed how we recognize developer contributions. Our bug bounty program is now completely automated.",
    img: 'https://avatar.vercel.sh/sarah',
  },
  {
    name: 'Mike Johnson',
    role: 'VP Engineering',
    company: 'ScaleUp Inc',
    body: "The AI scoring is incredibly accurate. It saved us 20+ hours per week on manual PR reviews.",
    img: 'https://avatar.vercel.sh/mike',
  },
  {
    name: 'Alex Rivera',
    role: 'CTO',
    company: 'StartupXYZ',
    body: "Finally, an objective way to measure developer impact. Our team morale has never been higher.",
    img: 'https://avatar.vercel.sh/alex',
  },
  {
    name: 'Emily Watson',
    role: 'Lead Developer',
    company: 'DevTools Co',
    body: "The leaderboards gamified our engineering culture in the best way possible. Highly recommend!",
    img: 'https://avatar.vercel.sh/emily',
  },
  {
    name: 'James Lee',
    role: 'Engineering Director',
    company: 'CloudScale',
    body: "Self-hosting MergeMint was a breeze. We had it running in production within an hour.",
    img: 'https://avatar.vercel.sh/james',
  },
  {
    name: 'Lisa Park',
    role: 'Product Manager',
    company: 'InnovateTech',
    body: "The dashboards give us incredible visibility into team velocity and quality metrics.",
    img: 'https://avatar.vercel.sh/lisa',
  },
];

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        {/* Meteors effect */}
        <div className="absolute inset-0 overflow-hidden">
          <Meteors number={30} />
        </div>
        
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <BlurFade delay={0.1} inView>
              <div className="mb-8">
                <Badge variant="outline" className="px-4 py-2 text-sm border-purple-500/30 bg-purple-500/5">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  Open Source PR Intelligence Platform
                </Badge>
              </div>
            </BlurFade>

            {/* Headline */}
            <BlurFade delay={0.2} inView>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                <span className="block">Turn merged PRs into</span>
                <span className="block bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  developer recognition
                </span>
              </h1>
            </BlurFade>

            {/* Subtitle */}
            <BlurFade delay={0.3} inView>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                MergeMint uses AI to evaluate every merged pull request, scoring contributions by 
                severity and component impact. Automate your bug bounty program, recognize top 
                contributors, and build a culture of excellence.
              </p>
            </BlurFade>

            {/* CTA Buttons */}
            <BlurFade delay={0.4} inView>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                  <Link href="/auth/sign-up">
                    Start Free
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                  <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                    <Github className="mr-2 h-5 w-5" />
                    View on GitHub
                  </Link>
                </Button>
              </div>
            </BlurFade>

            {/* Trust badges */}
            <BlurFade delay={0.5} inView>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm">SOC 2 Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Self-hosted option</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Open Source (Non-Commercial)</span>
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Dashboard Preview with Animated List */}
          <BlurFade delay={0.6} inView>
            <div className="mt-16 lg:mt-24">
              <div className="relative mx-auto max-w-6xl">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-purple-500/20 rounded-2xl blur-2xl" />
                <div className="relative grid lg:grid-cols-5 gap-6">
                  {/* Main Dashboard */}
                  <div className="lg:col-span-3 rounded-xl border bg-card shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">MergeMint Dashboard</span>
                    </div>
                    <Image
                      src="/images/dashboard.webp"
                      alt="MergeMint Dashboard"
                      width={1920}
                      height={1080}
                      className="w-full"
                      priority
                    />
                  </div>

                  {/* Animated PR Evaluations */}
                  <div className="lg:col-span-2 rounded-xl border bg-card shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 mb-4 border-b bg-muted/50">
                      <Bot className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Live PR Evaluations</span>
                    </div>
                    <div className="relative h-[400px] overflow-hidden">
                      <AnimatedList delay={2000}>
                        {prEvaluations.map((pr, idx) => (
                          <PRNotification key={idx} {...pr} />
                        ))}
                      </AnimatedList>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <BlurFade delay={0.1} inView>
              <div className="relative p-6 rounded-xl bg-card border overflow-hidden">
                <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                <div className="text-4xl font-bold text-purple-600">
                  <NumberTicker value={10000} />+
                </div>
                <p className="text-sm text-muted-foreground mt-1">PRs Evaluated</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <div className="relative p-6 rounded-xl bg-card border overflow-hidden">
                <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                <div className="text-4xl font-bold text-purple-600">
                  <NumberTicker value={500} />+
                </div>
                <p className="text-sm text-muted-foreground mt-1">Active Developers</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <div className="relative p-6 rounded-xl bg-card border overflow-hidden">
                <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                <div className="text-4xl font-bold text-purple-600">
                  <NumberTicker value={50} />+
                </div>
                <p className="text-sm text-muted-foreground mt-1">Organizations</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.4} inView>
              <div className="relative p-6 rounded-xl bg-card border overflow-hidden">
                <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                <div className="text-4xl font-bold text-purple-600">
                  <NumberTicker value={95} />%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Accuracy Rate</p>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <BlurFade delay={0.1} inView>
            <div className="text-center">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Loved by engineering teams
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See what engineering leaders are saying about MergeMint.
              </p>
            </div>
          </BlurFade>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee reverse pauseOnHover className="[--duration:30s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>
          <Marquee pauseOnHover className="[--duration:30s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                From PR merge to score in seconds
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                MergeMint connects to your GitHub organization and automatically evaluates every merged pull request using AI.
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Github className="h-8 w-8" />,
                step: '01',
                title: 'Connect GitHub',
                description: 'Install the MergeMint GitHub App on your organization. Takes less than 2 minutes.',
              },
              {
                icon: <GitMerge className="h-8 w-8" />,
                step: '02',
                title: 'Merge a PR',
                description: 'Developers work as usual. When a PR is merged, MergeMint gets notified via webhook.',
              },
              {
                icon: <Bot className="h-8 w-8" />,
                step: '03',
                title: 'AI Evaluation',
                description: 'Claude analyzes the diff, classifies the component and severity, and calculates a score.',
              },
              {
                icon: <Trophy className="h-8 w-8" />,
                step: '04',
                title: 'Leaderboards Update',
                description: 'Scores feed into dashboards. Developers see their impact. PMs track quality metrics.',
              },
            ].map((item, idx) => (
              <BlurFade key={idx} delay={0.1 * (idx + 1)} inView>
                <div className="relative group">
                  <div className="absolute -inset-px bg-gradient-to-b from-purple-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border bg-card">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-purple-500 mb-2">{item.step}</span>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                Everything you need to run a bug bounty
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Built for engineering managers, PMs, and developers who want to measure and reward impact.
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <BentoGrid className="lg:grid-rows-3 auto-rows-[18rem] lg:auto-rows-[16rem]">
              {/* AI Evaluation - Large card with animated PR list */}
              <BentoCard
                name="AI-Powered Evaluation"
                className="col-span-3 lg:col-span-2 lg:row-span-2"
                background={
                  <div className="absolute right-4 top-4 w-[60%] opacity-70">
                    <div className="relative h-[220px] overflow-hidden [mask-image:linear-gradient(to_top,transparent_5%,#000_50%)]">
                      <AnimatedList delay={2500} className="space-y-3">
                        {prEvaluations.slice(0, 4).map((pr, idx) => (
                          <BentoPRCard key={idx} {...pr} />
                        ))}
                      </AnimatedList>
                    </div>
                  </div>
                }
                Icon={Bot}
                description="Claude analyzes PR diffs, linked issues, and commit messages to classify severity and component automatically."
                href="/features"
                cta="Learn more"
              />

              {/* Leaderboards */}
              <BentoCard
                name="Leaderboards"
                className="col-span-3 lg:col-span-1 lg:row-span-2"
                background={
                  <div className="absolute top-4 right-4 w-[80%] opacity-80 [mask-image:linear-gradient(to_top,transparent_5%,#000_50%)]">
                    <div className="space-y-2">
                      {[
                        { rank: 1, name: 'sarah_dev', score: 425, color: '#fbbf24' },
                        { rank: 2, name: 'mike_eng', score: 380, color: '#9ca3af' },
                        { rank: 3, name: 'alex_backend', score: 275, color: '#cd7f32' },
                        { rank: 4, name: 'jane_frontend', score: 220, color: '#a78bfa' },
                        { rank: 5, name: 'tom_devops', score: 185, color: '#6b7280' },
                      ].map((dev) => (
                        <div
                          key={dev.rank}
                          className={cn(
                            'flex items-center gap-3 p-2.5 rounded-lg',
                            'bg-white/50 dark:bg-white/5 backdrop-blur-sm',
                            'border border-gray-200/50 dark:border-white/10',
                            'transform-gpu transition-all duration-300 hover:scale-[1.02]',
                          )}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: dev.color }}
                          >
                            {dev.rank}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium dark:text-white">{dev.name}</p>
                          </div>
                          <span className="text-sm font-bold text-purple-600">{dev.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
                Icon={Medal}
                description="Real-time rankings by total score, PR count, or average impact."
                href="/features"
                cta="Learn more"
              />

              {/* GitHub Integration */}
              <BentoCard
                name="GitHub Integration"
                className="col-span-3 lg:col-span-1"
                background={
                  <div className="absolute top-4 right-6 opacity-80 [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)]">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center shadow-xl">
                        <Github className="h-8 w-8 text-white dark:text-gray-900" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                }
                Icon={Github}
                description="One-click GitHub App installation with webhook-driven PR processing."
                href="/features"
                cta="Learn more"
              />

              {/* PR Comments - Wide card */}
              <BentoCard
                name="PR Comments"
                className="col-span-3 lg:col-span-2"
                background={
                  <div className="absolute top-4 right-4 w-[65%] opacity-80 [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)]">
                    <div className="p-3 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Bot className="h-3 w-3 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium">MergeMint Bot</span>
                        <span className="text-[10px] text-muted-foreground">commented</span>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span className="font-bold">Score: 75 points</span>
                        </div>
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span>Auth (1.5×)</span>
                          <span>P1 (50 pts)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                Icon={GitPullRequest}
                description="MergeMint posts detailed evaluation comments directly on every merged PR."
                href="/features"
                cta="Learn more"
              />

              {/* Team Analytics */}
              <BentoCard
                name="Team Analytics"
                className="col-span-3 lg:col-span-1"
                background={
                  <div className="absolute top-4 right-4 left-auto w-[70%] opacity-80 [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)]">
                    <div className="flex gap-1.5 justify-end items-end h-[80px]">
                      {[45, 62, 35, 70, 53, 48, 65].map((height, idx) => (
                        <div
                          key={idx}
                          className="w-5 rounded-t-md bg-gradient-to-t from-purple-600 to-purple-400"
                          style={{
                            height: `${height}px`,
                            opacity: 0.6 + (idx * 0.05),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                }
                Icon={BarChart3}
                description="Track team velocity, quality index, and contributor trends."
                href="/features"
                cta="Learn more"
              />

              {/* Self-Hosted */}
              <BentoCard
                name="Self-Hosted Option"
                className="col-span-3 lg:col-span-1"
                background={
                  <div className="absolute top-4 right-6 opacity-80 [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)]">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xl">
                        <Shield className="h-7 w-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-[10px] text-white">✓</span>
                      </div>
                    </div>
                  </div>
                }
                Icon={Shield}
                description="Run MergeMint on your own infrastructure. Keep all data behind your firewall."
                href="/features"
                cta="Learn more"
              />
            </BentoGrid>
          </BlurFade>
        </div>
      </section>

      {/* PR Comment Preview */}
      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <BlurFade delay={0.1} inView>
              <div>
                <Badge variant="outline" className="mb-4">Instant Feedback</Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                  Every PR gets a detailed evaluation
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  MergeMint comments on every merged PR with a breakdown of the score, eligibility checks, 
                  and impact analysis. Developers know exactly how their work is valued.
                </p>
                <ul className="space-y-3">
                  {[
                    'Component and severity classification',
                    'Eligibility criteria (issue linked, tests, documentation)',
                    'Final score with multiplier breakdown',
                    'AI-generated impact summary',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-2xl blur-xl" />
                <div className="relative rounded-xl border bg-card p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">MergeMint Bot</p>
                      <p className="text-sm text-muted-foreground">commented just now</p>
                    </div>
                  </div>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold">MergeMint PR Analysis</span>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold mb-2">Score: <span className="text-purple-600">75 points</span></p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Component: <span className="text-purple-600">Auth (1.5×)</span></div>
                        <div>Severity: <span className="text-orange-500">P1 (50 pts)</span></div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Issue/Bug Fix ✓</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Implementation ✓</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Tests Included ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <BlurFade delay={0.1} inView>
            <Badge variant="outline" className="mb-4">
              <Code2 className="mr-2 h-4 w-4" />
              Open Source
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Built in the open, for the community
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
              MergeMint is open source under CC BY-NC 4.0. Self-host it, fork it, contribute to it. 
              Free for non-commercial use. Contact us for commercial licensing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="outline" className="px-8">
                <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  Star on GitHub
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="px-8">
                <Link href="https://github.com/MergeMint/mergemint-app/blob/main/CONTRIBUTING.md" target="_blank">
                  Contribution Guide
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* GitHub Stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">CC BY-NC 4.0</span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Actively Maintained</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Community Driven</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Use Cases</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                Perfect for teams who value impact
              </h2>
            </div>
          </BlurFade>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Bug Bounty Programs',
                description: 'Automate scoring and payouts for internal bug bounties. No more spreadsheets or manual tracking.',
                icon: <Zap className="h-6 w-6" />,
              },
              {
                title: 'Performance Reviews',
                description: 'Quantify developer contributions with objective metrics. Great for 1:1s and promotion cases.',
                icon: <BarChart3 className="h-6 w-6" />,
              },
              {
                title: 'Open Source Recognition',
                description: 'Recognize contributors to your OSS projects. Build a community around measured impact.',
                icon: <Trophy className="h-6 w-6" />,
              },
            ].map((item, idx) => (
              <BlurFade key={idx} delay={0.1 * (idx + 1)} inView>
                <div className="relative p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow overflow-hidden group">
                  <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} borderRadius={16} />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <BlurFade delay={0.1} inView>
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-muted-foreground mb-4">Created by</p>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Jay Derinbogaz</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Link 
                      href="https://github.com/cderinbogaz" 
                      target="_blank"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span className="text-sm">GitHub</span>
                    </Link>
                    <Link 
                      href="https://linkedin.com/in/ceyhunderinbogaz" 
                      target="_blank"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="text-sm">LinkedIn</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <BlurFade delay={0.1} inView>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-violet-600 p-12 lg:p-20">
              <ShineBorder shineColor={['#ffffff', '#a855f7', '#ffffff']} borderRadius={24} />
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              
              <div className="relative text-center text-white">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                  Ready to reward your developers?
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-white/80 mb-8">
                  Set up MergeMint in under 5 minutes. Free for non-commercial use.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg">
                    <Link href="/auth/sign-up">
                      Get Started Free
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg">
                    <Link href="/features">
                      See All Features
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>
    </div>
  );
}

// PR Notification Component
function PRNotification({
  name,
  author,
  score,
  severity,
  component: _component,
  time,
  color,
}: {
  name: string;
  author: string;
  score: number;
  severity: string;
  component: string;
  time: string;
  color: string;
}) {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[350px] cursor-pointer overflow-hidden rounded-xl p-4',
        'transition-all duration-200 ease-in-out hover:scale-[103%]',
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
        'transform-gpu dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]',
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: color }}
        >
          <GitPullRequest className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col overflow-hidden flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">{name}</span>
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">@{author}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {severity}
            </Badge>
            <span className="text-xs font-semibold text-purple-600">+{score} pts</span>
          </div>
        </div>
      </div>
    </figure>
  );
}

// Review Card Component
function ReviewCard({
  img,
  name,
  role,
  company,
  body,
}: {
  img: string;
  name: string;
  role: string;
  company: string;
  body: string;
}) {
  return (
    <figure
      className={cn(
        'relative h-full w-72 cursor-pointer overflow-hidden rounded-xl border p-4',
        'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]',
        'dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
      )}
    >
      <div className="flex flex-row items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="rounded-full" width="40" height="40" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs text-muted-foreground">{role} at {company}</p>
        </div>
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed">{body}</blockquote>
    </figure>
  );
}

// Bento PR Card Component (smaller version for bento grid)
function BentoPRCard({
  name,
  author,
  score,
  severity,
  color,
}: {
  name: string;
  author: string;
  score: number;
  severity: string;
  component?: string;
  time?: string;
  color: string;
}) {
  return (
    <figure
      className={cn(
        'relative mx-auto min-h-fit w-full max-w-[280px] cursor-pointer overflow-hidden rounded-lg p-3',
        'transition-all duration-200 ease-in-out hover:scale-[102%]',
        'bg-white/80 dark:bg-white/10 backdrop-blur-sm',
        'border border-gray-200/50 dark:border-white/10',
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: color }}
        >
          <GitPullRequest className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col overflow-hidden flex-1">
          <span className="text-xs font-medium truncate dark:text-white">{name}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">@{author}</span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              {severity}
            </Badge>
            <span className="text-[10px] font-semibold text-purple-600">+{score}</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
