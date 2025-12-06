import Image from 'next/image';
import Link from 'next/link';

import { ArrowRightIcon, LayoutDashboard } from 'lucide-react';

import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Hero,
  Pill,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'mt-4 flex flex-col space-y-24 py-14'}>
      <div className={'container mx-auto'}>
        <Hero
          pill={
            <Pill label={'New'}>
              <span>MergeMint · AI scoring for merged PRs</span>
            </Pill>
          }
          title={
            <>
              <span>Reward contributors automatically</span>
              <span>with AI-evaluated pull requests</span>
            </>
          }
          subtitle={
            <span>
              Connect your GitHub org, sync merged PRs and linked issues, let an
              LLM score severity × component multipliers, and keep your bug
              bounty leaderboard up to date—no spreadsheets required.
            </span>
          }
          cta={<MainCallToActionButton />}
          image={
            <Image
              priority
              className={
                'dark:border-primary/10 rounded-2xl border border-gray-200'
              }
              width={3558}
              height={2222}
              src={`/images/dashboard.webp`}
              alt={`App Image`}
            />
          }
        />
      </div>

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-col space-y-16 xl:space-y-32 2xl:space-y-36'}
        >
          <FeatureShowcase
            heading={
              <>
                <b className="font-semibold dark:text-white">Built for PMs and eng leads</b>.{' '}
                <span className="text-muted-foreground font-normal">
                  MergeMint automates GitHub ingest, AI evaluations, and scoring rules so you can
                  focus on reviewing impact instead of collecting evidence.
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <LayoutDashboard className="h-5" />
                <span>PR intelligence</span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'GitHub ingestion'}
                description={`Sync merged PRs, linked issues, and file lists per org with Supabase-backed storage and RLS.`}
              />

              <FeatureCard
                className={
                  'relative col-span-2 w-full overflow-hidden lg:col-span-1'
                }
                label={'AI evaluations'}
                description={`LLM classifies component + severity, checks eligibility, and outputs a structured score per PR.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:col-span-1'}
                label={'Configurable scoring'}
                description={`Admins define components, multipliers, severity base points, and prompt templates per org.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'Leaderboards & insights'}
                description={`Developers see their scores and history; PMs get per-component activity and eligibility visibility.`}
              />
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-4'}>
      <CtaButton>
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>
              <Trans i18nKey={'common:getStarted'} />
            </span>

            <ArrowRightIcon
              className={
                'animate-in fade-in slide-in-from-left-8 h-4' +
                ' zoom-in fill-mode-both delay-1000 duration-1000'
              }
            />
          </span>
        </Link>
      </CtaButton>

      <CtaButton variant={'link'}>
        <Link href={'/contact'}>
          <Trans i18nKey={'common:contactUs'} />
        </Link>
      </CtaButton>
    </div>
  );
}
