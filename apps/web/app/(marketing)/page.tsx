'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  AlertCircle,
  AlertTriangle,
  ArrowRightIcon,
  BarChart3,
  Bot,
  Bug,
  Check,
  CheckCircle2,
  Code2,
  Crown,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Github,
  Layers,
  Linkedin,
  Medal,
  PieChart,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { AnimatedList, BentoCard, BentoGrid, BlurFade, Marquee, Meteors, NumberTicker, ShineBorder } from '@kit/ui/magicui';
import { Trans } from '@kit/ui/trans';
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
    name: 'Jay Derinbogaz',
    role: 'Co-founder & CTO',
    company: 'TextCortex AI',
    body: "We built MergeMint because we needed it ourselves. Now our entire team has clear visibility into contributions and fair recognition. Best internal tool we've ever built.",
    img: 'https://avatar.vercel.sh/jay',
  },
  {
    name: 'Sarah Chen',
    role: 'Engineering Manager',
    company: 'TechCorp',
    body: "MergeMint transformed how we recognize developer contributions. Our bug bounty program is now completely automated. No more manual spreadsheets!",
    img: 'https://avatar.vercel.sh/sarah',
  },
  {
    name: 'Mike Johnson',
    role: 'VP Engineering',
    company: 'ScaleUp Inc',
    body: "The AI scoring is incredibly accurate. It saved us 20+ hours per week on manual PR reviews. Our performance review process has never been more objective.",
    img: 'https://avatar.vercel.sh/mike',
  },
  {
    name: 'Alex Rivera',
    role: 'CTO',
    company: 'StartupXYZ',
    body: "Finally, an objective way to measure developer impact. Our team morale has never been higher. Developers love seeing their contributions quantified.",
    img: 'https://avatar.vercel.sh/alex',
  },
  {
    name: 'Emily Watson',
    role: 'Lead Developer',
    company: 'DevTools Co',
    body: "The leaderboards gamified our engineering culture in the best way possible. Highly recommend! It's boosted motivation across the entire team.",
    img: 'https://avatar.vercel.sh/emily',
  },
  {
    name: 'James Lee',
    role: 'Engineering Director',
    company: 'CloudScale',
    body: "Self-hosting MergeMint was a breeze. We had it running in production within an hour. Our compliance team loves that all data stays internal.",
    img: 'https://avatar.vercel.sh/james',
  },
];

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

// JSON-LD structured data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MergeMint',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description:
    'AI-powered PR scoring and developer recognition platform. Turn merged pull requests into objective developer recognition with Claude AI evaluation.',
  url: 'https://mergemint.dev',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free for non-commercial use under CC BY-NC 4.0',
  },
  featureList: [
    'AI-powered PR evaluation with Claude',
    'Automatic severity and component classification',
    'Real-time developer leaderboards',
    'GitHub integration with PR comments',
    'Configurable scoring rules',
    'Self-hosted option available',
    'Team analytics and dashboards',
  ],
  creator: {
    '@type': 'Person',
    name: 'Jay Derinbogaz',
    url: 'https://github.com/cderinbogaz',
  },
  sourceOrganization: {
    '@type': 'Organization',
    name: 'TextCortex AI',
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
              <div className="mb-8 flex flex-col items-center gap-3">
                <Badge variant="outline" className="px-4 py-2 text-sm border-blue-500/30 bg-blue-500/5">
                  <Rocket className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="text-blue-600"><Trans i18nKey="marketing:home.heroBadge1" /></span>
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm border-purple-500/30 bg-purple-500/5">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  <Trans i18nKey="marketing:home.heroBadge2" />
                </Badge>
              </div>
            </BlurFade>

            {/* Headline */}
            <BlurFade delay={0.2} inView>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                <span className="block"><Trans i18nKey="marketing:home.heroTitle" /></span>
                <span className="block bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  <Trans i18nKey="marketing:home.heroTitleHighlight" />
                </span>
              </h1>
            </BlurFade>

            {/* Subtitle */}
            <BlurFade delay={0.3} inView>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                <Trans i18nKey="marketing:home.heroDescription" />
              </p>
            </BlurFade>

            {/* CTA Buttons */}
            <BlurFade delay={0.4} inView>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                  <Link href="/auth/sign-up">
                    <Trans i18nKey="marketing:home.heroCta" />
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                  <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                    <Github className="mr-2 h-5 w-5" />
                    <Trans i18nKey="marketing:home.heroGithub" />
                  </Link>
                </Button>
              </div>
            </BlurFade>

            {/* Trust badges */}
            <BlurFade delay={0.5} inView>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm"><Trans i18nKey="marketing:home.trustBadge1" /></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm"><Trans i18nKey="marketing:home.trustBadge2" /></span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-purple-500" />
                  <span className="text-sm"><Trans i18nKey="marketing:home.trustBadge3" /></span>
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
                      <span className="text-sm text-muted-foreground ml-2"><Trans i18nKey="marketing:home.dashboardTitle" /></span>
                    </div>
                    <Image
                      src="/images/dashboard.png"
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
                      <span className="text-sm font-medium"><Trans i18nKey="marketing:home.livePrEvaluations" /></span>
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

      {/* Origin Story Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-transparent relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <BlurFade delay={0.1} inView>
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 px-4 py-2">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  <Trans i18nKey="marketing:home.storyBadge" />
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                  <Trans i18nKey="marketing:home.storyTitle" /><span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    <Trans i18nKey="marketing:home.storyTitleHighlight" />
                  </span>
                </h2>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-3xl blur-2xl animate-pulse" />
                <div className="relative rounded-2xl border bg-card p-8 lg:p-12 shadow-2xl overflow-hidden">
                  <ShineBorder shineColor={['#7c3aed', '#a855f7', '#ec4899']} borderRadius={16} />
                  
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {/* Header with animated gradient */}
                    <div className="flex items-start gap-4 mb-8">
                      <div className="relative flex-shrink-0">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          TC
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-bounce">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1 mt-0 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                          <Trans i18nKey="marketing:home.storyProblemTitle" />
                        </h3>
                        <p className="text-sm text-muted-foreground mb-0"><Trans i18nKey="marketing:home.storyProblemSubtitle" /></p>
                      </div>
                    </div>

                    <p className="text-lg leading-relaxed mb-6">
                      <Trans i18nKey="marketing:home.storyProblemDescription" />
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                      {/* Struggles Card with enhanced styling */}
                      <div className="relative p-6 rounded-xl bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/20 overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                              <AlertCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <h4 className="font-bold text-red-600 text-lg"><Trans i18nKey="marketing:home.storyStrugglesTitle" /></h4>
                          </div>
                          <ul className="space-y-3 text-sm text-muted-foreground">
                            {['storyStruggle1', 'storyStruggle2', 'storyStruggle3', 'storyStruggle4'].map((key, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span><Trans i18nKey={`marketing:home.${key}`} /></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Solution Card with enhanced styling */}
                      <div className="relative p-6 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20 overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                              <Zap className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-bold text-purple-600 text-lg"><Trans i18nKey="marketing:home.storyNeededTitle" /></h4>
                          </div>
                          <ul className="space-y-3 text-sm text-muted-foreground">
                            {['storyNeeded1', 'storyNeeded2', 'storyNeeded3', 'storyNeeded4'].map((key, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span><Trans i18nKey={`marketing:home.${key}`} /></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <p className="text-lg leading-relaxed mb-6 text-center">
                      <Trans i18nKey="marketing:home.storySolution" />
                    </p>

                    {/* Result Card with shine effect */}
                    <div className="relative p-6 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/10 border border-green-500/20 overflow-hidden">
                      <ShineBorder shineColor={['#10b981', '#34d399', '#10b981']} borderRadius={12} />
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-green-600 m-0 text-lg"><Trans i18nKey="marketing:home.storyResultTitle" /></h4>
                      </div>
                      <p className="text-muted-foreground mb-0">
                        <Trans i18nKey="marketing:home.storyResultDescription" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
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
                <p className="text-sm text-muted-foreground mt-1"><Trans i18nKey="marketing:home.stat1Label" /></p>
              </div>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <div className="relative p-6 rounded-xl bg-card border overflow-hidden">
                <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                <div className="text-4xl font-bold text-purple-600">
                  <NumberTicker value={500} />+
                </div>
                <p className="text-sm text-muted-foreground mt-1"><Trans i18nKey="marketing:home.stat2Label" /></p>
              </div>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <div className="relative p-6 rounded-xl bg-card border overflow-hidden">
                <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                <div className="text-4xl font-bold text-purple-600">
                  <NumberTicker value={50} />+
                </div>
                <p className="text-sm text-muted-foreground mt-1"><Trans i18nKey="marketing:home.stat3Label" /></p>
              </div>
            </BlurFade>
            <BlurFade delay={0.4} inView>
              <div className="relative p-6 rounded-xl bg-card border overflow-hidden">
                <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} />
                <div className="text-4xl font-bold text-purple-600">
                  <NumberTicker value={95} />%
                </div>
                <p className="text-sm text-muted-foreground mt-1"><Trans i18nKey="marketing:home.stat4Label" /></p>
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
              <Badge variant="outline" className="mb-4"><Trans i18nKey="marketing:home.testimonialsBadge" /></Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                <Trans i18nKey="marketing:home.testimonialsTitle" />
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <Trans i18nKey="marketing:home.testimonialsDescription" />
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
      <section className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2">
                <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                <Trans i18nKey="marketing:home.howItWorksBadge" />
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                <Trans i18nKey="marketing:home.howItWorksTitle" /><span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  <Trans i18nKey="marketing:home.howItWorksTitleHighlight" />
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                <Trans i18nKey="marketing:home.howItWorksDescription" />
              </p>
            </div>
          </BlurFade>

          {/* Steps with connecting lines */}
          <div className="relative">
            {/* Connection line (desktop only) */}
            <div className="hidden lg:block absolute top-[4.5rem] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-purple-500/20 via-purple-500/40 to-purple-500/20" />
            <div className="hidden lg:block absolute top-[4.5rem] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 animate-pulse" style={{ clipPath: 'inset(0 75% 0 0)' }} />
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Github className="h-8 w-8" />,
                  step: '01',
                  titleKey: 'marketing:home.howItWorksStep1Title',
                  descriptionKey: 'marketing:home.howItWorksStep1Description',
                  color: 'from-gray-500 to-gray-700',
                },
                {
                  icon: <GitMerge className="h-8 w-8" />,
                  step: '02',
                  titleKey: 'marketing:home.howItWorksStep2Title',
                  descriptionKey: 'marketing:home.howItWorksStep2Description',
                  color: 'from-blue-500 to-blue-700',
                },
                {
                  icon: <Bot className="h-8 w-8" />,
                  step: '03',
                  titleKey: 'marketing:home.howItWorksStep3Title',
                  descriptionKey: 'marketing:home.howItWorksStep3Description',
                  color: 'from-purple-500 to-violet-600',
                },
                {
                  icon: <Trophy className="h-8 w-8" />,
                  step: '04',
                  titleKey: 'marketing:home.howItWorksStep4Title',
                  descriptionKey: 'marketing:home.howItWorksStep4Description',
                  color: 'from-yellow-500 to-orange-500',
                },
              ].map((item, idx) => (
                <BlurFade key={idx} delay={0.1 * (idx + 1)} inView>
                  <div className="relative group">
                    {/* Glow effect on hover */}
                    <div className={cn(
                      'absolute -inset-2 bg-gradient-to-b rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl',
                      item.color
                    )} style={{ opacity: 0.1 }} />
                    <div className="absolute -inset-px bg-gradient-to-b from-purple-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} borderRadius={16} />

                      {/* Step number badge */}
                      <div className="absolute top-4 right-4">
                        <span className="text-4xl font-black text-purple-500/10">{item.step}</span>
                      </div>

                      {/* Icon with gradient background */}
                      <div className={cn(
                        'mb-4 flex h-18 w-18 items-center justify-center rounded-2xl text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300',
                        `bg-gradient-to-br ${item.color}`
                      )}>
                        <div className="h-16 w-16 flex items-center justify-center">
                          {item.icon}
                        </div>
                      </div>

                      <span className="text-xs font-bold text-purple-500 mb-2 uppercase tracking-wider"><Trans i18nKey="marketing:home.stepLabel" values={{ step: item.step }} /></span>
                      <h3 className="text-xl font-semibold mb-2"><Trans i18nKey={item.titleKey} /></h3>
                      <p className="text-muted-foreground text-sm"><Trans i18nKey={item.descriptionKey} /></p>

                      {/* Arrow indicator (except last) */}
                      {idx < 3 && (
                        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <ArrowRightIcon className="h-4 w-4 text-purple-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4"><Trans i18nKey="marketing:home.featuresBadge" /></Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                <Trans i18nKey="marketing:home.featuresTitle" /><span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  <Trans i18nKey="marketing:home.featuresTitleHighlight" />
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                <Trans i18nKey="marketing:home.featuresDescription" />
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <BentoGrid className="lg:grid-rows-3 auto-rows-[18rem] lg:auto-rows-[16rem]">
              {/* AI Evaluation - Large card with animated PR list */}
              <BentoCard
                name={<Trans i18nKey="marketing:home.bentoAiEvaluationTitle" />}
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
                description={<Trans i18nKey="marketing:home.bentoAiEvaluationDescription" />}
                href="/features"
                cta={<Trans i18nKey="marketing:home.bentoLearnMore" />}
              />

              {/* Leaderboards */}
              <BentoCard
                name={<Trans i18nKey="marketing:home.bentoLeaderboardsTitle" />}
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
                description={<Trans i18nKey="marketing:home.bentoLeaderboardsDescription" />}
                href="/features"
                cta={<Trans i18nKey="marketing:home.bentoLearnMore" />}
              />

              {/* GitHub Integration */}
              <BentoCard
                name={<Trans i18nKey="marketing:home.bentoGithubTitle" />}
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
                description={<Trans i18nKey="marketing:home.bentoGithubDescription" />}
                href="/features"
                cta={<Trans i18nKey="marketing:home.bentoLearnMore" />}
              />

              {/* PR Comments - Wide card */}
              <BentoCard
                name={<Trans i18nKey="marketing:home.bentoPrCommentsTitle" />}
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
                description={<Trans i18nKey="marketing:home.bentoPrCommentsDescription" />}
                href="/features"
                cta={<Trans i18nKey="marketing:home.bentoLearnMore" />}
              />

              {/* Team Analytics */}
              <BentoCard
                name={<Trans i18nKey="marketing:home.bentoTeamAnalyticsTitle" />}
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
                description={<Trans i18nKey="marketing:home.bentoTeamAnalyticsDescription" />}
                href="/features"
                cta={<Trans i18nKey="marketing:home.bentoLearnMore" />}
              />

              {/* Self-Hosted */}
              <BentoCard
                name={<Trans i18nKey="marketing:home.bentoSelfHostedTitle" />}
                className="col-span-3 lg:col-span-1"
                background={
                  <div className="absolute top-4 right-6 opacity-80 [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)]">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xl">
                        <Shield className="h-7 w-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                }
                Icon={Shield}
                description={<Trans i18nKey="marketing:home.bentoSelfHostedDescription" />}
                href="/features"
                cta={<Trans i18nKey="marketing:home.bentoLearnMore" />}
              />
            </BentoGrid>
          </BlurFade>
        </div>
      </section>

      {/* PR Comment Preview */}
      <section className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <BlurFade delay={0.1} inView>
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-2">
                  <Bot className="mr-2 h-4 w-4 text-purple-500" />
                  <Trans i18nKey="marketing:home.prPreviewBadge" />
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                  <Trans i18nKey="marketing:home.prPreviewTitle" /> <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"><Trans i18nKey="marketing:home.prPreviewTitleHighlight" /></span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  <Trans i18nKey="marketing:home.prPreviewDescription" />
                </p>
                <ul className="space-y-4">
                  {[
                    { textKey: 'marketing:home.prPreviewFeature1', icon: <Target className="h-5 w-5 text-purple-600" /> },
                    { textKey: 'marketing:home.prPreviewFeature2', icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> },
                    { textKey: 'marketing:home.prPreviewFeature3', icon: <BarChart3 className="h-5 w-5 text-blue-500" /> },
                    { textKey: 'marketing:home.prPreviewFeature4', icon: <Bot className="h-5 w-5 text-violet-500" /> },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="font-medium"><Trans i18nKey={item.textKey} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-2xl blur-2xl animate-pulse" />
                <div className="relative rounded-xl border bg-card p-6 shadow-2xl overflow-hidden">
                  <ShineBorder shineColor={['#7c3aed', '#a855f7', '#ec4899']} borderRadius={12} />
                  
                  {/* GitHub-style comment header */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">MergeMint Bot</p>
                      <p className="text-sm text-muted-foreground">commented just now</p>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      Verified
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Header with trophy */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <span className="font-bold text-lg">MergeMint PR Analysis</span>
                    </div>
                    
                    {/* Score display */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/5 to-violet-500/10 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">Final Score</span>
                        <span className="text-3xl font-black text-purple-600">75 pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 rounded-lg bg-card">
                          <p className="text-xs text-muted-foreground">Component</p>
                          <p className="text-sm font-semibold text-purple-600">Auth (1.5×)</p>
                        </div>
                        <div className="p-2 rounded-lg bg-card">
                          <p className="text-xs text-muted-foreground">Severity</p>
                          <p className="text-sm font-semibold text-orange-500">P1 (50 pts)</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Eligibility checks */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Eligibility Checks</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Issue Linked', status: true },
                          { label: 'Has Tests', status: true },
                          { label: 'Implementation', status: true },
                        ].map((check, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs font-medium">{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* Product Insights Section - NEW */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 border-cyan-500/30 bg-cyan-500/5">
                <Layers className="mr-2 h-4 w-4 text-cyan-600" />
                <span className="text-cyan-600"><Trans i18nKey="marketing:home.productInsightsBadge" /></span>
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                <Trans i18nKey="marketing:home.productInsightsTitle" /><span className="block bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  <Trans i18nKey="marketing:home.productInsightsTitleHighlight" />
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                <Trans i18nKey="marketing:home.productInsightsDescription" />
              </p>
            </div>
          </BlurFade>

          {/* Product Insights Bento Grid */}
          <BlurFade delay={0.2} inView>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Component Activity - Large Card */}
              <div className="relative p-6 rounded-2xl border bg-card hover:shadow-xl transition-all overflow-hidden group lg:col-span-2 lg:row-span-2">
                <ShineBorder shineColor={['#06b6d4', '#14b8a6', '#06b6d4']} borderRadius={16} />
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2"><Trans i18nKey="marketing:home.piComponentAnalyticsTitle" /></h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      <Trans i18nKey="marketing:home.piComponentAnalyticsDescription" />
                    </p>
                  </div>
                </div>

                {/* Component breakdown visualization */}
                <div className="mt-4 space-y-3">
                  {[
                    { name: 'Auth', prs: 24, bugs: 8, color: '#7c3aed', width: '100%' },
                    { name: 'Payments', prs: 18, bugs: 3, color: '#ef4444', width: '75%' },
                    { name: 'Dashboard', prs: 15, bugs: 2, color: '#3b82f6', width: '62%' },
                    { name: 'API', prs: 12, bugs: 5, color: '#10b981', width: '50%' },
                    { name: 'Notifications', prs: 8, bugs: 1, color: '#f59e0b', width: '33%' },
                  ].map((comp, idx) => (
                    <div key={idx} className="group/item">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{comp.name}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GitPullRequest className="h-3 w-3" />
                            {comp.prs} PRs
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <Bug className="h-3 w-3" />
                            {comp.bugs}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover/item:opacity-80"
                          style={{ width: comp.width, backgroundColor: comp.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bug Hotspots Card */}
              <div className="relative p-6 rounded-2xl border bg-card hover:shadow-xl transition-all overflow-hidden group bg-gradient-to-br from-red-500/5 to-orange-500/5">
                <ShineBorder shineColor={['#ef4444', '#f97316', '#ef4444']} borderRadius={16} />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Bug className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2"><Trans i18nKey="marketing:home.piBugHotspotsTitle" /></h3>
                <p className="text-muted-foreground text-sm mb-4">
                  <Trans i18nKey="marketing:home.piBugHotspotsDescription" />
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Auth', bugs: 8, trend: '+3' },
                    { name: 'API', bugs: 5, trend: '+2' },
                    { name: 'Payments', bugs: 3, trend: '-1' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-card border">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">{item.bugs} bugs</Badge>
                        <span className={cn(
                          'text-xs font-medium',
                          item.trend.startsWith('+') ? 'text-red-500' : 'text-green-500'
                        )}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Ownership Card */}
              <div className="relative p-6 rounded-2xl border bg-card hover:shadow-xl transition-all overflow-hidden group bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <ShineBorder shineColor={['#a855f7', '#ec4899', '#a855f7']} borderRadius={16} />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Crown className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2"><Trans i18nKey="marketing:home.piFeatureOwnershipTitle" /></h3>
                <p className="text-muted-foreground text-sm mb-4">
                  <Trans i18nKey="marketing:home.piFeatureOwnershipDescription" />
                </p>
                <div className="space-y-2">
                  {[
                    { component: 'Auth', owner: 'sarah_dev', percent: 68 },
                    { component: 'Payments', owner: 'mike_eng', percent: 72 },
                    { component: 'Dashboard', owner: 'alex_fe', percent: 55 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-card border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.component}</span>
                        <Crown className="h-3 w-3 text-yellow-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">@{item.owner}</span>
                        <Badge variant="secondary" className="text-xs">{item.percent}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Silos Card */}
              <div className="relative p-6 rounded-2xl border bg-card hover:shadow-xl transition-all overflow-hidden group bg-gradient-to-br from-yellow-500/5 to-amber-500/5">
                <ShineBorder shineColor={['#eab308', '#f59e0b', '#eab308']} borderRadius={16} />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2"><Trans i18nKey="marketing:home.piKnowledgeSilosTitle" /></h3>
                <p className="text-muted-foreground text-sm mb-4">
                  <Trans i18nKey="marketing:home.piKnowledgeSilosDescription" />
                </p>
                <div className="space-y-2">
                  {[
                    { component: 'Email Templates', contributor: 'jenny_ui', prs: 12 },
                    { component: 'Legacy API', contributor: 'chris_be', prs: 8 },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.component}</span>
                        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-600">Risk</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserCheck className="h-3 w-3" />
                        <span>Only @{item.contributor} ({item.prs} PRs)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity Trends Card */}
              <div className="relative p-6 rounded-2xl border bg-card hover:shadow-xl transition-all overflow-hidden group bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
                <ShineBorder shineColor={['#3b82f6', '#6366f1', '#3b82f6']} borderRadius={16} />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2"><Trans i18nKey="marketing:home.piSeverityTrendsTitle" /></h3>
                <p className="text-muted-foreground text-sm mb-4">
                  <Trans i18nKey="marketing:home.piSeverityTrendsDescription" />
                </p>
                <div className="flex items-end justify-between h-[80px] gap-2">
                  {[
                    { bugs: 3, features: 8 },
                    { bugs: 5, features: 6 },
                    { bugs: 2, features: 10 },
                    { bugs: 4, features: 7 },
                    { bugs: 6, features: 5 },
                    { bugs: 2, features: 9 },
                    { bugs: 1, features: 11 },
                  ].map((week, idx) => (
                    <div key={idx} className="flex-1 flex flex-col gap-0.5">
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400"
                        style={{ height: `${week.features * 5}px` }}
                      />
                      <div
                        className="w-full rounded-b-sm bg-gradient-to-t from-red-500 to-red-400"
                        style={{ height: `${week.bugs * 5}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <Trans i18nKey="marketing:home.piFeaturesLabel" />
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <Trans i18nKey="marketing:home.piBugFixesLabel" />
                  </span>
                </div>
              </div>

              {/* At-Risk Components Card */}
              <div className="relative p-6 rounded-2xl border bg-card hover:shadow-xl transition-all overflow-hidden group bg-gradient-to-br from-rose-500/5 to-red-500/5">
                <ShineBorder shineColor={['#f43f5e', '#ef4444', '#f43f5e']} borderRadius={16} />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2"><Trans i18nKey="marketing:home.piAtRiskTitle" /></h3>
                <p className="text-muted-foreground text-sm mb-4">
                  <Trans i18nKey="marketing:home.piAtRiskDescription" />
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Legacy Auth', score: 85, color: 'bg-red-500' },
                    { name: 'Old API v1', score: 72, color: 'bg-orange-500' },
                    { name: 'Admin Panel', score: 58, color: 'bg-yellow-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">Risk: {item.score}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn('h-full rounded-full', item.color)} style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>

          {/* CTA for Product Insights */}
          <BlurFade delay={0.3} inView>
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8">
                <Link href="/features">
                  <Trans i18nKey="marketing:home.productInsightsCta" />
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <BlurFade delay={0.1} inView>
            <Badge variant="outline" className="mb-4">
              <Code2 className="mr-2 h-4 w-4" />
              <Trans i18nKey="marketing:home.openSourceBadge" />
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              <Trans i18nKey="marketing:home.openSourceTitle" />
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
              <Trans i18nKey="marketing:home.openSourceDescription" />
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="outline" className="px-8">
                <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  <Trans i18nKey="marketing:home.openSourceStar" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="px-8">
                <Link href="https://github.com/MergeMint/mergemint-app/blob/main/CONTRIBUTING.md" target="_blank">
                  <Trans i18nKey="marketing:home.openSourceContribute" />
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* GitHub Stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold"><Trans i18nKey="marketing:home.openSourceLicense" /></span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-500" />
                <span className="font-semibold"><Trans i18nKey="marketing:home.openSourceMaintained" /></span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold"><Trans i18nKey="marketing:home.openSourceCommunity" /></span>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2">
                <Zap className="mr-2 h-4 w-4 text-purple-500" />
                <Trans i18nKey="marketing:home.useCasesBadge" />
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
                <Trans i18nKey="marketing:home.useCasesTitle" /> <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"><Trans i18nKey="marketing:home.useCasesTitleHighlight" /></span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                <Trans i18nKey="marketing:home.useCasesDescription" />
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                titleKey: 'marketing:home.useCase1Title',
                problemKey: 'marketing:home.useCase1Problem',
                solutionKey: 'marketing:home.useCase1Solution',
                icon: <Zap className="h-7 w-7" />,
                gradient: 'from-yellow-500 to-orange-500',
                bgGradient: 'from-yellow-500/5 to-orange-500/5',
              },
              {
                titleKey: 'marketing:home.useCase2Title',
                problemKey: 'marketing:home.useCase2Problem',
                solutionKey: 'marketing:home.useCase2Solution',
                icon: <BarChart3 className="h-7 w-7" />,
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-500/5 to-cyan-500/5',
              },
              {
                titleKey: 'marketing:home.useCase3Title',
                problemKey: 'marketing:home.useCase3Problem',
                solutionKey: 'marketing:home.useCase3Solution',
                icon: <Trophy className="h-7 w-7" />,
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-500/5 to-pink-500/5',
              },
            ].map((item, idx) => (
              <BlurFade key={idx} delay={0.1 * (idx + 1)} inView>
                <div className={cn(
                  'relative p-8 rounded-2xl border bg-card hover:shadow-2xl transition-all overflow-hidden group h-full flex flex-col',
                  `bg-gradient-to-br ${item.bgGradient}`
                )}>
                  <ShineBorder shineColor={['#7c3aed', '#a855f7', '#ec4899']} borderRadius={16} />

                  {/* Icon with gradient */}
                  <div className={cn(
                    'mb-6 flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg',
                    'transform group-hover:scale-110 transition-transform duration-300',
                    `bg-gradient-to-br ${item.gradient}`
                  )}>
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-4"><Trans i18nKey={item.titleKey} /></h3>

                  <div className="flex-grow space-y-4">
                    {/* Problem card */}
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 group/problem hover:bg-red-500/10 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center">
                          <X className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-sm font-semibold text-red-600"><Trans i18nKey="marketing:home.problemLabel" /></p>
                      </div>
                      <p className="text-sm text-muted-foreground"><Trans i18nKey={item.problemKey} /></p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center transform rotate-90">
                        <ArrowRightIcon className="h-4 w-4 text-purple-500" />
                      </div>
                    </div>

                    {/* Solution card */}
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 group/solution hover:bg-green-500/10 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm font-semibold text-green-600"><Trans i18nKey="marketing:home.solutionLabel" /></p>
                      </div>
                      <p className="text-sm text-muted-foreground"><Trans i18nKey={item.solutionKey} /></p>
                    </div>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-20 border-t bg-gradient-to-b from-muted/30 to-transparent relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <BlurFade delay={0.1} inView>
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4 px-4 py-2">
                <Users className="mr-2 h-4 w-4 text-purple-500" />
                <Trans i18nKey="marketing:home.creatorBadge" />
              </Badge>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-3xl blur-2xl animate-pulse" />
                <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-10 rounded-2xl border bg-card shadow-2xl overflow-hidden">
                  <ShineBorder shineColor={['#7c3aed', '#a855f7', '#ec4899']} borderRadius={16} />

                  {/* Avatar with glow */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl blur-xl opacity-50" />
                    <div className="relative h-28 w-28 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl transform hover:scale-105 transition-transform">
                      JD
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg border-4 border-background">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <Badge className="mb-3 bg-purple-500/10 text-purple-600 border-purple-500/20">
                      <Trans i18nKey="marketing:home.creatorRole" />
                    </Badge>
                    <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      <Trans i18nKey="marketing:home.creatorName" />
                    </h3>
                    <p className="text-muted-foreground mb-4 text-lg">
                      <Trans i18nKey="marketing:home.creatorTitle" />
                    </p>
                    <p className="text-sm text-muted-foreground/80 mb-6">
                      <Trans i18nKey="marketing:home.creatorDescription" />
                    </p>
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <Link
                        href="https://github.com/cderinbogaz"
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </Link>
                      <Link
                        href="https://linkedin.com/in/ceyhunderinbogaz"
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </Link>
                    </div>
                  </div>

                  {/* Company badge */}
                  <div className="flex-shrink-0">
                    <div className="relative p-6 rounded-xl bg-gradient-to-br from-purple-500/5 to-violet-500/10 border border-purple-500/20 overflow-hidden">
                      <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} borderRadius={12} />
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                          TextCortex AI
                        </div>
                        <div className="text-xs text-muted-foreground"><Trans i18nKey="marketing:home.creatorCompanySubtitle" /></div>
                        <div className="mt-3 flex justify-center gap-2">
                          <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <Trans i18nKey="marketing:home.creatorActiveUsers" />
                          </div>
                        </div>
                      </div>
                    </div>
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
                  <Trans i18nKey="marketing:home.ctaTitle" />
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-white/90 mb-3">
                  <Trans i18nKey="marketing:home.ctaDescription" />
                </p>
                <p className="mx-auto max-w-xl text-md text-white/70 mb-8">
                  <Trans i18nKey="marketing:home.ctaSubDescription" />
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg shadow-xl">
                    <Link href="/auth/sign-up">
                      <Trans i18nKey="marketing:home.ctaCta" />
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm">
                    <Link href="/features">
                      <Trans i18nKey="marketing:home.ctaFeatures" />
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span><Trans i18nKey="marketing:home.ctaBenefit1" /></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span><Trans i18nKey="marketing:home.ctaBenefit2" /></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span><Trans i18nKey="marketing:home.ctaBenefit3" /></span>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>
    </div>
    </>
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
  const isTextCortex = company === 'TextCortex AI';
  
  return (
    <figure
      className={cn(
        'relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-5',
        'transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        isTextCortex 
          ? 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'
          : 'border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05] dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]',
      )}
    >
      {isTextCortex && <ShineBorder shineColor={['#7c3aed', '#a855f7', '#7c3aed']} borderRadius={12} />}
      
      <div className="flex flex-row items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          className={cn(
            'rounded-full ring-2',
            isTextCortex ? 'ring-purple-500/50' : 'ring-transparent'
          )} 
          width="44" 
          height="44" 
          alt={name} 
          src={img} 
        />
        <div className="flex flex-col">
          <figcaption className={cn(
            'text-sm font-semibold',
            isTextCortex ? 'text-purple-600 dark:text-purple-400' : 'dark:text-white'
          )}>
            {name}
          </figcaption>
          <p className="text-xs text-muted-foreground">{role}</p>
          <p className={cn(
            'text-xs font-medium',
            isTextCortex ? 'text-purple-500' : 'text-muted-foreground'
          )}>
            {company}
          </p>
        </div>
        {isTextCortex && (
          <div className="ml-auto">
            <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30 text-[10px]">
              Creator
            </Badge>
          </div>
        )}
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
        "{body}"
      </blockquote>
      {isTextCortex && (
        <div className="mt-3 flex items-center gap-1 text-purple-500">
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-3 w-3 fill-current" />
        </div>
      )}
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
