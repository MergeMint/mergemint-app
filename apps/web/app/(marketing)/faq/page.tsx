import Link from 'next/link';

import { ArrowRight, ChevronDown, Github, HelpCircle } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';

import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  return {
    title: 'FAQ - MergeMint',
    description: 'Frequently asked questions about MergeMint, the AI-powered PR scoring platform.',
  };
};

async function FAQPage() {
  const faqCategories = [
    {
      title: 'Getting Started',
      items: [
        {
          question: 'What is MergeMint?',
          answer: 'MergeMint is an open-source platform that uses AI to automatically evaluate and score pull requests. It helps engineering teams run bug bounty programs, recognize top contributors, and measure developer impact objectively.',
        },
        {
          question: 'How does MergeMint evaluate PRs?',
          answer: 'When a PR is merged, MergeMint fetches the diff and sends it to Claude (Anthropic\'s AI). The AI analyzes the changes, classifies the affected component and severity level, checks eligibility criteria (issue linked, tests, documentation), and calculates a score using your configured multipliers.',
        },
        {
          question: 'How long does it take to set up?',
          answer: 'Most teams are up and running in under 5 minutes. You install the GitHub App, select which repositories to track, and configure your scoring rules. MergeMint starts processing new PRs immediately.',
        },
        {
          question: 'Can I process historical PRs?',
          answer: 'Yes! MergeMint includes a backfill feature that lets you process PRs from before you installed the app. This is great for establishing baseline scores and historical leaderboards.',
        },
      ],
    },
    {
      title: 'Scoring & Configuration',
      items: [
        {
          question: 'How is the final score calculated?',
          answer: 'The formula is: Final Score = Base Points (from severity) × Multiplier (from component). For example, a P1 severity fix (50 base points) in the Auth component (1.5× multiplier) would earn 75 points.',
        },
        {
          question: 'What are eligibility criteria?',
          answer: 'MergeMint checks four criteria: (1) Is this fixing an issue/bug? (2) Does the implementation actually fix what it claims? (3) Is the PR properly documented? (4) Are tests included? PRs that fail eligibility still get evaluated but score 0 points.',
        },
        {
          question: 'Can I customize the components and multipliers?',
          answer: 'Absolutely! You define your own components (e.g., Auth, Payments, UI) and assign multipliers based on complexity or business importance. You can also set up file path rules to auto-classify PRs.',
        },
        {
          question: 'How accurate is the AI classification?',
          answer: 'In our testing, Claude correctly classifies component and severity ~90% of the time. You can review and override any evaluation if needed. The AI provides justification for its decisions to help you understand its reasoning.',
        },
      ],
    },
    {
      title: 'GitHub Integration',
      items: [
        {
          question: 'What GitHub permissions does MergeMint need?',
          answer: 'MergeMint needs read access to code and pull requests (to analyze diffs), and write access to issues (to post evaluation comments). We only access repositories you explicitly enable.',
        },
        {
          question: 'Does MergeMint work with GitHub Enterprise?',
          answer: 'Yes, MergeMint supports GitHub Enterprise Server. For self-hosted installations, you\'ll need to configure the GitHub App with your enterprise domain.',
        },
        {
          question: 'Can I disable the PR comments?',
          answer: 'Yes, PR comments are optional. You can disable them globally or per-repository while still collecting scores in the dashboard.',
        },
        {
          question: 'Does MergeMint support GitLab or Bitbucket?',
          answer: 'Currently, MergeMint only supports GitHub. GitLab support is on our roadmap. Bitbucket support depends on community interest.',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          question: 'Is my code sent to the AI?',
          answer: 'Yes, PR diffs are sent to Claude (Anthropic) for evaluation. If this is a concern, you can self-host MergeMint and use your own Anthropic API key with enterprise-grade data handling agreements.',
        },
        {
          question: 'Can I self-host MergeMint?',
          answer: 'Yes! MergeMint is open source under CC BY-NC 4.0. You can deploy it on your own infrastructure for non-commercial use. For commercial use, please contact us for licensing options.',
        },
        {
          question: 'What data does MergeMint store?',
          answer: 'MergeMint stores PR metadata (title, author, file list, diff snippets), evaluation results (scores, classifications), and aggregated statistics. We don\'t store your full codebase.',
        },
        {
          question: 'Is MergeMint SOC 2 compliant?',
          answer: 'The hosted version is SOC 2 Type II compliant. For self-hosted deployments, compliance depends on your infrastructure. We provide security best practices documentation.',
        },
      ],
    },
    {
      title: 'Pricing & Plans',
      items: [
        {
          question: 'Is MergeMint free?',
          answer: 'MergeMint is free for non-commercial use under CC BY-NC 4.0. Self-host it for personal projects, education, or open source. For commercial use, contact us for licensing.',
        },
        {
          question: 'Is there a free tier for the hosted version?',
          answer: 'We offer a 14-day free trial of Pro, and the hosted version is completely free for open source projects. Contact us to apply for the OSS program.',
        },
        {
          question: 'Do I need my own Anthropic API key?',
          answer: 'For self-hosted installations, yes—you\'ll need to provide your own Anthropic API key. The hosted Pro plan includes AI credits.',
        },
        {
          question: 'Can I export my data?',
          answer: 'Yes, you can export all your data (PRs, evaluations, leaderboards) in CSV or JSON format. You own your data.',
        },
      ],
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqCategories.flatMap(cat => cat.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
          <div className="container relative mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4">
              <HelpCircle className="mr-2 h-4 w-4 text-purple-500" />
              FAQ
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Frequently Asked
              <span className="block bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everything you need to know about MergeMint. Can&apos;t find what you&apos;re looking for? 
            Feel free to reach out.
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-12 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-12">
              {faqCategories.map((category, catIdx) => (
                <div key={catIdx}>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 text-sm font-bold">
                      {catIdx + 1}
                    </span>
                    {category.title}
                  </h2>
                  <div className="space-y-4">
                    {category.items.map((item, idx) => (
                      <FaqItem key={idx} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="max-w-3xl mx-auto mt-16 p-8 rounded-2xl border bg-card text-center">
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                We&apos;re here to help. Reach out through GitHub or contact us directly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="https://github.com/MergeMint/mergemint-app/discussions" target="_blank">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub Discussions
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default withI18n(FAQPage);

function FaqItem({
  item,
}: React.PropsWithChildren<{
  item: {
    question: string;
    answer: string;
  };
}>) {
  return (
    <details className="group rounded-xl border bg-card overflow-hidden">
      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors">
        <h3 className="font-medium pr-4">{item.question}</h3>
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-open:rotate-180 flex-shrink-0" />
      </summary>
      <div className="px-6 pb-6 text-muted-foreground">
        {item.answer}
      </div>
    </details>
  );
}
