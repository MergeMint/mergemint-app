import { ReactNode } from 'react';

import { Page, PageBody } from '@kit/ui/page';

import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export default async function OrgLayout({
  children,
  params: _params,
}: {
  children: ReactNode;
  params: { orgSlug: string };
}) {
  await requireUserInServerComponent();

  return (
    <Page style={'header'}>
      <PageBody className={'space-y-6'}>
        {children}
      </PageBody>
    </Page>
  );
}
