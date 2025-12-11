'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';

import {
  updateProgramStatusAction,
  calculateProgramRewardsAction,
} from '~/lib/server/bounty-actions';

import type { ProgramStatus } from '~/lib/types/bounty.types';

export function ProgramActions({
  programId,
  orgId,
  orgSlug,
  currentStatus,
  hasRewards,
}: {
  programId: string;
  orgId: string;
  orgSlug: string;
  currentStatus: ProgramStatus;
  hasRewards: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: ProgramStatus) => {
    if (!confirm(`Are you sure you want to change status to "${newStatus}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('programId', programId);
      formData.append('orgId', orgId);
      formData.append('status', newStatus);
      formData.append('slug', orgSlug);

      await updateProgramStatusAction(formData);
      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateRewards = async () => {
    if (
      !confirm(
        'This will calculate rewards based on the program period. Continue?',
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('programId', programId);
      formData.append('orgId', orgId);
      formData.append('slug', orgSlug);

      const result = await calculateProgramRewardsAction(formData);

      if (result.success) {
        alert(
          `Successfully calculated rewards for ${result.count || 0} developer(s).`,
        );
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to calculate rewards:', error);
      alert('Failed to calculate rewards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={'space-y-2'}>
      {currentStatus === 'draft' && (
        <Button
          onClick={() => handleStatusChange('active')}
          disabled={isLoading}
          className={'w-full'}
        >
          Activate Program
        </Button>
      )}

      {currentStatus === 'active' && (
        <>
          <Button
            onClick={() => handleStatusChange('completed')}
            disabled={isLoading}
            className={'w-full'}
          >
            Mark as Completed
          </Button>
          <Button
            onClick={() => handleStatusChange('cancelled')}
            disabled={isLoading}
            variant={'destructive'}
            className={'w-full'}
          >
            Cancel Program
          </Button>
        </>
      )}

      {(currentStatus === 'completed' || currentStatus === 'active') && (
        <Button
          onClick={handleCalculateRewards}
          disabled={isLoading}
          variant={'secondary'}
          className={'w-full'}
        >
          {hasRewards ? 'Recalculate' : 'Calculate'} Rewards
        </Button>
      )}
    </div>
  );
}
