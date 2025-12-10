import { Metadata } from 'next';
import Link from 'next/link';

import {
  Github,
  Mail,
  MessageSquare,
  Twitter,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata: Metadata = {
  title: 'Contact Us - MergeMint Support & Sales',
  description:
    'Get in touch with the MergeMint team. Contact us for support, enterprise sales, partnerships, or general inquiries about AI-powered PR scoring.',
  keywords: [
    'contact MergeMint',
    'MergeMint support',
    'MergeMint sales',
    'PR scoring help',
    'developer analytics support',
    'MergeMint enterprise',
  ],
  openGraph: {
    title: 'Contact Us - MergeMint Support & Sales',
    description:
      'Get in touch with the MergeMint team for support, enterprise sales, or general inquiries.',
    type: 'website',
    url: 'https://mergemint.dev/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact MergeMint',
    description:
      'Reach out to the MergeMint team for support, sales, or partnerships.',
  },
  alternates: {
    canonical: 'https://mergemint.dev/contact',
  },
};

async function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
            <Trans i18nKey="marketing:contact.badge" />
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            <Trans i18nKey="marketing:contact.heroTitle" />
            <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              <Trans i18nKey="marketing:contact.heroTitleHighlight" />
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            <Trans i18nKey="marketing:contact.heroDescription" />
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans i18nKey="marketing:contact.formTitle" />
                </CardTitle>
                <CardDescription>
                  <Trans i18nKey="marketing:contact.formDescription" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <Trans i18nKey="marketing:contact.nameLabel" />
                      </Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Trans i18nKey="marketing:contact.emailLabel" />
                      </Label>
                      <Input id="email" type="email" placeholder="you@company.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      <Trans i18nKey="marketing:contact.subjectLabel" />
                    </Label>
                    <Input id="subject" placeholder="What's this about?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      <Trans i18nKey="marketing:contact.messageLabel" />
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    <Trans i18nKey="marketing:contact.submitButton" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <Trans i18nKey="marketing:contact.emailTitle" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    <Trans i18nKey="marketing:contact.emailGeneralLabel" />
                  </p>
                  <a href="mailto:hello@mergemint.dev" className="text-purple-600 hover:underline font-medium">
                    hello@mergemint.dev
                  </a>
                  <p className="text-muted-foreground mt-4 mb-2">
                    <Trans i18nKey="marketing:contact.emailSalesLabel" />
                  </p>
                  <a href="mailto:sales@mergemint.dev" className="text-purple-600 hover:underline font-medium">
                    sales@mergemint.dev
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-purple-500" />
                    <Trans i18nKey="marketing:contact.githubTitle" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    <Trans i18nKey="marketing:contact.githubDescription" />
                  </p>
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="https://github.com/MergeMint/mergemint-app/issues" target="_blank">
                        <Github className="mr-2 h-4 w-4" />
                        <Trans i18nKey="marketing:contact.githubOpenIssue" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="https://github.com/MergeMint/mergemint-app/discussions" target="_blank">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <Trans i18nKey="marketing:contact.githubStartDiscussion" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-purple-500" />
                    <Trans i18nKey="marketing:contact.socialTitle" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    <Trans i18nKey="marketing:contact.socialDescription" />
                  </p>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="https://twitter.com/mergemint" target="_blank">
                      <Twitter className="mr-2 h-4 w-4" />
                      <Trans i18nKey="marketing:contact.twitterHandle" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default withI18n(ContactPage);
