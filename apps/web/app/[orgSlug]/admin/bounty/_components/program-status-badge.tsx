import { Badge } from '@kit/ui/badge';

import type { ProgramStatus } from '~/lib/types/bounty.types';

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  const variantMap: Record<ProgramStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    draft: 'secondary',
    active: 'default',
    completed: 'outline',
    cancelled: 'destructive',
  };

  return (
    <Badge variant={variantMap[status]} className={'capitalize'}>
      {status}
    </Badge>
  );
}
