import { Metadata } from 'next';
import Link from 'next/link';

import {
  ArrowRightIcon,
  Check,
  Code2,
  Github,
  HelpCircle,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { ShineBorder } from '@kit/ui/magicui';

import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: 'Pricing - Free Open Source & Enterprise Plans',
  description:
    'MergeMint pricing: Free forever for open source and non-commercial use. Self-host unlimited repos, PRs, and team members. Enterprise plans available for commercial use.',
  keywords: [
    'MergeMint pricing',
    'free PR scoring tool',
    'open source developer analytics',
    'engineering metrics pricing',
    'self-hosted PR analytics',
    'free GitHub analytics',
    'developer recognition pricing',
  ],
  openGraph: {
    title: 'MergeMint Pricing - Free Open Source & Enterprise Plans',
    description:
      'Free forever for non-commercial use. Self-host with unlimited repos, PRs, and team members.',
    type: 'website',
    url: 'https://mergemint.dev/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MergeMint Pricing - Free Open Source',
    description:
      'Free forever for non-commercial use. Self-host with unlimited features.',
  },
  alternates: {
    canonical: 'https://mergemint.dev/pricing',
  },
};

async function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            Pricing
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Simple pricing for
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              every team
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            MergeMint is open source and free to self-host. We also offer a hosted version 
            with additional features and support.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Open Source */}
            <Card className="relative border-2 overflow-hidden">
              <ShineBorder shineColor={['#6b7280', '#9ca3af', '#6b7280']} />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">Open Source</CardTitle>
                </div>
                <CardDescription>
                  Self-host on your own infrastructure
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">Free</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited repositories',
                    'Unlimited PRs',
                    'Unlimited team members',
                    'AI-powered evaluation',
                    'Configurable scoring',
                    'Leaderboards & dashboards',
                    'PR comments',
                    'Community support',
                    'CC BY-NC 4.0 License',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="https://github.com/MergeMint/mergemint-app" target="_blank">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro (Most Popular) */}
            <Card className="relative border-2 border-purple-500 shadow-lg scale-105 overflow-hidden">
              <ShineBorder shineColor={['#7c3aed', '#a855f7', '#ec4899']} duration={10} />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-4 py-1">
                  <Star className="mr-1 h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">Pro</CardTitle>
                </div>
                <CardDescription>
                  Hosted solution for growing teams
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Open Source',
                    'Hosted & managed for you',
                    'Up to 50 active developers',
                    'Priority PR processing',
                    'Advanced analytics',
                    'Slack/Discord integrations',
                    'Export data (CSV, JSON)',
                    'Email support',
                    'SSO (coming soon)',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/auth/sign-up">
                    Start Free Trial
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  14-day free trial. No credit card required.
                </p>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="relative border-2 overflow-hidden">
              <ShineBorder shineColor={['#6b7280', '#9ca3af', '#6b7280']} />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                </div>
                <CardDescription>
                  For large organizations with custom needs
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Pro',
                    'Unlimited developers',
                    'Dedicated infrastructure',
                    'Custom integrations',
                    'Advanced security (SOC 2)',
                    'SLA guarantees',
                    'Dedicated support',
                    'Custom training',
                    'Invoice billing',
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Source Callout */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 rounded-2xl border bg-gradient-to-b from-purple-500/5 to-transparent">
              <Code2 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Free for Open Source Projects
              </h2>
              <p className="text-muted-foreground mb-6">
                If you&apos;re maintaining an open source project, MergeMint Pro is completely free. 
                We believe in giving back to the community that makes our work possible.
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">
                  Apply for OSS Program
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'What counts as an "active developer"?',
                a: 'An active developer is anyone who has had at least one PR evaluated in the current billing period. Developers who don\'t contribute don\'t count toward your limit.',
              },
              {
                q: 'Can I switch between plans?',
                a: 'Yes! You can upgrade or downgrade at any time. When upgrading, you\'ll be charged a prorated amount. When downgrading, the new rate applies at your next billing cycle.',
              },
              {
                q: 'Do I need my own Anthropic API key?',
                a: 'For self-hosted installations, yes—you\'ll need to provide your own API key for Claude. The hosted Pro plan includes AI credits.',
              },
              {
                q: 'Is my code sent to the AI?',
                a: 'Yes, PR diffs are sent to Claude for evaluation. If this is a concern, you can self-host and use your own API key with enterprise-grade data handling agreements.',
              },
              {
                q: 'What happens if I exceed my developer limit?',
                a: 'We\'ll notify you when you\'re approaching your limit. New PRs will still be processed, but we\'ll ask you to upgrade to continue.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  {item.q}
                </h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button asChild variant="outline">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-violet-600 p-12 lg:p-16 text-center text-white">
            <ShineBorder shineColor={['#ffffff', '#a855f7', '#ffffff']} borderRadius={24} />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Start measuring developer impact today
            </h2>
            <p className="mx-auto max-w-xl text-lg text-white/80 mb-8">
              Get started in minutes. No credit card required for the free trial.
            </p>
            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default withI18n(PricingPage);

