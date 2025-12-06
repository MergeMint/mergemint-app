import Link from 'next/link';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { PageBody, PageHeader } from '@kit/ui/page';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  triggerEvaluationRunAction,
  triggerGithubSyncAction,
} from '~/lib/server/mergemint-actions';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

type OrgMembership = {
  org_id: string;
  role: string;
  organizations: { name: string; slug: string } | null;
};

export default async function MergeMintHubPage() {
  await requireUserInServerComponent();
  const client = getSupabaseServerClient<any>();
  const { data } = await client
    .from('organization_members')
    .select('org_id, role, organizations(name, slug)')
    .order('created_at', { ascending: true });

  return (
    <>
      <PageHeader
        title={'MergeMint'}
        description={
          'Run GitHub syncs, evaluations, and jump into admin or developer views.'
        }
      />

      <PageBody>
        <div className={'grid gap-4 lg:grid-cols-2'}>
          {(data as OrgMembership[] | null)?.map((member) => {
            const org = member.organizations;
            if (!org) return null;

            return (
              <Card key={member.org_id}>
                <CardHeader className={'flex flex-row items-center justify-between'}>
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription className={'mt-1'}>
                      Role: <Badge variant={'outline'}>{member.role}</Badge>
                    </CardDescription>
                  </div>

                  <div className={'flex items-center gap-2'}>
                    <Link href={`/${org.slug}/me`}>
                      <Button variant={'secondary'} size={'sm'}>
                        My scores
                      </Button>
                    </Link>
                    {member.role === 'admin' ? (
                      <Link href={`/${org.slug}/admin`}>
                        <Button size={'sm'}>Admin</Button>
                      </Link>
                    ) : null}
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className={'space-y-3 pt-4'}>
                  <div className={'flex gap-2'}>
                    <form action={triggerGithubSyncAction}>
                      <input type="hidden" name="orgId" value={member.org_id} />
                      <input type="hidden" name="slug" value={org.slug} />
                      <Button variant={'outline'} size={'sm'}>
                        Sync GitHub now
                      </Button>
                    </form>

                    <form action={triggerEvaluationRunAction}>
                      <input type="hidden" name="orgId" value={member.org_id} />
                      <input type="hidden" name="slug" value={org.slug} />
                      <Button variant={'outline'} size={'sm'}>
                        Run evaluations
                      </Button>
                    </form>
                  </div>

                  <div className={'flex gap-3'}>
                    <Link href={`/${org.slug}/leaderboard`}>
                      <Button variant={'ghost'} size={'sm'}>
                        Leaderboard
                      </Button>
                    </Link>
                    <Link href={`/${org.slug}/prs`}>
                      <Button variant={'ghost'} size={'sm'}>
                        Evaluated PRs
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!data?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>You are not in any organizations yet</CardTitle>
                <CardDescription>
                  Ask an admin to invite you or create an org in Supabase.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>See a sample dashboard</CardTitle>
              <CardDescription>
                Preview what MergeMint will display once your GitHub sync and evaluations run.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={'/home/mergemint/demo'}>
                <Button variant={'secondary'} size={'sm'}>
                  Open sample stats
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
