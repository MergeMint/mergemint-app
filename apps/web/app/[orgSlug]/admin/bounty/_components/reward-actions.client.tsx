'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';

import {
  approveRewardAction,
  markRewardPaidAction,
} from '~/lib/server/bounty-actions';

import type { PayoutStatus } from '~/lib/types/bounty.types';

export function RewardActions({
  rewardId,
  orgId,
  orgSlug,
  currentStatus,
}: {
  rewardId: string;
  orgId: string;
  orgSlug: string;
  currentStatus: PayoutStatus;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showPaidDialog, setShowPaidDialog] = useState(false);

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('rewardId', rewardId);
      formData.append('orgId', orgId);
      formData.append('slug', orgSlug);

      await approveRewardAction(formData);
      setShowApproveDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to approve reward:', error);
      alert('Failed to approve reward. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('rewardId', rewardId);
      formData.append('orgId', orgId);
      formData.append('slug', orgSlug);

      await markRewardPaidAction(formData);
      setShowPaidDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to mark reward as paid:', error);
      alert('Failed to mark reward as paid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === 'paid') {
    return <span className={'text-sm text-muted-foreground'}>Completed</span>;
  }

  return (
    <div className={'flex gap-2'}>
      {currentStatus === 'pending' && (
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogTrigger asChild>
            <Button size={'sm'} variant={'outline'}>
              Approve
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleApprove}>
              <DialogHeader>
                <DialogTitle>Approve Reward</DialogTitle>
                <DialogDescription>
                  Approve this reward for payout. You can add optional notes.
                </DialogDescription>
              </DialogHeader>
              <div className={'py-4 space-y-4'}>
                <div className={'space-y-2'}>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any notes about this approval..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant={'outline'}
                  onClick={() => setShowApproveDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Approving...' : 'Approve'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {(currentStatus === 'approved' || currentStatus === 'pending') && (
        <Dialog open={showPaidDialog} onOpenChange={setShowPaidDialog}>
          <DialogTrigger asChild>
            <Button size={'sm'}>Mark as Paid</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleMarkPaid}>
              <DialogHeader>
                <DialogTitle>Mark Reward as Paid</DialogTitle>
                <DialogDescription>
                  Record the payout details for this reward.
                </DialogDescription>
              </DialogHeader>
              <div className={'py-4 space-y-4'}>
                <div className={'space-y-2'}>
                  <Label htmlFor="payout_method">
                    Payout Method <span className={'text-destructive'}>*</span>
                  </Label>
                  <Input
                    id="payout_method"
                    name="payout_method"
                    placeholder="e.g., PayPal, Bank Transfer, Stripe"
                    required
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor="payout_reference">
                    Reference Number <span className={'text-destructive'}>*</span>
                  </Label>
                  <Input
                    id="payout_reference"
                    name="payout_reference"
                    placeholder="e.g., Transaction ID, Invoice Number"
                    required
                  />
                </div>
                <div className={'space-y-2'}>
                  <Label htmlFor="payout_notes">Notes (Optional)</Label>
                  <Textarea
                    id="payout_notes"
                    name="payout_notes"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant={'outline'}
                  onClick={() => setShowPaidDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Mark as Paid'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
