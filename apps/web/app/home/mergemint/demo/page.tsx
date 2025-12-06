import { PageBody, PageHeader } from '@kit/ui/page';

import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { DemoDashboardClient } from './demo-dashboard.client';

export default async function MergeMintDemoPage() {
  await requireUserInServerComponent();

  return (
    <>
      <PageHeader
        title={'Sample MergeMint dashboard'}
        description={
          'No data yet? Here is a preview of what your org will see once GitHub sync and evaluations run.'
        }
      />

      <PageBody className={'space-y-6'}>
        <DemoDashboardClient />
      </PageBody>
    </>
  );
}
